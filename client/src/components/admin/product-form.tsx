import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { InsertProduct, Product, Size, FabricCategory, Fabric } from '@shared/schema';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, Image } from 'lucide-react';

// Form schema for product creation/editing
const productSchema = z.object({
  name: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  description: z.string().min(10, 'Описание должно содержать минимум 10 символов'),
  category: z.string(),
  basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Введите корректную цену'),
  discount: z.coerce.number().min(0).max(100),
  hasLiftingMechanism: z.boolean().default(false),
  liftingMechanismPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Введите корректную цену'),
  featured: z.boolean().default(false),
  inStock: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product; // If provided, we're editing an existing product
}

export default function ProductForm({ product }: ProductFormProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for dynamic fields
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  
  const [sizes, setSizes] = useState<Size[]>(product?.sizes || [
    { id: 'single', label: '90×200', price: -5000 },
    { id: 'small_double', label: '120×200', price: -2500 },
    { id: 'double', label: '140×200', price: 0 },
    { id: 'queen', label: '160×200', price: 3000 },
    { id: 'king', label: '180×200', price: 6000 },
    { id: 'custom', label: 'Свой размер', price: 0 }
  ]);
  const [newSizeId, setNewSizeId] = useState('');
  const [newSizeLabel, setNewSizeLabel] = useState('');
  const [newSizePrice, setNewSizePrice] = useState('0');
  
  const [fabricCategories, setFabricCategories] = useState<FabricCategory[]>(
    product?.fabricCategories || [
      { id: 'economy', name: 'Эконом', priceMultiplier: 0.8 },
      { id: 'standard', name: 'Стандарт', priceMultiplier: 1 },
      { id: 'premium', name: 'Премиум', priceMultiplier: 1.3 }
    ]
  );
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryMultiplier, setNewCategoryMultiplier] = useState('1');
  
  const [fabrics, setFabrics] = useState<Fabric[]>(product?.fabrics || []);
  const [newFabricId, setNewFabricId] = useState('');
  const [newFabricName, setNewFabricName] = useState('');
  const [newFabricCategory, setNewFabricCategory] = useState('standard');
  const [newFabricThumbnail, setNewFabricThumbnail] = useState('');
  const [newFabricImage, setNewFabricImage] = useState('');
  
  const [specifications, setSpecifications] = useState<Array<{key: string, value: string}>>(
    product?.specifications || []
  );
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // Form initialization
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      category: product?.category || 'bed',
      basePrice: product?.basePrice?.toString() || '',
      discount: product?.discount || 0,
      hasLiftingMechanism: product?.hasLiftingMechanism || false,
      liftingMechanismPrice: product?.liftingMechanismPrice?.toString() || '0',
      featured: product?.featured || false,
      inStock: product?.inStock ?? true,
    },
  });

  // Image handling
  const addImage = () => {
    if (newImageUrl && !images.includes(newImageUrl)) {
      setImages([...images, newImageUrl]);
      setNewImageUrl('');
    }
  };
  
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Size handling
  const addSize = () => {
    if (newSizeId && newSizeLabel) {
      const price = parseInt(newSizePrice) || 0;
      setSizes([...sizes, { id: newSizeId, label: newSizeLabel, price }]);
      setNewSizeId('');
      setNewSizeLabel('');
      setNewSizePrice('0');
    }
  };
  
  const removeSize = (id: string) => {
    setSizes(sizes.filter(size => size.id !== id));
  };

  // Fabric category handling
  const addFabricCategory = () => {
    if (newCategoryId && newCategoryName) {
      const multiplier = parseFloat(newCategoryMultiplier) || 1;
      setFabricCategories([
        ...fabricCategories, 
        { id: newCategoryId, name: newCategoryName, priceMultiplier: multiplier }
      ]);
      setNewCategoryId('');
      setNewCategoryName('');
      setNewCategoryMultiplier('1');
    }
  };
  
  const removeFabricCategory = (id: string) => {
    setFabricCategories(fabricCategories.filter(cat => cat.id !== id));
  };

  // Fabric handling
  const addFabric = () => {
    if (newFabricId && newFabricName && newFabricCategory && newFabricThumbnail && newFabricImage) {
      setFabrics([
        ...fabrics, 
        { 
          id: newFabricId, 
          name: newFabricName, 
          category: newFabricCategory, 
          thumbnail: newFabricThumbnail, 
          image: newFabricImage 
        }
      ]);
      setNewFabricId('');
      setNewFabricName('');
      setNewFabricCategory('standard');
      setNewFabricThumbnail('');
      setNewFabricImage('');
    }
  };
  
  const removeFabric = (id: string) => {
    setFabrics(fabrics.filter(fabric => fabric.id !== id));
  };

  // Specification handling
  const addSpecification = () => {
    if (newSpecKey && newSpecValue) {
      setSpecifications([...specifications, { key: newSpecKey, value: newSpecValue }]);
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };
  
  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  // Form submission
  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Validate required arrays
      if (images.length === 0) {
        throw new Error('Добавьте хотя бы одно изображение');
      }
      
      if (sizes.length === 0) {
        throw new Error('Добавьте хотя бы один размер');
      }
      
      if (fabricCategories.length === 0) {
        throw new Error('Добавьте хотя бы одну категорию ткани');
      }
      
      if (fabrics.length === 0) {
        throw new Error('Добавьте хотя бы один вариант ткани');
      }
      
      // Prepare product data
      const productData: InsertProduct = {
        ...data,
        images,
        sizes,
        fabricCategories,
        fabrics,
        specifications
      };
      
      // Send to API
      const url = product 
        ? `/api/products/${product.id}` 
        : '/api/products';
      
      const method = product ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при сохранении товара');
      }
      
      toast({
        title: product ? 'Товар обновлен' : 'Товар создан',
        description: `"${data.name}" успешно ${product ? 'обновлен' : 'добавлен'} в каталог`,
      });
      
      // Redirect back to products list
      navigate('/admin/products');
      
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить товар',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="basic">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Основная информация</TabsTrigger>
            <TabsTrigger value="images">Изображения</TabsTrigger>
            <TabsTrigger value="sizes">Размеры</TabsTrigger>
            <TabsTrigger value="fabrics">Ткани и материалы</TabsTrigger>
            <TabsTrigger value="specs">Характеристики</TabsTrigger>
          </TabsList>
          
          {/* Basic information tab */}
          <TabsContent value="basic">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Название товара</FormLabel>
                        <FormControl>
                          <Input placeholder="Кровать 'Морфей'" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Категория</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите категорию" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bed">Кровать</SelectItem>
                            <SelectItem value="mattress">Матрас</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Базовая цена (₽)</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="41900" {...field} />
                        </FormControl>
                        <FormDescription>
                          Базовая цена для стандартной конфигурации
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Скидка (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="100" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Описание</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Детальное описание товара"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                    <FormField
                      control={form.control}
                      name="hasLiftingMechanism"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Подъемный механизм</FormLabel>
                            <FormDescription>
                              Доступен ли подъемный механизм для этого товара
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch('hasLiftingMechanism') && (
                      <FormField
                        control={form.control}
                        name="liftingMechanismPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Цена подъемного механизма (₽)</FormLabel>
                            <FormControl>
                              <Input type="text" placeholder="8500" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Рекомендуемый товар</FormLabel>
                          <FormDescription>
                            Отображать в разделе "Рекомендуемые товары"
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="inStock"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">В наличии</FormLabel>
                          <FormDescription>
                            Товар доступен для заказа
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Images tab */}
          <TabsContent value="images">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Изображения товара</h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-40 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    ))}
                    
                    <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md border border-dashed">
                      <div className="text-center">
                        <Image className="mx-auto h-10 w-10 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Добавьте URL изображения</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="md:col-span-3">
                      <Input
                        placeholder="URL изображения"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={addImage}
                      disabled={!newImageUrl}
                    >
                      Добавить изображение
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Sizes tab */}
          <TabsContent value="sizes">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Доступные размеры</h3>
                  
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена (₽)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sizes.map((size) => (
                          <tr key={size.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{size.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{size.label}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {size.price >= 0 ? `+${size.price}` : size.price}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSize(size.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <Input
                      placeholder="ID (например, king)"
                      value={newSizeId}
                      onChange={(e) => setNewSizeId(e.target.value)}
                    />
                    <Input
                      placeholder="Название (например, 180×200)"
                      value={newSizeLabel}
                      onChange={(e) => setNewSizeLabel(e.target.value)}
                    />
                    <Input
                      placeholder="Изменение цены (например, 5000)"
                      value={newSizePrice}
                      onChange={(e) => setNewSizePrice(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={addSize}
                      disabled={!newSizeId || !newSizeLabel}
                    >
                      Добавить размер
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Fabrics tab */}
          <TabsContent value="fabrics">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-8">
                  {/* Fabric Categories */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Категории тканей</h3>
                    
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Множитель цены</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {fabricCategories.map((category) => (
                            <tr key={category.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{category.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{category.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">×{category.priceMultiplier}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFabricCategory(category.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                      <Input
                        placeholder="ID (например, premium)"
                        value={newCategoryId}
                        onChange={(e) => setNewCategoryId(e.target.value)}
                      />
                      <Input
                        placeholder="Название (например, Премиум)"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                      <Input
                        placeholder="Множитель цены (например, 1.3)"
                        value={newCategoryMultiplier}
                        onChange={(e) => setNewCategoryMultiplier(e.target.value)}
                      />
                      <Button
                        type="button"
                        onClick={addFabricCategory}
                        disabled={!newCategoryId || !newCategoryName}
                      >
                        Добавить категорию
                      </Button>
                    </div>
                  </div>
                  
                  {/* Fabric Options */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">Варианты тканей</h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {fabrics.map((fabric) => (
                        <div key={fabric.id} className="relative group border rounded-md p-3">
                          <div className="aspect-square mb-2 overflow-hidden rounded-md">
                            <img 
                              src={fabric.thumbnail} 
                              alt={fabric.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="font-medium text-sm truncate">{fabric.name}</p>
                          <p className="text-xs text-gray-500">Категория: {
                            fabricCategories.find(c => c.id === fabric.category)?.name || fabric.category
                          }</p>
                          <button
                            type="button"
                            onClick={() => removeFabric(fabric.id)}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="space-y-4">
                        <Input
                          placeholder="ID (например, beige)"
                          value={newFabricId}
                          onChange={(e) => setNewFabricId(e.target.value)}
                        />
                        <Input
                          placeholder="Название (например, Бежевый)"
                          value={newFabricName}
                          onChange={(e) => setNewFabricName(e.target.value)}
                        />
                        <Select
                          value={newFabricCategory}
                          onValueChange={setNewFabricCategory}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите категорию" />
                          </SelectTrigger>
                          <SelectContent>
                            {fabricCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <Input
                          placeholder="URL миниатюры (100x100)"
                          value={newFabricThumbnail}
                          onChange={(e) => setNewFabricThumbnail(e.target.value)}
                        />
                        <Input
                          placeholder="URL полного изображения"
                          value={newFabricImage}
                          onChange={(e) => setNewFabricImage(e.target.value)}
                        />
                        <Button
                          type="button"
                          onClick={addFabric}
                          disabled={!newFabricId || !newFabricName || !newFabricThumbnail || !newFabricImage}
                          className="w-full mt-2"
                        >
                          Добавить ткань
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Specifications tab */}
          <TabsContent value="specs">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Технические характеристики</h3>
                  
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Характеристика</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Значение</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {specifications.map((spec, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 text-sm">{spec.key}</td>
                            <td className="px-6 py-4 text-sm">{spec.value}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSpecification(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Input
                      placeholder="Характеристика (например, Материал основания)"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                    />
                    <Input
                      placeholder="Значение (например, Массив сосны)"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={addSpecification}
                      disabled={!newSpecKey || !newSpecValue}
                    >
                      <Plus size={16} className="mr-2" />
                      Добавить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/products')}
          >
            Отмена
          </Button>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : product ? 'Сохранить изменения' : 'Создать товар'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
