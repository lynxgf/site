import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBasket, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function AdminSidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuthStore();
  
  const navigationItems = [
    { 
      name: 'Панель управления', 
      href: '/admin/dashboard', 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      name: 'Товары', 
      href: '/admin/products', 
      icon: <Package size={20} /> 
    },
    { 
      name: 'Заказы', 
      href: '/admin/orders', 
      icon: <ShoppingBasket size={20} /> 
    },
    { 
      name: 'Пользователи', 
      href: '/admin/users', 
      icon: <Users size={20} /> 
    },
    { 
      name: 'Настройки', 
      href: '/admin/settings', 
      icon: <Settings size={20} /> 
    },
  ];
  
  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden flex items-center p-4 border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
        <span className="ml-2 font-semibold text-lg">Admin Panel</span>
      </div>
      
      {/* Sidebar for desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-sm transition-transform duration-300 transform
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-primary-900">LuxBed Admin</h1>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <a
                      className={`
                        flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors
                        ${location === item.href
                          ? 'bg-primary-50 text-primary-900'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut size={20} className="mr-3" />
              Выйти
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
