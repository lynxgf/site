import { 
  users, products, cartItems, orders, orderItems, reviews,
  type User, type InsertUser, 
  type Product, type InsertProduct,
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Review, type InsertReview
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
  
  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products);
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.category, category));
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }
  
  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return true;
  }
  
  // Cart methods
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
  }
  
  async getCartItem(id: number): Promise<CartItem | undefined> {
    const [item] = await db.select().from(cartItems).where(eq(cartItems.id, id));
    return item || undefined;
  }
  
  async getCartItemByProductAndSession(
    productId: number, 
    sessionId: string, 
    configuration: Partial<InsertCartItem>
  ): Promise<CartItem | undefined> {
    const { selectedSize, selectedFabricCategory, selectedFabric, hasLiftingMechanism } = configuration;
    
    // Build conditions for the query
    const conditions = [
      eq(cartItems.productId, productId),
      eq(cartItems.sessionId, sessionId)
    ];
    
    if (selectedSize !== undefined) {
      conditions.push(eq(cartItems.selectedSize, selectedSize));
    }
    
    if (selectedFabricCategory !== undefined) {
      conditions.push(eq(cartItems.selectedFabricCategory, selectedFabricCategory));
    }
    
    if (selectedFabric !== undefined) {
      conditions.push(eq(cartItems.selectedFabric, selectedFabric));
    }
    
    // Handle the hasLiftingMechanism field differently because it can be null
    if (hasLiftingMechanism !== undefined) {
      conditions.push(eq(cartItems.hasLiftingMechanism, hasLiftingMechanism === null ? null : Boolean(hasLiftingMechanism)));
    }
    
    const [item] = await db.select().from(cartItems).where(and(...conditions));
    
    return item || undefined;
  }
  
  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    const [newItem] = await db
      .insert(cartItems)
      .values(cartItem)
      .returning();
    return newItem;
  }
  
  async updateCartItem(id: number, updates: Partial<InsertCartItem>): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set(updates)
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem || undefined;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
    return true;
  }
  
  async clearCart(sessionId: string): Promise<boolean> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
    return true;
  }
  
  // Order methods
  async createOrder(order: any, items: any[]): Promise<Order> {
    // Логируем данные для отладки
    console.log("DATABASE_STORAGE: Данные заказа для сохранения:", JSON.stringify(order, null, 2));
    
    // Проверяем наличие session_id и устанавливаем запасной вариант
    if (!order.session_id || order.session_id === 'null' || order.session_id === 'undefined') {
      console.log("ВНИМАНИЕ: Отсутствует session_id, устанавливаем значение по умолчанию");
      order.session_id = 'default-session-' + Date.now();
    }
    
    // Обеспечиваем наличие всех обязательных полей с запасными значениями
    const safeOrder = {
      ...order,
      customer_name: order.customer_name || 'Гость',
      customer_email: order.customer_email || 'guest@example.com',
      customer_phone: order.customer_phone || '0000000000',
      address: order.address || '',
      delivery_method: order.delivery_method || 'pickup',
      delivery_method_text: order.delivery_method_text || 'Самовывоз',
      payment_method: order.payment_method || 'cash',
      payment_method_text: order.payment_method_text || 'Наличными',
      total_amount: order.total_amount || '0',
      status: order.status || 'pending'
    };
    
    console.log("DATABASE_STORAGE: Финальный объект заказа:", JSON.stringify(safeOrder, null, 2));
    
    // Сначала создаем заказ без транзакции
    try {
      // Insert the order
      const [newOrder] = await db
        .insert(orders)
        .values(safeOrder)
        .returning();
      
      console.log("DATABASE_STORAGE: Заказ успешно создан:", newOrder);
      
      // Теперь пытаемся добавить товары отдельно
      if (items && items.length > 0) {
        console.log("DATABASE_STORAGE: Товары для заказа:", JSON.stringify(items, null, 2));
        
        try {
          // Получаем информацию о продукте для каждого элемента корзины
          for (const item of items) {
            try {
              // Получаем информацию о продукте для этого элемента
              const productId = item.productId || item.product_id;
              let productName = item.productName || item.product_name || "Неизвестный товар";
              
              if (productId) {
                try {
                  const product = await this.getProductById(productId);
                  if (product) {
                    productName = product.name;
                    console.log(`DATABASE_STORAGE: Найден продукт для ID ${productId}:`, product.name);
                  }
                } catch (productError) {
                  console.log(`DATABASE_STORAGE: Не удалось найти продукт для ID ${productId}:`, productError);
                }
              }
              
              // Создаём безопасный объект элемента заказа с преобразованием ключей для соответствия схеме БД
              const safeOrderItem = {
                order_id: newOrder.id,
                product_id: productId || null,
                product_name: productName,
                quantity: item.quantity || 1,
                selected_size: item.selectedSize || item.selected_size || 'single',
                custom_width: item.customWidth || item.custom_width || null,
                custom_length: item.customLength || item.custom_length || null,
                selected_fabric_category: item.selectedFabricCategory || item.selected_fabric_category || 'standard',
                selected_fabric: item.selectedFabric || item.selected_fabric || 'beige',
                has_lifting_mechanism: item.hasLiftingMechanism || item.has_lifting_mechanism || false,
                price: item.price || '0'
              };
              
              console.log("DATABASE_STORAGE: Сохранение товара заказа:", JSON.stringify(safeOrderItem, null, 2));
              
              // Выполняем вставку с явным указанием свойств для соответствия схеме БД
              try {
                await db.insert(orderItems).values(safeOrderItem);
                console.log("DATABASE_STORAGE: Товар заказа успешно сохранен");
              } catch (insertError) {
                console.error("DATABASE_STORAGE: Ошибка при вставке товара:", insertError);
              }
            } catch (singleItemError) {
              console.error("DATABASE_STORAGE: Ошибка при сохранении товара заказа:", singleItemError);
              // Продолжаем со следующим товаром
            }
          }
          
          console.log("DATABASE_STORAGE: Завершена обработка всех товаров заказа");
        } catch (itemsError) {
          console.error("DATABASE_STORAGE: Общая ошибка при обработке товаров заказа:", itemsError);
          // Не выбрасываем ошибку, чтобы заказ всё равно был создан
        }
      } else {
        console.log("DATABASE_STORAGE: Нет товаров для сохранения в заказе");
      }
      
      return newOrder;
    } catch (error) {
      console.error("DATABASE_STORAGE: Критическая ошибка при создании заказа:", error);
      throw error;
    }
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }
  
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  
  async getOrdersBySessionId(sessionId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.sessionId, sessionId));
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }
  
  // Admin methods - for dashboard
  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders);
  }
  
  // Методы для работы с отзывами
  async getReviewsByProductId(productId: number): Promise<Review[]> {
    return db.select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
  }
  
  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(reviewData)
      .returning();
    return review;
  }
  
  async getReviewById(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review || undefined;
  }
  
  async deleteReview(id: number): Promise<boolean> {
    const deleted = await db.delete(reviews).where(eq(reviews.id, id));
    return deleted.rowCount > 0;
  }
}