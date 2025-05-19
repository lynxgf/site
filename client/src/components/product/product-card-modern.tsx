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
    return { text: "В НАЛИЧИИ", bgColor: "bg-green-600" };
  };

  const badge = getBadgeType();

  return (
    <div className="bg-white group hover:shadow-lg transition-shadow duration-300">
      <Link href={`/products/${product.id}`} className="block relative overflow-hidden">
        <div className="relative">
          <div className={`absolute top-2 left-2 ${badge.bgColor} text-white text-xs font-medium py-1 px-2 z-10 uppercase`}>
            {badge.text}
          </div>
          
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-medium py-1 px-2 z-10 uppercase hidden md:block">
            В НАЛИЧИИ
          </div>
          
          <img 
            src={product.images?.[0] || 'https://via.placeholder.com/600x400?text=Нет+изображения'} 
            alt={product.name} 
            className="w-full aspect-square object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        
        <div className="p-4">
          <div className="uppercase text-xs tracking-wider text-gray-500 mb-1">
            {product.category === "mattress" ? "МАТРАСЫ" : product.category === "bed" ? "КРОВАТИ" : "АКСЕССУАРЫ"}
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-[#8e2b85] transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center text-yellow-400 mb-3">
            <span className="flex">
              {[...Array(5)].map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              ))}
            </span>
            <span className="text-xs text-gray-500 ml-1">(19)</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              {product.discount && product.discount > 0 ? (
                <div className="flex flex-col">
                  <span className="text-black font-medium text-lg">
                    {discountedPrice} ₽
                  </span>
                  <span className="text-gray-500 text-sm line-through">
                    {product.basePrice} ₽
                  </span>
                </div>
              ) : (
                <span className="text-black font-medium text-lg">
                  {product.basePrice} ₽
                </span>
              )}
            </div>
            
            <button className="w-8 h-8 flex items-center justify-center bg-black text-white hover:bg-[#8e2b85] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}