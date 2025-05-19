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
    <div className="container mx-auto px-4 pb-16">
      <Breadcrumbs items={breadcrumbItems} className="pt-4 mb-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="bg-white rounded-lg overflow-hidden border">
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-auto object-cover"
            />
          </div>
          
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-lg overflow-hidden cursor-pointer border-2 ${index === 0 ? 'border-primary-700' : 'border-gray-200'}`}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} - вид ${index + 1}`} 
                    className="w-full h-24 object-cover" 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Configurator */}
        <ProductConfigurator product={product} />
      </div>
      
      {/* Product details tabs */}
      <div className="mt-16">
        <Tabs defaultValue="specifications">
          <TabsList className="w-full justify-start border-b rounded-none">
            <TabsTrigger value="specifications">Характеристики</TabsTrigger>
            <TabsTrigger value="delivery">Доставка и оплата</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы</TabsTrigger>
            <TabsTrigger value="warranty">Гарантия</TabsTrigger>
          </TabsList>
          
          <TabsContent value="specifications" className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {product.specifications && 
                Array.isArray(product.specifications) && 
                product.specifications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Общие характеристики</h3>
                  <div className="space-y-3">
                    {product.specifications.slice(0, Math.ceil(product.specifications.length / 2)).map((spec, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-1/2 text-gray-600">{spec.key}</div>
                        <div className="w-1/2 font-medium">{spec.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {product.specifications && 
                Array.isArray(product.specifications) && 
                product.specifications.length > Math.ceil(product.specifications.length / 2) && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Дополнительные характеристики</h3>
                  <div className="space-y-3">
                    {product.specifications.slice(Math.ceil(product.specifications.length / 2)).map((spec, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-1/2 text-gray-600">{spec.key}</div>
                        <div className="w-1/2 font-medium">{spec.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
