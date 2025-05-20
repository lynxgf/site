import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CartItem from "@/components/cart/cart-item";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { AlertCircle, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const [, navigate] = useLocation();
  const { cartItems, isCartLoading, fetchCart, clearCart } = useCartStore();
  
  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);
  
  // Calculate subtotal, discount, and total
  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const discount = cartItems.reduce((sum, item) => {
    if (item.product?.discount) {
      const itemPrice = Number(item.price) * item.quantity;
      return sum + (itemPrice * (item.product.discount / 100));
    }
    return sum;
  }, 0);
  const total = subtotal - discount;

  // Check if cart is empty
  const isCartEmpty = !isCartLoading && cartItems.length === 0;
  
  // Handle proceed to checkout
  const handleProceedToCheckout = () => {
    navigate("/checkout");
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-6">Корзина</h1>
        
        {isCartLoading ? (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-md border border-gray-100 h-40 animate-pulse"></div>
              ))}
            </div>
            <div>
              <div className="bg-white rounded-md border border-gray-100 h-80 animate-pulse"></div>
            </div>
          </div>
        ) : isCartEmpty ? (
          <div className="max-w-2xl mx-auto">
            <Card className="border border-gray-100 shadow-sm bg-white">
              <CardContent className="pt-10 pb-10 flex flex-col items-center">
                <div className="bg-gray-50 rounded-full p-5 mb-6">
                  <ShoppingBag className="h-12 w-12 text-[#8e2b85]" />
                </div>
                <h2 className="text-2xl font-medium text-gray-900 mb-3">Ваша корзина пуста</h2>
                <p className="text-gray-500 text-center mb-8 max-w-md">
                  Добавьте товары в корзину, чтобы продолжить покупки. В нашем каталоге представлены высококачественные 
                  матрасы и кровати.
                </p>
                <Button asChild className="bg-[#8e2b85] hover:bg-[#762271] text-white px-8 py-6 text-base">
                  <Link href="/products">Перейти к каталогу</Link>
                </Button>
              </CardContent>
            </Card>
            
            <div className="mt-12 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white p-6 rounded-md border border-gray-100 text-center">
                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#8e2b85]">
                    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Качество</h3>
                <p className="text-gray-500 text-sm">Мы используем только лучшие материалы для наших изделий</p>
              </div>
              
              <div className="bg-white p-6 rounded-md border border-gray-100 text-center">
                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#8e2b85]">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Комфорт</h3>
                <p className="text-gray-500 text-sm">Создаем максимально удобные изделия для крепкого сна</p>
              </div>
              
              <div className="bg-white p-6 rounded-md border border-gray-100 text-center">
                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#8e2b85]">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Гарантия</h3>
                <p className="text-gray-500 text-sm">Все наши изделия имеют гарантию качества до 10 лет</p>
              </div>
              
              <div className="bg-white p-6 rounded-md border border-gray-100 text-center">
                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#8e2b85]">
                    <rect width="16" height="16" x="4" y="4" rx="2"></rect>
                    <rect width="6" height="6" x="9" y="9" rx="1"></rect>
                    <path d="M15 2v2"></path>
                    <path d="M15 20v2"></path>
                    <path d="M2 15h2"></path>
                    <path d="M20 15h2"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Доставка</h3>
                <p className="text-gray-500 text-sm">Быстрая доставка по всей России с установкой</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((cartItem) => (
                <CartItem key={cartItem.id} item={cartItem} />
              ))}
              
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => clearCart()}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Очистить корзину
                </Button>
                
                <Button
                  variant="outline"
                  asChild
                  className="border-[#8e2b85] text-[#8e2b85] hover:bg-[#8e2b85]/5"
                >
                  <Link href="/products">Продолжить покупки</Link>
                </Button>
              </div>
            </div>
            
            {/* Order Summary */}
            <div>
              <Card className="bg-white border border-gray-100 shadow-sm sticky top-6">
                <CardContent className="pt-6 pb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Сумма заказа</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-700">
                      <span>Товаров на сумму:</span>
                      <span className="font-medium">{formatPrice(subtotal)} ₽</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-[#8e2b85]">
                        <span>Скидка:</span>
                        <span className="font-medium">−{formatPrice(discount)} ₽</span>
                      </div>
                    )}
                    
                    <Separator className="my-4 bg-gray-100" />
                    
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Итого:</span>
                      <span>{formatPrice(total)} ₽</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mt-8">
                    <div>
                      <label htmlFor="promo" className="text-sm text-gray-700 mb-2 block font-medium">
                        Промокод
                      </label>
                      <div className="flex space-x-2">
                        <Input 
                          id="promo" 
                          className="flex-1 border-gray-200 focus:border-[#8e2b85] focus:ring-[#8e2b85]" 
                          placeholder="Введите промокод" 
                        />
                        <Button 
                          variant="outline" 
                          className="border-[#8e2b85] text-[#8e2b85] hover:bg-[#8e2b85]/5"
                        >
                          Применить
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-[#8e2b85] hover:bg-[#762271] text-white py-6 text-base" 
                      onClick={handleProceedToCheckout}
                    >
                      Оформить заказ
                    </Button>
                  </div>
                  
                  <div className="mt-6 text-sm text-gray-500 flex items-start bg-gray-50 p-4 rounded-md">
                    <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-gray-400" />
                    <p>
                      Оформляя заказ, вы соглашаетесь с условиями пользовательского соглашения и политикой конфиденциальности
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}