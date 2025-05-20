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
import { Lock, User, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/lib/store";

// Валидационная схема для формы входа
const formSchema = z.object({
  username: z.string().min(1, "Введите имя пользователя"),
  password: z.string().min(1, "Введите пароль"),
});

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      const success = await login(values.username, values.password);
      
      if (success) {
        toast({
          title: "Успешный вход",
          description: "Вы успешно вошли в систему",
        });
        
        // Перенаправляем на страницу профиля
        navigate("/profile");
      }
    } catch (error) {
      toast({
        title: "Ошибка входа",
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
              <CardTitle className="text-2xl font-bold">Вход в систему</CardTitle>
              <CardDescription>
                Войдите в свой аккаунт для доступа к личному кабинету
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Имя пользователя</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Пароль</FormLabel>
                          <Link href="/forgot-password" className="text-xs text-[#8e2b85] hover:underline">
                            Забыли пароль?
                          </Link>
                        </div>
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
                    {isLoading ? "Вход..." : "Войти"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 text-center">
              <div className="text-sm">
                Нет аккаунта?{" "}
                <Link href="/register" className="text-[#8e2b85] hover:underline font-medium">
                  Зарегистрироваться <ChevronRight className="inline h-3 w-3" />
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}