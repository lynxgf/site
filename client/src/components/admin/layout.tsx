import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Settings, 
  FileText, 
  Users
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Проверка прав администратора
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["/api/session"],
  });

  // Определяем типы для сессии
  interface SessionData {
    sessionId: string;
    isLoggedIn: boolean;
    isAdmin?: boolean;
    userId?: number;
  }

  useEffect(() => {
    // Безопасное использование типизированных данных сессии
    const sessionData = session as SessionData | undefined;
    if (!sessionLoading && sessionData && sessionData.isAdmin === false) {
      toast({
        title: "Доступ запрещен",
        description: "У вас нет прав администратора",
        variant: "destructive",
      });
    }
  }, [session, sessionLoading, toast]);

  const navItems = [
    { path: "/admin", label: "Панель управления", icon: <LayoutDashboard className="mr-2 h-4 w-4" /> },
    { path: "/admin/products", label: "Товары", icon: <ShoppingBag className="mr-2 h-4 w-4" /> },
    { path: "/admin/orders", label: "Заказы", icon: <Package className="mr-2 h-4 w-4" /> },
    { path: "/admin/customers", label: "Клиенты", icon: <Users className="mr-2 h-4 w-4" /> },
    { path: "/admin/import-export", label: "Импорт/Экспорт", icon: <FileText className="mr-2 h-4 w-4" /> },
    { path: "/admin/settings", label: "Настройки", icon: <Settings className="mr-2 h-4 w-4" /> },
  ];

  if (sessionLoading) {
    return <div className="p-8">Загрузка...</div>;
  }

  // Безопасное приведение типов и проверка прав
  const sessionData = session as SessionData | undefined;
  if (sessionData && sessionData.isAdmin === false) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Доступ запрещен</h1>
        <p className="mb-4">У вас нет прав для доступа к административной панели.</p>
        <Button asChild>
          <Link to="/">Вернуться на главную</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Сайдбар */}
      <aside 
        className={`fixed lg:static lg:block z-40 bg-white shadow-md transition-all duration-300 h-full lg:w-64 ${
          isMenuOpen ? "w-64" : "w-0 -translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h1 className="text-xl font-bold">Админ-панель</h1>
          <button 
            className="lg:hidden" 
            onClick={() => setIsMenuOpen(false)}
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={`flex items-center p-2 rounded hover:bg-gray-100 transition-colors
                    ${location === item.path ? "bg-purple-100 text-purple-800" : ""}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Мобильная кнопка открытия меню */}
      <button
        className="fixed bottom-4 right-4 z-50 bg-purple-600 text-white p-3 rounded-full shadow-lg lg:hidden"
        onClick={() => setIsMenuOpen(true)}
      >
        <LayoutDashboard size={20} />
      </button>

      {/* Основной контент */}
      <main className="flex-1 p-6">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            className="mr-4"
            asChild
          >
            <Link to="/">
              <span className="flex items-center">
                <ChevronLeft className="mr-1" size={16} /> Вернуться на сайт
              </span>
            </Link>
          </Button>
        </div>
        
        {children}
      </main>
    </div>
  );
}