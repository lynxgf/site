import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { useCartStore, CartItem as CartItemType } from '@/lib/store';
import { formatPrice } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateCartItem, removeCartItem } = useCartStore();
  const [quantity, setQuantity] = useState(item.quantity);
  
  // Size display helper
  const formatSize = () => {
    if (item.selectedSize === 'custom' && item.customWidth && item.customLength) {
      return `${item.customWidth}×${item.customLength} см`;
    }
    
    // Find size label in the product sizes
    const sizes = item.product?.sizes || [];
    const sizeObj = Array.isArray(sizes) ? sizes.find(s => s.id === item.selectedSize) : null;
    return sizeObj ? sizeObj.label : item.selectedSize;
  };
  
  // Fabric display helper
  const getFabricName = () => {
    const fabrics = item.product?.fabrics || [];
    const fabricObj = Array.isArray(fabrics) 
      ? fabrics.find(f => f.id === item.selectedFabric) 
      : null;
    return fabricObj ? fabricObj.name : item.selectedFabric;
  };
  
  // Update quantity when input changes
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity > 0 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };
  
  // Update item in cart when quantity is confirmed
  const handleUpdateQuantity = () => {
    if (quantity !== item.quantity) {
      updateCartItem(item.id, { quantity });
    }
  };
  
  // Remove item from cart
  const handleRemove = () => {
    removeCartItem(item.id);
  };
  
  // Handle quantity buttons
  const decreaseQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      updateCartItem(item.id, { quantity: newQuantity });
    }
  };
  
  const increaseQuantity = () => {
    if (quantity < 99) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      updateCartItem(item.id, { quantity: newQuantity });
    }
  };
  
  if (!item.product) {
    return null; // Don't render if product details are missing
  }
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Product image */}
          <div className="sm:w-1/4 h-32 sm:h-auto">
            <img 
              src={item.product.images[0]} 
              alt={item.product.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Product details */}
          <div className="p-4 flex-1 flex flex-col sm:flex-row justify-between">
            <div className="mb-4 sm:mb-0 sm:mr-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {item.product.name}
              </h3>
              
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Размер: {formatSize()}</li>
                <li>Ткань: {getFabricName()} ({
                  item.selectedFabricCategory === 'economy' ? 'Эконом' :
                  item.selectedFabricCategory === 'premium' ? 'Премиум' : 'Стандарт'
                })</li>
                {item.hasLiftingMechanism && (
                  <li>Подъемный механизм: Да</li>
                )}
              </ul>
            </div>
            
            <div className="flex flex-row sm:flex-col justify-between items-end">
              {/* Price */}
              <div className="text-right mb-4">
                <p className="font-bold text-gray-900">{formatPrice(item.price)} ₽</p>
                <p className="text-sm text-gray-500">
                  {formatPrice(item.price)} ₽ за шт.
                </p>
              </div>
              
              {/* Quantity controls */}
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-r-none"
                  onClick={decreaseQuantity}
                >
                  <span className="text-lg">-</span>
                </Button>
                <Input
                  type="number"
                  min="1"
                  max="99"
                  value={quantity}
                  onChange={handleQuantityChange}
                  onBlur={handleUpdateQuantity}
                  className="h-8 w-12 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-l-none"
                  onClick={increaseQuantity}
                >
                  <span className="text-lg">+</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRemove}
                  className="ml-2 text-gray-500 hover:text-accent-500"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
