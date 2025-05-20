import { db } from './db';
import { users, products, InsertUser, InsertProduct } from '@shared/schema';

async function initDb() {
  console.log('Initializing database...');
  
  try {
    // Check if admin user exists
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length === 0) {
      console.log('Creating admin user...');
      
      // Create admin user with bcrypt password hashing
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const adminUser: InsertUser = {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        isAdmin: true
      };
      
      await db.insert(users).values(adminUser);
      console.log('Admin user created successfully.');
    } else {
      console.log('Users already exist, skipping admin user creation.');
    }
    
    // Check if products exist
    const existingProducts = await db.select().from(products);
    
    if (existingProducts.length === 0) {
      console.log('Adding sample products...');
      
      // Sample beds
      const bedSizes = [
        { id: 'single', label: '90×200', price: -5000 },
        { id: 'small_double', label: '120×200', price: -2500 },
        { id: 'double', label: '140×200', price: 0 },
        { id: 'queen', label: '160×200', price: 3000 },
        { id: 'king', label: '180×200', price: 6000 },
        { id: 'custom', label: 'Свой размер', price: 0 }
      ];
      
      const fabricCategories = [
        { id: 'economy', name: 'Эконом', priceMultiplier: 0.8 },
        { id: 'standard', name: 'Стандарт', priceMultiplier: 1 },
        { id: 'premium', name: 'Премиум', priceMultiplier: 1.3 }
      ];
      
      const fabrics = [
        // Economy fabrics
        { id: 'gray', name: 'Серый', category: 'economy', thumbnail: 'https://images.pexels.com/photos/172277/pexels-photo-172277.jpeg?auto=compress&cs=tinysrgb&w=100&h=100', image: 'https://images.pexels.com/photos/172277/pexels-photo-172277.jpeg?auto=compress&cs=tinysrgb&w=1200' },
        { id: 'blue', name: 'Синий', category: 'economy', thumbnail: 'https://images.pexels.com/photos/14936126/pexels-photo-14936126.jpeg?auto=compress&cs=tinysrgb&w=100&h=100', image: 'https://images.pexels.com/photos/14936126/pexels-photo-14936126.jpeg?auto=compress&cs=tinysrgb&w=1200' },
        { id: 'brown', name: 'Коричневый', category: 'economy', thumbnail: 'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=100&h=100', image: 'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=1200' },
        
        // Standard fabrics
        { id: 'beige', name: 'Бежевый', category: 'standard', thumbnail: 'https://images.pexels.com/photos/7728587/pexels-photo-7728587.jpeg?auto=compress&cs=tinysrgb&w=100&h=100', image: 'https://images.pexels.com/photos/7728587/pexels-photo-7728587.jpeg?auto=compress&cs=tinysrgb&w=1200' },
        { id: 'light_gray', name: 'Светло-серый', category: 'standard', thumbnail: 'https://images.pexels.com/photos/7676332/pexels-photo-7676332.jpeg?auto=compress&cs=tinysrgb&w=100&h=100', image: 'https://images.pexels.com/photos/7676332/pexels-photo-7676332.jpeg?auto=compress&cs=tinysrgb&w=1200' },
        { id: 'dark_gray', name: 'Темно-серый', category: 'standard', thumbnail: 'https://images.pexels.com/photos/1497365/pexels-photo-1497365.jpeg?auto=compress&cs=tinysrgb&w=100&h=100', image: 'https://images.pexels.com/photos/1497365/pexels-photo-1497365.jpeg?auto=compress&cs=tinysrgb&w=1200' },
        
        // Premium fabrics
        { id: 'velvet_blue', name: 'Синий бархат', category: 'premium', thumbnail: 'https://images.pexels.com/photos/6373305/pexels-photo-6373305.jpeg?auto=compress&cs=tinysrgb&w=100&h=100', image: 'https://images.pexels.com/photos/6373305/pexels-photo-6373305.jpeg?auto=compress&cs=tinysrgb&w=1200' },
        { id: 'velvet_green', name: 'Зеленый бархат', category: 'premium', thumbnail: 'https://images.pexels.com/photos/7354079/pexels-photo-7354079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100', image: 'https://images.pexels.com/photos/7354079/pexels-photo-7354079.jpeg?auto=compress&cs=tinysrgb&w=1200' },
        { id: 'leather_brown', name: 'Коричневая кожа', category: 'premium', thumbnail: 'https://images.pexels.com/photos/276093/pexels-photo-276093.jpeg?auto=compress&cs=tinysrgb&w=100&h=100', image: 'https://images.pexels.com/photos/276093/pexels-photo-276093.jpeg?auto=compress&cs=tinysrgb&w=1200' }
      ];
      
      // Add bed products
      const bedImages = [
        'https://images.pexels.com/photos/6585598/pexels-photo-6585598.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/3773584/pexels-photo-3773584.png?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/4210339/pexels-photo-4210339.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/6489093/pexels-photo-6489093.jpeg?auto=compress&cs=tinysrgb&w=1200'
      ];
      
      const morfeoBed: InsertProduct = {
        name: 'Кровать "Морфей"',
        description: 'Элегантная кровать "Морфей" с мягким изголовьем и возможностью выбора обивки. Идеальное сочетание комфорта, функциональности и стиля для вашей спальни. Доступна с подъемным механизмом для удобного хранения.',
        category: 'bed',
        basePrice: "41900",
        images: bedImages,
        sizes: bedSizes,
        fabricCategories: fabricCategories,
        fabrics: fabrics,
        hasLiftingMechanism: true,
        liftingMechanismPrice: "8500",
        specifications: [
          { key: "Материал основания", value: "Массив сосны" },
          { key: "Материал изголовья", value: "Фанера, ППУ" },
          { key: "Высота изголовья", value: "115 см" },
          { key: "Высота боковой спинки", value: "35 см" },
          { key: "Высота от пола", value: "30 см" },
          { key: "Тип подъемного механизма", value: "Газлифт" },
          { key: "Максимальная нагрузка", value: "320 кг" },
          { key: "Тип основания", value: "Ортопедическое" },
          { key: "Гарантия", value: "18 месяцев" },
          { key: "Производитель", value: "LuxBed, Россия" }
        ],
        discount: 10,
        featured: true,
        inStock: true
      };
      
      // Add more beds
      const auroraBed: InsertProduct = {
        name: 'Кровать "Аврора"',
        description: 'Современная кровать "Аврора" с изящным дизайном и высоким изголовьем. Подходит для классических и современных интерьеров.',
        category: 'bed',
        basePrice: "44900",
        images: ['https://images.pexels.com/photos/3773579/pexels-photo-3773579.png?auto=compress&cs=tinysrgb&w=1200'],
        sizes: bedSizes,
        fabricCategories: fabricCategories,
        fabrics: fabrics,
        hasLiftingMechanism: true,
        liftingMechanismPrice: "9000",
        specifications: [
          { key: "Материал основания", value: "Массив бука" },
          { key: "Материал изголовья", value: "МДФ, ППУ" },
          { key: "Высота изголовья", value: "120 см" },
          { key: "Высота от пола", value: "32 см" },
          { key: "Максимальная нагрузка", value: "300 кг" },
          { key: "Гарантия", value: "24 месяца" }
        ],
        discount: 0,
        featured: false,
        inStock: true
      };
      
      const oscarBed: InsertProduct = {
        name: 'Кровать "Оскар" с подъемным механизмом',
        description: 'Функциональная кровать с вместительным бельевым ящиком и стильным дизайном. Идеальное решение для небольших спален.',
        category: 'bed',
        basePrice: "52400",
        images: ['https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=1200'],
        sizes: bedSizes,
        fabricCategories: fabricCategories,
        fabrics: fabrics,
        hasLiftingMechanism: true,
        liftingMechanismPrice: "10000",
        specifications: [
          { key: "Материал основания", value: "ЛДСП, массив сосны" },
          { key: "Материал изголовья", value: "ЛДСП, ППУ повышенной плотности" },
          { key: "Высота изголовья", value: "100 см" },
          { key: "Объем бельевого ящика", value: "600 л" },
          { key: "Максимальная нагрузка", value: "350 кг" },
          { key: "Гарантия", value: "24 месяца" }
        ],
        discount: 0,
        featured: true,
        inStock: true
      };
      
      // Add mattresses
      const comfortMattress: InsertProduct = {
        name: 'Матрас "Комфорт Люкс"',
        description: 'Анатомический матрас средней жесткости с независимыми пружинами и натуральными наполнителями. Обеспечивает комфортный сон и поддержку позвоночника.',
        category: 'mattress',
        basePrice: "28900",
        images: ['https://images.unsplash.com/photo-1631049035182-249067d7618e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800'],
        sizes: bedSizes,
        fabricCategories: [
          { id: 'standard', name: 'Стандарт', priceMultiplier: 1 },
          { id: 'premium', name: 'Премиум', priceMultiplier: 1.2 }
        ],
        fabrics: [
          { id: 'white', name: 'Белый', category: 'standard', thumbnail: 'https://images.unsplash.com/photo-1586105449897-20b5d46a3b51?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100', image: 'https://images.unsplash.com/photo-1586105449897-20b5d46a3b51?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800' },
          { id: 'beige', name: 'Бежевый', category: 'standard', thumbnail: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100', image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800' },
          { id: 'silver', name: 'Серебристый', category: 'premium', thumbnail: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100', image: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800' }
        ],
        hasLiftingMechanism: false,
        liftingMechanismPrice: "0",
        specifications: [
          { key: "Тип пружинного блока", value: "Независимый, 256 пружин/м²" },
          { key: "Жесткость", value: "Средняя" },
          { key: "Высота", value: "24 см" },
          { key: "Наполнитель", value: "Натуральный латекс, кокосовая койра" },
          { key: "Максимальная нагрузка", value: "140 кг" },
          { key: "Гарантия", value: "36 месяцев" }
        ],
        discount: 15,
        featured: false,
        inStock: true
      };
      
      const ergoMattress: InsertProduct = {
        name: 'Матрас "Эргономик"',
        description: 'Инновационный беспружинный матрас с эффектом памяти. Адаптируется к форме тела и снимает напряжение с позвоночника и суставов.',
        category: 'mattress',
        basePrice: "32750",
        images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800'],
        sizes: bedSizes,
        fabricCategories: [
          { id: 'standard', name: 'Стандарт', priceMultiplier: 1 },
          { id: 'premium', name: 'Премиум', priceMultiplier: 1.2 }
        ],
        fabrics: [
          { id: 'white', name: 'Белый', category: 'standard', thumbnail: 'https://images.unsplash.com/photo-1586105449897-20b5d46a3b51?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100', image: 'https://images.unsplash.com/photo-1586105449897-20b5d46a3b51?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800' },
          { id: 'beige', name: 'Бежевый', category: 'standard', thumbnail: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100', image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800' },
          { id: 'silver', name: 'Серебристый', category: 'premium', thumbnail: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100', image: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800' }
        ],
        hasLiftingMechanism: false,
        liftingMechanismPrice: "0",
        specifications: [
          { key: "Тип", value: "Беспружинный" },
          { key: "Жесткость", value: "Средняя" },
          { key: "Высота", value: "22 см" },
          { key: "Наполнитель", value: "Memory Foam, высокоэластичный ППУ" },
          { key: "Максимальная нагрузка", value: "150 кг" },
          { key: "Гарантия", value: "48 месяцев" }
        ],
        discount: 0,
        featured: true,
        inStock: true
      };
      
      // Insert all sample products
      await db.insert(products).values([
        morfeoBed, 
        auroraBed, 
        oscarBed, 
        comfortMattress, 
        ergoMattress
      ]);
      
      console.log('Sample products created successfully.');
    } else {
      console.log('Products already exist, skipping product creation.');
    }
    
    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Export the function for use in index.ts
export { initDb };