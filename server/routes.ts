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
    cartProducts?: Array<{
      id: number;
      name: string;
      price: string;
    }>;
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
      // Validate user data
      console.log("Register request received:", JSON.stringify(req.body));
      
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
    const sessionId = req.session.sessionId || "";
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
    
    // Сохраняем продукты в сессии для использования при создании заказа
    req.session.cartProducts = enrichedCartItems.map(item => {
      return {
        id: item.productId,
        name: item.product?.name || "Неизвестный товар",
        price: item.price
      };
    });
    
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
    const sessionId = req.session.sessionId || "";
    await storage.clearCart(sessionId);
    res.json({ message: "Cart cleared successfully" });
  });

  // Order routes
  app.post("/api/orders", async (req, res) => {
    try {
      console.log("================== НАЧАЛО СОЗДАНИЯ ЗАКАЗА ==================");
      console.log("ПОЛНОЕ ТЕЛО ЗАПРОСА:", JSON.stringify(req.body, null, 2));
      
      // Получаем session ID с приоритетом тела запроса, затем сессии
      const sessionIdFromBody = req.body.sessionId || "";
      const sessionIdFromSession = req.session.sessionId || "";
      const sessionId = sessionIdFromBody || sessionIdFromSession || "generated-" + Date.now();
      
      console.log("Используемый ID сессии:", sessionId);
      
      // 1. Проверка и сбор данных товаров заказа
      let orderItems = [];
      
      // Сначала проверяем товары в запросе
      if (req.body.items && Array.isArray(req.body.items) && req.body.items.length > 0) {
        console.log("✅ Найдены товары в запросе:", req.body.items.length);
        orderItems = req.body.items;
      } else {
        // Если в запросе нет товаров, берем из корзины
        console.log("❌ В запросе нет товаров, проверяем корзину...");
        const cartItems = await storage.getCartItems(sessionId);
        
        if (!cartItems || cartItems.length === 0) {
          console.error("❌ Корзина пуста, заказ невозможен");
          return res.status(400).json({ message: "В корзине нет товаров. Добавьте товары в корзину перед оформлением заказа." });
        }
        
        console.log("✅ Найдены товары в корзине:", cartItems.length);
        orderItems = cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity || 1,
          selectedSize: item.selectedSize || "standard",
          customWidth: item.customWidth || null, 
          customLength: item.customLength || null,
          selectedFabricCategory: item.selectedFabricCategory || "standard",
          selectedFabric: item.selectedFabric || "standard",
          fabricName: item.selectedFabric || "Стандартная",
          hasLiftingMechanism: !!item.hasLiftingMechanism,
          price: item.price || "0"
        }));
      }
      
      console.log("ТОВАРЫ ДЛЯ ЗАКАЗА:", JSON.stringify(orderItems, null, 2));
      
      // 2. Проверка корректности данных о клиенте и доставке
      if (!req.body.customerName || !req.body.customerEmail || !req.body.customerPhone) {
        console.error("❌ Отсутствуют данные клиента");
        return res.status(400).json({ message: "Необходимо указать имя, email и телефон клиента" });
      }
      
      // 3. Проверка суммы заказа
      if (!req.body.totalAmount) {
        console.error("❌ Отсутствует сумма заказа");
        return res.status(400).json({ message: "Необходимо указать сумму заказа" });
      }
      
      // 4. Подготовка окончательных товаров заказа с информацией о продуктах
      // Получаем информацию о каждом товаре из БД
      let productsInfo = [];
      try {
        const productPromises = orderItems.map(item => 
          storage.getProductById(item.productId).catch(() => null)
        );
        productsInfo = await Promise.all(productPromises);
        console.log("✅ Получена информация о товарах");
      } catch (error) {
        console.error("❌ Ошибка при получении информации о товарах:", error);
        // Продолжаем выполнение, даже если не удалось получить информацию о всех товарах
      }
      
      // Подготавливаем позиции заказа для БД
      let dbOrderItems = orderItems.map((item, index) => {
        const productInfo = productsInfo[index];
        return {
          order_id: 0, // Будет заполнено после создания заказа
          product_id: item.productId,
          product_name: productInfo ? productInfo.name : "Товар " + item.productId,
          quantity: item.quantity || 1,
          selected_size: item.selectedSize || "standard",
          custom_width: item.customWidth || null,
          custom_length: item.customLength || null,
          selected_fabric_category: item.selectedFabricCategory || "standard",
          selected_fabric: item.selectedFabric || "standard",
          fabric_name: item.fabricName || item.selectedFabric || "Стандартная",
          has_lifting_mechanism: !!item.hasLiftingMechanism,
          price: item.price || "0"
        };
      });
      
      // Устанавливаем цену доставки автоматически в зависимости от выбранного способа
      const deliveryMethod = req.body.deliveryMethod || 'pickup';
      const deliveryPrice = deliveryMethod === 'courier' ? '500.00' : '0.00';
      
      // Добавляем доставку как отдельный товар заказа, если это курьерская доставка с ненулевой стоимостью
      if (deliveryMethod === 'courier') {
        dbOrderItems.push({
          order_id: 0, // Будет заполнено после создания заказа
          product_id: 999999, // Специальный ID для доставки
          product_name: 'Доставка курьером',
          quantity: 1,
          selected_size: 'standard',
          custom_width: null,
          custom_length: null,
          selected_fabric_category: 'standard',
          selected_fabric: 'standard',
          fabric_name: 'Стандартная',
          has_lifting_mechanism: false,
          price: deliveryPrice
        });
      }
      
      // 5. Формирование объекта заказа для БД
      const totalAmount = typeof req.body.totalAmount === 'number' 
        ? req.body.totalAmount.toString() 
        : (req.body.totalAmount || "0");
      
      // Мы уже добавили доставку как отдельный товар, поэтому сохраняем исходную сумму
      const finalTotalAmount = totalAmount;
      
      const orderToCreate = {
        session_id: sessionId,
        customer_name: req.body.customerName,
        customer_email: req.body.customerEmail,
        customer_phone: req.body.customerPhone,
        address: req.body.address || '',
        delivery_method: deliveryMethod,
        delivery_method_text: deliveryMethod === 'courier' ? 'Курьером' : 'Самовывоз',
        delivery_price: deliveryPrice,
        payment_method: req.body.paymentMethod || 'cash',
        payment_method_text: req.body.paymentMethodText || (req.body.paymentMethod === 'card' ? 'Банковской картой' : 'Наличными'),
        comment: req.body.comment || null,
        total_amount: finalTotalAmount,
        status: "pending"
      };
      
      console.log("ФИНАЛЬНЫЕ ДАННЫЕ ЗАКАЗА:", JSON.stringify(orderToCreate, null, 2));
      console.log("ФИНАЛЬНЫЕ ТОВАРЫ ЗАКАЗА:", JSON.stringify(dbOrderItems, null, 2));
      
      // 6. Сохранение заказа в БД
      let createdOrder;
      try {
        createdOrder = await storage.createOrder(orderToCreate, dbOrderItems);
        console.log("✅ Заказ успешно создан:", createdOrder?.id || "ID неизвестен");
      } catch (error) {
        console.error("❌ Ошибка при создании заказа:", error);
        throw new Error(`Не удалось создать заказ в базе данных: ${error.message}`);
      }
      
      if (!createdOrder) {
        throw new Error("База данных не вернула информацию о созданном заказе");
      }
      
      // 7. Очищаем корзину после успешного оформления заказа
      try {
        await storage.clearCart(sessionId);
        console.log("✅ Корзина очищена");
      } catch (error) {
        console.error("⚠️ Ошибка при очистке корзины:", error);
        // Не блокируем создание заказа из-за ошибки очистки корзины
      }
      
      console.log("================== ЗАКАЗ УСПЕШНО СОЗДАН ==================");
      
      // 8. Отправляем успешный ответ клиенту
      res.status(201).json({ 
        order: createdOrder,
        message: "Заказ успешно оформлен" 
      });
      
    } catch (error) {
      console.error("❌❌❌ КРИТИЧЕСКАЯ ОШИБКА ПРИ СОЗДАНИИ ЗАКАЗА:", error);
      res.status(500).json({ 
        message: "Ошибка при создании заказа", 
        error: error.message || "Неизвестная ошибка" 
      });
    }
  });
  
  app.get("/api/orders", async (req, res) => {
    const sessionId = req.session.sessionId;
    if (!sessionId) {
      return res.status(400).json({ message: "Отсутствует идентификатор сессии" });
    }
    const orders = await storage.getOrdersBySessionId(sessionId);
    res.json(orders);
  });
  
  // Маршруты для работы с отзывами
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Некорректный ID товара" });
      }
      
      const reviews = await storage.getReviewsByProductId(productId);
      res.json(reviews);
    } catch (error) {
      console.error("Ошибка при получении отзывов:", error);
      res.status(500).json({ message: "Ошибка сервера при получении отзывов" });
    }
  });
  
  app.post("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Некорректный ID товара" });
      }
      
      const sessionId = req.session.sessionId;
      if (!sessionId) {
        return res.status(400).json({ message: "Отсутствует идентификатор сессии" });
      }
      
      const { customerName, rating, comment } = req.body;
      
      if (!customerName || !rating || !comment) {
        return res.status(400).json({ message: "Все поля обязательны для заполнения" });
      }
      
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Оценка должна быть от 1 до 5" });
      }
      
      const review = await storage.createReview({
        productId,
        sessionId,
        customerName,
        rating,
        comment
      });
      
      res.status(201).json(review);
    } catch (error) {
      console.error("Ошибка при создании отзыва:", error);
      res.status(500).json({ message: "Ошибка сервера при создании отзыва" });
    }
  });
  
  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      if (isNaN(reviewId)) {
        return res.status(400).json({ message: "Некорректный ID отзыва" });
      }
      
      const success = await storage.deleteReview(reviewId);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Отзыв не найден" });
      }
    } catch (error) {
      console.error("Ошибка при удалении отзыва:", error);
      res.status(500).json({ message: "Ошибка сервера при удалении отзыва" });
    }
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
    const orders = await storage.getAllOrders();
    console.log("Получены заказы для админ-панели:", orders);
    res.json(orders);
  });
  
  app.patch("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Неверный ID заказа" });
      }
      
      if (!status || !["pending", "processing", "shipped", "delivered", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Неверный статус заказа" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(id, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Заказ не найден" });
      }
      
      console.log("Статус заказа обновлен:", id, status);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Ошибка при обновлении статуса заказа:", error);
      res.status(500).json({ message: "Ошибка при обновлении статуса заказа" });
    }
  });
  
  // API для импорта товаров
  app.post("/api/admin/products/import", requireAdmin, async (req, res) => {
    const products = req.body;
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Неверный формат данных для импорта" });
    }
    
    try {
      const importedProducts = [];
      
      for (const product of products) {
        // Подготовка продукта для вставки в БД
        const productData = {
          name: product.name || "Неизвестный товар",
          description: product.description || "Описание отсутствует",
          category: product.category || "mattress",
          basePrice: product.basePrice || "0",
          images: Array.isArray(product.images) ? product.images : [],
          sizes: product.sizes || [],
          fabricCategories: product.fabricCategories || [],
          fabrics: product.fabrics || [],
          hasLiftingMechanism: !!product.hasLiftingMechanism,
          liftingMechanismPrice: product.liftingMechanismPrice || "0",
          specifications: product.specifications || [],
          discount: Number(product.discount) || 0,
          featured: !!product.featured,
          inStock: product.inStock !== false
        };
        
        // Создание продукта
        const importedProduct = await storage.createProduct(productData);
        importedProducts.push(importedProduct);
      }
      
      res.status(201).json({
        message: `Успешно импортировано ${importedProducts.length} товаров`,
        products: importedProducts
      });
    } catch (error) {
      console.error("Ошибка при импорте товаров:", error);
      res.status(500).json({ 
        message: "Ошибка при импорте товаров",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // API для импорта пользователей
  app.post("/api/admin/users/import", requireAdmin, async (req, res) => {
    const users = req.body;
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: "Неверный формат данных для импорта" });
    }
    
    try {
      const importedUsers = [];
      
      for (const user of users) {
        // Подготовка пользователя для вставки в БД
        const userData = {
          username: user.username || `user_${Date.now()}`,
          email: user.email || `${Date.now()}@example.com`,
          password: user.password || "password123", // В реальном проекте должен быть хеширован
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          phone: user.phone || null,
          address: user.address || null,
          isAdmin: !!user.isAdmin
        };
        
        // Создание пользователя
        const importedUser = await storage.createUser(userData);
        importedUsers.push(importedUser);
      }
      
      res.status(201).json({
        message: `Успешно импортировано ${importedUsers.length} пользователей`,
        users: importedUsers
      });
    } catch (error) {
      console.error("Ошибка при импорте пользователей:", error);
      res.status(500).json({ 
        message: "Ошибка при импорте пользователей",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // API для импорта заказов
  app.post("/api/admin/orders/import", requireAdmin, async (req, res) => {
    const orders = req.body;
    
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ message: "Неверный формат данных для импорта" });
    }
    
    try {
      const importedOrders = [];
      
      for (const order of orders) {
        if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
          continue; // Пропускаем заказы без товаров
        }
        
        // Подготовка заказа для вставки в БД
        const orderData = {
          sessionId: order.sessionId || `import_${Date.now()}`,
          customerName: order.customerName || "Импортированный заказ",
          customerEmail: order.customerEmail || "import@example.com",
          customerPhone: order.customerPhone || "+7 (000) 000-00-00",
          address: order.address || "Адрес импортированного заказа",
          deliveryMethod: order.deliveryMethod || "courier",
          deliveryMethodText: order.deliveryMethodText || "Курьером",
          deliveryPrice: order.deliveryPrice || "500",
          paymentMethod: order.paymentMethod || "card",
          paymentMethodText: order.paymentMethodText || "Банковской картой",
          totalAmount: order.totalAmount || "0",
          status: order.status || "pending"
        };
        
        // Подготовка товаров заказа
        const orderItems = order.items.map((item: any) => ({
          productId: item.productId || 1,
          productName: item.productName || "Импортированный товар",
          quantity: item.quantity || 1,
          selectedSize: item.selectedSize || "standard",
          customWidth: item.customWidth || null,
          customLength: item.customLength || null,
          selectedFabricCategory: item.selectedFabricCategory || "standard",
          selectedFabric: item.selectedFabric || "cotton",
          fabricName: item.fabricName || "Хлопок",
          hasLiftingMechanism: !!item.hasLiftingMechanism,
          price: item.price || "0"
        }));
        
        // Создание заказа
        const importedOrder = await storage.createOrder(orderData, orderItems);
        importedOrders.push(importedOrder);
      }
      
      res.status(201).json({
        message: `Успешно импортировано ${importedOrders.length} заказов`,
        orders: importedOrders
      });
    } catch (error) {
      console.error("Ошибка при импорте заказов:", error);
      res.status(500).json({ 
        message: "Ошибка при импорте заказов",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Глобальная переменная для хранения настроек магазина
  let shopSettings = {
    // General settings
    shopName: 'Матрасовъ',
    shopDescription: 'Магазин высококачественных матрасов и кроватей',
    contactEmail: 'info@матрасовъ.рф',
    contactPhone: '+7 (495) 123-45-67',
    address: 'г. Москва, ул. Матрасная, д. 1',
    workingHours: 'ПН-ВС: 10:00 - 20:00',
    
    // Social media
    instagramUrl: 'https://instagram.com/matrasov',
    facebookUrl: 'https://facebook.com/matrasov',
    twitterUrl: '',
    
    // Delivery settings
    enableFreeDelivery: true,
    freeDeliveryThreshold: 20000,
    deliveryPriceLocal: 1000,
    deliveryPriceRegional: 3000,
    
    // Payment settings
    enableCashPayment: true,
    enableCardPayment: true,
    enableOnlinePayment: true,
    
    // Email notifications
    sendOrderConfirmation: true,
    sendOrderStatusUpdates: true,
    sendOrderShipped: true,
    
    // SMS notifications
    enableSmsNotifications: true,
    smsOrderConfirmation: true,
    smsOrderStatusUpdate: false,
  };
  
  // Публичный API для получения настроек магазина (для всех пользователей)
  app.get("/api/settings", async (req, res) => {
    try {
      res.json(shopSettings);
    } catch (error) {
      console.error("Ошибка при получении настроек:", error);
      res.status(500).json({ message: "Ошибка при получении настроек" });
    }
  });
  
  // API для админов - получение настроек
  app.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      res.json(shopSettings);
    } catch (error) {
      console.error("Ошибка при получении настроек:", error);
      res.status(500).json({ message: "Ошибка при получении настроек" });
    }
  });
  
  // API для админов - обновление настроек
  app.put("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      // Сохраняем новые настройки в глобальную переменную
      shopSettings = { ...req.body };
      console.log("Настройки магазина обновлены:", shopSettings);
      
      // Возвращаем обновленные настройки
      res.json(shopSettings);
    } catch (error) {
      console.error("Ошибка при сохранении настроек:", error);
      res.status(500).json({ message: "Ошибка при сохранении настроек" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  // Маршруты для отзывов
  app.get("/api/admin/reviews", requireAdmin, async (req, res) => {
    try {
      // Получаем все отзывы из всех продуктов
      const products = await storage.getAllProducts();
      let allReviews = [];
      
      for (const product of products) {
        const productReviews = await storage.getReviewsByProductId(product.id);
        allReviews = [...allReviews, ...productReviews];
      }
      
      // Сортируем отзывы, самые новые - вверху
      allReviews.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      res.json(allReviews);
    } catch (error) {
      console.error("Error retrieving reviews:", error);
      res.status(500).json({ message: "Ошибка при получении отзывов" });
    }
  });
  
  app.delete("/api/admin/reviews/:id", requireAdmin, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      if (isNaN(reviewId)) {
        return res.status(400).json({ message: "Неверный ID отзыва" });
      }
      
      const success = await storage.deleteReview(reviewId);
      
      if (!success) {
        return res.status(404).json({ message: "Отзыв не найден" });
      }
      
      res.json({ message: "Отзыв успешно удален" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Ошибка при удалении отзыва" });
    }
  });

  // API для получения отзывов по ID продукта
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Неверный ID продукта" });
      }
      
      const reviews = await storage.getReviewsByProductId(productId);
      res.json(reviews);
    } catch (error) {
      console.error("Error retrieving product reviews:", error);
      res.status(500).json({ message: "Ошибка при получении отзывов о продукте" });
    }
  });
  
  // API для добавления нового отзыва к продукту
  app.post("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Неверный ID продукта" });
      }
      
      const { customerName, rating, comment } = req.body;
      
      if (!customerName || !rating || !comment) {
        return res.status(400).json({ message: "Все поля обязательны для заполнения" });
      }
      
      // Проверяем, что рейтинг от 1 до 5
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Рейтинг должен быть от 1 до 5" });
      }
      
      // Используем текущий sessionId для привязки отзыва к сессии
      const sessionId = req.session.sessionId;
      
      const review = await storage.createReview({
        productId,
        sessionId,
        customerName,
        rating,
        comment
      });
      
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Ошибка при добавлении отзыва" });
    }
  });
  
  // API для удаления отзыва к продукту
  app.delete("/api/products/:productId/reviews/:reviewId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const reviewId = parseInt(req.params.reviewId);
      
      if (isNaN(productId) || isNaN(reviewId)) {
        return res.status(400).json({ message: "Неверный ID продукта или отзыва" });
      }
      
      // Проверяем, что есть права администратора либо это владелец отзыва
      if (!req.session.isAdmin) {
        return res.status(401).json({ message: "Недостаточно прав для удаления отзыва" });
      }
      
      const success = await storage.deleteReview(reviewId);
      
      if (!success) {
        return res.status(404).json({ message: "Отзыв не найден" });
      }
      
      res.json({ message: "Отзыв успешно удален" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Ошибка при удалении отзыва" });
    }
  });

  return httpServer;
}
