import { useEffect, useState } from "react";
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
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = cartItems.reduce((sum, item) => {
    if (item.product?.discount) {
      const itemPrice = item.price * item.quantity;
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Корзина</h1>
      
      {isCartLoading ? (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-40 animate-pulse"></div>
            ))}
          </div>
          <div>
            <div className="bg-gray-100 rounded-lg h-72 animate-pulse"></div>
          </div>
        </div>
      ) : isCartEmpty ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 flex flex-col items-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ваша корзина пуста</h2>
            <p className="text-gray-500 text-center mb-6">
              Добавьте товары в корзину, чтобы продолжить покупки
            </p>
            <Button asChild className="w-full">
              <Link href="/products">Перейти к каталогу</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((cartItem) => (
              <CartItem key={cartItem.id} item={cartItem} />
            ))}
            
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => clearCart()}
              >
                Очистить корзину
              </Button>
              
              <Button
                variant="outline"
                asChild
              >
                <Link href="/products">Продолжить покупки</Link>
              </Button>
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">Сумма заказа</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Товаров на сумму:</span>
                    <span>{formatPrice(subtotal)} ₽</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-accent-600">
                      <span>Скидка:</span>
                      <span>−{formatPrice(discount)} ₽</span>
                    </div>
                  )}
                  
                  <Separator className="my-3" />
                  
                  <div className="flex justify-between font-bold">
                    <span>Итого:</span>
                    <span>{formatPrice(total)} ₽</span>
                  </div>
                </div>
                
                <div className="space-y-4 mt-6">
                  <div>
                    <label htmlFor="promo" className="text-sm text-gray-600 mb-1 block">
                      Промокод
                    </label>
                    <div className="flex space-x-2">
                      <Input id="promo" className="flex-1" placeholder="Введите промокод" />
                      <Button variant="outline">Применить</Button>
                    </div>
                  </div>
                  
                  <Button className="w-full" onClick={handleProceedToCheckout}>
                    Оформить заказ
                  </Button>
                </div>
                
                <div className="mt-4 text-sm text-gray-500 flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <p>
                    Оформляя заказ, вы соглашаетесь с условиями пользовательского соглашения
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
