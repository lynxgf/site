import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCardModern from "@/components/product/product-card-modern";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default function ProductsPage() {
  const [location] = useLocation();
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<string>("default");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 200000 });

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Set category based on location
  useEffect(() => {
    if (location.includes("/products/mattress")) {
      setCategory("mattress");
    } else if (location.includes("/products/bed")) {
      setCategory("bed");
    } else if (location.includes("/products/accessory")) {
      setCategory("accessory");
    } else {
      setCategory(null);
    }
  }, [location]);

  // Filter products by category and price
  const filteredProducts = products
    ?.filter(product => {
      // Filter by category
      if (category && product.category !== category) return false;
      
      // Filter by price
      const price = product.discount 
        ? Math.round(parseFloat(product.basePrice) * (1 - product.discount / 100)) 
        : parseFloat(product.basePrice);
      
      return price >= minPrice && price <= maxPrice;
    })
    .sort((a, b) => {
      if (sort === "price-asc") {
        const priceA = a.discount 
          ? Math.round(parseFloat(a.basePrice) * (1 - a.discount / 100)) 
          : parseFloat(a.basePrice);
        const priceB = b.discount 
          ? Math.round(parseFloat(b.basePrice) * (1 - b.discount / 100)) 
          : parseFloat(b.basePrice);
        return priceA - priceB;
      } else if (sort === "price-desc") {
        const priceA = a.discount 
          ? Math.round(parseFloat(a.basePrice) * (1 - a.discount / 100)) 
          : parseFloat(a.basePrice);
        const priceB = b.discount 
          ? Math.round(parseFloat(b.basePrice) * (1 - b.discount / 100)) 
          : parseFloat(b.basePrice);
        return priceB - priceA;
      } else {
        return 0;
      }
    }) || [];

  // Find min and max prices
  useEffect(() => {
    if (products && products.length > 0) {
      let minPrice = Number.MAX_VALUE;
      let maxPrice = 0;
      
      products.forEach(product => {
        const price = product.discount 
          ? Math.round(parseFloat(product.basePrice) * (1 - product.discount / 100)) 
          : parseFloat(product.basePrice);
        
        if (price < minPrice) minPrice = price;
        if (price > maxPrice) maxPrice = price;
      });
      
      setPriceRange({ min: minPrice, max: maxPrice });
    }
  }, [products]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "min") {
      setMinPrice(Number(value));
    } else if (name === "max") {
      setMaxPrice(Number(value));
    }
  };

  // Generate title based on category
  const getTitle = () => {
    if (category === "mattress") return "Матрасы";
    if (category === "bed") return "Кровати";
    if (category === "accessory") return "Аксессуары";
    return "Все товары";
  };

  const title = getTitle();

  // Generate breadcrumbs
  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: "Каталог", href: "/products" },
    { label: title, href: category ? `/products/${category}` : "/products" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 py-8">
          <Breadcrumbs items={breadcrumbs} className="mb-4" />
          
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
            {title}
          </h1>
          
          <p className="text-gray-600 max-w-3xl">
            {category === "mattress"
              ? "Премиальные матрасы для идеального сна. Различные степени жесткости, независимые пружины и натуральные наполнители."
              : category === "bed"
              ? "Стильные и удобные кровати. Разнообразие моделей, размеров и обивки для создания идеальной спальни."
              : category === "accessory"
              ? "Аксессуары для вашей спальни. Подушки, постельное белье и другие товары для комфортного сна."
              : "Каталог наших товаров для сна и отдыха. Матрасы, кровати и аксессуары премиального качества."}
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col-reverse lg:flex-row gap-8">
          {/* Sidebar with filters */}
          <div className="lg:w-1/4">
            <div className="bg-white p-6 sticky top-20">
              <h3 className="text-lg font-medium mb-4 text-gray-900">Фильтры</h3>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 text-gray-700">Категории</h4>
                <div className="space-y-2">
                  <button 
                    className={`block w-full text-left px-2 py-1 ${category === null ? 'bg-gray-100 text-[#8e2b85]' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setCategory(null)}
                  >
                    Все товары
                  </button>
                  <button 
                    className={`block w-full text-left px-2 py-1 ${category === 'mattress' ? 'bg-gray-100 text-[#8e2b85]' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setCategory('mattress')}
                  >
                    Матрасы
                  </button>
                  <button 
                    className={`block w-full text-left px-2 py-1 ${category === 'bed' ? 'bg-gray-100 text-[#8e2b85]' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setCategory('bed')}
                  >
                    Кровати
                  </button>
                  <button 
                    className={`block w-full text-left px-2 py-1 ${category === 'accessory' ? 'bg-gray-100 text-[#8e2b85]' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setCategory('accessory')}
                  >
                    Аксессуары
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 text-gray-700">Цена, ₽</h4>
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    name="min"
                    value={minPrice}
                    onChange={handlePriceChange}
                    className="w-full border border-gray-300 px-3 py-2 text-sm"
                    placeholder="От"
                    min={priceRange.min}
                    max={priceRange.max}
                  />
                  <input
                    type="number"
                    name="max"
                    value={maxPrice}
                    onChange={handlePriceChange}
                    className="w-full border border-gray-300 px-3 py-2 text-sm"
                    placeholder="До"
                    min={priceRange.min}
                    max={priceRange.max}
                  />
                </div>
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3 text-gray-700">Сортировка</h4>
                <div className="space-y-2">
                  <button 
                    className={`block w-full text-left px-2 py-1 ${sort === 'default' ? 'bg-gray-100 text-[#8e2b85]' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setSort('default')}
                  >
                    По умолчанию
                  </button>
                  <button 
                    className={`block w-full text-left px-2 py-1 ${sort === 'price-asc' ? 'bg-gray-100 text-[#8e2b85]' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setSort('price-asc')}
                  >
                    Сначала дешевле
                  </button>
                  <button 
                    className={`block w-full text-left px-2 py-1 ${sort === 'price-desc' ? 'bg-gray-100 text-[#8e2b85]' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setSort('price-desc')}
                  >
                    Сначала дороже
                  </button>
                </div>
              </div>
              
              <Button 
                className="w-full bg-[#8e2b85] text-white hover:bg-[#702269] rounded-none"
                onClick={() => {
                  setMinPrice(priceRange.min);
                  setMaxPrice(priceRange.max);
                  setSort('default');
                }}
              >
                Сбросить фильтры
              </Button>
            </div>
          </div>
          
          {/* Products grid */}
          <div className="lg:w-3/4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-gray-100 h-80 animate-pulse"></div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCardModern key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Товары не найдены</h3>
                <p className="text-gray-600 mb-6">
                  По заданным параметрам не найдено ни одного товара. Попробуйте изменить фильтры.
                </p>
                <Button 
                  className="bg-[#8e2b85] text-white hover:bg-[#702269] rounded-none"
                  onClick={() => {
                    setMinPrice(priceRange.min);
                    setMaxPrice(priceRange.max);
                    setSort('default');
                  }}
                >
                  Сбросить фильтры
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}