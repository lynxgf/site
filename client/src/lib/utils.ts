import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price with thousand separators
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(Math.round(price));
}

// Calculate size price difference based on selected size and custom dimensions
export function calculateSizePriceDifference(
  selectedSize: string, 
  sizes: any[], 
  customWidth: number, 
  customLength: number
): number {
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
}

// Calculate fabric price difference based on selected fabric category
export function calculateFabricPriceDifference(
  selectedFabricCategory: string,
  fabricCategories: any[],
  basePrice: number
): number {
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
}

// Calculate total price based on all selected options
export function calculateTotalPrice(
  basePrice: number,
  sizePriceDifference: number,
  fabricPriceDifference: number,
  hasLiftingMechanism: boolean,
  liftingMechanismPrice: number,
  discount: number = 0
): number {
  const subtotal = basePrice + sizePriceDifference + fabricPriceDifference + 
    (hasLiftingMechanism ? liftingMechanismPrice : 0);
  
  const discountAmount = discount > 0 ? subtotal * (discount / 100) : 0;
  
  return subtotal - discountAmount;
}

// Generate a random session ID
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
