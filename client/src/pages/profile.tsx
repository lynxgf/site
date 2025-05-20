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
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">Личный кабинет</h1>
          <Button 
            variant="outline" 
            className="border-red-300 text-red-600 hover:bg-red-50" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
        
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Профиль</TabsTrigger>
            <TabsTrigger value="security">Безопасность</TabsTrigger>
          </TabsList>
          
          {/* Вкладка профиля */}
          <TabsContent value="profile">
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle>Информация профиля</CardTitle>
                <CardDescription>
                  Здесь вы можете обновить свои личные данные и контактную информацию
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
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
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="bg-[#8e2b85] hover:bg-[#762271] text-white"
                      disabled={isUpdatingProfile}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isUpdatingProfile ? "Сохранение..." : "Сохранить изменения"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Вкладка безопасности */}
          <TabsContent value="security">
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle>Безопасность</CardTitle>
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
                    
                    <Button 
                      type="submit" 
                      className="bg-[#8e2b85] hover:bg-[#762271] text-white"
                      disabled={isUpdatingPassword}
                    >
                      <KeyRound className="h-4 w-4 mr-2" />
                      {isUpdatingPassword ? "Сохранение..." : "Изменить пароль"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}