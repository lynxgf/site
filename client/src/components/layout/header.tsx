import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useCartStore, useAuthStore } from '@/lib/store';
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { LogOut, Settings, ShoppingBag, User } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location, setLocation] = useLocation();
  const { cartItems, fetchCart } = useCartStore();
  const { isAuthenticated, isAdmin, username, user, logout } = useAuthStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: isSearchOpen, // Только запрашиваем при открытии поиска
  });
  
  // Обработчик поиска
  useEffect(() => {
    if (products && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const results = products.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      ).slice(0, 5); // Ограничиваем до 5 результатов
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, products]);
  
  // Закрытие поиска при клике вне формы
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchCart();
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchCart]);
  
  // Обработчик отправки формы поиска
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Фокусируемся на поле поиска при открытии
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-white'}`}>
      {/* Top info bar */}
      <div className="bg-gray-900 py-2 px-4 text-sm hidden md:block">
        <div className="container mx-auto flex justify-between">
          <div className="flex space-x-6">
            <a href="tel:+74951234567" className="flex items-center text-gray-300 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              +7 (495) 123-45-67
            </a>
            <a href="mailto:info@матрасовъ.рф" className="flex items-center text-gray-300 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              info@матрасовъ.рф
            </a>
          </div>
          <div className="flex items-center space-x-5">
            <span className="flex items-center text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ПН-ВС: 10:00 - 20:00
            </span>
            <a href="#" className="text-gray-300 hover:text-white">Доставка и оплата</a>
            <a href="#" className="text-gray-300 hover:text-white">Гарантия</a>
            <a href="#" className="text-gray-300 hover:text-white">Политика конфиденциальности</a>
          </div>
        </div>
      </div>
      
      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/">
              <div className="flex items-center h-8">
                <svg width="120" height="22" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g fill="#8e2b85">
                    <path d="M30 2.5L25.625 17.5H23.125L19.375 5L15.625 17.5H13.125L8.75 2.5H11.25L14.375 15.625L18.125 2.5H20.625L24.375 15.625L27.5 2.5H30Z"/>
                    <path d="M39.8633 7.5C41.1133 7.5 42.0508 7.85156 42.6758 8.55469C43.3008 9.25781 43.6133 10.2656 43.6133 11.5781V17.5H41.2383V11.875C41.2383 11.125 41.0664 10.5586 40.7227 10.1758C40.3789 9.79297 39.8828 9.60156 39.2344 9.60156C38.5156 9.60156 37.9453 9.81641 37.5234 10.2461C37.1016 10.6758 36.8906 11.3008 36.8906 12.1211V17.5H34.5156V7.65625H36.7656V8.90625C37.1094 8.45312 37.543 8.11719 38.0664 7.89844C38.5898 7.63281 39.1914 7.5 39.8633 7.5Z"/>
                    <path d="M51.9258 9.72656H49.7695V17.5H47.3945V9.72656H45.957V7.65625H47.3945V6.75C47.3945 5.65625 47.707 4.82031 48.332 4.25C48.9633 3.67969 49.8945 3.39453 51.1258 3.39453H52.7539V5.47656H51.5039C51.0039 5.47656 50.6602 5.57812 50.4727 5.78125C50.2852 5.98438 50.1914 6.32812 50.1914 6.8125V7.65625H52.7539V9.72656H51.9258Z"/>
                    <path d="M63.4766 12.4375C63.4766 12.8125 63.4531 13.1406 63.4062 13.4219H56.5625C56.6094 14.1406 56.8672 14.7109 57.3359 15.1328C57.8047 15.5547 58.3828 15.7656 59.0703 15.7656C60.0391 15.7656 60.7188 15.3594 61.1094 14.5469H63.2656C62.9688 15.4062 62.4453 16.1094 61.6953 16.6562C60.9453 17.1875 60.0469 17.4531 59 17.4531C58.125 17.4531 57.3438 17.2578 56.6562 16.8672C55.9688 16.4766 55.4297 15.9297 55.0391 15.2266C54.6484 14.5234 54.4531 13.7266 54.4531 12.8359C54.4531 11.9453 54.6484 11.1484 55.0391 10.4453C55.4297 9.74219 55.9688 9.19531 56.6562 8.80469C57.3438 8.41406 58.125 8.21875 59 8.21875C59.875 8.21875 60.6484 8.41406 61.3203 8.80469C61.9922 9.19531 62.5156 9.72656 62.8906 10.3984C63.2812 11.0703 63.4766 11.8281 63.4766 12.6719V12.4375ZM61.3672 11.6562C61.3672 11.0625 61.1562 10.5859 60.7344 10.2266C60.3125 9.86719 59.7812 9.6875 59.1406 9.6875C58.5469 9.6875 58.0391 9.86719 57.6172 10.2266C57.1953 10.5859 56.9375 11.0625 56.8438 11.6562H61.3672Z"/>
                    <path d="M70 15.7656C70.5156 15.7656 70.9766 15.6562 71.3828 15.4375C71.7891 15.2188 72.0859 14.9141 72.2734 14.5234H74.5547C74.3203 15.5078 73.7734 16.3047 72.9141 16.9141C72.0547 17.5234 71.0781 17.8281 69.9844 17.8281C69.0156 17.8281 68.1562 17.6328 67.4062 17.2422C66.6562 16.8516 66.0703 16.3047 65.6484 15.6016C65.2266 14.8984 65.0156 14.1016 65.0156 13.2109C65.0156 12.3203 65.2266 11.5234 65.6484 10.8203C66.0703 10.1172 66.6562 9.57031 67.4062 9.17969C68.1562 8.78906 69.0156 8.59375 69.9844 8.59375C70.9219 8.59375 71.7656 8.78906 72.5156 9.17969C73.2656 9.57031 73.8516 10.1016 74.2734 10.7734C74.6953 11.4453 74.9062 12.2031 74.9062 13.0469C74.9062 13.2031 74.8984 13.3594 74.8828 13.5156H67.3906C67.4375 14.2969 67.7031 14.9062 68.1875 15.3438C68.6719 15.7812 69.2812 16 70 15.7656ZM71.9922 11.9375C71.9453 11.2031 71.6797 10.625 71.1953 10.2031C70.7109 9.78125 70.125 9.57031 69.4375 9.57031C68.7969 9.57031 68.2422 9.78125 67.7734 10.2031C67.3047 10.625 67.0156 11.2031 66.9062 11.9375H71.9922Z"/>
                    <path d="M75.4336 13.2109C75.4336 12.3203 75.6289 11.5234 76.0195 10.8203C76.4102 10.1172 76.9414 9.57031 77.6133 9.17969C78.2852 8.78906 79.0352 8.59375 79.8633 8.59375C80.6133 8.59375 81.2695 8.75 81.832 9.0625C82.3945 9.375 82.8242 9.78125 83.1211 10.2812V8.78125H85.4023V17.6719H83.1211V16.1719C82.8242 16.6719 82.3945 17.0781 81.832 17.3906C81.2695 17.7031 80.6133 17.8594 79.8633 17.8594C79.0352 17.8594 78.2852 17.6641 77.6133 17.2734C76.9414 16.8828 76.4102 16.3438 76.0195 15.6562C75.6289 14.9531 75.4336 14.1406 75.4336 13.2109ZM83.1211 13.2109C83.1211 12.7578 83.0117 12.3594 82.793 12.0156C82.5742 11.6719 82.2773 11.4062 81.9023 11.2188C81.5273 11.0312 81.1289 10.9375 80.707 10.9375C80.2852 10.9375 79.8945 11.0312 79.5352 11.2188C79.1758 11.4062 78.8789 11.6719 78.6445 12.0156C78.4102 12.3594 78.293 12.7578 78.293 13.2109C78.293 13.6641 78.4102 14.0625 78.6445 14.4062C78.8789 14.75 79.1758 15.0156 79.5352 15.2031C79.9102 15.3906 80.3008 15.4844 80.707 15.4844C81.1289 15.4844 81.5273 15.3906 81.9023 15.2031C82.2773 15.0156 82.5742 14.75 82.793 14.4062C83.0117 14.0625 83.1211 13.6641 83.1211 13.2109Z"/>
                    <path d="M97.5 12.4375C97.5 12.8125 97.4766 13.1406 97.4297 13.4219H90.5859C90.6328 14.1406 90.8906 14.7109 91.3594 15.1328C91.8281 15.5547 92.4062 15.7656 93.0938 15.7656C94.0625 15.7656 94.7422 15.3594 95.1328 14.5469H97.2891C96.9922 15.4062 96.4688 16.1094 95.7188 16.6562C94.9688 17.1875 94.0703 17.4531 93.0234 17.4531C92.1484 17.4531 91.3672 17.2578 90.6797 16.8672C89.9922 16.4766 89.4531 15.9297 89.0625 15.2266C88.6719 14.5234 88.4766 13.7266 88.4766 12.8359C88.4766 11.9453 88.6719 11.1484 89.0625 10.4453C89.4531 9.74219 89.9922 9.19531 90.6797 8.80469C91.3672 8.41406 92.1484 8.21875 93.0234 8.21875C93.8984 8.21875 94.6719 8.41406 95.3438 8.80469C96.0156 9.19531 96.5391 9.72656 96.9141 10.3984C97.3047 11.0703 97.5 11.8281 97.5 12.6719V12.4375ZM95.3906 11.6562C95.3906 11.0625 95.1797 10.5859 94.7578 10.2266C94.3359 9.86719 93.8047 9.6875 93.1641 9.6875C92.5703 9.6875 92.0625 9.86719 91.6406 10.2266C91.2188 10.5859 90.9609 11.0625 90.8672 11.6562H95.3906Z"/>
                  </g>
                </svg>
              </div>
            </Link>
            
            <nav className="hidden lg:flex space-x-8">
              <Link to="/products/mattress" className={`${location.includes('/products/mattress') ? 'text-[#8e2b85]' : 'text-black hover:text-[#8e2b85]'} transition-colors`}>
                Матрасы
              </Link>
              <Link to="/products/bed" className={`${location.includes('/products/bed') ? 'text-[#8e2b85]' : 'text-black hover:text-[#8e2b85]'} transition-colors`}>
                Кровати
              </Link>
              <Link to="/products/accessory" className={`${location.includes('/products/accessory') ? 'text-[#8e2b85]' : 'text-black hover:text-[#8e2b85]'} transition-colors`}>
                Аксессуары
              </Link>
              <Link to="/about" className={`${location === '/about' ? 'text-[#8e2b85]' : 'text-black hover:text-[#8e2b85]'} transition-colors`}>
                О компании
              </Link>
              <Link to="/contacts" className={`${location === '/contacts' ? 'text-[#8e2b85]' : 'text-black hover:text-[#8e2b85]'} transition-colors`}>
                Контакты
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Профиль/Авторизация */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <div className="relative" id="profile-menu-container">
                  <div 
                    className="p-2 flex items-center gap-2 text-black hover:text-[#8e2b85] transition-colors rounded-full cursor-pointer"
                    aria-label="Профиль пользователя"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const menu = document.getElementById('profile-dropdown');
                      if (menu) {
                        menu.classList.toggle('hidden');
                      }
                      
                      // Добавляем обработчик клика вне меню
                      const handleOutsideClick = (event: MouseEvent) => {
                        const container = document.getElementById('profile-menu-container');
                        if (container && !container.contains(event.target as Node)) {
                          const menu = document.getElementById('profile-dropdown');
                          if (menu) {
                            menu.classList.add('hidden');
                          }
                          document.removeEventListener('click', handleOutsideClick);
                        }
                      };
                      
                      // Добавляем обработчик с небольшой задержкой, чтобы не сработало сразу
                      setTimeout(() => {
                        document.addEventListener('click', handleOutsideClick);
                      }, 100);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span className="text-sm font-medium hidden lg:block">
                      {user?.username || "Профиль"}
                    </span>
                  </div>
                  
                  <div id="profile-dropdown" className="absolute right-0 top-full mt-2 w-56 bg-white rounded-md shadow-lg hidden z-50">
                    <div className="flex items-center justify-start gap-2 p-3 border-b">
                      <div className="rounded-full w-10 h-10 bg-[#8e2b85] text-white flex items-center justify-center">
                        <span className="text-lg font-medium">
                          {username ? username.charAt(0).toUpperCase() : 'У'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{username || "Пользователь"}</span>
                        <span className="text-xs text-gray-500 truncate">{user?.email || "Нет email"}</span>
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#8e2b85]">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          <span>Личный кабинет</span>
                        </div>
                      </Link>
                      
                      <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#8e2b85]">
                        <div className="flex items-center">
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          <span>Мои заказы</span>
                        </div>
                      </Link>
                      
                      {isAdmin && (
                        <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#8e2b85]">
                          <div className="flex items-center">
                            <Settings className="w-4 h-4 mr-2" />
                            <span>Панель администратора</span>
                          </div>
                        </Link>
                      )}
                    </div>
                    
                    <div className="py-1 border-t">
                      <button 
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        onClick={async (e) => {
                          e.preventDefault();
                          await logout();
                          setLocation('/');
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        <span>Выйти</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="p-2 flex items-center gap-2 text-black hover:text-[#8e2b85] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="text-sm font-medium hidden lg:block">
                    Войти
                  </span>
                </Link>
              )}
            </div>
            
            {/* Поиск */}
            <div className="relative">
              <button
                onClick={toggleSearch}
                className="p-2 text-black hover:text-[#8e2b85] transition-colors"
                aria-label="Поиск"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
              
              {isSearchOpen && (
                <div ref={searchRef} className="absolute right-0 top-full mt-2 w-80 bg-white shadow-lg rounded-md p-4 z-30">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="flex">
                      <Input
                        id="search-input"
                        className="flex-grow"
                        placeholder="Поиск товаров..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Button type="submit" className="ml-2 bg-[#8e2b85] hover:bg-[#76236e]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                      </Button>
                    </div>
                  </form>
                  
                  {searchResults.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h4 className="text-sm font-medium text-gray-500">Результаты поиска:</h4>
                      <div className="divide-y">
                        {searchResults.map((product) => (
                          <Link key={product.id} href={`/product/${product.id}`}>
                            <div className="py-2 flex items-center gap-3 hover:bg-gray-50 cursor-pointer">
                              {product.images.length > 0 && (
                                <img src={product.images[0]} className="w-12 h-12 object-cover" alt={product.name} />
                              )}
                              <div>
                                <h5 className="text-sm font-medium">{product.name}</h5>
                                <p className="text-xs text-gray-500 truncate">{product.category}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Корзина */}
            <Link href="/cart" className="p-2 text-black hover:text-[#8e2b85] transition-colors relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#8e2b85] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center -mt-1 -mr-1">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>
            
            <div className="hidden lg:block">
              <Button className="bg-[#8B2A82] hover:bg-[#7A2573] text-white rounded-sm px-4 py-2 h-auto font-medium">
                Заказать звонок
              </Button>
            </div>
            
            {/* Мобильное меню */}
            <div className="lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-black hover:text-[#8e2b85] transition-colors"
                aria-label="Открыть меню"
              >
                {isMobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 py-4 px-4">
          <div className="container mx-auto space-y-4">
            <Link href="/products/mattress" className="block py-2 border-b border-gray-100">
              Матрасы
            </Link>
            <Link href="/products/bed" className="block py-2 border-b border-gray-100">
              Кровати
            </Link>
            <Link href="/products/accessory" className="block py-2 border-b border-gray-100">
              Аксессуары
            </Link>
            <Link href="/about" className="block py-2 border-b border-gray-100">
              О компании
            </Link>
            <Link href="/contacts" className="block py-2 border-b border-gray-100">
              Контакты
            </Link>
            <Link href="/faq" className="block py-2 border-b border-gray-100">
              Часто задаваемые вопросы
            </Link>
            
            {!isAuthenticated && (
              <Link href="/login" className="block py-2 border-b border-gray-100">
                Войти
              </Link>
            )}
            
            {isAuthenticated && (
              <>
                <Link href="/profile" className="block py-2 border-b border-gray-100">
                  Личный кабинет
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    setLocation('/');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-red-600"
                >
                  Выйти
                </button>
              </>
            )}
            
            <div className="pt-4">
              <Button className="w-full bg-[#8B2A82] hover:bg-[#7A2573] text-white rounded-sm px-4 py-2 h-auto font-medium">
                Заказать звонок
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}