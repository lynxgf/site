import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product, Review } from "@shared/schema";
import ProductConfigurator from "@/components/product/product-configurator";
import ProductReviews from "@/components/product/reviews";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function ProductPageModern() {
  const params = useParams<{ id: string }>();
  const productId = parseInt(params.id);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
  });
  
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: !!productId,
  });
  
  // Получаем информацию о пользователе для проверки прав администратора
  const { data: session } = useQuery({
    queryKey: ['/api/session'],
  });
  
  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  const relatedProducts = allProducts
    ?.filter(p => p.id !== productId && p.category === product?.category)
    .slice(0, 4) || [];
  
  const { addToCart } = useCartStore();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Calculate discounted price
  const calculateDiscountedPrice = (price: string, discount: number): string => {
    const basePrice = parseFloat(price);
    const discountedPrice = basePrice * (1 - discount / 100);
    return discountedPrice.toFixed(0);
  };
  
  // Format price with thousands separators
  const formatPrice = (price: string | number): string => {
    if (typeof price === 'string') price = parseFloat(price);
    return price.toLocaleString('ru-RU');
  };

  // Add to cart handler
  const handleAddToCart = async (cartItem: any) => {
    try {
      setIsAddingToCart(true);
      await addToCart(cartItem);
      toast({
        title: "Товар добавлен в корзину",
        description: `${product?.name} был добавлен в вашу корзину.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить товар в корзину. Пожалуйста, попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {isLoading ? (
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-gray-300 border-t-[#8e2b85] rounded-full"></div>
        </div>
      ) : product ? (
        <>
          {/* Breadcrumbs with White Background */}
          <div className="bg-white border-b border-gray-100">
            <div className="container mx-auto py-4 px-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/" className="hover:text-[#8e2b85]">Главная</Link>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                <Link href="/products" className="hover:text-[#8e2b85]">Каталог</Link>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                <Link 
                  href={`/products/${product.category}`} 
                  className="hover:text-[#8e2b85]"
                >
                  {product.category === "mattress" ? "Матрасы" : 
                  product.category === "bed" ? "Кровати" : "Аксессуары"}
                </Link>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                <span className="text-gray-800 font-medium">{product.name}</span>
              </div>
            </div>
          </div>
          
          {/* Product Info Section */}
          <div className="container mx-auto py-10 px-6">
            {/* Product Main Info */}
            <div className="grid md:grid-cols-2 gap-16 mb-16">
              {/* Product Gallery - оптимизировано для мобильных устройств */}
              <div className="md:sticky md:top-8 self-start">
                {product.images && product.images.length > 0 ? (
                  <div className="relative aspect-square bg-white border border-gray-200 overflow-hidden rounded-sm">
                    <img
                      src={product.images[selectedImage]}
                      alt={product.name}
                      className="object-contain w-full h-full p-4"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.discount && product.discount > 0 && (
                        <div className="bg-red-500 text-white text-xs font-medium px-2 py-1 uppercase">
                          -{product.discount}%
                        </div>
                      )}
                      
                      {product.featured && (
                        <div className="bg-black text-white text-xs font-medium px-2 py-1 uppercase">
                          BESTSELLER
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center rounded-sm">
                    <span className="text-gray-400">Нет изображения</span>
                  </div>
                )}
                
                {/* Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="grid grid-cols-6 gap-2 mt-4">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-sm overflow-hidden ${
                          selectedImage === index 
                            ? 'ring-2 ring-[#8e2b85] ring-offset-1' 
                            : 'border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Additional info under gallery */}
                <div className="mt-6 grid grid-cols-3 gap-4 bg-white border border-gray-200 p-4 rounded-sm">
                  <div className="flex items-center">
                    <div className="mr-3 w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#8e2b85]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Доставка</p>
                      <p className="text-sm font-medium">Бесплатно</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-3 w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#8e2b85]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Гарантия</p>
                      <p className="text-sm font-medium">24 месяца</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-3 w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#8e2b85]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Оплата</p>
                      <p className="text-sm font-medium">Любой способ</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Product Info & Configuration */}
              <div>
                <h1 className="text-3xl font-medium text-gray-900 mb-3">{product.name}</h1>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">({reviews.length} {reviews.length === 1 ? 'отзыв' : reviews.length > 1 && reviews.length < 5 ? 'отзыва' : 'отзывов'})</span>
                  </div>
                  
                  <div className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span>В наличии</span>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Артикул: {product.id}
                  </div>
                </div>
                
                <div className="mb-6">
                  {product.discount && product.discount > 0 ? (
                    <div className="flex items-center gap-3">
                      <p className="text-3xl font-semibold text-gray-900">
                        {formatPrice(calculateDiscountedPrice(product.basePrice, product.discount))} ₽
                      </p>
                      <p className="text-xl text-gray-400 line-through">
                        {formatPrice(product.basePrice)} ₽
                      </p>
                      <div className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                        Скидка {product.discount}%
                      </div>
                    </div>
                  ) : (
                    <p className="text-3xl font-semibold text-gray-900">
                      {formatPrice(product.basePrice)} ₽
                    </p>
                  )}
                </div>
                
                <div className="mb-8 bg-white p-6 border border-gray-200 rounded-sm">
                  <h3 className="text-lg font-medium mb-4">Описание</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
                
                {/* Product Configurator */}
                <div className="bg-white p-6 border border-gray-200 rounded-sm mb-8">
                  <ProductConfigurator 
                    product={product}
                    onAddToCart={handleAddToCart}
                    isAddingToCart={isAddingToCart}
                  />
                </div>
                
                {/* Product Reviews */}
                <div className="bg-white p-6 border border-gray-200 rounded-sm mb-8">
                  <ProductReviews 
                    productId={productId} 
                    isAdmin={session?.isAdmin === true} 
                  />
                </div>
                
                {/* Share and Wishlist */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center text-gray-500 hover:text-[#8e2b85]">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                      <span className="text-sm">В избранное</span>
                    </button>
                    
                    <button className="flex items-center text-gray-500 hover:text-[#8e2b85]">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                      </svg>
                      <span className="text-sm">Поделиться</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1 text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Сертифицированная продукция</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product Specifications */}
            <div className="bg-white p-8 border border-gray-200 rounded-sm mb-16">
              <h2 className="text-2xl font-medium text-gray-900 mb-6">Характеристики</h2>
              
              <div className="grid md:grid-cols-2 gap-x-16 gap-y-4">
                {product.specifications && product.specifications
                  .slice(0, Math.ceil(product.specifications.length / 2))
                  .map((spec, index) => (
                    <div key={index} className="flex py-3 border-b border-gray-100">
                      <span className="font-medium text-gray-700 w-1/2">{spec.key}</span>
                      <span className="text-gray-600">{spec.value}</span>
                    </div>
                  ))}
                
                {product.specifications && product.specifications
                  .slice(Math.ceil(product.specifications.length / 2))
                  .map((spec, index) => (
                    <div key={index} className="flex py-3 border-b border-gray-100">
                      <span className="font-medium text-gray-700 w-1/2">{spec.key}</span>
                      <span className="text-gray-600">{spec.value}</span>
                    </div>
                  ))}
              </div>
            </div>
            
            {/* Reviews Section */}
            <div className="bg-white p-8 border border-gray-200 rounded-sm mb-16">
              <ProductReviews 
                productId={productId} 
                isAdmin={session?.isAdmin} 
              />
            </div>
            
            {/* Related products */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-medium text-gray-900">Похожие товары</h2>
                <Link href="/products" className="text-[#8e2b85] flex items-center hover:underline">
                  <span>Все товары</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <div 
                    key={relatedProduct.id} 
                    className="bg-white group hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col"
                  >
                    <Link href={`/product/${relatedProduct.id}`} className="block relative overflow-hidden flex-grow">
                      <div className="relative">
                        {/* Discount badge */}
                        {relatedProduct.discount && relatedProduct.discount > 0 && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 z-10 uppercase">
                            -{relatedProduct.discount}%
                          </div>
                        )}
                        
                        <div className="overflow-hidden">
                          <img
                            src={relatedProduct.images?.[0] || 'https://via.placeholder.com/300'}
                            alt={relatedProduct.name}
                            className="w-full aspect-square object-cover object-center group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                      </div>
                      
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="uppercase text-xs tracking-wider text-gray-500 mb-1">
                          {relatedProduct.category === "mattress" ? "МАТРАСЫ" : relatedProduct.category === "bed" ? "КРОВАТИ" : "АКСЕССУАРЫ"}
                        </div>
                        
                        <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-[#8e2b85] transition-colors line-clamp-2">
                          {relatedProduct.name}
                        </h3>
                        
                        <div className="mt-auto">
                          {relatedProduct.discount && relatedProduct.discount > 0 ? (
                            <div className="flex flex-col">
                              <span className="text-black font-medium text-lg">
                                {formatPrice(calculateDiscountedPrice(relatedProduct.basePrice, relatedProduct.discount))} ₽
                              </span>
                              <span className="text-gray-500 text-sm line-through">
                                {formatPrice(relatedProduct.basePrice)} ₽
                              </span>
                            </div>
                          ) : (
                            <span className="text-black font-medium text-lg">
                              {formatPrice(relatedProduct.basePrice)} ₽
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="h-screen flex flex-col items-center justify-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">Товар не найден</h2>
          <p className="text-gray-600 mb-8">Извините, но запрашиваемый товар не существует или был удален.</p>
          <Button asChild>
            <Link href="/products">Вернуться в каталог</Link>
          </Button>
        </div>
      )}
    </div>
  );
}