import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products?.filter(product => product.featured).slice(0, 4) || [];
  const mattresses = products?.filter(product => product.category === "mattress").slice(0, 4) || [];
  const beds = products?.filter(product => product.category === "bed").slice(0, 4) || [];

  return (
    <div>
      {/* Hero Section - Minimal Dark Style */}
      <section className="relative h-screen min-h-[600px] bg-gray-900 overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-10">
          <img 
            src="https://images.unsplash.com/photo-1558882224-dda166733046?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Дизайнерская кровать в современном интерьере" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 h-full flex items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center mb-6 border-b border-[#d4af37] pb-2">
              <span className="text-[#d4af37] tracking-widest text-xs font-medium uppercase">ПЕРСОНАЛИЗАЦИЯ</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6 leading-tight">
              Создайте <span className="font-medium italic">идеальную</span>
              <br />
              кровать вашей мечты
            </h1>
            
            <p className="text-lg text-white/80 mb-12 leading-relaxed max-w-xl">
              Индивидуальное изготовление мебели по вашим параметрам. Выберите размер, материал обивки и 
              дополнительные элементы, чтобы создать кровать, которая идеально впишется в интерьер вашей спальни.
            </p>
            
            <div className="flex flex-wrap items-center gap-6">
              <Button 
                size="lg" 
                className="bg-[#d4af37] text-black hover:bg-[#e6c76a] transition-colors py-6 px-10 text-base font-normal rounded-none" 
                asChild
              >
                <Link href="/configurator">Создать свою кровать</Link>
              </Button>
              
              <Link href="#explore" className="text-white hover:text-[#d4af37] transition-colors flex items-center gap-2 group">
                <span className="border-b border-transparent group-hover:border-[#d4af37] pb-1">Узнать больше</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 transform group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-white/70 animate-bounce">
          <span className="text-xs mb-2 tracking-widest uppercase">Прокрутите вниз</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </section>
      
      {/* Why Choose Us Section */}
      <section id="explore" className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="mb-14 text-center">
            <h5 className="uppercase text-xs tracking-widest text-gray-500 mb-2">ПРЕИМУЩЕСТВА И КАЧЕСТВО</h5>
            <h2 className="text-3xl font-normal mb-3">
              Почему выбирают <span className="font-medium italic">наши коллекции</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Мы создаем уникальные решения для сна и отдыха, сочетая классический стиль, эргономику
              и передовые технологии для вашего идеального комфорта.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6">
              <div className="flex items-start mb-4">
                <div className="mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#8e2b85" className="w-8 h-8">
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Премиум качество</h3>
                  <p className="text-gray-600">
                    Мы используем только премиальные материалы для создания нашей продукции - от эксклюзивных тканей до экологически 
                    чистых наполнителей и прочных каркасов из ценных пород дерева.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6">
              <div className="flex items-start mb-4">
                <div className="mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#8e2b85" className="w-8 h-8">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Индивидуальный подход</h3>
                  <p className="text-gray-600">
                    Создайте мебель, которая будет отражать вашу индивидуальность. Наши мастера изготовят кровать или 
                    матрас по вашим размерам, с выбранной обивкой и дополнительными элементами.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6">
              <div className="flex items-start mb-4">
                <div className="mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#8e2b85" className="w-8 h-8">
                    <path d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Гарантия качества</h3>
                  <p className="text-gray-600">
                    Мы уверены в качестве нашей продукции и предоставляем расширенную гарантию до 4 лет на всю мебель. 
                    Наши изделия проходят строгий контроль качества на всех этапах производства.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 border-t border-gray-100 pt-10">
            <div className="text-center">
              <p className="text-4xl lg:text-5xl font-light text-black mb-1">7<span className="text-[#d4af37]">+</span></p>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-normal">ЛЕТ НА РЫНКЕ</p>
            </div>
            <div className="text-center">
              <p className="text-4xl lg:text-5xl font-light text-black mb-1">15<span className="text-[#d4af37]">k</span></p>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-normal">СЧАСТЛИВЫХ КЛИЕНТОВ</p>
            </div>
            <div className="text-center">
              <p className="text-4xl lg:text-5xl font-light text-black mb-1">98<span className="text-[#d4af37]">%</span></p>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-normal">ПОЛОЖИТЕЛЬНЫХ ОТЗЫВОВ</p>
            </div>
            <div className="text-center">
              <p className="text-4xl lg:text-5xl font-light text-black mb-1">24<span className="text-[#d4af37]">/</span>7</p>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-normal">КЛИЕНТСКАЯ ПОДДЕРЖКА</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular Models */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-normal text-gray-900">
                Популярные <span className="font-medium italic">модели</span>
              </h2>
              <Link 
                href="/products" 
                className="flex items-center text-gray-600 hover:text-[#8e2b85]"
              >
                <span>Показать все коллекции</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {beds.slice(0, 3).map((product) => (
              <div key={product.id} className="bg-white group hover:shadow-lg transition-shadow duration-300">
                <Link href={`/products/${product.id}`} className="block relative overflow-hidden">
                  <div className="relative">
                    {product.discount && product.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium py-1 px-2 z-10 uppercase">
                        -{product.discount}%
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-medium py-1 px-2 z-10 uppercase">
                      В наличии
                    </div>
                    
                    <div className="absolute top-2 right-2 bg-black/80 text-white text-xs font-medium py-1 px-2 z-10 uppercase">
                      BESTSELLER
                    </div>
                    
                    <img 
                      src={product.images?.[0] || 'https://via.placeholder.com/600x400?text=Нет+изображения'} 
                      alt={product.name} 
                      className="w-full aspect-square object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="p-4">
                    <div className="uppercase text-xs tracking-wider text-gray-500 mb-1">{product.category === "mattress" ? "МАТРАСЫ" : "КРОВАТИ"}</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-[#8e2b85] transition-colors">{product.name}</h3>
                    
                    <div className="flex items-center text-yellow-400 mb-3">
                      <span className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                          </svg>
                        ))}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">(33)</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        {product.discount && product.discount > 0 ? (
                          <div className="flex flex-col">
                            <span className="text-black font-medium text-lg">
                              {Math.round(parseFloat(product.basePrice) * (1 - product.discount / 100))} ₽
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
            ))}
          </div>
        </div>
      </section>
      
      {/* Customization Section with Image */}
      <section className="bg-gray-900 py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12 mb-10 md:mb-0">
              <h5 className="uppercase text-[#d4af37] tracking-widest text-xs mb-3">ПЕРСОНАЛИЗАЦИЯ</h5>
              <h2 className="text-4xl font-light text-white mb-6 leading-tight">
                Создайте <span className="font-medium italic">идеальную</span><br />
                кровать вашей мечты
              </h2>
              <p className="text-gray-300 leading-relaxed mb-8">
                Индивидуальное изготовление мебели по вашим параметрам. Выберите размер, материал обивки и 
                дополнительные элементы, чтобы создать кровать, которая идеально впишется в интерьер вашей спальни 
                и подарит непревзойденный комфорт.
              </p>
              
              <Button 
                size="lg" 
                className="bg-[#d4af37] text-black hover:bg-[#e6c76a] transition-colors py-4 px-8 text-base font-normal rounded-none" 
                asChild
              >
                <Link href="/configurator">Создать свою кровать</Link>
              </Button>
              
              <Link href="/products/bed" className="ml-6 text-white hover:text-[#d4af37] transition-colors inline-flex items-center">
                <span>Узнать больше</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 ml-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            
            <div className="md:w-1/2 relative">
              <img 
                src="https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Элегантная спальня с дизайнерской кроватью" 
                className="w-full"
              />
              
              <div className="absolute bottom-4 right-4 bg-black/80 p-4 max-w-xs">
                <h4 className="text-[#d4af37] font-light text-base mb-1">Коллекция «Роял»</h4>
                <p className="text-white/90 text-sm mb-2">Идеальное сочетание роскоши и комфорта для вашей спальни</p>
                <div className="flex justify-between items-center">
                  <span className="text-white/60 text-xs">От</span>
                  <span className="text-white font-medium text-xl">59 900 ₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Elegant Beds Collection */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h5 className="uppercase text-[#d4af37] tracking-widest text-xs mb-2">ПРЕМИУМ КОЛЛЕКЦИЯ</h5>
            <div className="flex flex-wrap justify-between items-end">
              <h2 className="text-3xl font-light text-gray-900 mb-6">
                Элегантные <span className="font-medium italic">кровати</span>
              </h2>
              <Link 
                href="/products/bed" 
                className="flex items-center text-gray-600 hover:text-[#8e2b85]"
              >
                <span>Смотреть все кровати</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            <p className="text-gray-600 max-w-3xl mb-8">
              Изысканные модели кроватей, которые станут центральным элементом вашей спальни. 
              Каждая деталь продумана для создания неповторимого стиля и максимального комфорта.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {beds.slice(0, 3).map((product) => (
              <div key={product.id} className="bg-white group">
                <Link href={`/products/${product.id}`} className="block relative overflow-hidden">
                  <div className="relative">
                    <img 
                      src={product.images?.[0] || 'https://via.placeholder.com/600x400?text=Нет+изображения'} 
                      alt={product.name} 
                      className="w-full aspect-[4/3] object-cover object-center"
                    />
                    
                    {product.discount && product.discount > 0 && (
                      <div className="absolute top-3 left-0 bg-red-500 text-white text-xs font-medium py-1 px-3 z-10">
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  
                  <div className="py-4">
                    <div className="uppercase text-xs tracking-wider text-gray-500 mb-2">КРОВАТИ</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-[#8e2b85] transition-colors">{product.name}</h3>
                    
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
                              {Math.round(parseFloat(product.basePrice) * (1 - product.discount / 100))} ₽
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
            ))}
          </div>
        </div>
      </section>
      
      {/* Newsletter & CTA Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              Мы создаем <span className="font-medium text-[#8e2b85]">идеальный комфорт</span> 
              для вашего сна и отдыха
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Мы стремимся не просто создать красивую мебель, но предложить вам неповторимый опыт отдыха. 
              Ведь качество сна напрямую влияет на качество жизни.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                className="bg-[#8e2b85] text-white hover:bg-[#702269] transition-colors py-3 px-8 rounded-none w-full sm:w-auto" 
                asChild
              >
                <Link href="/products">Перейти в каталог</Link>
              </Button>
            </div>
          </div>
          
          <div className="h-px w-full bg-gray-200 my-16"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h3 className="text-2xl font-light text-gray-900 mb-3">
                Подпишитесь на рассылку
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Получайте первыми информацию о новых коллекциях, акциях и специальных предложениях.
              </p>
            </div>
            
            <div className="md:w-1/2">
              <form className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Ваш e-mail" 
                  className="px-4 py-3 border border-gray-300 flex-grow focus:outline-none focus:border-[#8e2b85]"
                  required
                />
                <Button 
                  className="bg-[#8e2b85] text-white hover:bg-[#702269] transition-colors py-3 px-6 rounded-none"
                  type="submit"
                >
                  Подписаться
                </Button>
              </form>
              <p className="text-gray-500 text-xs mt-2">
                Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}