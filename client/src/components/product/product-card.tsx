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
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative">
        <Link href={`/product/${product.id}`}>
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-48 object-cover"
          />
        </Link>
        
        <div className="absolute top-3 right-3">
          <button 
            className="bg-white rounded-full p-2 shadow-sm hover:bg-gray-100"
            aria-label="Add to favorites"
          >
            <i className="far fa-heart text-gray-400 hover:text-accent-500"></i>
          </button>
        </div>
        
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{product.discount}%
          </div>
        )}
        
        {product.featured && !product.discount && (
          <div className="absolute top-3 left-3 bg-primary-700 text-white text-xs font-bold px-2 py-1 rounded">
            ХИТ
          </div>
        )}
      </div>
      
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 hover:text-primary-700">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400 text-sm">
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className="fas fa-star"></i>
            <i className={product.id % 2 === 0 ? 'fas fa-star' : 'fas fa-star-half-alt'}></i>
          </div>
          <span className="ml-1 text-xs text-gray-500">({(12 + product.id * 7)})</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold text-gray-900">{formatPrice(discountedPrice)} ₽</p>
            {product.discount > 0 && (
              <p className="text-gray-500 text-sm line-through">{formatPrice(basePrice)} ₽</p>
            )}
          </div>
          
          <Link href={`/product/${product.id}`}>
            <button 
              className="bg-primary-800 text-white p-2 rounded-md hover:bg-primary-900"
              aria-label="Add to cart"
            >
              <i className="fas fa-shopping-cart"></i>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
