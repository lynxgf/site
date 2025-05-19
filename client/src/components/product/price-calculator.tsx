import { Size, FabricCategory } from '@shared/schema';
import { formatPrice } from '@/lib/utils';

interface PriceCalculatorProps {
  basePrice: number;
  selectedSize: string;
  customWidth: number;
  customLength: number;
  selectedFabricCategory: string;
  hasLiftingMechanism: boolean;
  liftingMechanismPrice: number;
  sizes: Size[];
  fabricCategories: FabricCategory[];
  discount: number;
}

export default function PriceCalculator({
  basePrice,
  selectedSize,
  customWidth,
  customLength,
  selectedFabricCategory,
  hasLiftingMechanism,
  liftingMechanismPrice,
  sizes,
  fabricCategories,
  discount
}: PriceCalculatorProps) {
  // Calculate size price difference
  const sizePriceDifference = (() => {
    if (selectedSize === 'custom') {
      // Base calculation for custom size
      const baseSize = sizes.find(size => size.id === 'double');
      const baseSizePrice = baseSize ? baseSize.price : 0;
      const baseWidth = 140;
      const baseLength = 200;
      
      // Calculate price difference per cm²
      const baseSizeCm2 = baseWidth * baseLength;
      const customSizeCm2 = customWidth * customLength;
      const sizeDifferenceCm2 = customSizeCm2 - baseSizeCm2;
      
      // Price adjustment: 10₽ per 100cm²
      return baseSizePrice + (sizeDifferenceCm2 / 100) * 10;
    } else {
      const selectedSizeObj = sizes.find(size => size.id === selectedSize);
      return selectedSizeObj ? selectedSizeObj.price : 0;
    }
  })();
  
  // Calculate fabric price difference
  const fabricPriceDifference = (() => {
    const categoryObj = fabricCategories.find(cat => cat.id === selectedFabricCategory);
    const multiplier = categoryObj ? categoryObj.priceMultiplier : 1;
    
    // Calculate additional price based on category
    if (selectedFabricCategory === 'standard') {
      return 0; // Standard is the base
    } else if (selectedFabricCategory === 'economy') {
      return basePrice * (multiplier - 1); // Negative value for economy
    } else {
      return basePrice * (multiplier - 1); // Positive value for premium
    }
  })();
  
  // Calculate subtotal
  const subtotalPrice = basePrice + sizePriceDifference + fabricPriceDifference + 
    (hasLiftingMechanism ? liftingMechanismPrice : 0);
  
  // Apply discount if applicable
  const discountAmount = discount > 0 ? subtotalPrice * (discount / 100) : 0;
  const totalPrice = subtotalPrice - discountAmount;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-baseline">
        <div>
          <p className="text-sm text-gray-500">Итоговая цена</p>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(totalPrice)}
            </span>
            <span className="ml-2 text-gray-500">₽</span>
          </div>
        </div>
        {discount > 0 && (
          <div className="text-right">
            <p className="text-sm text-accent-500">Скидка</p>
            <p className="font-medium text-accent-500">
              -{formatPrice(discountAmount)} ₽
            </p>
          </div>
        )}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Базовая цена:</span>
          <span className="font-medium">{formatPrice(basePrice)} ₽</span>
        </div>
        
        {sizePriceDifference !== 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Наценка за размер:</span>
            <span className="font-medium">
              {(sizePriceDifference > 0 ? '+' : '')}{formatPrice(sizePriceDifference)} ₽
            </span>
          </div>
        )}
        
        {fabricPriceDifference !== 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Наценка за ткань:</span>
            <span className="font-medium">
              {fabricPriceDifference > 0 ? '+' : ''}{formatPrice(fabricPriceDifference)} ₽
            </span>
          </div>
        )}
        
        {hasLiftingMechanism && (
          <div className="flex justify-between">
            <span className="text-gray-600">Подъемный механизм:</span>
            <span className="font-medium">+{formatPrice(liftingMechanismPrice)} ₽</span>
          </div>
        )}
      </div>
    </div>
  );
}
