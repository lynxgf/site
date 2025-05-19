import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import ProductCard from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

// Category translations
const categoryLabels: Record<string, string> = {
  "bed": "Кровати",
  "mattress": "Матрасы"
};

export default function ProductsPage() {
  const params = useParams<{ category?: string }>();
  const category = params.category;
  
  // Filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [hasLiftingMechanism, setHasLiftingMechanism] = useState<boolean | null>(null);
  const [selectedFabricCategory, setSelectedFabricCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>("popular");
  
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", category],
    queryFn: async () => {
      const url = category 
        ? `/api/products?category=${category}` 
        : "/api/products";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });
  
  // Apply filters and sorting
  const filteredProducts = products?.filter(product => {
    const price = Number(product.basePrice);
    
    // Price filter
    if (price < priceRange[0] || price > priceRange[1]) return false;
    
    // Lifting mechanism filter (only for beds)
    if (hasLiftingMechanism !== null && product.category === "bed") {
      if (hasLiftingMechanism !== product.hasLiftingMechanism) return false;
    }
    
    return true;
  }) || [];
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = Number(a.basePrice);
    const priceB = Number(b.basePrice);
    
    switch (sortOption) {
      case "price-asc":
        return priceA - priceB;
      case "price-desc":
        return priceB - priceA;
      case "popular":
      default:
        // Sort by featured and then by id
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.id - b.id;
    }
  });
  
  // Define breadcrumb items
  const breadcrumbItems = category 
    ? [
        { label: "Главная", href: "/" },
        { label: categoryLabels[category] || "Товары", href: `/products/${category}` }
      ]
    : [
        { label: "Главная", href: "/" },
        { label: "Все товары", href: "/products" }
      ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar / Filters */}
        <div className="w-full md:w-1/4 lg:w-1/5">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
            <h2 className="font-semibold text-lg mb-4">Фильтры</h2>
            
            <div className="mb-6">
              <h3 className="font-medium mb-3">Цена</h3>
              <div className="px-2">
                <Slider 
                  defaultValue={[0, 100000]} 
                  max={100000} 
                  step={1000}
                  onValueChange={(value) => setPriceRange(value as [number, number])} 
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm">{priceRange[0].toLocaleString()} ₽</span>
                <span className="text-sm">{priceRange[1].toLocaleString()} ₽</span>
              </div>
            </div>
            
            {category === "bed" && (
              <div className="mb-6">
                <h3 className="font-medium mb-3">Подъемный механизм</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="lifting-yes" 
                      checked={hasLiftingMechanism === true}
                      onCheckedChange={() => setHasLiftingMechanism(hasLiftingMechanism === true ? null : true)}
                    />
                    <Label htmlFor="lifting-yes">Есть</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="lifting-no" 
                      checked={hasLiftingMechanism === false}
                      onCheckedChange={() => setHasLiftingMechanism(hasLiftingMechanism === false ? null : false)}
                    />
                    <Label htmlFor="lifting-no">Нет</Label>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="font-medium mb-3">Категория ткани</h3>
              <RadioGroup 
                value={selectedFabricCategory || ""}
                onValueChange={(value) => setSelectedFabricCategory(value || null)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="economy" id="fabric-economy" />
                  <Label htmlFor="fabric-economy">Эконом</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="fabric-standard" />
                  <Label htmlFor="fabric-standard">Стандарт</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="premium" id="fabric-premium" />
                  <Label htmlFor="fabric-premium">Премиум</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setPriceRange([0, 100000]);
                setHasLiftingMechanism(null);
                setSelectedFabricCategory(null);
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        </div>
        
        {/* Product listing */}
        <div className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-2xl font-bold">
              {category ? categoryLabels[category] : "Все товары"}
              <span className="ml-2 text-sm font-normal text-gray-500">
                {sortedProducts.length} {sortedProducts.length === 1 ? 'товар' : 
                  sortedProducts.length > 1 && sortedProducts.length < 5 ? 'товара' : 'товаров'}
              </span>
            </h1>
            
            <div className="mt-2 sm:mt-0">
              <select 
                className="border rounded-md p-2 bg-white text-sm" 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="popular">По популярности</option>
                <option value="price-asc">По возрастанию цены</option>
                <option value="price-desc">По убыванию цены</option>
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-100 rounded-lg h-80 animate-pulse"></div>
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-600">Товары не найдены. Попробуйте изменить параметры фильтрации.</p>
              <Button 
                className="mt-4"
                onClick={() => {
                  setPriceRange([0, 100000]);
                  setHasLiftingMechanism(null);
                  setSelectedFabricCategory(null);
                }}
              >
                Сбросить фильтры
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
