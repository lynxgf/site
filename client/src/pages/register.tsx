import { useState } from "react";
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
import { Link } from "wouter";
import { UserPlus, Lock, Mail, User, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/lib/store";

// Валидационная схема для формы регистрации
const formSchema = z.object({
  username: z.string().min(3, "Имя пользователя должно быть не менее 3 символов"),
  email: z.string().email("Пожалуйста, введите корректный email"),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { checkAuth } = useAuthStore();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Ошибка при регистрации");
      }
      
      console.log("Registration success:", data);
      
      // Обновляем статус аутентификации
      await checkAuth();
      
      toast({
        title: "Успешная регистрация",
        description: "Вы успешно зарегистрировались в системе.",
      });
      
      // Перенаправляем на страницу профиля
      navigate("/profile");
    } catch (error) {
      toast({
        title: "Ошибка регистрации",
        description: error instanceof Error ? error.message : "Что-то пошло не так",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="max-w-md mx-auto">
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="text-center space-y-1">
              <CardTitle className="text-2xl font-bold">Регистрация</CardTitle>
              <CardDescription>
                Создайте аккаунт для доступа к личному кабинету
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Имя пользователя</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserPlus className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              className="pl-10 border-gray-200 focus:border-[#8e2b85] focus:ring-[#8e2b85]"
                              placeholder="ivanov_ivan"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
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
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Пароль</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Подтверждение пароля</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                    className="w-full bg-[#8e2b85] hover:bg-[#762271] text-white py-6"
                    disabled={isLoading}
                  >
                    {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 text-center">
              <div className="text-sm text-gray-500">
                Регистрируясь, вы соглашаетесь с нашими{" "}
                <Link href="/terms" className="text-[#8e2b85] hover:underline">
                  Условиями использования
                </Link>{" "}
                и{" "}
                <Link href="/privacy" className="text-[#8e2b85] hover:underline">
                  Политикой конфиденциальности
                </Link>
              </div>
              
              <div className="text-sm">
                Уже есть аккаунт?{" "}
                <Link href="/login" className="text-[#8e2b85] hover:underline font-medium">
                  Войти <ChevronRight className="inline h-3 w-3" />
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}