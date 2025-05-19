import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductConfigurator from "@/components/product/product-configurator";
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
              {/* Product Gallery */}
              <div className="sticky top-8 self-start">
                {product.images && product.images.length > 0 ? (
                  <div className="relative aspect-square bg-white border border-gray-200 overflow-hidden rounded-sm shadow-md group">
                    {/* 3D View button */}
                    <button className="absolute bottom-4 right-4 z-20 bg-white/80 backdrop-blur-sm py-2 px-3 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1 text-[#8e2b85]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                      </svg>
                      <span className="text-xs font-medium">3D просмотр</span>
                    </button>
                    
                    {/* Left/Right Navigation */}
                    {product.images.length > 1 && (
                      <>
                        <button 
                          onClick={() => setSelectedImage(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 z-20 bg-white/70 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-700">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => setSelectedImage(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 z-20 bg-white/70 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-700">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </button>
                      </>
                    )}
                    
                    <img
                      src={product.images[selectedImage]}
                      alt={product.name}
                      className="object-contain w-full h-full p-4 transition-transform duration-700 ease-in-out group-hover:scale-105"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                      {product.discount && product.discount > 0 && (
                        <div className="bg-red-500 text-white text-xs font-medium px-2 py-1 uppercase shadow-sm">
                          -{product.discount}%
                        </div>
                      )}
                      
                      {product.featured && (
                        <div className="bg-black text-white text-xs font-medium px-2 py-1 uppercase shadow-sm">
                          BESTSELLER
                        </div>
                      )}
                    </div>
                    
                    {/* Image magnifying glass effect */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-zoom-in"></div>
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
                        className={`aspect-square rounded-sm overflow-hidden transform transition-all duration-300 ${
                          selectedImage === index 
                            ? 'ring-2 ring-[#8e2b85] ring-offset-1 scale-105 shadow-md z-10' 
                            : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          className={`object-cover w-full h-full transition-all duration-300 ${selectedImage === index ? 'scale-110' : 'scale-100 hover:scale-105'}`}
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
                <div className="flex justify-between items-start mb-3">
                  <h1 className="text-3xl font-medium text-gray-900">{product.name}</h1>
                  <div className="flex items-center space-x-3">
                    <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-700">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                      </svg>
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-700">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                        </svg>
                      ))}
                    </div>
                    <button className="text-sm text-gray-500 hover:underline">(24 отзыва)</button>
                  </div>
                  
                  <div className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span>В наличии</span>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Артикул: <span className="font-medium">{product.id}</span>
                  </div>
                </div>
                
                <div className="mb-6 bg-white p-5 border border-gray-200 rounded-md shadow-sm">
                  {product.discount && product.discount > 0 ? (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3">
                        <p className="text-3xl font-semibold text-gray-900">
                          {formatPrice(calculateDiscountedPrice(product.basePrice, product.discount))} ₽
                        </p>
                        <p className="text-xl text-gray-400 line-through">
                          {formatPrice(product.basePrice)} ₽
                        </p>
                        <div className="ml-2 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          Скидка {product.discount}%
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-green-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Вы экономите: {formatPrice(parseFloat(product.basePrice) - parseFloat(calculateDiscountedPrice(product.basePrice, product.discount)))} ₽
                      </div>
                    </div>
                  ) : (
                    <p className="text-3xl font-semibold text-gray-900">
                      {formatPrice(product.basePrice)} ₽
                    </p>
                  )}
                  
                  {/* Дополнительные опции оплаты */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-[#8e2b85]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                        </svg>
                        <span className="text-sm font-medium">Рассрочка</span>
                      </div>
                      <span className="text-sm text-gray-600">от {formatPrice(parseFloat(product.discount && product.discount > 0 ? calculateDiscountedPrice(product.basePrice, product.discount) : product.basePrice) / 10)} ₽/мес</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8 bg-white p-6 border border-gray-200 rounded-sm shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Описание</h3>
                    <button className="text-[#8e2b85] text-sm hover:underline flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Скачать PDF
                    </button>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {product.description}
                  </p>
                  
                  {/* Основные преимущества */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8e2b85]/10 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#8e2b85]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Экологически чистые материалы</h4>
                        <p className="text-xs text-gray-600 mt-1">Безопасны для здоровья всей семьи</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8e2b85]/10 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#8e2b85]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Простое обслуживание</h4>
                        <p className="text-xs text-gray-600 mt-1">Легкий уход и долговечность</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Product Configurator */}
                <div className="bg-white p-6 border border-gray-200 rounded-sm mb-8">
                  <ProductConfigurator 
                    product={product}
                    onAddToCart={handleAddToCart}
                    isAddingToCart={isAddingToCart}
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
            <div className="bg-white p-8 border border-gray-200 rounded-sm mb-16 shadow-md">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-medium text-gray-900">Характеристики</h2>
                <div className="flex items-center">
                  <a href="#" className="text-sm text-[#8e2b85] hover:underline flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Загрузить инструкцию
                  </a>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-x-16 gap-y-2">
                {product.specifications && product.specifications
                  .slice(0, Math.ceil(product.specifications?.length / 2))
                  .map((spec, index) => (
                    <div key={index} className="flex py-3 border-b border-gray-100 hover:bg-gray-50 group transition-colors rounded-sm px-2">
                      <span className="font-medium text-gray-700 w-1/2 group-hover:text-[#8e2b85] transition-colors">{spec.key}</span>
                      <span className="text-gray-600">{spec.value}</span>
                    </div>
                  ))}
                
                {product.specifications && product.specifications
                  .slice(Math.ceil(product.specifications?.length / 2))
                  .map((spec, index) => (
                    <div key={index} className="flex py-3 border-b border-gray-100 hover:bg-gray-50 group transition-colors rounded-sm px-2">
                      <span className="font-medium text-gray-700 w-1/2 group-hover:text-[#8e2b85] transition-colors">{spec.key}</span>
                      <span className="text-gray-600">{spec.value}</span>
                    </div>
                  ))}
              </div>
              
              {/* Дополнительные сертификаты */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Сертификаты качества</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center px-4 py-3 border border-gray-200 rounded-sm bg-gray-50 hover:bg-gray-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#8e2b85] mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="text-sm font-medium">Сертификат экологичности</span>
                  </div>
                  <div className="flex items-center px-4 py-3 border border-gray-200 rounded-sm bg-gray-50 hover:bg-gray-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#8e2b85] mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="text-sm font-medium">Гигиенический сертификат</span>
                  </div>
                  <div className="flex items-center px-4 py-3 border border-gray-200 rounded-sm bg-gray-50 hover:bg-gray-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#8e2b85] mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="text-sm font-medium">Сертификат качества</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Related products */}
            <div className="bg-white p-8 border border-gray-200 rounded-sm mb-16 shadow-md">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-medium text-gray-900">Похожие товары</h2>
                <Link href="/products" className="text-[#8e2b85] flex items-center px-3 py-2 hover:bg-[#8e2b85]/5 rounded-full transition-colors">
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
                    className="bg-white group hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col rounded-sm overflow-hidden"
                  >
                    <Link href={`/product/${relatedProduct.id}`} className="block relative overflow-hidden flex-grow">
                      <div className="relative">
                        {/* Discount badge */}
                        {relatedProduct.discount && relatedProduct.discount > 0 && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 z-10 uppercase shadow-sm">
                            -{relatedProduct.discount}%
                          </div>
                        )}
                        
                        {/* Hover quick view button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                          <div className="bg-white/80 backdrop-blur-sm py-2 px-4 rounded-full flex items-center shadow-md transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1 text-[#8e2b85]">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-xs font-medium">Быстрый просмотр</span>
                          </div>
                        </div>
                        
                        <div className="overflow-hidden">
                          <img
                            src={relatedProduct.images?.[0] || 'https://via.placeholder.com/300'}
                            alt={relatedProduct.name}
                            className="w-full aspect-square object-cover object-center group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      </div>
                      
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="uppercase text-xs tracking-wider text-gray-500 mb-1">
                          {relatedProduct.category === "mattress" ? "МАТРАСЫ" : relatedProduct.category === "bed" ? "КРОВАТИ" : "АКСЕССУАРЫ"}
                        </div>
                        
                        <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-[#8e2b85] transition-colors line-clamp-2">
                          {relatedProduct.name}
                        </h3>
                        
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400">
                              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                            </svg>
                          ))}
                        </div>
                        
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
              
              <div className="mt-10 border-t border-gray-100 pt-10">
                <h3 className="text-xl font-medium text-gray-900 mb-6">Клиенты также смотрели</h3>
                <div className="flex overflow-hidden gap-4">
                  {[...Array(6)].map((_, index) => {
                    // Используем остальные продукты как "Также смотрели"
                    const product = allProducts?.[index % (allProducts.length || 1)];
                    if (!product) return null;
                    
                    return (
                      <Link 
                        key={index} 
                        href={`/product/${product.id}`}
                        className="min-w-[180px] max-w-[180px] bg-white border border-gray-100 rounded-sm overflow-hidden hover:shadow-md transition-shadow group"
                      >
                        <div className="relative">
                          <img
                            src={product.images?.[0] || 'https://via.placeholder.com/180'}
                            alt={product.name}
                            className="w-full aspect-square object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-3">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#8e2b85] transition-colors">
                            {product.name}
                          </h4>
                          <p className="text-sm font-medium mt-1">
                            {formatPrice(product.basePrice)} ₽
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
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