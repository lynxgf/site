import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Схема валидации формы
const formSchema = z.object({
  name: z.string().min(2, "Имя должно содержать не менее 2 символов"),
  email: z.string().email("Введите корректный email"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  message: z.string().min(10, "Сообщение должно содержать не менее 10 символов"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Настройка формы
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });
  
  // Обработчик отправки формы
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // В реальном приложении здесь был бы запрос к API
      // await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      
      // Имитация запроса
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Сообщение отправлено",
        description: "Мы свяжемся с вами в ближайшее время",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Ошибка отправки",
        description: "Не удалось отправить сообщение. Пожалуйста, попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Контакты</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Свяжитесь с нами любым удобным способом. Мы всегда готовы ответить на ваши вопросы.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Контактная информация */}
          <div className="md:col-span-1 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Свяжитесь с нами</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#8B2A82]/10 rounded-full flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#8B2A82" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Адрес</h3>
                      <p className="text-gray-600 mt-1 text-sm">г. Москва, ул. Примерная, д. 123</p>
                      <p className="text-gray-600 text-sm">Время работы: ПН-ВС с 10:00 до 20:00</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#8B2A82]/10 rounded-full flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#8B2A82" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Телефон</h3>
                      <p className="text-gray-600 mt-1 text-sm">+7 (495) 123-45-67</p>
                      <p className="text-gray-600 text-sm">+7 (800) 123-45-67 (Бесплатно по России)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#8B2A82]/10 rounded-full flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#8B2A82" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600 mt-1 text-sm">info@матрасовъ.рф</p>
                      <p className="text-gray-600 text-sm">support@матрасовъ.рф</p>
                    </div>
                  </div>
                </div>
                
                {/* Социальные сети */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Мы в социальных сетях</h3>
                  <div className="flex space-x-3">
                    <a href="#" className="w-10 h-10 bg-[#8B2A82]/10 rounded-full flex items-center justify-center hover:bg-[#8B2A82]/20 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B2A82" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                    </a>
                    <a href="#" className="w-10 h-10 bg-[#8B2A82]/10 rounded-full flex items-center justify-center hover:bg-[#8B2A82]/20 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B2A82" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                    <a href="#" className="w-10 h-10 bg-[#8B2A82]/10 rounded-full flex items-center justify-center hover:bg-[#8B2A82]/20 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B2A82" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497 -3.753C20.18 7.773 21.692 5.25 22 4.009z"></path>
                      </svg>
                    </a>
                    <a href="#" className="w-10 h-10 bg-[#8B2A82]/10 rounded-full flex items-center justify-center hover:bg-[#8B2A82]/20 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B2A82" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Карта */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Как нас найти</h2>
                <div className="w-full h-64 bg-gray-200 rounded-md flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Карта загружается...</span>
                  {/* Здесь будет карта */}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Форма обратной связи */}
          <div className="md:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Напишите нам</h2>
                <p className="text-gray-600 mb-6">
                  У вас есть вопросы или предложения? Заполните форму ниже, и мы свяжемся с вами в ближайшее время.
                </p>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Имя</FormLabel>
                            <FormControl>
                              <Input placeholder="Ваше имя" {...field} />
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
                              <Input type="email" placeholder="Ваш email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Телефон</FormLabel>
                          <FormControl>
                            <Input placeholder="+7 (___) ___-__-__" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Сообщение</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Ваше сообщение" 
                              className="min-h-32"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-[#8B2A82] hover:bg-[#76236e]"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Отправка..." : "Отправить сообщение"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            {/* FAQ */}
            <Card className="border-0 shadow-sm mt-8">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Часто задаваемые вопросы</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Какой срок доставки товаров?</h3>
                    <p className="text-gray-600 mt-1 text-sm">
                      Доставка по Москве осуществляется в течение 1-2 дней. Доставка по России – от 3 до 14 дней, в зависимости от региона.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">Какие способы оплаты вы принимаете?</h3>
                    <p className="text-gray-600 mt-1 text-sm">
                      Мы принимаем оплату наличными при доставке, банковскими картами, а также безналичным расчетом для юридических лиц.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">Какой гарантийный срок на вашу продукцию?</h3>
                    <p className="text-gray-600 mt-1 text-sm">
                      Гарантийный срок на матрасы составляет от 1 до 10 лет, на кровати – от 1 до 5 лет, в зависимости от модели.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">Возможен ли возврат товара?</h3>
                    <p className="text-gray-600 mt-1 text-sm">
                      Да, в соответствии с законом о защите прав потребителей, возврат возможен в течение 14 дней с момента покупки, при условии сохранения товарного вида и потребительских свойств.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}