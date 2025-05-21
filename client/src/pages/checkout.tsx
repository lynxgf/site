import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, ShoppingCart, Truck, CreditCard, ShieldCheck, Package, MessageSquare } from 'lucide-react';

// Form validation schema
const formSchema = z
  .object({
    customerName: z.string().min(3, 'Введите ваше полное имя'),
    customerEmail: z.string().email('Введите корректный email'),
    customerPhone: z.string().min(10, 'Введите корректный номер телефона'),
    deliveryMethod: z.enum(['courier', 'pickup']),
    paymentMethod: z.enum(['card', 'cash']),
    comment: z.string().optional(),
    address: z.string().optional(),
  })
  .refine(
    (data) => {
      // Если выбрана доставка курьером, адрес должен быть указан и содержать не менее 10 символов
      if (data.deliveryMethod === 'courier') {
        return data.address && data.address.length >= 10;
      }
      // Если выбран самовывоз, адрес не проверяем
      return true;
    },
    {
      message: "Для доставки курьером, пожалуйста, введите полный адрес (минимум 10 символов)",
      path: ["address"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { cartItems, isCartLoading, fetchCart, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  
  // Загружаем корзину и получаем ID сессии при первой загрузке страницы
  // но только если заказ еще не был успешно завершен
  useEffect(() => {
    // Загружаем корзину только если заказ еще не был оформлен
    if (!orderComplete) {
      fetchCart();
      
      // Получаем ID сессии
      fetch('/api/session')
        .then(res => res.json())
        .then(data => {
          if (data.sessionId) {
            setSessionId(data.sessionId);
          }
        })
        .catch(error => {
          console.error('Ошибка при получении ID сессии:', error);
        });
    }
  }, [orderComplete, fetchCart]);
  
  // Initialize form first
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      address: '',
      deliveryMethod: 'courier',
      paymentMethod: 'card',
      comment: '',
    },
  });
  
  // Get current delivery method
  const deliveryMethod = form.watch('deliveryMethod');
  
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const discount = cartItems.reduce((sum, item) => {
    if (item.product?.discount) {
      const itemPrice = Number(item.price) * item.quantity;
      return sum + (itemPrice * (item.product.discount / 100));
    }
    return sum;
  }, 0);
  
  // Стоимость доставки зависит от выбранного метода
  const deliveryCost = deliveryMethod === 'courier' ? 500 : 0;
  const total = subtotal - discount + deliveryCost;
  
  // Удаляем автоматический запрос корзины при монтировании компонента,
  // т.к. он уже происходит в основном эффекте выше
  
  // Этот эффект отвечает за перенаправление из оформления заказа обратно в корзину
  // но ТОЛЬКО если нет завершенного заказа
  useEffect(() => {
    // Перенаправляем в корзину только если:
    // 1. Заказ НЕ был завершен (это главное условие)
    // 2. Корзина уже загружена (не в процессе загрузки)
    // 3. Корзина пуста (нет товаров для заказа)
    if (!orderComplete && !isCartLoading && cartItems.length === 0) {
      // Используем setTimeout, чтобы дать время обновить состояние
      const redirectTimer = setTimeout(() => {
        navigate('/cart');
      }, 100);
      
      // Очищаем таймер при размонтировании компонента
      return () => clearTimeout(redirectTimer);
    }
  }, [cartItems, isCartLoading, navigate, orderComplete]);
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Получаем текущий метод доставки из формы 
      const currentDeliveryMethod = data.deliveryMethod;
      // Рассчитываем стоимость доставки на основе выбранного метода
      const currentDeliveryCost = currentDeliveryMethod === 'courier' ? 500 : 0;
      // Рассчитываем общую сумму заказа
      const orderTotal = subtotal - discount + currentDeliveryCost;
      
      // Prepare order items
      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        customWidth: item.customWidth === undefined ? null : item.customWidth,
        customLength: item.customLength === undefined ? null : item.customLength,
        selectedFabricCategory: item.selectedFabricCategory,
        selectedFabric: item.selectedFabric,
        fabricName: item.selectedFabric, // Упрощаем, используем ID ткани как название
        hasLiftingMechanism: !!item.hasLiftingMechanism, // Убедимся, что это булево значение
        price: item.price
      }));
      
      // Выведем полную информацию о заказе перед отправкой
      console.log("Данные заказа перед отправкой:", {
        ...data,
        sessionId,
        totalAmount: orderTotal,
        deliveryMethodText: currentDeliveryMethod === 'courier' ? 'Курьером' : 'Самовывоз',
        deliveryPrice: currentDeliveryCost, 
        paymentMethodText: data.paymentMethod === 'card' ? 'Банковской картой' : 'Наличными',
        items: orderItems
      });
      
      // Send order to server
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          sessionId: sessionId, // Передаем ID сессии
          totalAmount: orderTotal,
          deliveryMethodText: currentDeliveryMethod === 'courier' ? 'Курьером' : 'Самовывоз',
          deliveryPrice: currentDeliveryCost, 
          paymentMethodText: data.paymentMethod === 'card' ? 'Банковской картой' : 'Наличными',
          items: orderItems
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось оформить заказ');
      }
      
      const orderData = await response.json();
      
      console.log("Заказ успешно создан:", orderData);
      
      // ВАЖНО! Сначала отмечаем заказ как завершенный
      // Устанавливаем флаг перед очисткой корзины,
      // чтобы избежать перенаправления на страницу корзины
      setOrderId(orderData.order.id);
      setOrderComplete(true);
      
      // Только после этого очищаем корзину
      await clearCart();
      
      // Важно: мы не делаем немедленного перенаправления здесь,
      // а используем условный рендеринг для страницы подтверждения заказа
      
    } catch (error) {
      toast({
        title: 'Ошибка при оформлении заказа',
        description: error instanceof Error ? error.message : 'Попробуйте еще раз позже',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (orderComplete) {
    return (
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Card className="max-w-2xl mx-auto border border-gray-100 shadow-sm">
            <CardContent className="pt-10 pb-10 flex flex-col items-center text-center">
              <div className="bg-green-50 rounded-full p-5 mb-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-4">Заказ успешно оформлен!</h1>
              <p className="text-lg text-gray-900 mb-2">
                Спасибо за ваш заказ #{orderId}
              </p>
              <p className="text-gray-600 mb-8 max-w-lg">
                Мы отправили детали заказа на ваш email. Наш менеджер свяжется с вами в ближайшее время для подтверждения заказа.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md mb-8">
                <div className="bg-white p-4 rounded-md border border-gray-100 text-center">
                  <div className="text-[#8e2b85] mb-2">
                    <Truck className="h-6 w-6 mx-auto" />
                  </div>
                  <h3 className="text-sm font-medium">Статус заказа</h3>
                  <p className="text-gray-600 text-sm">Принят в обработку</p>
                </div>
                
                <div className="bg-white p-4 rounded-md border border-gray-100 text-center">
                  <div className="text-[#8e2b85] mb-2">
                    <Package className="h-6 w-6 mx-auto" />
                  </div>
                  <h3 className="text-sm font-medium">Доставка</h3>
                  <p className="text-gray-600 text-sm">В процессе подготовки</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="min-w-[150px] bg-[#8e2b85] hover:bg-[#762271] text-white px-6 py-6 text-base">
                  <a href="/">Вернуться на главную</a>
                </Button>
                <Button variant="outline" asChild className="min-w-[150px] border-[#8e2b85] text-[#8e2b85] hover:bg-[#8e2b85]/5 px-6 py-6 text-base">
                  <a href="/products">Продолжить покупки</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (isCartLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-10">Оформление заказа</h1>
          <div className="animate-pulse flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3 bg-white h-[600px] rounded-md border border-gray-100"></div>
            <div className="w-full lg:w-1/3 bg-white h-[400px] rounded-md border border-gray-100"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-10">Оформление заказа</h1>
        
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Checkout form */}
          <div className="w-full lg:w-2/3">
            <div className="mb-6">
              <div className="flex items-center mb-6">
                <div className="bg-[#8e2b85] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-medium">1</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Контактная информация</h2>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <Card className="border border-gray-100 shadow-sm overflow-hidden">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">ФИО</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Иванов Иван Иванович" 
                                  className="border-gray-200 focus:border-[#8e2b85] focus:ring-[#8e2b85]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Телефон</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="+7 (999) 123-45-67" 
                                  className="border-gray-200 focus:border-[#8e2b85] focus:ring-[#8e2b85]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="customerEmail"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="example@mail.ru" 
                                  className="border-gray-200 focus:border-[#8e2b85] focus:ring-[#8e2b85]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="mt-10">
                    <div className="flex items-center mb-6">
                      <div className="bg-[#8e2b85] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium">2</span>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Доставка</h2>
                    </div>
                    
                    <Card className="border border-gray-100 shadow-sm overflow-hidden">
                      <CardContent className="p-6">
                        <FormField
                          control={form.control}
                          name="deliveryMethod"
                          render={({ field }) => (
                            <FormItem className="space-y-4 mb-6">
                              <FormLabel className="text-gray-700 font-medium">Способ доставки</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-3"
                                >
                                  <Card 
                                    className={`border ${field.value === 'courier' ? 'border-[#8e2b85]' : 'border-gray-200'} p-4 cursor-pointer transition-all hover:border-[#8e2b85]`}
                                    onClick={() => {
                                      if (field.value !== 'courier') {
                                        field.onChange('courier');
                                      }
                                    }}
                                  >
                                    <div className="flex items-center gap-4">
                                      <RadioGroupItem value="courier" id="courier" className="text-[#8e2b85]" />
                                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                                        <Truck className="h-5 w-5 text-[#8e2b85]" />
                                      </div>
                                      <div className="flex-1">
                                        <FormLabel className="font-medium text-gray-900 cursor-pointer block" htmlFor="courier">
                                          Курьером (+500 ₽)
                                        </FormLabel>
                                        <p className="text-sm text-gray-500 mt-1">
                                          Доставка в течение 1-3 дней после подтверждения
                                        </p>
                                      </div>
                                    </div>
                                  </Card>
                                  
                                  <Card 
                                    className={`border ${field.value === 'pickup' ? 'border-[#8e2b85]' : 'border-gray-200'} p-4 cursor-pointer transition-all hover:border-[#8e2b85]`}
                                    onClick={() => {
                                      if (field.value !== 'pickup') {
                                        field.onChange('pickup');
                                      }
                                    }}
                                  >
                                    <div className="flex items-center gap-4">
                                      <RadioGroupItem value="pickup" id="pickup" className="text-[#8e2b85]" />
                                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                                        <Package className="h-5 w-5 text-[#8e2b85]" />
                                      </div>
                                      <div className="flex-1">
                                        <FormLabel className="font-medium text-gray-900 cursor-pointer block" htmlFor="pickup">
                                          Самовывоз (бесплатно)
                                        </FormLabel>
                                        <p className="text-sm text-gray-500 mt-1">
                                          Из нашего магазина в центре города
                                        </p>
                                      </div>
                                    </div>
                                  </Card>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {form.watch('deliveryMethod') === 'courier' && (
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 font-medium">Адрес доставки</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Город, улица, дом, квартира, индекс"
                                    className="resize-none min-h-[100px] border-gray-200 focus:border-[#8e2b85] focus:ring-[#8e2b85]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        
                        {form.watch('deliveryMethod') === 'pickup' && (
                          <div className="p-4 bg-gray-50 rounded-md mt-4">
                            <div className="text-gray-700 font-medium mb-2">Адрес самовывоза:</div>
                            <p className="text-gray-900">г. Москва, ул. Тверская, д. 15</p>
                            <p className="text-gray-500 text-sm mt-1">Ежедневно с 10:00 до 20:00</p>
                            <p className="text-gray-500 text-sm">Заказ будет доступен после подтверждения по телефону или email</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-10">
                    <div className="flex items-center mb-6">
                      <div className="bg-[#8e2b85] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium">3</span>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Оплата</h2>
                    </div>
                    
                    <Card className="border border-gray-100 shadow-sm overflow-hidden">
                      <CardContent className="p-6">
                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-gray-700 font-medium">Способ оплаты</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-3"
                                >
                                  <Card 
                                    className={`border ${field.value === 'card' ? 'border-[#8e2b85]' : 'border-gray-200'} p-4 cursor-pointer transition-all hover:border-[#8e2b85]`}
                                    onClick={() => {
                                      if (field.value !== 'card') {
                                        field.onChange('card');
                                      }
                                    }}
                                  >
                                    <div className="flex items-center gap-4">
                                      <RadioGroupItem value="card" id="card" className="text-[#8e2b85]" />
                                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                                        <CreditCard className="h-5 w-5 text-[#8e2b85]" />
                                      </div>
                                      <div className="flex-1">
                                        <FormLabel className="font-medium text-gray-900 cursor-pointer block" htmlFor="card">
                                          Банковской картой онлайн
                                        </FormLabel>
                                        <p className="text-sm text-gray-500 mt-1">
                                          Visa, MasterCard, Мир и другие
                                        </p>
                                      </div>
                                    </div>
                                  </Card>
                                  
                                  <Card 
                                    className={`border ${field.value === 'cash' ? 'border-[#8e2b85]' : 'border-gray-200'} p-4 cursor-pointer transition-all hover:border-[#8e2b85]`}
                                    onClick={() => {
                                      if (field.value !== 'cash') {
                                        field.onChange('cash');
                                      }
                                    }}
                                  >
                                    <div className="flex items-center gap-4">
                                      <RadioGroupItem value="cash" id="cash" className="text-[#8e2b85]" />
                                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                                        <ShoppingCart className="h-5 w-5 text-[#8e2b85]" />
                                      </div>
                                      <div className="flex-1">
                                        <FormLabel className="font-medium text-gray-900 cursor-pointer block" htmlFor="cash">
                                          Наличными при получении
                                        </FormLabel>
                                        <p className="text-sm text-gray-500 mt-1">
                                          Оплата курьеру или в пункте выдачи
                                        </p>
                                      </div>
                                    </div>
                                  </Card>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="mt-10">
                    <div className="flex items-center mb-6">
                      <div className="bg-[#8e2b85] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium">4</span>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Комментарий к заказу</h2>
                    </div>
                    
                    <Card className="border border-gray-100 shadow-sm overflow-hidden">
                      <CardContent className="p-6">
                        <FormField
                          control={form.control}
                          name="comment"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center mb-3">
                                <MessageSquare className="h-5 w-5 text-[#8e2b85] mr-2" />
                                <FormLabel className="text-gray-700 font-medium">Дополнительная информация</FormLabel>
                              </div>
                              <FormControl>
                                <Textarea
                                  placeholder="Дополнительная информация к заказу (необязательно)"
                                  className="resize-none min-h-[120px] border-gray-200 focus:border-[#8e2b85] focus:ring-[#8e2b85]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="hidden lg:block">
                    <Button 
                      type="submit" 
                      className="w-full bg-[#8e2b85] hover:bg-[#762271] text-white py-6 text-base" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Оформление заказа...' : 'Оформить заказ'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
          
          {/* Order summary */}
          <div className="w-full lg:w-1/3">
            <Card className="border border-gray-100 shadow-sm sticky top-10">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Ваш заказ</h2>
                
                <div className="max-h-[300px] overflow-y-auto mb-6 pr-1 space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex border-b border-gray-100 pb-4">
                      <div className="w-24 h-24 flex-shrink-0">
                        <img 
                          src={item.product?.images[0]} 
                          alt={item.product?.name} 
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-medium text-gray-900">{item.product?.name}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span className="inline-block bg-gray-100 rounded-full w-3 h-3 mr-2"></span>
                          <span>Кол-во: {item.quantity}</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-[#8e2b85] font-medium">
                            {formatPrice(Number(item.price) * item.quantity)} ₽
                          </span>
                          {item.product?.discount && item.product.discount > 0 && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              {formatPrice(Number(item.product.basePrice) * item.quantity)} ₽
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>Товары:</span>
                    <span className="font-medium">{formatPrice(subtotal)} ₽</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-[#8e2b85]">
                      <span>Скидка:</span>
                      <span className="font-medium">−{formatPrice(discount)} ₽</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-700">
                    <span>Доставка:</span>
                    <span className="font-medium">{formatPrice(form.watch('deliveryMethod') === 'courier' ? 500 : 0)} ₽</span>
                  </div>
                  
                  <Separator className="my-4 bg-gray-100" />
                  
                  <div className="flex justify-between font-semibold text-lg text-gray-900">
                    <span>Итого:</span>
                    <span>{formatPrice(subtotal - discount + (form.watch('deliveryMethod') === 'courier' ? 500 : 0))} ₽</span>
                  </div>
                </div>
                
                <Button 
                  onClick={form.handleSubmit(onSubmit)} 
                  className="w-full mt-6 bg-[#8e2b85] hover:bg-[#762271] text-white py-6 text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Оформление заказа...' : 'Оформить заказ'}
                </Button>
                
                <div className="mt-6 bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start">
                    <ShieldCheck className="h-5 w-5 text-[#8e2b85] mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      Ваши данные защищены. Оформляя заказ, вы соглашаетесь с условиями пользовательского соглашения и политикой конфиденциальности
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col space-y-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mr-3">
                      <Truck className="h-5 w-5 text-[#8e2b85]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Доставка по всей России</h3>
                      <p className="text-xs text-gray-500">
                        Доставка в любой город России
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mr-3">
                      <ShieldCheck className="h-5 w-5 text-[#8e2b85]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Гарантия качества</h3>
                      <p className="text-xs text-gray-500">
                        Гарантия до 10 лет на все изделия
                      </p>
                    </div>
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