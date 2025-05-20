import { useState, useEffect } from 'react';
import { useCartStore, useConfigurationStore } from '@/lib/store';
import { Product, Size, FabricCategory, Fabric } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import FabricSelector from './fabric-selector';
import { 
  calculateSizePriceDifference, 
  calculateFabricPriceDifference, 
  calculateTotalPrice,
  formatPrice 
} from '@/lib/utils';

interface ProductConfiguratorProps {
  product: Product;
}

export default function ProductConfigurator({ product }: ProductConfiguratorProps) {
  const { toast } = useToast();
  const { addToCart, isCartUpdating } = useCartStore();
  
  // Get configuration from store
  const {
    selectedSize,
    customWidth,
    customLength,
    selectedFabricCategory,
    selectedFabric,
    hasLiftingMechanism,
    setSelectedSize,
    setCustomDimensions,
    setSelectedFabricCategory,
    setSelectedFabric,
    toggleLiftingMechanism
  } = useConfigurationStore();

  // Set initial fabric selections if needed
  useEffect(() => {
    if (!selectedFabricCategory && product.fabricCategories.length > 0) {
      setSelectedFabricCategory(product.fabricCategories[0].id);
    }
    
    if (!selectedFabric && product.fabrics.length > 0) {
      const fabricsInCategory = product.fabrics.filter(
        (fabric: Fabric) => fabric.category === selectedFabricCategory
      );
      
      if (fabricsInCategory.length > 0) {
        setSelectedFabric(fabricsInCategory[0].id);
      }
    }
  }, [product, selectedFabricCategory, selectedFabric, setSelectedFabricCategory, setSelectedFabric]);

  // Get the selected fabric object
  const getSelectedFabricObject = (): Fabric | undefined => {
    return product.fabrics.find((fabric: Fabric) => fabric.id === selectedFabric);
  };

  // Price calculations
  const basePrice = parseFloat(product.basePrice);
  const liftingMechanismPrice = parseFloat(product.liftingMechanismPrice || '0');
  
  const sizePriceDifference = calculateSizePriceDifference(
    selectedSize,
    product.sizes,
    customWidth,
    customLength
  );
  
  const fabricPriceDifference = calculateFabricPriceDifference(
    selectedFabricCategory,
    product.fabricCategories,
    basePrice
  );
  
  const subtotalPrice = basePrice + sizePriceDifference + fabricPriceDifference + 
    (hasLiftingMechanism ? liftingMechanismPrice : 0);
  
  const discountAmount = product.discount ? subtotalPrice * (product.discount / 100) : 0;
  const totalPrice = subtotalPrice - discountAmount;

  // Handle add to cart
  const handleAddToCart = async () => {
    try {
      const selectedFabricObj = getSelectedFabricObject();
      
      if (!selectedFabricObj) {
        throw new Error('Please select a fabric');
      }
      
      // Данные для корзины
      const cartItem: any = {
        productId: product.id,
        quantity: 1,
        selectedSize,
        customWidth: selectedSize === 'custom' ? Number(customWidth) : null,
        customLength: selectedSize === 'custom' ? Number(customLength) : null,
        selectedFabricCategory,
        selectedFabric,
        hasLiftingMechanism,
        price: Number(totalPrice)
      };
      
      await addToCart(cartItem);
      
      toast({
        title: 'Товар добавлен в корзину',
        description: `${product.name} успешно добавлен в корзину`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось добавить товар в корзину',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        {/* Product description section */}
        <p className="text-neutral-600 mb-8 leading-relaxed text-[15px]">{product.description}</p>
        
        {/* Product price section with badges */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-medium text-neutral-900">{formatPrice(totalPrice)} ₽</span>
              {product.discount > 0 && (
                <span className="text-lg text-neutral-500 line-through">{formatPrice(basePrice)} ₽</span>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              {product.discount > 0 && (
                <span className="inline-block bg-red-500 text-white text-xs font-medium py-1 px-2">
                  -{product.discount}%
                </span>
              )}
              {product.inStock && (
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-medium py-1 px-2">
                  В наличии
                </span>
              )}
              {product.featured && (
                <span className="inline-block bg-neutral-100 text-neutral-800 text-xs font-medium py-1 px-2">
                  Бестселлер
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-neutral-500 hover:text-neutral-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
            <button className="text-neutral-500 hover:text-neutral-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Options */}
      <div className="mb-8">
        {/* Size selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-neutral-800 font-medium text-sm uppercase tracking-wide">Выберите размер</Label>
            <button className="text-xs text-neutral-600 hover:text-neutral-900 hover:underline">Таблица размеров</button>
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
            {product.sizes.map((size: Size) => (
              <button 
                key={size.id}
                className={`py-2 px-1 border text-sm transition-all ${
                  selectedSize === size.id 
                    ? 'border-neutral-800 bg-neutral-50 font-medium text-neutral-900' 
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                }`}
                onClick={() => setSelectedSize(size.id)}
              >
                <div className="flex flex-col items-center">
                  <span>{size.label}</span>
                  {size.price !== 0 && (
                    <span className={`text-xs mt-1 ${size.price < 0 ? 'text-green-600' : 'text-neutral-500'}`}>
                      {size.price > 0 ? '+' : ''}{formatPrice(size.price)} ₽
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Custom size */}
        {selectedSize === 'custom' && (
          <div className="mb-6 p-4 bg-neutral-50 border border-neutral-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-neutral-700 text-sm font-medium mb-2">
                  Ширина (см)
                </Label>
                <Input 
                  type="number" 
                  value={customWidth}
                  onChange={(e) => setCustomDimensions(
                    parseInt(e.target.value) || 80, 
                    customLength
                  )}
                  min="80" 
                  max="220"
                  className="block w-full border-neutral-300 focus:border-neutral-800 focus:ring-neutral-800"
                />
              </div>
              <div>
                <Label className="block text-neutral-700 text-sm font-medium mb-2">
                  Длина (см)
                </Label>
                <Input 
                  type="number" 
                  value={customLength}
                  onChange={(e) => setCustomDimensions(
                    customWidth, 
                    parseInt(e.target.value) || 180
                  )}
                  min="180" 
                  max="220"
                  className="block w-full border-neutral-300 focus:border-neutral-800 focus:ring-neutral-800"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Fabric category */}
        <div className="mb-6">
          <Label className="text-neutral-800 font-medium text-sm uppercase tracking-wide block mb-3">
            Категория ткани
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {product.fabricCategories.map((category: FabricCategory) => (
              <button 
                key={category.id}
                className={`py-3 border text-center transition-all ${
                  selectedFabricCategory === category.id 
                    ? 'border-neutral-800 bg-neutral-50 font-medium text-neutral-900' 
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                }`}
                onClick={() => setSelectedFabricCategory(category.id)}
              >
                <div className="flex flex-col items-center">
                  <span>{category.name}</span>
                  {category.priceMultiplier !== 1 && (
                    <span className="text-xs mt-1 text-neutral-500">
                      {category.priceMultiplier < 1 ? '-' : '+'}
                      {Math.abs(Math.round((category.priceMultiplier - 1) * 100))}%
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Fabric swatches */}
        <div className="mb-8">
          <Label className="text-neutral-800 font-medium text-sm uppercase tracking-wide block mb-3">
            Выберите обивку
          </Label>
          <FabricSelector 
            fabrics={product.fabrics} 
            selectedFabricCategory={selectedFabricCategory}
            selectedFabric={selectedFabric}
            onSelectFabric={setSelectedFabric}
          />
        </div>
        
        {/* Lifting mechanism option - only for beds */}
        {product.category === 'bed' && product.hasLiftingMechanism && (
          <div className="mb-6 border border-neutral-200 p-4 rounded-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-3 w-10 h-10 flex items-center justify-center bg-neutral-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-neutral-700">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <Label htmlFor="lifting" className="block text-neutral-800 font-medium">
                    Подъемный механизм
                  </Label>
                  <p className="text-sm text-neutral-500">
                    Удобное хранение вещей под кроватью
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium mr-3">+{formatPrice(liftingMechanismPrice)} ₽</span>
                <div className="relative">
                  <Checkbox 
                    id="lifting" 
                    checked={hasLiftingMechanism}
                    onCheckedChange={() => toggleLiftingMechanism()} 
                    className="h-6 w-6 rounded-md border-2 border-neutral-300 bg-white data-[state=checked]:bg-[#8e2b85] data-[state=checked]:border-[#8e2b85] focus:ring-[#8e2b85] focus:ring-offset-2"
                  />
                  {hasLiftingMechanism && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4 absolute top-1 left-1 pointer-events-none">
                      <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Price and Add to Cart */}
      <div className="mt-auto">
        <Separator className="mb-6" />
        
        <div className="space-y-5 mb-6">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center text-sm text-neutral-600">
              <span>Базовая цена</span>
              <span className="inline-block ml-1 bg-neutral-100 text-neutral-500 rounded-full w-4 h-4 text-xs flex items-center justify-center cursor-help">?</span>
            </div>
            <span className="font-medium">{formatPrice(basePrice)} ₽</span>
          </div>
          
          {sizePriceDifference !== 0 && (
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-neutral-600">Доплата за размер</span>
              <span className={`font-medium ${sizePriceDifference < 0 ? 'text-green-600' : ''}`}>
                {(sizePriceDifference > 0 ? '+' : '')}{formatPrice(sizePriceDifference)} ₽
              </span>
            </div>
          )}
          
          {fabricPriceDifference !== 0 && (
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-neutral-600">Выбранная категория ткани</span>
              <span className={`font-medium ${fabricPriceDifference < 0 ? 'text-green-600' : ''}`}>
                {fabricPriceDifference > 0 ? '+' : ''}{formatPrice(fabricPriceDifference)} ₽
              </span>
            </div>
          )}
          
          {hasLiftingMechanism && (
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-neutral-600">Подъемный механизм</span>
              <span className="font-medium">+{formatPrice(liftingMechanismPrice)} ₽</span>
            </div>
          )}
          
          {product.discount > 0 && (
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-red-600">Скидка {product.discount}%</span>
              <span className="font-medium text-red-600">
                -{formatPrice(discountAmount)} ₽
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Button 
              className="flex-grow bg-neutral-900 hover:bg-black text-white font-medium py-6"
              onClick={handleAddToCart}
              disabled={isCartUpdating}
            >
              {isCartUpdating ? 'Добавление...' : 'Добавить в корзину'}
            </Button>
            <Button 
              className="aspect-square p-0 border-neutral-300 hover:bg-neutral-100" 
              size="icon" 
              variant="outline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </Button>
          </div>
          
          <Button className="bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-100 font-medium" variant="outline">
            Купить в один клик
          </Button>
        </div>
        
        <div className="mt-6 flex items-center justify-between text-sm text-neutral-600">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <span>Доставка от 2 дней</span>
          </div>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
            </svg>
            <span>Гарантия качества</span>
          </div>
        </div>
      </div>
    </div>
  );
}
