import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { z } from "zod";
import { storage } from "./storage";
import { insertProductSchema, insertCartItemSchema, insertOrderSchema } from "@shared/schema";
import { nanoid } from "nanoid";

// Custom session type
declare module "express-session" {
  interface SessionData {
    userId?: number;
    isAdmin?: boolean;
    sessionId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "luxbed-secret",
      resave: false,
      saveUninitialized: true,
      cookie: { secure: process.env.NODE_ENV === "production" },
    })
  );

  // Initialize session with a unique ID
  app.use((req, res, next) => {
    if (!req.session.sessionId) {
      req.session.sessionId = nanoid();
    }
    next();
  });

  // Admin auth middleware
  const requireAdmin = (req: Request, res: Response, next: () => void) => {
    if (req.session.isAdmin) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  // Authentication routes
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    req.session.userId = user.id;
    req.session.isAdmin = user.isAdmin;
    
    res.json({ 
      id: user.id, 
      username: user.username, 
      isAdmin: user.isAdmin 
    });
  });
  
  app.get("/api/session", (req, res) => {
    res.json({ 
      sessionId: req.session.sessionId,
      isLoggedIn: !!req.session.userId,
      isAdmin: !!req.session.isAdmin
    });
  });
  
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    const { category } = req.query;
    
    let products;
    if (category) {
      products = await storage.getProductsByCategory(category as string);
    } else {
      products = await storage.getAllProducts();
    }
    
    res.json(products);
  });
  
  app.get("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    const product = await storage.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  });
  
  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });
  
  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    try {
      const updates = req.body;
      const updatedProduct = await storage.updateProduct(id, updates);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data", error });
    }
  });
  
  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    const success = await storage.deleteProduct(id);
    
    if (!success) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json({ message: "Product deleted successfully" });
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    const sessionId = req.session.sessionId;
    const cartItems = await storage.getCartItems(sessionId);
    
    // Get complete product information for each cart item
    const enrichedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await storage.getProductById(item.productId);
        return {
          ...item,
          product
        };
      })
    );
    
    res.json(enrichedCartItems);
  });
  
  app.post("/api/cart", async (req, res) => {
    const sessionId = req.session.sessionId || "";
    
    try {
      console.log("Raw cart data:", JSON.stringify(req.body));
      
      if (!sessionId) {
        return res.status(400).json({ message: "Missing session ID" });
      }
      
      if (!req.body.productId) {
        return res.status(400).json({ message: "Missing product ID" });
      }
      
      // Создаем правильный объект для валидации
      const cartData = {
        sessionId: sessionId,
        productId: Number(req.body.productId),
        quantity: Number(req.body.quantity || 1),
        selectedSize: String(req.body.selectedSize || "standard"),
        selectedFabricCategory: String(req.body.selectedFabricCategory || "standard"),
        selectedFabric: String(req.body.selectedFabric || "cotton"),
        hasLiftingMechanism: Boolean(req.body.hasLiftingMechanism),
        price: Number(req.body.price),
      };
      
      // Добавляем опционные поля только если они не null и не undefined
      if (req.body.customWidth) {
        cartData.customWidth = Number(req.body.customWidth);
      }
      
      if (req.body.customLength) {
        cartData.customLength = Number(req.body.customLength);
      }
      
      console.log("Processed cart data:", JSON.stringify(cartData));
      
      // Verify that the product exists
      const product = await storage.getProductById(cartData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const cartItem = await storage.addToCart(cartData);
      console.log("Added cart item:", JSON.stringify(cartItem));
      
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Cart error:", error);
      res.status(400).json({ 
        message: "Invalid cart item data", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  app.patch("/api/cart/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const sessionId = req.session.sessionId;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }
    
    // Check if the cart item belongs to the current session
    const cartItem = await storage.getCartItem(id);
    if (!cartItem || cartItem.sessionId !== sessionId) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    try {
      const updates = req.body;
      const updatedCartItem = await storage.updateCartItem(id, updates);
      
      if (!updatedCartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(updatedCartItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data", error });
    }
  });
  
  app.delete("/api/cart/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const sessionId = req.session.sessionId;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }
    
    // Check if the cart item belongs to the current session
    const cartItem = await storage.getCartItem(id);
    if (!cartItem || cartItem.sessionId !== sessionId) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    const success = await storage.removeCartItem(id);
    
    if (!success) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    res.json({ message: "Cart item removed successfully" });
  });
  
  app.delete("/api/cart", async (req, res) => {
    const sessionId = req.session.sessionId;
    await storage.clearCart(sessionId);
    res.json({ message: "Cart cleared successfully" });
  });

  // Order routes
  app.post("/api/orders", async (req, res) => {
    const sessionId = req.session.sessionId;
    
    try {
      // Validate order data
      const orderSchema = insertOrderSchema.extend({
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          selectedSize: z.string(),
          customWidth: z.number().optional(),
          customLength: z.number().optional(),
          selectedFabricCategory: z.string(),
          selectedFabric: z.string(),
          fabricName: z.string(),
          hasLiftingMechanism: z.boolean().default(false),
          price: z.number()
        }))
      });
      
      const orderData = orderSchema.parse({
        ...req.body,
        sessionId
      });
      
      // Get cart items and calculate total
      const cartItems = await storage.getCartItems(sessionId);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Create order items
      const orderItems = orderData.items.map(item => ({
        orderId: 0, // Will be set after order creation
        ...item,
        price: item.price.toString()
      }));
      
      // Create order
      const order = await storage.createOrder(
        {
          sessionId,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone,
          address: orderData.address,
          totalAmount: orderData.totalAmount,
          status: "pending"
        },
        orderItems
      );
      
      // Clear cart after successful order
      await storage.clearCart(sessionId);
      
      res.status(201).json({ 
        order,
        message: "Order placed successfully" 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid order data", error });
    }
  });
  
  app.get("/api/orders", async (req, res) => {
    const sessionId = req.session.sessionId;
    const orders = await storage.getOrdersBySessionId(sessionId);
    res.json(orders);
  });
  
  app.get("/api/orders/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const sessionId = req.session.sessionId;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    
    const order = await storage.getOrderById(id);
    
    // Only admin or the order owner can access the order
    if (!order || (!req.session.isAdmin && order.sessionId !== sessionId)) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    const orderItems = await storage.getOrderItems(id);
    
    res.json({
      ...order,
      items: orderItems
    });
  });
  
  // Admin-only routes for order management
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    // This would typically include pagination, filtering, etc.
    const orders = Array.from((await storage.getAllOrders()) || []);
    res.json(orders);
  });
  
  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    
    if (!status || !["pending", "processing", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const updatedOrder = await storage.updateOrderStatus(id, status);
    
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.json(updatedOrder);
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
