import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { z } from "zod";
import { storage } from "./storage";
import { 
  insertProductSchema, 
  insertCartItemSchema, 
  insertOrderSchema,
  registerUserSchema,
  loginUserSchema
} from "@shared/schema";
import bcrypt from "bcryptjs";
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
  app.post("/api/register", async (req, res) => {
    try {
      console.log("Register request body:", req.body);
      
      // Validate user data
      const { confirmPassword, ...userData } = registerUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Пользователь с таким именем уже существует" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Пользователь с таким email уже существует" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
        isAdmin: false
      });
      
      // Set session
      req.session.userId = newUser.id;
      req.session.isAdmin = newUser.isAdmin;
      
      // Return user data (without password)
      const { password, ...userWithoutPassword } = newUser;
      return res.status(201).json({ 
        success: true,
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: "Ошибка валидации", 
          errors: error.errors 
        });
      }
      return res.status(500).json({ 
        success: false,
        message: "Произошла ошибка при регистрации" 
      });
    }
  });
  
  app.post("/api/login", async (req, res) => {
    try {
      const loginData = loginUserSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByUsername(loginData.username);
      if (!user) {
        return res.status(401).json({ message: "Неверное имя пользователя или пароль" });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Неверное имя пользователя или пароль" });
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin;
      
      // Return user data (without password)
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Ошибка валидации", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Произошла ошибка при входе" });
    }
  });
  
  app.get("/api/session", (req, res) => {
    res.json({ 
      sessionId: req.session.sessionId,
      isLoggedIn: !!req.session.userId,
      isAdmin: !!req.session.isAdmin
    });
  });
  
  app.get("/api/user/profile", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Необходима авторизация" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      
      // Return user data (without password)
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Произошла ошибка при получении профиля" });
    }
  });
  
  app.put("/api/user/profile", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Необходима авторизация" });
    }
    
    try {
      // Validate update data (limited fields)
      const updateSchema = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        email: z.string().email("Пожалуйста, введите корректный email").optional(),
      });
      
      const updateData = updateSchema.parse(req.body);
      
      // Check if email is being updated and already exists
      if (updateData.email) {
        const existingEmail = await storage.getUserByEmail(updateData.email);
        if (existingEmail && existingEmail.id !== req.session.userId) {
          return res.status(409).json({ message: "Пользователь с таким email уже существует" });
        }
      }
      
      // Update user
      const updatedUser = await storage.updateUser(req.session.userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      
      // Return updated user data (without password)
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Ошибка валидации", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Произошла ошибка при обновлении профиля" });
    }
  });
  
  app.put("/api/user/password", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Необходима авторизация" });
    }
    
    try {
      // Validate password data
      const passwordSchema = z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6, "Пароль должен быть не менее 6 символов"),
        confirmPassword: z.string(),
      }).refine(data => data.newPassword === data.confirmPassword, {
        message: "Пароли не совпадают",
        path: ["confirmPassword"],
      });
      
      const passwordData = passwordSchema.parse(req.body);
      
      // Get user
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(passwordData.currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Текущий пароль неверен" });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(passwordData.newPassword, salt);
      
      // Update password
      await storage.updateUser(user.id, { password: hashedPassword });
      
      res.json({ message: "Пароль успешно обновлен" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Ошибка валидации", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Произошла ошибка при обновлении пароля" });
    }
  });
  
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Ошибка при выходе из системы" });
      }
      res.json({ message: "Выход выполнен успешно" });
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
      
      // Проверим существование продукта перед добавлением в корзину
      const product = await storage.getProductById(Number(req.body.productId));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Создаем правильную структуру данных корзины
      const cartItem = {
        sessionId: sessionId,
        productId: Number(req.body.productId),
        quantity: Number(req.body.quantity || 1),
        selectedSize: String(req.body.selectedSize || "standard"),
        selectedFabricCategory: String(req.body.selectedFabricCategory || "standard"),
        selectedFabric: String(req.body.selectedFabric || "cotton"),
        hasLiftingMechanism: Boolean(req.body.hasLiftingMechanism),
        price: String(req.body.price), // Преобразуем в строку, т.к. в схеме price - это string
      };
      
      // Проверяем, нужно ли добавить пользовательские размеры
      if (req.body.customWidth) {
        // @ts-ignore
        cartItem.customWidth = Number(req.body.customWidth);
      }
      
      if (req.body.customLength) {
        // @ts-ignore
        cartItem.customLength = Number(req.body.customLength);
      }
      
      console.log("Данные корзины для отправки:", cartItem);
      
      // Добавляем в корзину, пропуская валидацию Zod напрямую
      const result = await storage.addToCart(cartItem);
      console.log("Товар добавлен в корзину:", result);
      
      res.status(201).json(result);
    } catch (error) {
      console.error("Ошибка корзины:", error);
      res.status(400).json({ 
        message: "Не удалось добавить товар в корзину", 
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
