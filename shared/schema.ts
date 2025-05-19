import { pgTable, text, serial, numeric, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

// Products schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'mattress' or 'bed'
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  images: text("images").array().notNull(),
  sizes: jsonb("sizes").notNull(), // Array of available sizes with price differences
  fabricCategories: jsonb("fabric_categories").notNull(), // Array of fabric categories with price multipliers
  fabrics: jsonb("fabrics").notNull(), // Array of fabrics with category, color, image
  hasLiftingMechanism: boolean("has_lifting_mechanism").default(false),
  liftingMechanismPrice: numeric("lifting_mechanism_price", { precision: 10, scale: 2 }).default("0"),
  specifications: jsonb("specifications").notNull(), // Key-value pairs of specifications
  discount: integer("discount").default(0), // Percentage discount
  featured: boolean("featured").default(false),
  inStock: boolean("in_stock").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

// Cart items schema
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  selectedSize: text("selected_size").notNull(),
  customWidth: integer("custom_width"),
  customLength: integer("custom_length"),
  selectedFabricCategory: text("selected_fabric_category").notNull(),
  selectedFabric: text("selected_fabric").notNull(),
  hasLiftingMechanism: boolean("has_lifting_mechanism").default(false),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

// Orders schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  address: text("address").notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

// Order items schema
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  selectedSize: text("selected_size").notNull(),
  customWidth: integer("custom_width"),
  customLength: integer("custom_length"),
  selectedFabricCategory: text("selected_fabric_category").notNull(),
  selectedFabric: text("selected_fabric").notNull(),
  fabricName: text("fabric_name").notNull(),
  hasLiftingMechanism: boolean("has_lifting_mechanism").default(false),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Custom types for product configuration
export type Size = {
  id: string;
  label: string;
  price: number;
};

export type FabricCategory = {
  id: string;
  name: string;
  priceMultiplier: number;
};

export type Fabric = {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  image: string;
};

export type ProductSpecification = {
  key: string;
  value: string;
};
