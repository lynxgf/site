import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, MapPin, Save, KeyRound, LogOut, Heart, ShoppingBag, Lock } from "lucide-react";
import { useAuthStore, UserProfile } from "@/lib/store";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";

// Валидационная схема для формы данных профиля
const profileFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Пожалуйста, введите корректный email"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Валидационная схема для формы смены пароля
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Введите текущий пароль"),
  newPassword: z.string().min(6, "Новый пароль должен быть не менее 6 символов"),
  confirmPassword: z.string().min(1, "Подтвердите новый пароль"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user, getUserProfile, updateUserProfile, updatePassword, logout } = useAuthStore();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Убедимся, что пользователь авторизован
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    } else if (isAuthenticated && !user) {
      getUserProfile();
    }
  }, [isAuthenticated, isLoading, navigate, getUserProfile, user]);
  
  // Форма профиля
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    },
  });
  
  // Обновляем форму при загрузке данных пользователя
  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user, profileForm]);
  
  // Форма смены пароля
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Обработчик сохранения профиля
  const onSaveProfile = async (values: z.infer<typeof profileFormSchema>) => {
    setIsUpdatingProfile(true);
    
    try {
      const updatedProfile = await updateUserProfile(values);
      
      if (updatedProfile) {
        toast({
          title: "Профиль обновлен",
          description: "Ваш профиль успешно обновлен",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка обновления",
        description: error instanceof Error ? error.message : "Не удалось обновить профиль",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  
  // Обработчик смены пароля
  const onChangePassword = async (values: z.infer<typeof passwordFormSchema>) => {
    setIsUpdatingPassword(true);
    
    try {
      const success = await updatePassword(values.currentPassword, values.newPassword);
      
      if (success) {
        toast({
          title: "Пароль изменен",
          description: "Ваш пароль успешно изменен",
        });
        
        // Сбрасываем форму
        passwordForm.reset({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка смены пароля",
        description: error instanceof Error ? error.message : "Не удалось изменить пароль",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  
  // Обработчик выхода из аккаунта
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Получаем данные о заказах
  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    enabled: activeTab === "orders", // Загружаем только когда нужно
  });
  
  // Получаем избранное
  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: activeTab === "favorites", // Загружаем только когда нужно
  });
  
  if (isLoading || !user) {
    return (
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-6 w-1/3"></div>
            <div className="bg-white rounded-md border border-gray-100 h-[500px]"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Профиль хедер - новая версия по скриншоту */}
        <div className="rounded-lg shadow-sm mb-8 overflow-hidden">
          {/* Хедер - полностью фиолетовый фон */}
          <div className="bg-[#8B2A82] h-28 relative">
            {/* Данные пользователя */}
            <div className="absolute left-32 top-1/2 transform -translate-y-1/2">
              <h1 className="text-xl font-bold text-white">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.username}
              </h1>
              <p className="text-white/80 text-sm">{user?.email}</p>
            </div>
            
            {/* Аватар - теперь слева и немного внизу */}
            <div className="absolute bottom-0 left-8 transform translate-y-1/2">
              <div className="rounded-full w-20 h-20 bg-[#8B2A82] text-white flex items-center justify-center text-4xl border-4 border-white shadow-sm">
                <span className="font-medium">
                  {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 
                   user?.username ? user.username.charAt(0).toUpperCase() : 'Д'}
                </span>
              </div>
            </div>
            
            {/* Кнопка выхода - в правом верхнем углу с полупрозрачным фоном */}
            <div className="absolute top-4 right-4">
              <Button 
                variant="outline" 
                className="bg-[#8B2A82] border-0 text-white hover:bg-[#9c3994] rounded-sm text-sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Боковое меню - улучшенный дизайн в соответствии с макетом */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex items-center text-left px-4 py-3 hover:bg-gray-50 transition-colors text-sm ${
                      activeTab === "profile" 
                        ? "border-l-[3px] border-[#8B2A82] pl-[calc(1rem-3px)] text-[#8B2A82] font-medium" 
                        : "border-l-[3px] border-transparent text-gray-800"
                    }`}
                  >
                    <User className="h-5 w-5 mr-3" />
                    <span>Личная информация</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("security")}
                    className={`flex items-center text-left px-4 py-3 hover:bg-gray-50 transition-colors text-sm ${
                      activeTab === "security" 
                        ? "border-l-[3px] border-[#8B2A82] pl-[calc(1rem-3px)] text-[#8B2A82] font-medium" 
                        : "border-l-[3px] border-transparent text-gray-800"
                    }`}
                  >
                    <Lock className="h-5 w-5 mr-3" />
                    <span>Безопасность</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`flex items-center text-left px-4 py-3 hover:bg-gray-50 transition-colors text-sm ${
                      activeTab === "orders" 
                        ? "border-l-[3px] border-[#8B2A82] pl-[calc(1rem-3px)] text-[#8B2A82] font-medium" 
                        : "border-l-[3px] border-transparent text-gray-800"
                    }`}
                  >
                    <ShoppingBag className="h-5 w-5 mr-3" />
                    <span>Мои заказы</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("favorites")}
                    className={`flex items-center text-left px-4 py-3 hover:bg-gray-50 transition-colors text-sm ${
                      activeTab === "favorites" 
                        ? "border-l-[3px] border-[#8B2A82] pl-[calc(1rem-3px)] text-[#8B2A82] font-medium" 
                        : "border-l-[3px] border-transparent text-gray-800"
                    }`}
                  >
                    <Heart className="h-5 w-5 mr-3" />
                    <span>Избранное</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>
          
          {/* Основной контент */}
          <div className="lg:col-span-3">
            {/* Вкладка профиля - улучшенный дизайн */}
            {activeTab === "profile" && (
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="pb-2 px-0">
                  <CardTitle className="flex items-center text-lg font-medium text-gray-900">
                    <User className="h-5 w-5 mr-2 text-[#8B2A82]" />
                    Личная информация
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500 mt-1">
                    Здесь вы можете обновить свои личные данные и контактную информацию
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Имя</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input
                                    className="pl-10 border-gray-200 focus:border-[#8B2A82] focus:ring-[#8B2A82]"
                                    placeholder="Ваше имя"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Фамилия</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input
                                    className="pl-10 border-gray-200 focus:border-[#8B2A82] focus:ring-[#8B2A82]"
                                    placeholder="Ваша фамилия"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  className="pl-10 border-gray-200 focus:border-[#8B2A82] focus:ring-[#8B2A82]"
                                  placeholder="Ваш email"
                                  type="email"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Телефон</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  className="pl-10 border-gray-200 focus:border-[#8B2A82] focus:ring-[#8B2A82]"
                                  placeholder="+7 (999) 123-45-67"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Адрес доставки</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  className="pl-10 border-gray-200 focus:border-[#8B2A82] focus:ring-[#8B2A82]"
                                  placeholder="Ваш адрес доставки"
                                  {...field}
                                  value={field.value || ''}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="bg-[#8B2A82] hover:bg-[#7A2573] text-white"
                          disabled={isUpdatingProfile}
                        >
                          {isUpdatingProfile ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Сохранение...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Сохранить изменения
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
            
            {/* Вкладка безопасности */}
            {activeTab === "security" && (
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Lock className="h-5 w-5 mr-2 text-[#8B2A82]" />
                    Безопасность
                  </CardTitle>
                  <CardDescription>
                    Здесь вы можете изменить пароль от своей учетной записи
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Текущий пароль</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  className="pl-10 border-gray-200 focus:border-[#8B2A82] focus:ring-[#8B2A82]"
                                  type="password"
                                  placeholder="••••••••"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Новый пароль</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  className="pl-10 border-gray-200 focus:border-[#8B2A82] focus:ring-[#8B2A82]"
                                  type="password"
                                  placeholder="••••••••"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Подтвердите новый пароль</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  className="pl-10 border-gray-200 focus:border-[#8B2A82] focus:ring-[#8B2A82]"
                                  type="password"
                                  placeholder="••••••••"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          className="bg-[#8B2A82] hover:bg-[#7A2573] text-white"
                          disabled={isUpdatingPassword}
                        >
                          {isUpdatingPassword ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Изменение...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Изменить пароль
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
            
            {/* Вкладка заказов */}
            {activeTab === "orders" && (
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <ShoppingBag className="h-5 w-5 mr-2 text-[#8B2A82]" />
                    Мои заказы
                  </CardTitle>
                  <CardDescription>
                    История ваших заказов и их статус
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order: any) => (
                        <div key={order.id} className="border border-gray-200 rounded-md p-4">
                          <div className="flex flex-col md:flex-row justify-between mb-4">
                            <div>
                              <p className="text-sm text-gray-500">Заказ №{order.id}</p>
                              <p className="font-medium">от {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="mt-2 md:mt-0">
                              <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status === 'completed' ? 'Выполнен' :
                                 order.status === 'processing' ? 'В обработке' :
                                 order.status === 'cancelled' ? 'Отменен' :
                                 'Ожидает обработки'}
                              </span>
                            </div>
                          </div>
                          <div className="border-t border-gray-200 pt-3">
                            <p className="font-medium">Сумма заказа: {parseFloat(order.totalAmount).toLocaleString()} ₽</p>
                            <p className="text-sm text-gray-600 mt-1">Адрес доставки: {order.address}</p>
                          </div>
                          <div className="mt-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-[#8B2A82] border-[#8B2A82] hover:bg-[#8B2A82]/10"
                            >
                              Подробнее
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">У вас пока нет заказов</h3>
                      <p className="text-gray-500 mb-4">Здесь будут отображаться ваши заказы</p>
                      <Button className="bg-[#8B2A82] hover:bg-[#7A2573] text-white">
                        Перейти к покупкам
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Вкладка избранного */}
            {activeTab === "favorites" && (
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Heart className="h-5 w-5 mr-2 text-[#8B2A82]" />
                    Избранное
                  </CardTitle>
                  <CardDescription>
                    Сохраненные товары, которые вам понравились
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {favorites.map((product: any) => (
                        <div key={product.id} className="border border-gray-200 rounded-md overflow-hidden">
                          <div className="aspect-square bg-gray-100">
                            {product.images && product.images[0] && (
                              <img 
                                src={product.images[0]} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-[#8B2A82] font-bold mt-1">
                              {parseFloat(product.basePrice).toLocaleString()} ₽
                            </p>
                            <div className="flex space-x-2 mt-3">
                              <Button 
                                className="flex-1 bg-[#8B2A82] hover:bg-[#7A2573] text-white"
                                size="sm"
                              >
                                В корзину
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">У вас пока нет избранных товаров</h3>
                      <p className="text-gray-500 mb-4">Добавляйте товары в избранное, чтобы не потерять их</p>
                      <Button className="bg-[#8B2A82] hover:bg-[#7A2573] text-white">
                        Перейти к покупкам
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}