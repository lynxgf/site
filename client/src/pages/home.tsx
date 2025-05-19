import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { formatPrice } from "@/lib/utils";

export default function Home() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products?.filter(product => product.featured).slice(0, 4) || [];
  const mattresses = products?.filter(product => product.category === "mattress").slice(0, 4) || [];
  const beds = products?.filter(product => product.category === "bed").slice(0, 4) || [];

  return (
    <div>
      {/* Hero Section - Luxury Edition */}
      <section className="relative h-screen min-h-[700px] bg-[#1a1a1a] overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-10">
          <img 
            src="https://images.unsplash.com/photo-1618219944342-824e40a13285?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=90" 
            alt="Роскошная кровать в изысканном интерьере" 
            className="w-full h-full object-cover object-center"
            style={{ objectPosition: '50% 32%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/10"></div>
          
          {/* Gold accent elements */}
          <div className="absolute top-32 right-32 w-20 h-20 border border-[#d4af37]/30 hidden lg:block"></div>
          <div className="absolute top-40 right-40 w-20 h-20 border border-[#d4af37]/20 hidden lg:block"></div>
          <div className="absolute bottom-32 left-40 w-24 h-24 border border-[#d4af37]/30 hidden lg:block"></div>
          <div className="absolute bottom-40 left-32 w-24 h-24 border border-[#d4af37]/20 hidden lg:block"></div>
          
          {/* Gold light streaks */}
          <div className="absolute top-0 left-1/3 w-1 h-32 bg-gradient-to-b from-[#d4af37]/0 via-[#d4af37]/30 to-[#d4af37]/0 hidden lg:block"></div>
          <div className="absolute bottom-0 right-1/4 w-1 h-48 bg-gradient-to-t from-[#d4af37]/0 via-[#d4af37]/20 to-[#d4af37]/0 hidden lg:block"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-20 max-w-[1400px] mx-auto px-6 h-full flex items-center">
          <div className="max-w-2xl">
            {/* Luxury badge */}
            <div className="inline-flex items-center mb-6 border-b border-[var(--luxury-gold)]/60 pb-2">
              <span className="text-[var(--luxury-gold)] tracking-widest text-xs font-light uppercase">Премиальная коллекция 2025</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-light text-white mb-6 leading-tight tracking-tighter">
              Идеальная 
              <span className="font-medium italic relative inline-block ml-3">
                роскошь
                <span className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-[var(--luxury-gold)] to-transparent"></span>
              </span>
              <br />
              <span className="text-white/80">для вашей спальни</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/70 mb-12 leading-relaxed max-w-xl font-light">
              Создайте спальню вашей мечты с нашей коллекцией премиальных 
              кроватей и матрасов, разработанных с непревзойденным вниманием к деталям.
            </p>
            
            <div className="flex flex-wrap items-center gap-6">
              <Button 
                size="lg" 
                className="bg-[var(--luxury-primary)] text-white hover:bg-[var(--luxury-gold)] hover:text-[var(--luxury-black)] transition-colors duration-300 py-7 px-10 text-base font-normal rounded-none" 
                asChild
              >
                <Link href="/products/bed">Каталог кроватей</Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white/60 hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] py-7 px-10 text-base font-normal rounded-none transition-colors duration-300" 
                asChild
              >
                <Link href="/products/mattress">Каталог матрасов</Link>
              </Button>
              
              <Link href="#explore" className="text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                <span className="border-b border-transparent group-hover:border-[var(--luxury-gold)]/40 pb-1">Узнать больше</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#1a1a1a] to-transparent z-20"></div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
          <span className="text-white/50 text-xs mb-2 tracking-widest uppercase">Прокрутите вниз</span>
          <div className="w-5 h-9 border border-white/40 rounded-full flex justify-center pt-1">
            <div className="w-1 h-2 bg-white rounded-full animate-[scroll_1.5s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </section>

      {/* Luxury Features Section */}
      <section id="explore" className="py-24 relative overflow-hidden bg-[var(--luxury-light-gray)]">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--luxury-border-light)] opacity-70 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--luxury-border-light)] opacity-70 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[var(--luxury-primary)] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-[var(--luxury-gold)] rounded-full"></div>
        <div className="absolute inset-0 pattern-grid-lg text-neutral-100 opacity-5"></div>
        
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <span className="text-[var(--luxury-primary)] tracking-widest text-xs font-medium uppercase mb-3 inline-block">Превосходство в деталях</span>
            <h2 className="text-3xl md:text-4xl font-light text-[var(--luxury-black)] mb-6">Почему выбирают <span className="italic font-medium relative">
              наши коллекции
              <span className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-[var(--luxury-primary)] to-transparent"></span>
            </span></h2>
            <div className="w-24 h-px bg-[var(--luxury-primary)]/20 mx-auto mb-8"></div>
            <p className="text-[var(--luxury-dark-gray)] leading-relaxed text-lg">
              Мы создаем уникальные решения для сна и отдыха, сочетая изысканный стиль, 
              эргономику и передовые технологии для вашего идеального комфорта.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="p-8 bg-white hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-0 h-1 bg-[var(--luxury-primary)] transition-all duration-500 group-hover:w-full"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 flex items-center justify-center bg-[var(--luxury-light-gray)] mb-6 group-hover:bg-[var(--luxury-primary)]/10 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-[var(--luxury-primary)] group-hover:text-[var(--luxury-primary-dark)] transition-colors duration-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <span className="absolute top-2 right-2 text-5xl font-light text-[var(--luxury-light-gray)] group-hover:text-[var(--luxury-border-light)] transition-colors duration-300">01</span>
              </div>
              
              <h3 className="text-xl font-medium text-[var(--luxury-black)] mb-4 group-hover:text-[var(--luxury-primary)] transition-colors duration-300">Премиум качество</h3>
              <p className="text-[var(--luxury-dark-gray)] leading-relaxed mb-6 text-base">
                Мы используем только премиальные материалы для создания нашей продукции - от эксклюзивных тканей до экологически 
                чистых наполнителей и прочных каркасов из ценных пород дерева.
              </p>
              <div className="w-8 h-px bg-[var(--luxury-border-medium)] group-hover:bg-[var(--luxury-primary)] transition-all duration-300 group-hover:w-16"></div>
            </div>
            
            <div className="p-8 bg-white hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-0 h-1 bg-[var(--luxury-primary)] transition-all duration-500 group-hover:w-full"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 flex items-center justify-center bg-[var(--luxury-light-gray)] mb-6 group-hover:bg-[var(--luxury-primary)]/10 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-[var(--luxury-primary)] group-hover:text-[var(--luxury-primary-dark)] transition-colors duration-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 16.5m14.8-1.2a2.25 2.25 0 00.394-3.747l-3.105-3.105a2.25 2.25 0 00-1.591-.659H6.375a2.25 2.25 0 00-1.591.659l-3.105 3.105A2.25 2.25 0 002.073 15.3l.394.55a2.25 2.25 0 002.245.051l6.038-3.019a.75.75 0 01.754.001l6.037 3.018a2.25 2.25 0 002.245-.05l.394-.55z" />
                  </svg>
                </div>
                <span className="absolute top-2 right-2 text-5xl font-light text-[var(--luxury-light-gray)] group-hover:text-[var(--luxury-border-light)] transition-colors duration-300">02</span>
              </div>
              
              <h3 className="text-xl font-medium text-[var(--luxury-black)] mb-4 group-hover:text-[var(--luxury-primary)] transition-colors duration-300">Индивидуальный подход</h3>
              <p className="text-[var(--luxury-dark-gray)] leading-relaxed mb-6 text-base">
                Создайте мебель, которая будет отражать вашу индивидуальность. Наши мастера изготовят кровать или матрас 
                по вашим размерам, с выбранной обивкой и дополнительными элементами.
              </p>
              <div className="w-8 h-px bg-[var(--luxury-border-medium)] group-hover:bg-[var(--luxury-primary)] transition-all duration-300 group-hover:w-16"></div>
            </div>
            
            <div className="p-8 bg-white hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-0 h-1 bg-[var(--luxury-primary)] transition-all duration-500 group-hover:w-full"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 flex items-center justify-center bg-[var(--luxury-light-gray)] mb-6 group-hover:bg-[var(--luxury-primary)]/10 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-[var(--luxury-primary)] group-hover:text-[var(--luxury-primary-dark)] transition-colors duration-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <span className="absolute top-2 right-2 text-5xl font-light text-[var(--luxury-light-gray)] group-hover:text-[var(--luxury-border-light)] transition-colors duration-300">03</span>
              </div>
              
              <h3 className="text-xl font-medium text-[var(--luxury-black)] mb-4 group-hover:text-[var(--luxury-primary)] transition-colors duration-300">Гарантия качества</h3>
              <p className="text-[var(--luxury-dark-gray)] leading-relaxed mb-6 text-base">
                Мы уверены в качестве нашей продукции и предоставляем расширенную гарантию до 4 лет на всю мебель. 
                Наши изделия проходят строгий контроль качества на всех этапах производства.
              </p>
              <div className="w-8 h-px bg-[var(--luxury-border-medium)] group-hover:bg-[var(--luxury-primary)] transition-all duration-300 group-hover:w-16"></div>
            </div>
          </div>
          
          {/* Luxury counter stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-24 border-t border-[var(--luxury-border-light)] pt-16">
            <div className="text-center group bg-white p-8 hover:shadow-lg transition-all duration-300">
              <p className="text-4xl lg:text-5xl font-light text-[var(--luxury-black)] mb-3 group-hover:text-[var(--luxury-primary)] transition-colors duration-300">7<span className="text-[var(--luxury-gold)]">+</span></p>
              <p className="text-sm uppercase tracking-wider text-[var(--luxury-medium-gray)] font-medium">Лет на рынке</p>
              <div className="w-12 h-[2px] bg-[var(--luxury-border-medium)] mx-auto mt-4 group-hover:bg-[var(--luxury-primary)] transition-colors duration-300"></div>
            </div>
            <div className="text-center group bg-white p-8 hover:shadow-lg transition-all duration-300">
              <p className="text-4xl lg:text-5xl font-light text-[var(--luxury-black)] mb-3 group-hover:text-[var(--luxury-primary)] transition-colors duration-300">15<span className="text-[var(--luxury-gold)]">k</span></p>
              <p className="text-sm uppercase tracking-wider text-[var(--luxury-medium-gray)] font-medium">Счастливых клиентов</p>
              <div className="w-12 h-[2px] bg-[var(--luxury-border-medium)] mx-auto mt-4 group-hover:bg-[var(--luxury-primary)] transition-colors duration-300"></div>
            </div>
            <div className="text-center group bg-white p-8 hover:shadow-lg transition-all duration-300">
              <p className="text-4xl lg:text-5xl font-light text-[var(--luxury-black)] mb-3 group-hover:text-[var(--luxury-primary)] transition-colors duration-300">98<span className="text-[var(--luxury-gold)]">%</span></p>
              <p className="text-sm uppercase tracking-wider text-[var(--luxury-medium-gray)] font-medium">Положительных отзывов</p>
              <div className="w-12 h-[2px] bg-[var(--luxury-border-medium)] mx-auto mt-4 group-hover:bg-[var(--luxury-primary)] transition-colors duration-300"></div>
            </div>
            <div className="text-center group bg-white p-8 hover:shadow-lg transition-all duration-300">
              <p className="text-4xl lg:text-5xl font-light text-[var(--luxury-black)] mb-3 group-hover:text-[var(--luxury-primary)] transition-colors duration-300">24<span className="text-[var(--luxury-gold)]">/</span>7</p>
              <p className="text-sm uppercase tracking-wider text-[var(--luxury-medium-gray)] font-medium">Клиентская поддержка</p>
              <div className="w-12 h-[2px] bg-[var(--luxury-border-medium)] mx-auto mt-4 group-hover:bg-[var(--luxury-primary)] transition-colors duration-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection - Luxury Edition */}
      <section className="py-24 bg-gradient-to-b from-white to-neutral-50">
        <div className="max-w-[1400px] mx-auto px-6 relative">
          {/* Decorative elements */}
          <div className="absolute right-0 top-0 w-48 h-48 opacity-30 hidden lg:block">
            <div className="absolute inset-0 animate-slowSpin">
              <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="49" stroke="#d4af37" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="35" stroke="#d4af37" strokeWidth="0.5" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="#d4af37" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#d4af37" strokeWidth="0.5" />
              </svg>
            </div>
          </div>
          
          <div className="relative mb-20">
            <div className="relative z-10">
              <div className="inline-flex items-center mb-3 border-l-2 border-[#d4af37] pl-3">
                <span className="text-[#d4af37] tracking-widest text-xs font-light uppercase">Luxury Collection</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-end justify-between">
                <h2 className="text-3xl md:text-4xl font-light text-neutral-900 mb-4 md:mb-0">
                  Популярные <span className="italic font-medium">модели</span>
                </h2>
                <Link href="/products" className="text-neutral-800 hover:text-[#d4af37] font-light transition-colors duration-300 group flex items-center">
                  <span className="border-b border-transparent group-hover:border-[#d4af37] pb-1">Показать все коллекции</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Product grid with luxury styling */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-neutral-100 h-[450px] animate-pulse">
                  <div className="w-full h-3/4 bg-neutral-200 mb-4"></div>
                  <div className="h-4 bg-neutral-200 w-2/3 mb-3"></div>
                  <div className="h-4 bg-neutral-200 w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 relative">
              {/* Decorative lines */}
              <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pointer-events-none -z-10">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="border-t border-neutral-200 mt-6"></div>
                ))}
              </div>
              
              {featuredProducts.map((product, index) => (
                <div key={product.id} className={`group relative animate-fadeInUp`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <ProductCard product={product} />
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-6 h-6 flex items-center justify-center bg-white text-[#d4af37] rounded-full text-xs font-light">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Designer's quote */}
          <div className="mt-24 md:mt-32 text-center max-w-3xl mx-auto">
            <div className="text-[#d4af37] text-4xl mb-6">"</div>
            <blockquote className="text-xl md:text-2xl font-light text-neutral-700 italic mb-6 leading-relaxed">
              Мы создаем не просто мебель, а произведения искусства для вашего дома, где каждая деталь продумана и каждый элемент имеет значение.
            </blockquote>
            <div className="flex items-center justify-center">
              <div className="w-12 h-px bg-neutral-300 mr-4"></div>
              <span className="text-neutral-500 text-sm uppercase tracking-wider">Наш дизайнер</span>
              <div className="w-12 h-px bg-neutral-300 ml-4"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury CTA Banner */}
      <section className="py-28 bg-[#1a1a1a] text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 bottom-0 w-1/4 bg-gradient-to-r from-[#d4af37]/5 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 border border-[#d4af37]/10 -mb-32 -mr-32"></div>
        <div className="absolute top-10 left-10 w-2 h-2 bg-[#d4af37] rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-2 h-2 bg-[#d4af37] rounded-full"></div>
        
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-40 h-40 border border-[#d4af37] rounded-full animate-slowSpin"></div>
              </div>
              
              <div>
                <div className="inline-flex items-center mb-6 border-b border-[#d4af37]/60 pb-2">
                  <span className="text-[#d4af37] tracking-widest text-xs font-light uppercase">Персонализация</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight mb-8">
                  Создайте <span className="italic font-medium">идеальную</span> кровать вашей мечты
                </h2>
                <p className="text-white/70 mb-10 text-lg leading-relaxed">
                  Индивидуальное изготовление мебели по вашим параметрам. 
                  Выберите размер, материал обивки и дополнительные элементы, 
                  чтобы создать кровать, которая идеально впишется в интерьер 
                  вашей спальни и подарит непревзойденный комфорт.
                </p>
                <div className="flex flex-wrap gap-6 items-center">
                  <Button 
                    className="bg-[#d4af37] hover:bg-[#b38728] text-black py-6 px-10 text-base font-light rounded-none transition-colors duration-300" 
                    asChild
                  >
                    <Link href="/products/bed">Создать свою кровать</Link>
                  </Button>
                  
                  <Link href="/products/bed" className="text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-2 group">
                    <span className="border-b border-transparent group-hover:border-white/40 pb-1">Узнать больше</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Image frame */}
              <div className="relative z-10 h-[500px] lg:h-[600px] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1615874959474-d609969a20ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                  alt="Роскошная кровать в интерьере" 
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                
                {/* Gold border frame */}
                <div className="absolute inset-0 border border-[#d4af37]/20 m-4"></div>
                
                {/* Product highlight badge */}
                <div className="absolute bottom-8 right-8 bg-black/80 backdrop-blur-sm p-6 max-w-[280px]">
                  <h3 className="text-[#d4af37] text-lg font-light mb-2">Коллекция «Роял»</h3>
                  <p className="text-white/80 text-sm mb-4">Идеальное сочетание роскоши и комфорта для вашей спальни</p>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-xs">От</span>
                    <span className="text-white text-xl font-light">59 900 ₽</span>
                  </div>
                </div>
              </div>
              
              {/* Decorative corner elements */}
              <div className="absolute top-4 left-4 w-16 h-16 border-t border-l border-[#d4af37]/40 -mt-4 -ml-4 z-20"></div>
              <div className="absolute bottom-4 right-4 w-16 h-16 border-b border-r border-[#d4af37]/40 -mb-4 -mr-4 z-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Beds Collection - Luxury */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
        <div className="absolute left-0 top-0 w-[200px] h-[200px] bg-[#f8f8f8] rounded-full opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="max-w-[1400px] mx-auto px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <div className="inline-flex items-center mb-4 border-l-2 border-[#d4af37] pl-3">
                  <span className="text-[#d4af37] tracking-widest text-xs font-light uppercase">Премиум коллекция</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-light text-neutral-900 mb-6 leading-tight">
                  Элегантные <br /><span className="italic font-medium">кровати</span>
                </h2>
                <p className="text-neutral-600 leading-relaxed mb-8">
                  Изысканные модели кроватей, которые станут центральным элементом вашей спальни. 
                  Каждая деталь продумана для создания неповторимого стиля и максимального комфорта.
                </p>
                <Link 
                  href="/products/bed" 
                  className="inline-flex items-center text-neutral-900 hover:text-[#d4af37] transition-colors duration-300 group border-b border-neutral-300 hover:border-[#d4af37] pb-2"
                >
                  <span className="mr-3 font-light">Смотреть все кровати</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5 transition-transform group-hover:translate-x-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
            
            <div className="lg:col-span-8">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-neutral-100 h-[450px] animate-pulse">
                      <div className="w-full h-3/4 bg-neutral-200 mb-4"></div>
                      <div className="h-4 bg-neutral-200 w-2/3 mb-3"></div>
                      <div className="h-4 bg-neutral-200 w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {beds.map((product, index) => (
                    <div 
                      key={product.id} 
                      className="group relative animate-fadeInUp" 
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      <div className="absolute inset-0 bg-neutral-50 transform scale-105 opacity-0 group-hover:opacity-100 -z-10 transition-all duration-500"></div>
                      <ProductCard product={product} />
                      
                      {/* Luxurious numbered indicator */}
                      <div className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center">
                        <span className="text-[#d4af37] text-xs font-light">{`0${index + 1}`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Materials & Design Showcase */}
      <section className="py-28 bg-[#fcfcfc] relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579187707643-35646d22b596?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000')] bg-fixed opacity-5"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#f8f8f8] rounded-full opacity-70 translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-[1400px] mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <div className="inline-flex items-center mb-3">
              <span className="w-12 h-px bg-[#d4af37]"></span>
              <span className="text-[#d4af37] tracking-widest text-xs font-light uppercase mx-4">Философия дизайна</span>
              <span className="w-12 h-px bg-[#d4af37]"></span>
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-neutral-900 mb-6">
              Материалы и технологии <span className="italic font-medium">премиум-класса</span>
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              Мы создаем каждое изделие с особым вниманием к деталям и используем только лучшие материалы, 
              чтобы гарантировать исключительное качество, комфорт и долговечность нашей мебели.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-12">
            <div className="relative group">
              <div className="absolute inset-0 border border-neutral-100 group-hover:border-[#d4af37]/30 transition-colors duration-500"></div>
              <div className="p-10 relative">
                <div className="absolute top-0 right-0 opacity-5 text-6xl font-light">01</div>
                <div className="w-16 h-16 border border-neutral-200 group-hover:border-[#d4af37]/50 transition-colors duration-500 flex items-center justify-center mb-8">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-[#d4af37]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-light text-neutral-900 mb-4 group-hover:text-[#d4af37] transition-colors duration-500">
                  Создано с <span className="font-medium">заботой</span>
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-6">
                  Каждая модель тщательно разработана нашими дизайнерами для обеспечения максимального комфорта 
                  и правильной поддержки тела во время сна. Мы уделяем внимание каждой детали.
                </p>
                <div className="h-px w-12 bg-neutral-200 group-hover:bg-[#d4af37] group-hover:w-16 transition-all duration-500"></div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 border border-neutral-100 group-hover:border-[#d4af37]/30 transition-colors duration-500"></div>
              <div className="p-10 relative">
                <div className="absolute top-0 right-0 opacity-5 text-6xl font-light">02</div>
                <div className="w-16 h-16 border border-neutral-200 group-hover:border-[#d4af37]/50 transition-colors duration-500 flex items-center justify-center mb-8">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-[#d4af37]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-light text-neutral-900 mb-4 group-hover:text-[#d4af37] transition-colors duration-500">
                  Эргономичный <span className="font-medium">дизайн</span>
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-6">
                  Наши кровати и матрасы учитывают анатомические особенности тела, обеспечивая 
                  правильное положение позвоночника и здоровый, комфортный сон на долгие годы.
                </p>
                <div className="h-px w-12 bg-neutral-200 group-hover:bg-[#d4af37] group-hover:w-16 transition-all duration-500"></div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 border border-neutral-100 group-hover:border-[#d4af37]/30 transition-colors duration-500"></div>
              <div className="p-10 relative">
                <div className="absolute top-0 right-0 opacity-5 text-6xl font-light">03</div>
                <div className="w-16 h-16 border border-neutral-200 group-hover:border-[#d4af37]/50 transition-colors duration-500 flex items-center justify-center mb-8">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-[#d4af37]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.893 13.393l-1.135-1.135a2.252 2.252 0 01-.421-.585l-1.08-2.16a.414.414 0 00-.663-.107.827.827 0 01-.812.21l-1.273-.363a.89.89 0 00-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 01-1.81 1.025 1.055 1.055 0 01-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 01-1.383-2.46l.007-.042a2.25 2.25 0 01.29-.787l.09-.15a2.25 2.25 0 012.37-1.048l1.178.236a1.125 1.125 0 001.302-.795l.208-.73a1.125 1.125 0 00-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 01-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 01-1.458-1.137l1.411-2.353a2.25 2.25 0 00.286-.76m11.928 9.869A9 9 0 008.965 3.525m11.928 9.868A9 9 0 118.965 3.525" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-light text-neutral-900 mb-4 group-hover:text-[#d4af37] transition-colors duration-500">
                  Экологичные <span className="font-medium">материалы</span>
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-6">
                  Мы используем только безопасные и экологически чистые материалы, имеющие соответствующие 
                  сертификаты, чтобы ваша мебель была не только красивой, но и безопасной.
                </p>
                <div className="h-px w-12 bg-neutral-200 group-hover:bg-[#d4af37] group-hover:w-16 transition-all duration-500"></div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 border border-neutral-100 group-hover:border-[#d4af37]/30 transition-colors duration-500"></div>
              <div className="p-10 relative">
                <div className="absolute top-0 right-0 opacity-5 text-6xl font-light">04</div>
                <div className="w-16 h-16 border border-neutral-200 group-hover:border-[#d4af37]/50 transition-colors duration-500 flex items-center justify-center mb-8">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-[#d4af37]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-light text-neutral-900 mb-4 group-hover:text-[#d4af37] transition-colors duration-500">
                  Роскошный <span className="font-medium">интерьер</span>
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-6">
                  Наша мебель создана, чтобы стать центральным элементом вашей спальни, подчеркивая 
                  изысканный вкус и создавая атмосферу роскоши и комфорта в вашем доме.
                </p>
                <div className="h-px w-12 bg-neutral-200 group-hover:bg-[#d4af37] group-hover:w-16 transition-all duration-500"></div>
              </div>
            </div>
          </div>
          
          {/* Materials showcase */}
          <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 border border-neutral-100 hover:border-[#d4af37]/20 transition-colors duration-300 group">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-6">
                <img src="https://images.unsplash.com/photo-1592170083360-a2ed2fc40ba9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" alt="Натуральное дерево" className="w-full h-full object-cover" />
              </div>
              <h4 className="text-lg font-medium text-neutral-900 mb-2 group-hover:text-[#d4af37] transition-colors duration-300">Натуральное дерево</h4>
              <p className="text-neutral-600 leading-relaxed">Массив дуба, бука и ясеня для каркасов кроватей, обеспечивающий прочность и долговечность.</p>
            </div>
            
            <div className="bg-white p-8 border border-neutral-100 hover:border-[#d4af37]/20 transition-colors duration-300 group">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-6">
                <img src="https://images.unsplash.com/photo-1544939514-d250d7cfe3f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" alt="Премиальный текстиль" className="w-full h-full object-cover" />
              </div>
              <h4 className="text-lg font-medium text-neutral-900 mb-2 group-hover:text-[#d4af37] transition-colors duration-300">Премиальный текстиль</h4>
              <p className="text-neutral-600 leading-relaxed">Итальянские и бельгийские ткани премиум-класса, велюр, натуральная кожа для обивки.</p>
            </div>
            
            <div className="bg-white p-8 border border-neutral-100 hover:border-[#d4af37]/20 transition-colors duration-300 group">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-6">
                <img src="https://images.unsplash.com/photo-1618345608726-09abd38be070?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" alt="Ортопедические материалы" className="w-full h-full object-cover" />
              </div>
              <h4 className="text-lg font-medium text-neutral-900 mb-2 group-hover:text-[#d4af37] transition-colors duration-300">Ортопедические материалы</h4>
              <p className="text-neutral-600 leading-relaxed">Инновационные материалы с эффектом памяти и многозонные пружинные блоки для матрасов.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mattresses Collection - Luxury Layout */}
      <section className="py-24 bg-[#1a1a1a] text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent"></div>
        <div className="absolute left-1/4 top-20 w-1 h-1 bg-[#d4af37] rounded-full"></div>
        <div className="absolute right-1/3 bottom-20 w-1 h-1 bg-[#d4af37] rounded-full"></div>
        <div className="absolute right-0 top-0 w-96 h-96 border-t border-l border-[#d4af37]/10 opacity-30 -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="max-w-[1400px] mx-auto px-6 relative">
          <div className="mb-20 text-center">
            <div className="inline-flex items-center mb-3">
              <span className="text-[#d4af37] tracking-widest text-xs font-light uppercase">Sleep Collection</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight mb-6">
              Ортопедические <span className="italic font-medium">матрасы</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Инновационные решения для идеального сна и поддержки здоровья вашего позвоночника
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/3">
              <div className="relative h-[500px] overflow-hidden bg-gradient-to-b from-transparent to-[#111] group">
                <img 
                  src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=1500&q=80" 
                  alt="Коллекция премиальных матрасов" 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-[#d4af37] text-xl font-light mb-3">Непревзойденный комфорт</h3>
                  <p className="text-white/80 mb-6">
                    Наши матрасы созданы с использованием передовых технологий и материалов, 
                    обеспечивающих максимальный комфорт и поддержку во время сна.
                  </p>
                  <Link 
                    href="/products/mattress" 
                    className="inline-flex items-center text-white hover:text-[#d4af37] transition-colors duration-300 group border-b border-white/30 hover:border-[#d4af37] pb-1"
                  >
                    <span className="mr-3 font-light">Подробнее</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="lg:w-2/3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-light">Премиальная коллекция</h3>
                <Link 
                  href="/products/mattress" 
                  className="text-white/80 hover:text-[#d4af37] transition-colors duration-300 group flex items-center text-sm"
                >
                  <span className="mr-2 border-b border-transparent group-hover:border-[#d4af37] pb-1">Показать все матрасы</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </Link>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-neutral-100 h-[400px] animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {mattresses.map((product, index) => (
                    <div 
                      key={product.id} 
                      className="bg-[#222] group transition-all duration-500 hover:bg-[#2a2a2a] border border-[#333] hover:border-[#d4af37]/20 animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      <div className="aspect-[3/2] overflow-hidden relative">
                        <img 
                          src={product.images[0] || "https://via.placeholder.com/400x300"} 
                          alt={product.name} 
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" 
                        />
                        {product.discount && product.discount > 0 && (
                          <div className="absolute top-3 right-3 bg-[#d4af37] text-black text-xs font-light py-1 px-2">
                            -{product.discount}%
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-lg font-light group-hover:text-[#d4af37] transition-colors duration-300">{product.name}</h4>
                          <span className="text-xs text-white/50">Art. {product.id}</span>
                        </div>
                        <p className="text-white/60 text-sm mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-white/60 text-xs">От</span>
                            <span className="text-lg font-light ml-1">{formatPrice(parseFloat(product.basePrice))}</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-white/20 text-white hover:border-[#d4af37] hover:text-[#d4af37] rounded-none text-xs"
                            asChild
                          >
                            <Link href={`/product/${product.id}`}>Подробнее</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Luxury Edition */}
      <section className="py-32 bg-gradient-to-b from-[#121212] to-[#1a1a1a] text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000')] bg-center opacity-5"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent"></div>
        
        {/* Large quote mark */}
        <div className="absolute left-[10%] top-[15%] opacity-5">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 11H6C5.46957 11 4.96086 10.7893 4.58579 10.4142C4.21071 10.0391 4 9.53043 4 9V7C4 6.46957 4.21071 5.96086 4.58579 5.58579C4.96086 5.21071 5.46957 5 6 5H8C8.53043 5 9.03914 5.21071 9.41421 5.58579C9.78929 5.96086 10 6.46957 10 7V15C10 16.0609 9.57857 17.0783 8.82843 17.8284C8.07828 18.5786 7.06087 19 6 19H5M20 11H16C15.4696 11 14.9609 10.7893 14.5858 10.4142C14.2107 10.0391 14 9.53043 14 9V7C14 6.46957 14.2107 5.96086 14.5858 5.58579C14.9609 5.21071 15.4696 5 16 5H18C18.5304 5 19.0391 5.21071 19.4142 5.58579C19.7893 5.96086 20 6.46957 20 7V15C20 16.0609 19.5786 17.0783 18.8284 17.8284C18.0783 18.5786 17.0609 19 16 19H15" 
              stroke="#d4af37" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <div className="max-w-[1400px] mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center mb-3">
              <span className="w-8 h-px bg-[#d4af37]"></span>
              <span className="text-[#d4af37] tracking-widest text-xs font-light uppercase mx-4">Отзывы клиентов</span>
              <span className="w-8 h-px bg-[#d4af37]"></span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6 leading-tight">
              Что говорят <span className="italic font-medium">о нас</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Отзывы наших клиентов — лучшее подтверждение качества и комфорта нашей продукции. 
              Узнайте, что думают о нас те, кто уже выбрал нашу мебель для своего дома.
            </p>
          </div>
          
          <div className="relative">
            <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                <CarouselItem>
                  <div className="p-8 md:p-12 bg-[#222222] border border-[#333] group transition-all duration-500 hover:border-[#d4af37]/30">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex text-[#d4af37] space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-white/20 font-light italic text-sm">03.04.2025</span>
                    </div>
                    
                    <blockquote className="mb-8">
                      <p className="text-white/80 text-lg md:text-xl leading-relaxed font-light italic">
                        "Заказывала кровать с подъемным механизмом, очень довольна качеством исполнения. 
                        Удобная, красивая, с продуманным местом для хранения. Консультанты помогли подобрать 
                        идеальный размер и ткань, которая прекрасно вписалась в интерьер. Однозначно рекомендую!"
                      </p>
                    </blockquote>
                    
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-700 mr-4">
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80" alt="Мария К." className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Мария К.</p>
                        <p className="text-white/60 text-sm">Москва</p>
                      </div>
                      <div className="ml-auto">
                        <div className="text-[#d4af37] text-4xl font-light opacity-10 group-hover:opacity-20 transition-opacity duration-500">"</div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-8 md:p-12 bg-[#222222] border border-[#333] group transition-all duration-500 hover:border-[#d4af37]/30">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex text-[#d4af37] space-x-1">
                        {[...Array(4)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                          </svg>
                        ))}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#d4af37]/30">
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-white/20 font-light italic text-sm">25.03.2025</span>
                    </div>
                    
                    <blockquote className="mb-8">
                      <p className="text-white/80 text-lg md:text-xl leading-relaxed font-light italic">
                        "Матрас 'Эргономик' превзошел все ожидания! Уже через неделю использования 
                        почувствовал значительное улучшение качества сна и меньше проблем со спиной. 
                        Очень доволен покупкой — отличное соотношение цены и качества."
                      </p>
                    </blockquote>
                    
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-700 mr-4">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80" alt="Алексей В." className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Алексей В.</p>
                        <p className="text-white/60 text-sm">Санкт-Петербург</p>
                      </div>
                      <div className="ml-auto">
                        <div className="text-[#d4af37] text-4xl font-light opacity-10 group-hover:opacity-20 transition-opacity duration-500">"</div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-8 md:p-12 bg-[#222222] border border-[#333] group transition-all duration-500 hover:border-[#d4af37]/30">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex text-[#d4af37] space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-white/20 font-light italic text-sm">15.03.2025</span>
                    </div>
                    
                    <blockquote className="mb-8">
                      <p className="text-white/80 text-lg md:text-xl leading-relaxed font-light italic">
                        "Выбрали кровать 'Морфей' по рекомендации друзей и ни разу не пожалели. Очень стильная, 
                        прочная и невероятно удобная. Особенно радует возможность настройки под свои предпочтения. 
                        Благодарим компанию за действительно качественную мебель и отличный сервис!"
                      </p>
                    </blockquote>
                    
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-700 mr-4">
                        <img src="https://images.unsplash.com/photo-1488716820095-cbc05e0fa912?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80" alt="Ольга и Дмитрий Т." className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Ольга и Дмитрий Т.</p>
                        <p className="text-white/60 text-sm">Екатеринбург</p>
                      </div>
                      <div className="ml-auto">
                        <div className="text-[#d4af37] text-4xl font-light opacity-10 group-hover:opacity-20 transition-opacity duration-500">"</div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              
              <div className="flex justify-center mt-10">
                <CarouselPrevious className="relative static translate-y-0 mr-3 h-12 w-12 border-[#333] hover:border-[#d4af37] bg-[#222] text-white hover:text-[#d4af37] rounded-none" />
                <CarouselNext className="relative static translate-y-0 h-12 w-12 border-[#333] hover:border-[#d4af37] bg-[#222] text-white hover:text-[#d4af37] rounded-none" />
              </div>
            </Carousel>
            
            {/* Decoration line */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/4 h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Luxury CTA Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f8f8f8] rounded-full opacity-50 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] border border-neutral-100 rounded-full opacity-80 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-[1400px] mx-auto px-6 relative">
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Golden accent line */}
              <div className="absolute top-0 left-0 w-24 h-px bg-[#d4af37]"></div>
              
              <div className="max-w-3xl">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-neutral-900 leading-tight mt-10 mb-8">
                  Создайте спальню своей мечты с нашей <span className="italic font-medium">эксклюзивной</span> мебелью
                </h2>
                <p className="text-neutral-600 text-lg leading-relaxed mb-12">
                  Индивидуальный подход, премиальные материалы и безупречное качество изготовления. 
                  Мы поможем воплотить в реальность ваши представления об идеальной спальне.
                </p>
                
                <div className="flex flex-wrap gap-6">
                  <Button 
                    className="bg-[#1a1a1a] hover:bg-black text-white py-7 px-10 text-base font-light rounded-none" 
                    asChild
                  >
                    <Link href="/products">Перейти в каталог</Link>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="border-neutral-300 text-neutral-800 hover:text-[#d4af37] hover:border-[#d4af37] py-7 px-10 text-base font-light rounded-none" 
                    asChild
                  >
                    <Link href="/products/bed">Настроить кровать</Link>
                  </Button>
                </div>
              </div>
              
              {/* Stats */}
              <div className="absolute top-0 right-0 w-[300px] hidden lg:block">
                <div className="border-l border-neutral-200 pl-10 py-4">
                  <div className="mb-8">
                    <p className="text-4xl font-light text-neutral-900 mb-1">1500<span className="text-[#d4af37]">+</span></p>
                    <p className="text-neutral-500 text-sm">Довольных клиентов ежемесячно</p>
                  </div>
                  <div className="mb-8">
                    <p className="text-4xl font-light text-neutral-900 mb-1">10<span className="text-[#d4af37]">лет</span></p>
                    <p className="text-neutral-500 text-sm">Опыта в производстве мебели</p>
                  </div>
                  <div>
                    <p className="text-4xl font-light text-neutral-900 mb-1">4<span className="text-[#d4af37]">года</span></p>
                    <p className="text-neutral-500 text-sm">Гарантии на всю продукцию</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Services */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 border-t border-neutral-100 pt-16">
              <div className="p-6 group transition-all duration-300 hover:bg-neutral-50">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 flex items-center justify-center border border-neutral-200 mr-4 group-hover:border-[#d4af37] transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5 text-neutral-800">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900">Доставка по всей России</h3>
                </div>
                <p className="text-neutral-600 pl-14">Быстрая и надежная доставка в любой регион страны. Профессиональная сборка и установка.</p>
              </div>
              
              <div className="p-6 group transition-all duration-300 hover:bg-neutral-50">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 flex items-center justify-center border border-neutral-200 mr-4 group-hover:border-[#d4af37] transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5 text-neutral-800">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900">Консультация дизайнера</h3>
                </div>
                <p className="text-neutral-600 pl-14">Персональный подбор мебели для вашего интерьера. Помощь в выборе оптимальных размеров и отделки.</p>
              </div>
              
              <div className="p-6 group transition-all duration-300 hover:bg-neutral-50">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 flex items-center justify-center border border-neutral-200 mr-4 group-hover:border-[#d4af37] transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5 text-neutral-800">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900">Удобные способы оплаты</h3>
                </div>
                <p className="text-neutral-600 pl-14">Наличный и безналичный расчет, банковские карты, возможность оформления рассрочки.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
