import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Product } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Парсинг параметров запроса
function useQueryParams() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  return {
    q: params.get('q') || '',
    category: params.get('category') || '',
    sort: params.get('sort') || 'relevance'
  };
}

export default function SearchPage() {
  const { q: initialQuery, category: initialCategory, sort: initialSort } = useQueryParams();
  const [location, setLocation] = useLocation();
  
  // Состояния поиска и фильтров
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSort, setSelectedSort] = useState<string>(initialSort);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [inStock, setInStock] = useState<boolean>(false);
  const [hasDiscount, setHasDiscount] = useState<boolean>(false);
  
  // Загрузка всех продуктов
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Обновление URL при изменении фильтров
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedSort !== 'relevance') params.set('sort', selectedSort);
    
    const newPath = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    if (location !== newPath && searchQuery) {
      setLocation(newPath);
    }
  }, [searchQuery, selectedCategory, selectedSort, location]);
  
  // При изменении URL обновляем состояние компонента
  useEffect(() => {
    const { q, category, sort } = useQueryParams();
    if (q && q !== searchQuery) {
      setSearchQuery(q);
    }
    if (category !== selectedCategory) {
      setSelectedCategory(category);
    }
    if (sort !== selectedSort) {
      setSelectedSort(sort);
    }
  }, [location]);
  
  // Обработчик отправки формы поиска
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // URL обновляется автоматически через useEffect
  };
  
  // Фильтрация и сортировка продуктов
  const filteredProducts = products?.filter(product => {
    // Фильтр по поисковому запросу
    const matchesQuery = searchQuery ? 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) :
      true;
      
    // Фильтр по категории
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    
    // Фильтр по цене
    const price = parseFloat(product.basePrice);
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    
    // Фильтр по наличию скидки
    const matchesDiscount = hasDiscount ? (product.discount && product.discount > 0) : true;
    
    // Фильтр по наличию (в данном примере считаем, что все товары в наличии)
    const matchesStock = inStock ? true : true;
    
    return matchesQuery && matchesCategory && matchesPrice && matchesDiscount && matchesStock;
  }) || [];
  
  // Сортировка результатов
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discount && a.discount > 0 
      ? parseFloat(a.basePrice) * (1 - a.discount / 100) 
      : parseFloat(a.basePrice);
      
    const priceB = b.discount && b.discount > 0 
      ? parseFloat(b.basePrice) * (1 - b.discount / 100) 
      : parseFloat(b.basePrice);
    
    switch (selectedSort) {
      case 'price-asc':
        return priceA - priceB;
      case 'price-desc':
        return priceB - priceA;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        // По умолчанию (relevance) - по релевантности запросу
        if (!searchQuery) return 0;
        
        const aNameIncludes = a.name.toLowerCase().includes(searchQuery.toLowerCase());
        const bNameIncludes = b.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (aNameIncludes && !bNameIncludes) return -1;
        if (!aNameIncludes && bNameIncludes) return 1;
        return 0;
    }
  });
  
  // Форматирование цены
  const formatPrice = (price: number): string => {
    return price.toLocaleString('ru-RU');
  };
  
  // Расчет скидки
  const calculateDiscountedPrice = (price: string, discount: number): string => {
    const basePrice = parseFloat(price);
    const discountedPrice = basePrice * (1 - discount / 100);
    return discountedPrice.toFixed(0);
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        {/* Заголовок страницы и форма поиска */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-gray-900 mb-6">
            {searchQuery ? `Результаты поиска: "${searchQuery}"` : 'Каталог товаров'}
          </h1>
          
          <form onSubmit={handleSearchSubmit} className="max-w-2xl">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow rounded-md"
              />
              <Button type="submit" className="bg-[#8e2b85] hover:bg-[#722169] text-white">
                Найти
              </Button>
            </div>
          </form>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Сайдбар с фильтрами */}
          <div className="w-full lg:w-1/4 bg-white p-6 shadow-sm rounded-lg h-fit">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Фильтры</h2>
            
            {/* Категории */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Категория</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="all-categories"
                    name="category"
                    checked={selectedCategory === ''}
                    onChange={() => setSelectedCategory('')}
                    className="mr-2"
                  />
                  <label htmlFor="all-categories" className="text-sm text-gray-700">Все категории</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="mattress"
                    name="category"
                    checked={selectedCategory === 'mattress'}
                    onChange={() => setSelectedCategory('mattress')}
                    className="mr-2"
                  />
                  <label htmlFor="mattress" className="text-sm text-gray-700">Матрасы</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="bed"
                    name="category"
                    checked={selectedCategory === 'bed'}
                    onChange={() => setSelectedCategory('bed')}
                    className="mr-2"
                  />
                  <label htmlFor="bed" className="text-sm text-gray-700">Кровати</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="accessory"
                    name="category"
                    checked={selectedCategory === 'accessory'}
                    onChange={() => setSelectedCategory('accessory')}
                    className="mr-2"
                  />
                  <label htmlFor="accessory" className="text-sm text-gray-700">Аксессуары</label>
                </div>
              </div>
            </div>
            
            {/* Цена */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Цена</h3>
              <div className="flex gap-2 mb-4">
                <Input
                  type="number"
                  placeholder="От"
                  value={priceRange[0] > 0 ? priceRange[0] : ''}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="w-1/2"
                />
                <Input
                  type="number"
                  placeholder="До"
                  value={priceRange[1] < 100000 ? priceRange[1] : ''}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])}
                  className="w-1/2"
                />
              </div>
            </div>
            
            {/* Дополнительные фильтры */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Дополнительно</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Checkbox
                    id="in-stock"
                    checked={inStock}
                    onCheckedChange={(checked) => setInStock(checked as boolean)}
                    className="mr-2"
                  />
                  <Label htmlFor="in-stock" className="text-sm text-gray-700">В наличии</Label>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    id="has-discount"
                    checked={hasDiscount}
                    onCheckedChange={(checked) => setHasDiscount(checked as boolean)}
                    className="mr-2"
                  />
                  <Label htmlFor="has-discount" className="text-sm text-gray-700">Со скидкой</Label>
                </div>
              </div>
            </div>
            
            {/* Кнопка сброса фильтров */}
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory('');
                setPriceRange([0, 100000]);
                setInStock(false);
                setHasDiscount(false);
                setSelectedSort('relevance');
              }}
              className="w-full"
            >
              Сбросить фильтры
            </Button>
          </div>
          
          {/* Результаты поиска */}
          <div className="flex-1">
            {/* Сортировка и количество результатов */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
              <p className="text-gray-600 mb-2 sm:mb-0">
                Найдено товаров: <span className="font-medium">{sortedProducts.length}</span>
              </p>
              
              <div className="flex items-center">
                <span className="text-gray-600 mr-2 text-sm">Сортировать:</span>
                <Select value={selectedSort} onValueChange={setSelectedSort}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="По релевантности" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">По релевантности</SelectItem>
                    <SelectItem value="price-asc">Сначала дешевле</SelectItem>
                    <SelectItem value="price-desc">Сначала дороже</SelectItem>
                    <SelectItem value="name-asc">По названию (А-Я)</SelectItem>
                    <SelectItem value="name-desc">По названию (Я-А)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Список товаров */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin w-10 h-10 border-4 border-[#8e2b85] border-t-transparent rounded-full"></div>
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <div key={product.id} className="bg-white group hover:shadow-xl transition-all duration-300 rounded-lg overflow-hidden">
                    <Link href={`/product/${product.id}`} className="block">
                      <div className="relative">
                        {/* Discount badge */}
                        {product.discount && product.discount > 0 && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 z-10 uppercase">
                            -{product.discount}%
                          </div>
                        )}
                        
                        <div className="relative overflow-hidden aspect-square">
                          <img
                            src={product.images?.[0] || 'https://via.placeholder.com/300?text=Нет+изображения'}
                            alt={product.name}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="uppercase text-xs tracking-wider text-gray-500 mb-1">
                          {product.category === "mattress" ? "МАТРАСЫ" : 
                           product.category === "bed" ? "КРОВАТИ" : "АКСЕССУАРЫ"}
                        </div>
                        
                        <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-[#8e2b85] transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        
                        <div className="mt-auto">
                          {product.discount && product.discount > 0 ? (
                            <div className="flex flex-col">
                              <span className="text-black font-medium text-lg">
                                {formatPrice(parseFloat(calculateDiscountedPrice(product.basePrice, product.discount)))} ₽
                              </span>
                              <span className="text-gray-500 text-sm line-through">
                                {formatPrice(parseFloat(product.basePrice))} ₽
                              </span>
                            </div>
                          ) : (
                            <span className="text-black font-medium text-lg">
                              {formatPrice(parseFloat(product.basePrice))} ₽
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor" 
                  className="w-16 h-16 mx-auto text-gray-300 mb-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Ничего не найдено</h3>
                <p className="text-gray-600 mb-6">
                  По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска или сбросить фильтры.
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setPriceRange([0, 100000]);
                    setInStock(false);
                    setHasDiscount(false);
                  }}
                  variant="outline"
                  className="mx-auto"
                >
                  Сбросить все фильтры
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}