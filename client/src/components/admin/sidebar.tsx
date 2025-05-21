import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  FileText,
  Star
} from 'lucide-react';

export default function AdminSidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuthStore();
  
  const navigationItems = [
    { 
      name: 'Панель управления', 
      href: '/admin', 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      name: 'Товары', 
      href: '/admin/products', 
      icon: <ShoppingBag className="h-5 w-5" /> 
    },
    { 
      name: 'Заказы', 
      href: '/admin/orders', 
      icon: <Package className="h-5 w-5" /> 
    },
    { 
      name: 'Пользователи', 
      href: '/admin/users', 
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      name: 'Отзывы', 
      href: '/admin/reviews', 
      icon: <Star className="h-5 w-5" /> 
    },
    { 
      name: 'Экспорт данных', 
      href: '/admin/export', 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      name: 'Настройки', 
      href: '/admin/settings', 
      icon: <Settings className="h-5 w-5" /> 
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
        <span className="ml-2 font-semibold text-lg">LuxBed Admin</span>
      </div>
      
      {/* Sidebar for desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-white border-r transition-transform duration-300 transform
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold">LuxBed Admin</h1>
          </div>
          
          <nav className="py-6">
            <ul className="space-y-1 px-2">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className={`
                      flex items-center py-2 px-3 rounded-md hover:bg-gray-100 transition-colors
                      ${location === item.href ? 'bg-gray-100 font-medium' : 'text-gray-600'}
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-4 mt-auto border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
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
