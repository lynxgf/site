import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { cartItems, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchCart]);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-white'}`}>
      {/* Top bar */}
      <div className="hidden lg:block bg-[#f9f6f8] border-b border-[#efe7ed]">
        <div className="container mx-auto px-6 py-2">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-6 text-[#4a3d49]">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                +7 (495) 123-45-67
              </span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                info@матрасовъ.рф
              </span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ПН-ВС: 10:00 - 20:00
              </span>
            </div>
            <div className="flex items-center space-x-6 text-[#4a3d49] tracking-wide">
              <Link href="#" className="hover:text-[#8e2b85] transition-colors">
                Доставка и оплата
              </Link>
              <Link href="#" className="hover:text-[#8e2b85] transition-colors">
                Гарантия
              </Link>
              <Link href="#" className="hover:text-[#8e2b85] transition-colors">
                Политика конфиденциальности
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main header */}
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-10">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <div className="h-9 min-w-[120px]">
                <svg width="120" height="22" viewBox="0 0 260 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g fill="#8e2b85">
                    <path d="M11.4,14.3h-7.2V45h-4.1v-45h23.8l-12.5,45h-4.2L11.4,14.3z"/>
                    <path d="M47.8,45h-3.9L34,13.1L24.1,45h-3.9l12.9-45h1.8L47.8,45z"/>
                    <path d="M71,45h-4.3V27.7c0-1.8-0.3-3.2-0.8-4.1c-0.5-0.9-1.2-1.5-2-1.9c-0.8-0.4-1.8-0.6-2.9-0.6c-1.8,0-3.3,0.7-4.5,2.1c-1.2,1.4-1.8,3.4-1.8,6.1V45h-4.3V0h4.3v18.4c1-1.8,2.2-3.1,3.7-4c1.5-0.9,3.2-1.3,5.1-1.3c2.8,0,5.1,0.9,6.7,2.6c1.6,1.7,2.4,4.1,2.4,7.1V45z"/>
                    <path d="M96.8,31.6h-19.5c0.1,2.8,1,5,2.6,6.6c1.6,1.6,3.7,2.3,6.3,2.3c1.7,0,3.2-0.3,4.5-1c1.3-0.7,2.5-1.7,3.4-3l2.3,2.4c-1.2,1.7-2.7,3-4.5,3.9c-1.8,0.9-3.8,1.4-6.2,1.4c-2.6,0-4.9-0.6-6.8-1.7c-1.9-1.1-3.4-2.7-4.5-4.8c-1.1-2.1-1.6-4.5-1.6-7.2c0-2.7,0.5-5.1,1.6-7.2c1.1-2.1,2.5-3.7,4.3-4.8c1.8-1.1,3.9-1.7,6.2-1.7c2.3,0,4.3,0.6,6.1,1.7c1.8,1.1,3.2,2.7,4.3,4.8c1,2.1,1.5,4.5,1.5,7.3V31.6zM79.6,20.7c-1.5,1.5-2.4,3.6-2.6,6.2h15.2c-0.2-2.6-1.1-4.7-2.6-6.2c-1.5-1.5-3.4-2.3-5.7-2.3C83,18.4,81.1,19.2,79.6,20.7z"/>
                    <path d="M115.4,45h-4.3V14.3h4.3V45z M110.7,6.2c-0.5-0.5-0.8-1.1-0.8-1.9c0-0.8,0.3-1.5,0.8-2c0.5-0.5,1.2-0.8,2-0.8c0.8,0,1.5,0.3,2,0.8c0.5,0.5,0.8,1.2,0.8,2c0,0.8-0.3,1.4-0.8,1.9c-0.5,0.5-1.2,0.8-2,0.8C111.9,6.9,111.2,6.7,110.7,6.2z"/>
                    <path d="M146,22c-2.2,0-4.2,0.6-5.9,1.8c-1.7,1.2-3.1,2.9-4.1,5c-1,2.1-1.5,4.6-1.5,7.3c0,2.7,0.5,5.1,1.5,7.2c1,2.1,2.4,3.7,4.1,4.9c1.7,1.2,3.7,1.8,5.9,1.8c1.6,0,3.1-0.3,4.6-0.9c1.5-0.6,2.7-1.5,3.7-2.6l2.6,2.7c-1.4,1.6-3.1,2.8-5.1,3.6c-2,0.8-4.1,1.2-6.3,1.2c-3,0-5.7-0.7-8-2.1c-2.3-1.4-4.1-3.3-5.4-5.8c-1.3-2.5-2-5.3-2-8.4c0-3.1,0.7-5.9,2-8.4c1.3-2.5,3.1-4.4,5.4-5.8c2.3-1.4,5-2.1,8-2.1c2.1,0,4.1,0.4,6.1,1.1c2,0.7,3.7,1.8,5,3.1l-2.4,3.1C152.2,23.4,149.3,22,146,22z"/>
                    <path d="M174.2,45h-4.3V14.3h4.3V45z M169.6,6.2c-0.5-0.5-0.8-1.1-0.8-1.9c0-0.8,0.3-1.5,0.8-2c0.5-0.5,1.2-0.8,2-0.8c0.8,0,1.5,0.3,2,0.8c0.5,0.5,0.8,1.2,0.8,2c0,0.8-0.3,1.4-0.8,1.9c-0.5,0.5-1.2,0.8-2,0.8C170.8,6.9,170.1,6.7,169.6,6.2z"/>
                    <path d="M204.5,45h-4.1V27.7c0-2.1-0.4-3.7-1.3-4.8c-0.9-1.1-2.2-1.6-3.9-1.6c-1.2,0-2.3,0.3-3.3,0.9c-1,0.6-1.8,1.5-2.4,2.6c-0.6,1.1-0.9,2.4-0.9,3.8V45h-4.3V14.3h4.1v4.8c0.8-1.6,2-2.9,3.6-3.8c1.5-0.9,3.3-1.4,5.3-1.4c2.4,0,4.3,0.8,5.7,2.3c1.4,1.6,2.1,3.7,2.1,6.5V45z"/>
                    <path d="M235.8,45h-3.9c-2.2,0-3.9-0.5-5.1-1.6c-1.2-1.1-1.8-2.6-1.8-4.8V18.4h-5.2v-4h5.2V7h4.3v7.4h8.2v4h-8.2v19.8c0,1.2,0.3,2,0.8,2.5c0.5,0.5,1.4,0.8,2.6,0.8h3.1V45z"/>
                    <path d="M259.3,32.9h-23.2v-4.2h23.2V32.9z"/>
                  </g>
                </svg>
              </div>
            </Link>
            
            <nav className="hidden lg:flex space-x-8">
              <Link 
                href="/products/mattress" 
                className={`font-light text-[15px] tracking-wide ${location === '/products/mattress' ? 'text-[#8e2b85]' : 'text-[#4a3d49] hover:text-[#8e2b85]'} transition-colors`}
              >
                Матрасы
              </Link>
              <Link 
                href="/products/bed" 
                className={`font-light text-[15px] tracking-wide ${location === '/products/bed' ? 'text-[#8e2b85]' : 'text-[#4a3d49] hover:text-[#8e2b85]'} transition-colors`}
              >
                Кровати
              </Link>
              <Link 
                href="/products" 
                className={`font-light text-[15px] tracking-wide ${location === '/products' ? 'text-[#8e2b85]' : 'text-[#4a3d49] hover:text-[#8e2b85]'} transition-colors`}
              >
                Аксессуары
              </Link>
              <Link href="#" className="font-light text-[15px] tracking-wide text-[#4a3d49] hover:text-[#8e2b85] transition-colors">
                О компании
              </Link>
              <Link href="#" className="font-light text-[15px] tracking-wide text-[#4a3d49] hover:text-[#8e2b85] transition-colors">
                Контакты
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-5">
            <button 
              className="lg:hidden text-[#8e2b85]" 
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            
            <div className="hidden lg:flex items-center space-x-6">
              <button className="text-[#8e2b85] hover:text-[#702269] transition-colors" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
              
              <Link href="/cart" className="text-[#8e2b85] hover:text-[#702269] transition-colors relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#8e2b85] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-medium">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>
              
              <Link href="/admin/login" className="text-[#8e2b85] hover:text-[#702269] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-3 font-light border-[#d9ccd5] text-[#8e2b85] hover:bg-[#f9f6f8] hover:text-[#702269] hover:border-[#8e2b85] rounded-none transition-colors"
              >
                Заказать звонок
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`lg:hidden bg-[#f9f6f8]/95 backdrop-blur-sm px-6 py-4 border-t border-[#efe7ed] shadow-lg ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <nav className="flex flex-col space-y-4 py-2">
          <Link 
            href="/products/mattress" 
            className={`text-[15px] tracking-wide ${location === '/products/mattress' ? 'text-[#8e2b85] font-medium' : 'text-[#4a3d49] hover:text-[#8e2b85]'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Матрасы
          </Link>
          <Link 
            href="/products/bed" 
            className={`text-[15px] tracking-wide ${location === '/products/bed' ? 'text-[#8e2b85] font-medium' : 'text-[#4a3d49] hover:text-[#8e2b85]'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Кровати
          </Link>
          <Link 
            href="/products" 
            className={`text-[15px] tracking-wide ${location === '/products' ? 'text-[#8e2b85] font-medium' : 'text-[#4a3d49] hover:text-[#8e2b85]'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Аксессуары
          </Link>
          <Link 
            href="#" 
            className="text-[15px] tracking-wide text-[#4a3d49] hover:text-[#8e2b85]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            О компании
          </Link>
          <Link 
            href="#" 
            className="text-[15px] tracking-wide text-[#4a3d49] hover:text-[#8e2b85]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Контакты
          </Link>
          
          <div className="pt-3 mt-3 border-t border-[#d9ccd5] space-y-4">
            <Link 
              href="/cart" 
              className="flex items-center font-light tracking-wide text-[#4a3d49] hover:text-[#8e2b85]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Корзина {cartItemCount > 0 && `(${cartItemCount})`}
            </Link>
            
            <div className="flex flex-col space-y-3 text-xs text-[#4a3d49]">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                +7 (495) 123-45-67
              </span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                info@матрасовъ.рф
              </span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ПН-ВС: 10:00 - 20:00
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full font-light border-[#d9ccd5] text-[#8e2b85] hover:bg-[#f9f6f8] hover:text-[#702269] hover:border-[#8e2b85] rounded-none transition-colors"
            >
              Заказать звонок
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
