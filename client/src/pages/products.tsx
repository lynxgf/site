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
    <div className="max-w-[1400px] mx-auto px-4 py-10">
      <Breadcrumbs items={breadcrumbItems} className="mb-8" />
      
      {/* Category header with banner */}
      <div className="relative overflow-hidden mb-12 h-[180px] rounded-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/80 to-neutral-900/40 z-10"></div>
        <img 
          src={category === "bed" ? "https://images.unsplash.com/photo-1609975111200-b1e2e8216e3e?w=1600&auto=format&fit=crop&q=80" : "https://images.unsplash.com/photo-1618022514340-85465341d090?w=1600&auto=format&fit=crop&q=80"} 
          alt={category ? categoryLabels[category] : "Все товары"} 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="relative z-20 h-full flex flex-col justify-center px-8">
          <h1 className="text-3xl md:text-4xl font-medium text-white mb-2">
            {category ? categoryLabels[category] : "Все товары"}
          </h1>
          <p className="text-neutral-200 max-w-lg">
            {category === "bed" 
              ? "Элегантные и комфортные кровати для спальни вашей мечты" 
              : category === "mattress" 
                ? "Ортопедические матрасы для качественного сна и здоровья"
                : "Широкий выбор высококачественной мебели для вашего дома"}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar / Filters */}
        <div className="w-full md:w-[280px] lg:w-[320px]">
          <div className="sticky top-24">
            <div className="p-6 border border-neutral-200 rounded-sm mb-6">
              <h2 className="font-medium text-lg mb-6 text-neutral-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                </svg>
                Фильтры
              </h2>
              
              <div className="mb-8">
                <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-700 mb-4">Цена</h3>
                <div className="px-2">
                  <Slider 
                    defaultValue={[0, 100000]} 
                    max={100000} 
                    step={1000}
                    onValueChange={(value) => setPriceRange(value as [number, number])} 
                    className="py-4"
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="py-1 px-3 bg-neutral-100 rounded-sm text-sm">{priceRange[0].toLocaleString()} ₽</div>
                  <div className="py-1 px-3 bg-neutral-100 rounded-sm text-sm">{priceRange[1].toLocaleString()} ₽</div>
                </div>
              </div>
              
              {category === "bed" && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-700 mb-4">Подъемный механизм</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Checkbox 
                        id="lifting-yes" 
                        checked={hasLiftingMechanism === true}
                        onCheckedChange={() => setHasLiftingMechanism(hasLiftingMechanism === true ? null : true)}
                        className="border-neutral-300 text-neutral-800"
                      />
                      <Label htmlFor="lifting-yes" className="ml-3 text-sm text-neutral-700">С подъемным механизмом</Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="lifting-no" 
                        checked={hasLiftingMechanism === false}
                        onCheckedChange={() => setHasLiftingMechanism(hasLiftingMechanism === false ? null : false)}
                        className="border-neutral-300 text-neutral-800"
                      />
                      <Label htmlFor="lifting-no" className="ml-3 text-sm text-neutral-700">Без подъемного механизма</Label>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-700 mb-4">Категория ткани</h3>
                <RadioGroup 
                  value={selectedFabricCategory || ""}
                  onValueChange={(value) => setSelectedFabricCategory(value || null)}
                  className="space-y-3"
                >
                  <div className="flex items-center">
                    <RadioGroupItem value="economy" id="fabric-economy" className="text-neutral-800" />
                    <Label htmlFor="fabric-economy" className="ml-3 text-sm text-neutral-700">Эконом</Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="standard" id="fabric-standard" className="text-neutral-800" />
                    <Label htmlFor="fabric-standard" className="ml-3 text-sm text-neutral-700">Стандарт</Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="premium" id="fabric-premium" className="text-neutral-800" />
                    <Label htmlFor="fabric-premium" className="ml-3 text-sm text-neutral-700">Премиум</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full border-neutral-300 hover:bg-neutral-100 text-neutral-800"
                onClick={() => {
                  setPriceRange([0, 100000]);
                  setHasLiftingMechanism(null);
                  setSelectedFabricCategory(null);
                }}
              >
                Сбросить фильтры
              </Button>
            </div>
            
            <div className="border border-neutral-200 rounded-sm p-6 bg-neutral-50">
              <h3 className="font-medium text-neutral-900 mb-4">Нужна помощь?</h3>
              <p className="text-sm text-neutral-600 mb-4">Наши специалисты готовы помочь вам с выбором идеальной мебели для вашего дома.</p>
              <div className="flex items-center gap-3 text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <span>+7 (800) 123-45-67</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product listing */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <p className="text-neutral-600 mb-1">Результаты поиска</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-medium text-neutral-900">{sortedProducts.length}</span>
                <span className="text-neutral-500">
                  {sortedProducts.length === 1 ? 'товар' : 
                    sortedProducts.length > 1 && sortedProducts.length < 5 ? 'товара' : 'товаров'}
                </span>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center gap-3">
              <span className="text-sm text-neutral-500">Сортировать:</span>
              <select 
                className="border border-neutral-300 rounded-sm py-2 px-3 bg-white text-sm focus:outline-none focus:border-neutral-400" 
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-5">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-neutral-100 rounded-sm h-96 animate-pulse"></div>
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-5">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="border border-neutral-200 p-12 rounded-sm bg-white text-center">
              <div className="inline-block p-4 bg-neutral-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-neutral-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Товары не найдены</h3>
              <p className="text-neutral-600 mb-6">Не удалось найти товары, соответствующие вашим критериям. Попробуйте изменить параметры фильтрации.</p>
              <Button 
                className="bg-neutral-900 hover:bg-black text-white py-6 px-8"
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
