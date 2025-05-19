import { Link } from "wouter";
import { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCardModern({ product }: ProductCardProps) {
  const discountedPrice = product.discount && product.discount > 0
    ? Math.round(parseFloat(product.basePrice) * (1 - product.discount / 100))
    : parseFloat(product.basePrice);

  // Функция для определения типа бейджа (Хит продаж, Новинка и т.д.)
  const getBadgeType = () => {
    if (product.featured) return { text: "BESTSELLER", bgColor: "bg-black" };
    if (product.discount && product.discount > 0) return { text: `−${product.discount}%`, bgColor: "bg-red-500" };
    return { text: "НОВИНКА", bgColor: "bg-[#8e2b85]" };
  };

  const badge = getBadgeType();
  
  // Генерация случайного рейтинга для демонстрации
  const rating = Math.random() * 0.5 + 4.5; // Рейтинг от 4.5 до 5.0
  const reviews = Math.floor(Math.random() * 30) + 10; // Количество отзывов от 10 до 40

  return (
    <div className="bg-white group hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
      <Link href={`/product/${product.id}`} className="block relative overflow-hidden flex-grow">
        <div className="relative">
          {/* Скидка и бейджи */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            <div className={`${badge.bgColor} text-white text-xs font-medium py-1 px-2 uppercase`}>
              {badge.text}
            </div>
            
            {product.discount && product.discount > 0 && badge.text !== `−${product.discount}%` && (
              <div className="bg-red-500 text-white text-xs font-medium py-1 px-2 uppercase">
                −{product.discount}%
              </div>
            )}
          </div>
          
          <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-medium py-1 px-2 z-10 uppercase">
            В НАЛИЧИИ
          </div>
          
          {/* Кнопки быстрых действий */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-[#8e2b85] hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
            <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-[#8e2b85] hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </button>
          </div>
          
          {/* Фото товара */}
          <div className="overflow-hidden">
            <img 
              src={product.images?.[0] || 'https://via.placeholder.com/600x400?text=Нет+изображения'} 
              alt={product.name} 
              className="w-full aspect-square object-cover object-center group-hover:scale-110 transition-transform duration-700"
            />
          </div>
        </div>
        
        <div className="p-4 flex flex-col">
          {/* Категория */}
          <div className="uppercase text-xs tracking-wider text-gray-500 mb-1">
            {product.category === "mattress" ? "МАТРАСЫ" : product.category === "bed" ? "КРОВАТИ" : "АКСЕССУАРЫ"}
          </div>
          
          {/* Название товара */}
          <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-[#8e2b85] transition-colors line-clamp-2">
            {product.name}
          </h3>
          
          {/* Рейтинг */}
          <div className="flex items-center text-yellow-400 mb-3">
            <span className="flex">
              {[...Array(5)].map((_, i) => {
                // Определяем заполнение звезды (полное, частичное или пустое)
                const starFill = i < Math.floor(rating) 
                  ? "currentColor" 
                  : i < Math.ceil(rating) 
                    ? "url(#partialFill)" 
                    : "none";
                
                return (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={starFill} className="w-4 h-4">
                    {i === Math.floor(rating) && rating % 1 !== 0 && (
                      <defs>
                        <linearGradient id="partialFill">
                          <stop offset={`${(rating % 1) * 100}%`} stopColor="currentColor" />
                          <stop offset={`${(rating % 1) * 100}%`} stopColor="white" />
                        </linearGradient>
                      </defs>
                    )}
                    <path strokeWidth="1" stroke="currentColor" fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                );
              })}
            </span>
            <span className="text-xs text-gray-500 ml-1">({reviews})</span>
          </div>
          
          {/* Цена */}
          <div className="flex items-center justify-between mt-auto">
            <div>
              {product.discount && product.discount > 0 ? (
                <div className="flex flex-col">
                  <span className="text-black font-medium text-lg">
                    {discountedPrice.toLocaleString()} ₽
                  </span>
                  <span className="text-gray-500 text-sm line-through">
                    {parseInt(product.basePrice).toLocaleString()} ₽
                  </span>
                </div>
              ) : (
                <span className="text-black font-medium text-lg">
                  {parseInt(product.basePrice).toLocaleString()} ₽
                </span>
              )}
            </div>
            
            <button className="w-10 h-10 flex items-center justify-center bg-black text-white hover:bg-[#8e2b85] transition-colors rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}