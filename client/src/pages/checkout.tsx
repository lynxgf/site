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
import { CheckCircle, ShoppingBag } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  customerName: z.string().min(3, 'Введите ваше полное имя'),
  customerEmail: z.string().email('Введите корректный email'),
  customerPhone: z.string().min(10, 'Введите корректный номер телефона'),
  address: z.string().min(10, 'Введите полный адрес доставки'),
  deliveryMethod: z.enum(['courier', 'pickup']),
  paymentMethod: z.enum(['card', 'cash']),
  comment: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { cartItems, isCartLoading, fetchCart, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = cartItems.reduce((sum, item) => {
    if (item.product?.discount) {
      const itemPrice = item.price * item.quantity;
      return sum + (itemPrice * (item.product.discount / 100));
    }
    return sum;
  }, 0);
  const deliveryCost = 500; // Fixed delivery cost
  const total = subtotal - discount + deliveryCost;
  
  // Initialize form
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
  
  // Fetch cart on component mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);
  
  // Redirect to cart if empty
  useEffect(() => {
    if (!isCartLoading && cartItems.length === 0 && !orderComplete) {
      navigate('/cart');
    }
  }, [cartItems, isCartLoading, navigate, orderComplete]);
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Prepare order items
      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        customWidth: item.customWidth,
        customLength: item.customLength,
        selectedFabricCategory: item.selectedFabricCategory,
        selectedFabric: item.selectedFabric,
        fabricName: item.product?.fabrics.find(f => f.id === item.selectedFabric)?.name || item.selectedFabric,
        hasLiftingMechanism: item.hasLiftingMechanism,
        price: item.price
      }));
      
      // Send order to server
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          totalAmount: total,
          items: orderItems
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Не удалось оформить заказ');
      }
      
      const orderData = await response.json();
      
      // Clear cart and show success message
      await clearCart();
      setOrderComplete(true);
      setOrderId(orderData.order.id);
      
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
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
            <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
            <h1 className="text-3xl font-bold mb-4">Заказ успешно оформлен!</h1>
            <p className="text-lg mb-2">
              Спасибо за ваш заказ #{orderId}
            </p>
            <p className="text-gray-600 mb-8">
              Мы отправили детали заказа на ваш email. Наш менеджер свяжется с вами в ближайшее время для подтверждения заказа.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="min-w-[150px]">
                <a href="/">Вернуться на главную</a>
              </Button>
              <Button variant="outline" asChild className="min-w-[150px]">
                <a href="/products">Продолжить покупки</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isCartLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>
        <div className="animate-pulse flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3 bg-gray-200 h-[600px] rounded-lg"></div>
          <div className="w-full md:w-1/3 bg-gray-200 h-[400px] rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Checkout form */}
        <div className="w-full md:w-2/3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Контактная информация</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ФИО</FormLabel>
                        <FormControl>
                          <Input placeholder="Иванов Иван Иванович" {...field} />
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
                        <FormLabel>Телефон</FormLabel>
                        <FormControl>
                          <Input placeholder="+7 (999) 123-45-67" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="example@mail.ru" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Доставка</h2>
                
                <FormField
                  control={form.control}
                  name="deliveryMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3 mb-6">
                      <FormLabel>Способ доставки</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="courier" id="courier" />
                            <FormLabel className="font-normal cursor-pointer" htmlFor="courier">
                              Курьером (+500 ₽)
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pickup" id="pickup" />
                            <FormLabel className="font-normal cursor-pointer" htmlFor="pickup">
                              Самовывоз (бесплатно)
                            </FormLabel>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Адрес доставки</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Город, улица, дом, квартира, индекс"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Оплата</h2>
                
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Способ оплаты</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="card" id="card" />
                            <FormLabel className="font-normal cursor-pointer" htmlFor="card">
                              Банковской картой онлайн
                            </FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="cash" id="cash" />
                            <FormLabel className="font-normal cursor-pointer" htmlFor="cash">
                              Наличными при получении
                            </FormLabel>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Комментарий к заказу</h2>
                
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Дополнительная информация к заказу (необязательно)"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="hidden md:block">
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Оформление заказа...' : 'Оформить заказ'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
        
        {/* Order summary */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-lg p-6 shadow-sm sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>
            
            <div className="max-h-[300px] overflow-y-auto mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex py-3 border-b">
                  <div className="w-16 h-16 flex-shrink-0">
                    <img 
                      src={item.product?.images[0]} 
                      alt={item.product?.name} 
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-sm">{item.product?.name}</p>
                    <p className="text-xs text-gray-500">
                      Кол-во: {item.quantity}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {formatPrice(item.price * item.quantity)} ₽
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Товары:</span>
                <span>{formatPrice(subtotal)} ₽</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-accent-600">
                  <span>Скидка:</span>
                  <span>−{formatPrice(discount)} ₽</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Доставка:</span>
                <span>{formatPrice(deliveryCost)} ₽</span>
              </div>
              
              <Separator className="my-3" />
              
              <div className="flex justify-between font-bold text-base">
                <span>Итого:</span>
                <span>{formatPrice(total)} ₽</span>
              </div>
            </div>
            
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              className="w-full mt-6" 
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Оформление заказа...' : 'Оформить заказ'}
            </Button>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных и пользовательским соглашением
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
