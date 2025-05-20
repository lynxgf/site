import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Product } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';
import AdminSidebar from '@/components/admin/sidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2,
  ArrowUpDown,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function AdminProducts() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Fetch products
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    refetchInterval: 10000, // Обновление данных каждые 10 секунд
    staleTime: 2000, // Данные считаются устаревшими через 2 секунды
    refetchOnMount: true, // Обновление при монтировании компонента
  });
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest('DELETE', `/api/products/${productId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Успех',
        description: 'Товар успешно удален',
      });
      
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setProductToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить товар',
        variant: 'destructive',
      });
    },
  });
  
  // Handle sorting
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Filter and sort products
  const filteredAndSortedProducts = products 
    ? [...products]
        .filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          let aValue: any = a[sortField as keyof Product];
          let bValue: any = b[sortField as keyof Product];
          
          // Handle specific fields
          if (sortField === 'basePrice') {
            aValue = Number(a.basePrice);
            bValue = Number(b.basePrice);
          }
          
          if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        })
    : [];
  
  // Handle delete confirmation
  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
  };
  
  // Handle cancel delete
  const cancelDelete = () => {
    setProductToDelete(null);
  };
  
  // Handle delete product
  const handleDeleteProduct = async () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6 lg:p-8 lg:ml-64">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Управление товарами</h1>
          
          <Button onClick={() => navigate('/admin/products/new')}>
            <Plus className="h-5 w-5 mr-2" />
            Добавить товар
          </Button>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle>Фильтры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по названию или категории"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                disabled={!searchTerm}
              >
                Сбросить
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {isLoading ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent">
              <span className="sr-only">Загрузка...</span>
            </div>
            <p className="mt-4 text-gray-500">Загрузка товаров...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-600">Произошла ошибка при загрузке товаров. Пожалуйста, попробуйте позже.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead className="w-[80px]">Фото</TableHead>
                    <TableHead className="min-w-[200px]">
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('name')}
                      >
                        Название
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('category')}
                      >
                        Категория
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">
                      <div 
                        className="flex items-center justify-end cursor-pointer"
                        onClick={() => handleSort('basePrice')}
                      >
                        Цена
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedProducts.length > 0 ? (
                    filteredAndSortedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.id}</TableCell>
                        <TableCell>
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{product.name}</div>
                          {product.featured && (
                            <Badge variant="outline" className="mt-1 bg-primary-50">Рекомендуемый</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge>
                            {product.category === 'bed' ? 'Кровать' : 'Матрас'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>{formatPrice(Number(product.basePrice))} ₽</div>
                          {product.discount > 0 && (
                            <div className="text-sm text-accent-500">Скидка: {product.discount}%</div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div 
                            className="cursor-pointer" 
                            onClick={() => {
                              // Обновить статус наличия
                              updateProductMutation.mutate({
                                productId: product.id,
                                updates: { inStock: !product.inStock }
                              });
                              
                              // Немедленно обновить кеш
                              setTimeout(() => {
                                queryClient.invalidateQueries({ queryKey: ['/api/products'] });
                                queryClient.invalidateQueries({ queryKey: [`/api/products/${product.id}`] });
                                queryClient.refetchQueries({ queryKey: ['/api/products'] });
                              }, 300);
                            }}
                          >
                            {product.inStock ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                В наличии
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                <XCircle className="h-4 w-4 mr-1" />
                                Нет в наличии
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                              title="Редактировать"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => confirmDelete(product)}
                              title="Удалить"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'Товары не найдены. Попробуйте изменить параметры поиска.' : 'Товары не найдены.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы собираетесь удалить товар "{productToDelete?.name}". 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
