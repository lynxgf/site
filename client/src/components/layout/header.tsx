import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { cartItems, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="font-bold text-2xl text-primary-900">
              LuxBed
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link 
                href="/products/mattress" 
                className={`font-medium ${location === '/products/mattress' ? 'text-primary-700' : 'hover:text-primary-700'}`}
              >
                Матрасы
              </Link>
              <Link 
                href="/products/bed" 
                className={`font-medium ${location === '/products/bed' ? 'text-primary-700' : 'hover:text-primary-700'}`}
              >
                Кровати
              </Link>
              <Link 
                href="/products" 
                className={`font-medium ${location === '/products' ? 'text-primary-700' : 'hover:text-primary-700'}`}
              >
                Аксессуары
              </Link>
              <Link href="#" className="font-medium hover:text-primary-700">
                О компании
              </Link>
              <Link href="#" className="font-medium hover:text-primary-700">
                Контакты
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className="md:hidden text-gray-700" 
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
            <div className="hidden md:flex items-center space-x-4">
              <button className="text-gray-700" aria-label="Search">
                <i className="fas fa-search text-xl"></i>
              </button>
              <Link href="/cart" className="text-gray-700 relative">
                <i className="fas fa-shopping-cart text-xl"></i>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>
              <Link href="/admin/login" className="text-gray-700">
                <i className="fas fa-user text-xl"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div className={`md:hidden bg-gray-50 px-4 py-2 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <nav className="flex flex-col space-y-3 py-3">
          <Link 
            href="/products/mattress" 
            className={`font-medium ${location === '/products/mattress' ? 'text-primary-700' : 'hover:text-primary-700'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Матрасы
          </Link>
          <Link 
            href="/products/bed" 
            className={`font-medium ${location === '/products/bed' ? 'text-primary-700' : 'hover:text-primary-700'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Кровати
          </Link>
          <Link 
            href="/products" 
            className={`font-medium ${location === '/products' ? 'text-primary-700' : 'hover:text-primary-700'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Аксессуары
          </Link>
          <Link 
            href="#" 
            className="font-medium hover:text-primary-700"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            О компании
          </Link>
          <Link 
            href="#" 
            className="font-medium hover:text-primary-700"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Контакты
          </Link>
          <div className="pt-2 flex space-x-4">
            <Link 
              href="/cart" 
              className="font-medium hover:text-primary-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <i className="fas fa-shopping-cart mr-2"></i>
              Корзина {cartItemCount > 0 && `(${cartItemCount})`}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
