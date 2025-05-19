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
      
      const cartItem = {
        productId: product.id,
        quantity: 1,
        selectedSize,
        customWidth: selectedSize === 'custom' ? customWidth : undefined,
        customLength: selectedSize === 'custom' ? customLength : undefined,
        selectedFabricCategory,
        selectedFabric,
        hasLiftingMechanism,
        price: totalPrice
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
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
      <div className="flex items-center mb-4">
        <div className="flex text-yellow-400">
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
          <i className="fas fa-star-half-alt"></i>
        </div>
        <span className="ml-2 text-sm text-gray-500">4.8 (124 отзыва)</span>
      </div>
      <p className="text-gray-700 mb-6">{product.description}</p>

      {/* Configuration Options */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Конфигурация</h2>
        
        {/* Size selection */}
        <div className="mb-6">
          <Label className="block text-gray-700 font-medium mb-2">Размер</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {product.sizes.map((size: Size) => (
              <button 
                key={size.id}
                className={`py-2 px-3 border rounded-md text-center transition-colors ${
                  selectedSize === size.id 
                    ? 'bg-primary-100 border-primary-600 text-primary-800' 
                    : 'border-gray-300 hover:border-primary-400'
                }`}
                onClick={() => setSelectedSize(size.id)}
              >
                <span>{size.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Custom size */}
        {selectedSize === 'custom' && (
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-gray-700 text-sm font-medium mb-2">
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
                  className="block w-full"
                />
              </div>
              <div>
                <Label className="block text-gray-700 text-sm font-medium mb-2">
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
                  className="block w-full"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Fabric category */}
        <div className="mb-6">
          <Label className="block text-gray-700 font-medium mb-2">Категория ткани</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {product.fabricCategories.map((category: FabricCategory) => (
              <button 
                key={category.id}
                className={`py-2 px-3 border rounded-md text-center transition-colors ${
                  selectedFabricCategory === category.id 
                    ? 'bg-primary-100 border-primary-600 text-primary-800' 
                    : 'border-gray-300 hover:border-primary-400'
                }`}
                onClick={() => setSelectedFabricCategory(category.id)}
              >
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Fabric swatches */}
        <FabricSelector 
          fabrics={product.fabrics} 
          selectedFabricCategory={selectedFabricCategory}
          selectedFabric={selectedFabric}
          onSelectFabric={setSelectedFabric}
        />
        
        {/* Lifting mechanism option - only for beds */}
        {product.category === 'bed' && product.hasLiftingMechanism && (
          <div className="mb-6">
            <div className="flex items-center">
              <Checkbox 
                id="lifting" 
                checked={hasLiftingMechanism}
                onCheckedChange={() => toggleLiftingMechanism()} 
                className="h-4 w-4"
              />
              <Label htmlFor="lifting" className="ml-2 block text-gray-700">
                Подъемный механизм
              </Label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Удобное хранение вещей под кроватью
            </p>
          </div>
        )}
      </div>
      
      {/* Price and Add to Cart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-20">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Итоговая цена</p>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(totalPrice)}
              </span>
              <span className="ml-2 text-gray-500">₽</span>
            </div>
          </div>
          {product.discount > 0 && (
            <div className="text-right">
              <p className="text-sm text-accent-500">Скидка</p>
              <p className="font-medium text-accent-500">
                -{formatPrice(discountAmount)} ₽
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Базовая цена:</span>
            <span className="font-medium">{formatPrice(basePrice)} ₽</span>
          </div>
          {sizePriceDifference !== 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Наценка за размер:</span>
              <span className="font-medium">
                {(sizePriceDifference > 0 ? '+' : '')}{formatPrice(sizePriceDifference)} ₽
              </span>
            </div>
          )}
          {fabricPriceDifference !== 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Наценка за ткань:</span>
              <span className="font-medium">
                {fabricPriceDifference > 0 ? '+' : ''}{formatPrice(fabricPriceDifference)} ₽
              </span>
            </div>
          )}
          {hasLiftingMechanism && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Подъемный механизм:</span>
              <span className="font-medium">+{formatPrice(liftingMechanismPrice)} ₽</span>
            </div>
          )}
          {(hasLiftingMechanism || sizePriceDifference !== 0 || fabricPriceDifference !== 0) && (
            <Separator className="my-2" />
          )}
        </div>
        
        <div className="space-y-4">
          <Button 
            className="w-full bg-primary-800 hover:bg-primary-900 text-white"
            onClick={handleAddToCart}
            disabled={isCartUpdating}
          >
            {isCartUpdating ? 'Добавление...' : 'Добавить в корзину'}
          </Button>
          <Button className="w-full" variant="outline">
            Купить в один клик
          </Button>
        </div>
        
        <div className="mt-4 text-center">
          <a href="#" className="text-primary-700 text-sm flex items-center justify-center">
            <i className="far fa-heart mr-2"></i> Добавить в избранное
          </a>
        </div>
      </div>
    </div>
  );
}
