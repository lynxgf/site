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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, MapPin, Save, KeyRound, LogOut } from "lucide-react";
import { useAuthStore, UserProfile } from "@/lib/store";
import { Separator } from "@/components/ui/separator";

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
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Профиль хедер */}
        <div className="bg-white rounded-lg shadow-sm mb-8 border border-gray-100 overflow-hidden">
          <div className="relative h-48 bg-gradient-to-r from-[#8e2b85] to-[#762271]">
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
          
          <div className="relative px-8 pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 -mt-12 z-10">
                <div className="rounded-full w-24 h-24 bg-[#8e2b85] text-white flex items-center justify-center text-4xl border-4 border-white shadow-md">
                  <span className="font-medium">
                    {username ? username.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="text-center sm:text-left mt-2 sm:mt-0">
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : username}
                  </h1>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="border-red-300 text-red-600 hover:bg-red-50" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Боковое меню */}
          <div className="lg:col-span-1">
            <Card className="border border-gray-100 shadow-sm sticky top-24">
              <CardContent className="p-0">
                <div className="py-4">
                  <Tabs defaultValue="profile" orientation="vertical" className="w-full">
                    <TabsList className="bg-white border-r border-gray-100 flex flex-col h-auto w-full rounded-none justify-start p-0">
                      <TabsTrigger 
                        value="profile" 
                        className="rounded-none border-l-2 border-transparent data-[state=active]:border-[#8e2b85] justify-start pl-4 py-4 w-full"
                      >
                        <User className="h-5 w-5 mr-2" />
                        Личная информация
                      </TabsTrigger>
                      <TabsTrigger 
                        value="security" 
                        className="rounded-none border-l-2 border-transparent data-[state=active]:border-[#8e2b85] justify-start pl-4 py-4 w-full"
                      >
                        <KeyRound className="h-5 w-5 mr-2" />
                        Безопасность
                      </TabsTrigger>
                      <TabsTrigger 
                        value="orders" 
                        className="rounded-none border-l-2 border-transparent data-[state=active]:border-[#8e2b85] justify-start pl-4 py-4 w-full"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 mr-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        Мои заказы
                      </TabsTrigger>
                      <TabsTrigger 
                        value="favorites" 
                        className="rounded-none border-l-2 border-transparent data-[state=active]:border-[#8e2b85] justify-start pl-4 py-4 w-full"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 mr-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        Избранное
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Основной контент */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="space-y-8">
              {/* Вкладка профиля */}
              <TabsContent value="profile">
                <Card className="border border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <User className="h-5 w-5 mr-2 text-[#8e2b85]" />
                      Личная информация
                    </CardTitle>
                    <CardDescription>
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
                                      className="pl-10 border-gray-200 focus:border-[#8e2b85] focus:ring-[#8e2b85]"
                                      placeholder="Иван"
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
                                      className="pl-10 border-gray-200 focus:border-[#8e2b85] focus:ring-[#8e2b85]"
                                      placeholder="Иванов"
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
                                    className="pl-10 border-gray-200 focus:border-[#8e2b85] focus:ring-[#8e2b85]"
                                    placeholder="ivan@example.com"
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
                                    className="pl-10 border-gray-200 focus:border-[#8e2b85] focus:ring-[#8e2b85]"
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
                                    className="pl-10 border-gray-200 focus:border-[#8e2b85] focus:ring-[#8e2b85]"
                                    placeholder="Город, улица, дом, квартира, индекс"
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
                            className="bg-[#8e2b85] hover:bg-[#762271] text-white px-6"
                            disabled={isUpdatingProfile}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {isUpdatingProfile ? "Сохранение..." : "Сохранить изменения"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Вкладка безопасности */}
              <TabsContent value="security">
                <Card className="border border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <KeyRound className="h-5 w-5 mr-2 text-[#8e2b85]" />
                      Безопасность
                    </CardTitle>
                    <CardDescription>
                      Здесь вы можете изменить пароль для входа в систему
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
                                    className="pl-10 border-gray-200 focus:border-[#8e2b85] focus:ring-[#8e2b85]"
                                    type="password"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Separator className="my-4" />
                        
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
                                    className="pl-10 border-gray-200 focus:border-[#8e2b85] focus:ring-[#8e2b85]"
                                    type="password"
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
                              <FormLabel>Подтверждение пароля</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input
                                    className="pl-10 border-gray-200 focus:border-[#8e2b85] focus:ring-[#8e2b85]"
                                    type="password"
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
                            className="bg-[#8e2b85] hover:bg-[#762271] text-white px-6"
                            disabled={isUpdatingPassword}
                          >
                            <KeyRound className="h-4 w-4 mr-2" />
                            {isUpdatingPassword ? "Сохранение..." : "Изменить пароль"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Вкладка заказов */}
              <TabsContent value="orders">
                <Card className="border border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 mr-2 text-[#8e2b85]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      Мои заказы
                    </CardTitle>
                    <CardDescription>
                      История ваших заказов и их статус
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <div className="text-center py-12 px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">У вас пока нет заказов</h3>
                        <p className="text-gray-500 mb-6">Начните делать покупки прямо сейчас!</p>
                        <Button 
                          onClick={() => setLocation('/products')} 
                          className="bg-[#8e2b85] hover:bg-[#762271] text-white"
                        >
                          Перейти в каталог
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Вкладка избранного */}
              <TabsContent value="favorites">
                <Card className="border border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 mr-2 text-[#8e2b85]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                      Избранное
                    </CardTitle>
                    <CardDescription>
                      Товары, которые вы добавили в избранное
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <div className="text-center py-12 px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">У вас пока нет избранных товаров</h3>
                        <p className="text-gray-500 mb-6">Добавляйте товары в избранное, чтобы вернуться к ним позже</p>
                        <Button 
                          onClick={() => setLocation('/products')} 
                          className="bg-[#8e2b85] hover:bg-[#762271] text-white"
                        >
                          Перейти в каталог
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}