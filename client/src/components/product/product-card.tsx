import { Link } from 'wouter';
import { Product } from '@shared/schema';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Calculate the discounted price if there's a discount
  const basePrice = Number(product.basePrice);
  const discountedPrice = product.discount 
    ? basePrice - (basePrice * (product.discount / 100))
    : basePrice;

  return (
    <div className="group relative overflow-hidden transition-all duration-300 hover:translate-y-[-4px]">
      {/* Main card */}
      <div className="bg-white overflow-hidden border border-neutral-100 hover:border-neutral-200 transition-all">
        {/* Product image container */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <Link href={`/product/${product.id}`}>
            <div className="w-full h-full overflow-hidden">
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </Link>
          
          {/* Product badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.discount > 0 && (
              <div className="bg-red-500 text-white text-xs font-medium px-2 py-1">
                -{product.discount}%
              </div>
            )}
            
            {product.featured && !product.discount && (
              <div className="bg-neutral-900 text-white text-xs font-medium px-2 py-1">
                BESTSELLER
              </div>
            )}

            {product.inStock && (
              <div className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2 py-1">
                В наличии
              </div>
            )}
          </div>
          
          {/* Quick actions (absolute positioned) */}
          <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              className="bg-white w-8 h-8 flex items-center justify-center shadow-sm hover:bg-neutral-100 transition-colors"
              aria-label="Add to favorites"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-neutral-600">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
            
            <button 
              className="bg-white w-8 h-8 flex items-center justify-center shadow-sm hover:bg-neutral-100 transition-colors"
              aria-label="Quick view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-neutral-600">
                <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      
        {/* Product info */}
        <div className="p-4">
          {/* Category */}
          <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
            {product.category === 'bed' ? 'Кровати' : 'Матрасы'}
          </div>
          
          {/* Product name */}
          <Link href={`/product/${product.id}`}>
            <h3 className="font-medium text-neutral-900 mb-1 transition-colors group-hover:text-neutral-700">
              {product.name}
            </h3>
          </Link>
          
          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex text-yellow-400 text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
              </svg>
              {product.id % 2 === 0 ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="ml-1 text-xs text-neutral-500">({(12 + product.id * 7)})</span>
          </div>
          
          {/* Price */}
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-baseline gap-2">
                <p className="font-medium text-neutral-900">{formatPrice(discountedPrice)} ₽</p>
                {product.discount > 0 && (
                  <p className="text-neutral-400 text-sm line-through">{formatPrice(basePrice)} ₽</p>
                )}
              </div>
            </div>
            
            <Link href={`/product/${product.id}`} className="block">
              <button 
                className="bg-neutral-900 hover:bg-black text-white w-8 h-8 flex items-center justify-center transition-colors"
                aria-label="Просмотреть товар"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* "Add to cart" button that appears on hover */}
      <div className="absolute inset-x-0 -bottom-10 group-hover:bottom-0 transition-all duration-300">
        <Link href={`/product/${product.id}`} className="block">
          <button 
            className="w-full py-3 bg-neutral-900 hover:bg-black text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Добавить в корзину
          </button>
        </Link>
      </div>
    </div>
  );
}
