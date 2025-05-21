import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Order } from '@shared/schema';
import { queryClient, apiRequest } from '@/lib/queryClient';
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
import { 
  Search, 
  Calendar, 
  ArrowUpDown, 
  Eye, 
  PackageCheck, 
  Truck, 
  CheckCircle, 
  AlertTriangle,
  ShoppingBag
} from 'lucide-react';

// Типы статусов заказа
const orderStatuses = [
  { value: 'pending', label: 'Ожидает оплаты', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'processing', label: 'В обработке', color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'Отправлен', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'delivered', label: 'Доставлен', color: 'bg-green-100 text-green-800' },
  { value: 'completed', label: 'Завершен', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Отменен', color: 'bg-red-100 text-red-800' },
];

export default function AdminOrders() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Fetch orders
  const { data: orders = [], isLoading, error } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    refetchInterval: 5000, // Обновление каждые 5 секунд
    refetchOnWindowFocus: true, // Обновление при фокусе окна
    staleTime: 3000, // Данные считаются устаревшими через 3 секунды
    
    // Явно указываем функцию для получения данных
    queryFn: async () => {
      try {
        // Получаем данные с сервера
        return await apiRequest('GET', '/api/admin/orders');
      } catch (error) {
        console.error("Ошибка при получении заказов:", error);
        return []; // Возвращаем пустой массив в случае ошибки
      }
    }
  });
  
  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      console.log(`Обновление статуса заказа #${orderId} на ${status}`);
      return apiRequest('PATCH', `/api/admin/orders/${orderId}`, { status });
    },
    onSuccess: (data) => {
      console.log("Статус заказа успешно обновлен:", data);
      toast({
        title: 'Успех',
        description: 'Статус заказа успешно обновлен',
      });
      
      // Close dialog and invalidate orders query
      setIsDetailsOpen(false);
      setSelectedOrder(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
    },
    onError: (error) => {
      console.error("Ошибка при обновлении статуса:", error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить статус заказа',
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
  
  // Status filter and search filter
  const filteredOrders = Array.isArray(orders) 
    ? orders.filter(order => {
        // Status filter
        if (statusFilter !== 'all' && order.status !== statusFilter) {
          return false;
        }
        
        // Search term filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            order.customerName.toLowerCase().includes(searchLower) ||
            order.customerEmail.toLowerCase().includes(searchLower) ||
            order.customerPhone.includes(searchTerm) ||
            order.id.toString().includes(searchTerm)
          );
        }
        
        return true;
      })
    : [];
  
  // Sort filtered orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue: any = a[sortField as keyof Order];
    let bValue: any = b[sortField as keyof Order];
    
    // Handle specific fields
    if (sortField === 'totalAmount') {
      aValue = Number(a.totalAmount);
      bValue = Number(b.totalAmount);
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Update order status
  const handleStatusChange = (status: string) => {
    if (selectedOrder) {
      updateOrderStatusMutation.mutate({ 
        orderId: selectedOrder.id, 
        status 
      });
    }
  };
  
  // View order details
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    
    if (!statusObj) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800">
          Неизвестно
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className={statusObj.color}>
        {status === 'pending' && <AlertTriangle className="h-3 w-3 mr-1" />}
        {status === 'processing' && <PackageCheck className="h-3 w-3 mr-1" />}
        {status === 'shipped' && <Truck className="h-3 w-3 mr-1" />}
        {status === 'delivered' || status === 'completed' ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
        {statusObj.label}
      </Badge>
    );
  };
  
  // Get order items
  const getOrderItems = (order: Order) => {
    // This would come from the API in a real application
    return [
      {
        id: 1,
        productName: 'Кровать "Аврора"',
        quantity: 1,
        price: '39800',
        options: 'Размер: 160×200, Ткань: Бежевый велюр'
      },
      {
        id: 2,
        productName: 'Матрас "Комфорт Люкс"',
        quantity: 1,
        price: '12600',
        options: 'Размер: 160×200'
      }
    ];
  };
  
  // Calculate totals for dashboard
  const pendingCount = Array.isArray(orders) ? orders.filter(o => o.status === 'pending').length : 0;
  const processingCount = Array.isArray(orders) ? orders.filter(o => o.status === 'processing').length : 0;
  const completedCount = Array.isArray(orders) ? orders.filter(o => ['completed', 'delivered'].includes(o.status)).length : 0;
  const cancelledCount = Array.isArray(orders) ? orders.filter(o => o.status === 'cancelled').length : 0;
  const totalSales = Array.isArray(orders) ? orders.reduce((sum, order) => {
    if (order.status !== 'cancelled') {
      // Преобразуем строку в число перед вычислениями
      const amount = typeof order.totalAmount === 'string' 
        ? parseFloat(order.totalAmount) 
        : Number(order.totalAmount);
      return sum + (isNaN(amount) ? 0 : amount);
    }
    return sum;
  }, 0) : 0;
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6 lg:p-8 lg:ml-64">
        <h1 className="text-3xl font-bold mb-6">Управление заказами</h1>
        
        {/* Dashboard summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="mr-4 bg-yellow-100 p-3 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Ожидают</p>
                  <h3 className="text-2xl font-bold">{pendingCount}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="mr-4 bg-blue-100 p-3 rounded-full">
                  <PackageCheck className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">В обработке</p>
                  <h3 className="text-2xl font-bold">{processingCount}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="mr-4 bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Выполнено</p>
                  <h3 className="text-2xl font-bold">{completedCount}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="mr-4 bg-purple-100 p-3 rounded-full">
                  <ShoppingBag className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Общая сумма</p>
                  <h3 className="text-2xl font-bold">{formatPrice(totalSales)} ₽</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle>Фильтры заказов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск по имени, email или телефону"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Статус заказа" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  {orderStatuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                disabled={!searchTerm && statusFilter === 'all'}
              >
                Сбросить
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Orders table */}
        {isLoading ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent">
              <span className="sr-only">Загрузка...</span>
            </div>
            <p className="mt-4 text-gray-500">Загрузка заказов...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-600">Произошла ошибка при загрузке заказов. Пожалуйста, попробуйте позже.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70px]">
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('id')}
                      >
                        #
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('customerName')}
                      >
                        Клиент
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Контакты</TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('createdAt')}
                      >
                        Дата
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">
                      <div 
                        className="flex items-center justify-end cursor-pointer"
                        onClick={() => handleSort('totalAmount')}
                      >
                        Сумма
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('status')}
                      >
                        Статус
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.length > 0 ? (
                    sortedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{order.customerName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{order.customerEmail}</div>
                          <div className="text-sm text-gray-500">{order.customerPhone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(order.totalAmount)} ₽
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            onClick={() => viewOrderDetails(order)}
                            size="icon"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        {searchTerm || statusFilter !== 'all' ? 
                          'Заказы не найдены. Попробуйте изменить параметры поиска.' : 
                          'Заказов пока нет.'
                        }
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
      
      {/* Order details dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Детали заказа #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              От {selectedOrder?.customerName} ({new Date(selectedOrder?.createdAt || '').toLocaleDateString()})
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <Tabs defaultValue="info" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Информация</TabsTrigger>
                <TabsTrigger value="items">Товары</TabsTrigger>
                <TabsTrigger value="status">Статус</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Клиент</h4>
                    <p className="mt-1">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                    <p className="mt-1">{selectedOrder.customerEmail}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Телефон</h4>
                    <p className="mt-1">{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Дата заказа</h4>
                    <p className="mt-1">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="border p-4 rounded-md bg-gray-50 mb-2">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Информация о доставке</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-medium text-gray-500">Способ доставки</h5>
                      <p className="mt-1 text-sm">
                        {selectedOrder.deliveryMethodText || 
                         (selectedOrder.deliveryMethod ? 
                            (selectedOrder.deliveryMethod === 'courier' ? 'Курьером' : 
                             selectedOrder.deliveryMethod === 'pickup' ? 'Самовывоз' : 'Не указано')
                          : 'Не указано')}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-medium text-gray-500">Стоимость доставки</h5>
                      <p className="mt-1 text-sm">
                        {selectedOrder.deliveryPrice ? `${formatPrice(selectedOrder.deliveryPrice)} ₽` : 
                         (selectedOrder.deliveryMethod === 'courier' ? '500 ₽' : 'Бесплатно')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h5 className="text-xs font-medium text-gray-500">Адрес</h5>
                    <p className="mt-1 text-sm">{selectedOrder.address || 'Самовывоз из магазина'}</p>
                  </div>
                </div>
                
                <div className="border p-4 rounded-md bg-gray-50 mb-2">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Информация об оплате</h4>
                  <div>
                    <h5 className="text-xs font-medium text-gray-500">Способ оплаты</h5>
                    <p className="mt-1 text-sm">
                      {selectedOrder.paymentMethodText || 
                       (selectedOrder.paymentMethod ? 
                         (selectedOrder.paymentMethod === 'card' ? 'Банковской картой' : 
                          selectedOrder.paymentMethod === 'cash' ? 'Наличными' : 'Не указано')
                        : 'Не указано')}
                    </p>
                  </div>
                </div>
                
                {selectedOrder.comment && (
                  <div className="border p-4 rounded-md bg-gray-50 mb-2">
                    <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                      <div className="h-4 w-4 mr-2">💬</div>
                      Комментарий к заказу
                    </h4>
                    <p className="text-sm bg-white p-3 rounded mt-2 border border-gray-100">
                      {selectedOrder.comment}
                    </p>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Итого:</span>
                    <span className="font-bold">{formatPrice(selectedOrder.totalAmount)} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Статус заказа:</span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="items" className="space-y-4 mt-4">
                <div className="divide-y">
                  {getOrderItems(selectedOrder).map((item) => (
                    <div key={item.id} className="py-3">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.productName}</span>
                        <span>{formatPrice(item.price)} ₽</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <div>Количество: {item.quantity}</div>
                        <div>{item.options}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t text-right">
                  <span className="font-bold">{formatPrice(selectedOrder.totalAmount)} ₽</span>
                </div>
              </TabsContent>
              
              <TabsContent value="status" className="space-y-4 mt-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Изменить статус заказа</h4>
                  <Select 
                    defaultValue={selectedOrder.status} 
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      {orderStatuses.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="border rounded-md p-4 bg-gray-50">
                  <h4 className="text-sm font-medium mb-2">История статусов</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                      <span className="flex-1">Заказ создан</span>
                      <span className="text-gray-500">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                      <span className="flex-1">Статус изменен на "{orderStatuses.find(s => s.value === selectedOrder.status)?.label}"</span>
                      <span className="text-gray-500">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsDetailsOpen(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}