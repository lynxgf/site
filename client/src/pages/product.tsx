import { useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product, Size, FabricCategory, Fabric } from "@shared/schema";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import ProductConfigurator from "@/components/product/product-configurator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/product/product-card";
import { useConfigurationStore } from "@/lib/store";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const productId = parseInt(params.id);
  
  const resetConfiguration = useConfigurationStore(state => state.resetConfiguration);
  
  // Reset configuration when navigating to a different product
  useEffect(() => {
    resetConfiguration();
  }, [productId, resetConfiguration]);
  
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
  });
  
  const { data: allProducts, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  const relatedProducts = allProducts?.filter(p => 
    p.id !== productId && p.category === product?.category
  ).slice(0, 4);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="bg-gray-200 rounded-lg h-96 animate-pulse"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-24 animate-pulse"></div>
              ))}
            </div>
          </div>
          <div>
            <div className="h-10 bg-gray-200 rounded w-3/4 animate-pulse mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse mb-4"></div>
            <div className="h-20 bg-gray-200 rounded w-full animate-pulse mb-6"></div>
            <div className="bg-gray-100 rounded-lg p-6 animate-pulse mb-6 h-80"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-lg mb-8">
          <p className="text-red-600">Произошла ошибка при загрузке товара. Пожалуйста, попробуйте позже.</p>
        </div>
      </div>
    );
  }
  
  // Define breadcrumb items
  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { 
      label: product.category === "bed" ? "Кровати" : "Матрасы", 
      href: `/products/${product.category}` 
    },
    { label: product.name, href: `/product/${product.id}` }
  ];
  
  return (
    <div className="max-w-[1400px] mx-auto px-4 pb-16">
      <Breadcrumbs items={breadcrumbItems} className="pt-6 mb-8" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-6">
          {/* Main image */}
          <div className="bg-white overflow-hidden rounded-sm border border-neutral-100 shadow-sm">
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-auto object-cover"
            />
          </div>
          
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {product.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`bg-white overflow-hidden cursor-pointer transition-all hover:opacity-90 ${
                    index === 0 ? 'ring-2 ring-neutral-800' : 'border border-neutral-200'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} - вид ${index + 1}`} 
                    className="w-full h-20 object-cover" 
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Product badge */}
          {product.discount > 0 && (
            <div className="absolute top-4 left-4">
              <span className="bg-red-500 text-white text-sm font-medium py-1 px-3">
                SALE
              </span>
            </div>
          )}
        </div>
        
        {/* Product Configurator */}
        <div>
          <h1 className="text-3xl font-medium text-neutral-900 mb-2">{product.name}</h1>
          <div className="flex items-center mb-6">
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-2">Артикул: {product.id}00{product.id * 23}</span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1 text-yellow-500">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                4.9
              </span>
              <span className="mx-2">|</span>
              <span className="text-gray-500 hover:text-gray-700 cursor-pointer">15 отзывов</span>
            </div>
          </div>
          
          <ProductConfigurator product={product} />
        </div>
      </div>
      
      {/* Product details tabs */}
      <div className="mt-20">
        <Tabs defaultValue="specifications" className="w-full">
          <div className="border-b border-neutral-200">
            <TabsList className="w-full justify-start bg-transparent p-0 h-12">
              <TabsTrigger 
                value="specifications" 
                className="px-6 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none data-[state=active]:bg-transparent text-[15px] font-medium"
              >
                Характеристики
              </TabsTrigger>
              <TabsTrigger 
                value="dimensions" 
                className="px-6 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none data-[state=active]:bg-transparent text-[15px] font-medium"
              >
                Габаритные размеры
              </TabsTrigger>
              <TabsTrigger 
                value="delivery" 
                className="px-6 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none data-[state=active]:bg-transparent text-[15px] font-medium"
              >
                Доставка и оплата
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="px-6 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none data-[state=active]:bg-transparent text-[15px] font-medium"
              >
                Отзывы
              </TabsTrigger>
              <TabsTrigger 
                value="warranty" 
                className="px-6 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none data-[state=active]:bg-transparent text-[15px] font-medium"
              >
                Гарантия
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="specifications" className="pt-10 pb-8 animate-in fade-in-50 duration-300">
            {product.specifications && Array.isArray(product.specifications) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
                <div>
                  <h3 className="font-medium text-lg text-neutral-900 mb-6 flex items-center">
                    <span className="inline-block w-1 h-4 bg-neutral-800 mr-3"></span>
                    Общие характеристики
                  </h3>
                  <div className="space-y-3">
                    {product.specifications.slice(0, Math.ceil(product.specifications.length / 2)).map((spec, index) => (
                      <div key={index} className="flex items-start py-2 border-b border-neutral-100 last:border-b-0">
                        <div className="w-1/2 text-neutral-600 pr-4">{spec.key}</div>
                        <div className="w-1/2 font-medium text-neutral-900">{spec.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {product.specifications.length > Math.ceil(product.specifications.length / 2) && (
                  <div>
                    <h3 className="font-medium text-lg text-neutral-900 mb-6 flex items-center">
                      <span className="inline-block w-1 h-4 bg-neutral-800 mr-3"></span>
                      Дополнительные характеристики
                    </h3>
                    <div className="space-y-3">
                      {product.specifications.slice(Math.ceil(product.specifications.length / 2)).map((spec, index) => (
                        <div key={index} className="flex items-start py-2 border-b border-neutral-100 last:border-b-0">
                          <div className="w-1/2 text-neutral-600 pr-4">{spec.key}</div>
                          <div className="w-1/2 font-medium text-neutral-900">{spec.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="dimensions" className="pt-10 pb-8 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <h3 className="font-medium text-lg text-neutral-900 mb-6 flex items-center">
                  <span className="inline-block w-1 h-4 bg-neutral-800 mr-3"></span>
                  Схема и размеры
                </h3>
                
                <div className="border border-neutral-200 p-6 bg-neutral-50 rounded-sm">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-4 border border-neutral-200 mb-4 w-full">
                        <svg className="w-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="10" y="30" width="180" height="80" stroke="#333" strokeWidth="1" fill="none" />
                          <rect x="10" y="10" width="180" height="20" stroke="#333" strokeWidth="1" fill="none" />
                          <path d="M10,30 L10,10" stroke="#333" strokeWidth="1" />
                          <path d="M190,30 L190,10" stroke="#333" strokeWidth="1" />
                          <line x1="0" y1="30" x2="200" y2="30" stroke="#888" strokeWidth="0.5" strokeDasharray="4,2" />
                          <text x="100" y="105" textAnchor="middle" fontSize="10" fill="#333">Длина {product.category === 'bed' ? '203' : '200'} см</text>
                          <text x="5" y="60" textAnchor="middle" fontSize="10" fill="#333" transform="rotate(90,5,60)">Высота {product.category === 'bed' ? '90' : '25'} см</text>
                        </svg>
                      </div>
                      <span className="text-sm text-neutral-600">Вид сбоку</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-4 border border-neutral-200 mb-4 w-full">
                        <svg className="w-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="10" y="10" width="180" height="100" stroke="#333" strokeWidth="1" fill="none" />
                          <line x1="0" y1="10" x2="200" y2="10" stroke="#888" strokeWidth="0.5" strokeDasharray="4,2" />
                          <line x1="0" y1="110" x2="200" y2="110" stroke="#888" strokeWidth="0.5" strokeDasharray="4,2" />
                          <text x="100" y="65" textAnchor="middle" fontSize="10" fill="#333">Ширина {product.category === 'bed' ? '165' : '160'} см</text>
                        </svg>
                      </div>
                      <span className="text-sm text-neutral-600">Вид сверху</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg text-neutral-900 mb-6 flex items-center">
                  <span className="inline-block w-1 h-4 bg-neutral-800 mr-3"></span>
                  Размеры и варианты
                </h3>
                
                <div className="space-y-6">
                  <div className="border border-neutral-200 p-6 rounded-sm">
                    <h4 className="text-sm uppercase tracking-wide text-neutral-500 mb-4">Доступные размеры</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {product.sizes && Array.isArray(product.sizes) && product.sizes.map((size: Size, index: number) => (
                        <div 
                          key={index} 
                          className={`border p-3 text-center rounded-sm ${
                            size.id === 'double' 
                              ? 'border-neutral-800 bg-neutral-50' 
                              : 'border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          <div className="text-base font-medium">{size.label}</div>
                          {size.price > 0 && (
                            <div className="text-xs mt-1 text-neutral-600">+{size.price} ₽</div>
                          )}
                          {size.price < 0 && (
                            <div className="text-xs mt-1 text-green-600">{size.price} ₽</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {product.hasLiftingMechanism && (
                    <div className="border border-neutral-200 p-6 rounded-sm">
                      <h4 className="text-sm uppercase tracking-wide text-neutral-500 mb-4">Дополнительно</h4>
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-neutral-900">Подъемный механизм</span>
                          <span className="text-sm text-neutral-600 ml-2">+{product.liftingMechanismPrice} ₽</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="delivery" className="py-8">
            <div className="max-w-3xl">
              <h3 className="text-lg font-semibold mb-4">Доставка</h3>
              <p className="mb-4">Мы осуществляем доставку по всей России. Сроки и стоимость доставки зависят от вашего региона.</p>
              
              <ul className="list-disc pl-5 mb-6 space-y-2">
                <li>Москва и Московская область: 1-3 дня</li>
                <li>Санкт-Петербург и Ленинградская область: 2-4 дня</li>
                <li>Другие регионы России: 3-10 дней</li>
              </ul>
              
              <h3 className="text-lg font-semibold mb-4">Оплата</h3>
              <p className="mb-4">Доступны следующие способы оплаты:</p>
              
              <ul className="list-disc pl-5 space-y-2">
                <li>Банковской картой при оформлении заказа</li>
                <li>Наличными при получении (доступно только для некоторых регионов)</li>
                <li>Банковским переводом (для юридических лиц)</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="py-8">
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Отзывы о товаре</h3>
                <button className="text-primary-700 font-medium hover:text-primary-800">
                  Написать отзыв
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="border-b pb-6">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                    </div>
                    <span className="ml-2 font-medium">Анна М.</span>
                    <span className="ml-2 text-sm text-gray-500">21.03.2023</span>
                  </div>
                  <p className="text-gray-700">
                    Прекрасная кровать! Качество материалов на высоте, очень удобная. Подъемный механизм работает отлично, есть где хранить белье.
                  </p>
                </div>
                
                <div className="border-b pb-6">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="far fa-star"></i>
                    </div>
                    <span className="ml-2 font-medium">Сергей П.</span>
                    <span className="ml-2 text-sm text-gray-500">15.02.2023</span>
                  </div>
                  <p className="text-gray-700">
                    Доволен покупкой. Хорошее соотношение цены и качества. Единственный минус - доставку пришлось ждать дольше обещанного.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="warranty" className="py-8">
            <div className="max-w-3xl">
              <h3 className="text-lg font-semibold mb-4">Условия гарантии</h3>
              <p className="mb-4">
                Мы предоставляем гарантию на все наши товары. Гарантийный срок составляет от 12 до 48 месяцев в зависимости от модели.
              </p>
              
              <h4 className="font-medium mb-2">Гарантия распространяется на:</h4>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Производственные дефекты</li>
                <li>Дефекты материалов</li>
                <li>Функциональные элементы (подъемные механизмы, пружинные блоки и т.д.)</li>
              </ul>
              
              <h4 className="font-medium mb-2">Гарантия не распространяется на:</h4>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>Механические повреждения, возникшие по вине покупателя</li>
                <li>Естественный износ обивки</li>
                <li>Повреждения, вызванные неправильной эксплуатацией или хранением</li>
              </ul>
              
              <p>
                Для получения гарантийного обслуживания необходимо предоставить документ, подтверждающий покупку (чек или договор).
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Рекомендуемые товары</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
