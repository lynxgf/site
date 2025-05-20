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
    <Card className="overflow-hidden border border-gray-100 shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Product image with badge */}
          <div className="relative sm:w-1/4 h-40 sm:h-auto overflow-hidden">
            <img 
              src={item.product.images[0]} 
              alt={item.product.name} 
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
            {item.product.discount > 0 && (
              <div className="absolute top-3 left-3 bg-[#8e2b85] text-white text-xs font-medium py-1 px-2 rounded">
                -{item.product.discount}%
              </div>
            )}
          </div>
          
          {/* Product details */}
          <div className="p-6 flex-1 flex flex-col sm:flex-row justify-between">
            <div className="mb-4 sm:mb-0 sm:mr-4 flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-3 hover:text-[#8e2b85] transition-colors">
                {item.product.name}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 bg-gray-100 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">Размер: <span className="font-medium">{formatSize()}</span></span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 bg-gray-100 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    Ткань: <span className="font-medium">{getFabricName()}</span>
                  </span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 bg-gray-100 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">
                    Категория: <span className="font-medium">{
                      item.selectedFabricCategory === 'economy' ? 'Эконом' :
                      item.selectedFabricCategory === 'premium' ? 'Премиум' : 'Стандарт'
                    }</span>
                  </span>
                </div>
                
                {item.hasLiftingMechanism && (
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2 bg-gray-100 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">
                      Подъемный механизм: <span className="font-medium">Да</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-row sm:flex-col justify-between items-end">
              {/* Price */}
              <div className="text-right mb-4">
                <p className="font-semibold text-xl text-gray-900">{formatPrice(item.price)} ₽</p>
                {item.product.discount > 0 && (
                  <p className="text-sm text-gray-500 line-through">
                    {formatPrice(parseFloat(item.product.basePrice))} ₽
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {formatPrice(parseFloat(item.price))} ₽ за шт.
                </p>
              </div>
              
              {/* Quantity controls */}
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 rounded-r-none border-gray-200 hover:bg-gray-50 hover:text-[#8e2b85]"
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
                  className="h-9 w-14 rounded-none text-center border-x-0 border-gray-200 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 rounded-l-none border-gray-200 hover:bg-gray-50 hover:text-[#8e2b85]"
                  onClick={increaseQuantity}
                >
                  <span className="text-lg">+</span>
                </Button>
                
                <div className="w-px h-8 bg-gray-100 mx-3"></div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRemove}
                  className="text-gray-400 hover:text-[#8e2b85] hover:bg-gray-50"
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
