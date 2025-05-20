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
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/orders');
        const data = response as any;
        return data as Order[];
      } catch (error) {
        // В реальном приложении здесь будет использоваться API
        // Для демонстрации используем мок-данные
        const mockOrders: Order[] = [
          {
            id: 1,
            sessionId: '123',
            customerName: 'Иван Петров',
            customerEmail: 'ivan@example.com',
            customerPhone: '+7 900 123-45-67',
            address: 'г. Москва, ул. Примерная, д. 1, кв. 123',
            totalAmount: '52400',
            status: 'completed',
            createdAt: new Date('2023-08-15')
          },
          {
            id: 2,
            sessionId: '456',
            customerName: 'Анна Смирнова',
            customerEmail: 'anna@example.com',
            customerPhone: '+7 900 987-65-43',
            address: 'г. Санкт-Петербург, ул. Тестовая, д. 5, кв. 42',
            totalAmount: '41900',
            status: 'processing',
            createdAt: new Date('2023-08-20')
          },
          {
            id: 3,
            sessionId: '789',
            customerName: 'Сергей Иванов',
            customerEmail: 'sergey@example.com',
            customerPhone: '+7 900 111-22-33',
            address: 'г. Екатеринбург, ул. Образцовая, д. 10, кв. 15',
            totalAmount: '28900',
            status: 'pending',
            createdAt: new Date('2023-08-25')
          },
          {
            id: 4,
            sessionId: '101',
            customerName: 'Мария Кузнецова',
            customerEmail: 'maria@example.com',
            customerPhone: '+7 900 444-55-66',
            address: 'г. Новосибирск, ул. Пример, д. 7, кв. 33',
            totalAmount: '35700',
            status: 'shipped',
            createdAt: new Date('2023-08-28')
          },
          {
            id: 5,
            sessionId: '102',
            customerName: 'Алексей Соколов',
            customerEmail: 'alexey@example.com',
            customerPhone: '+7 900 777-88-99',
            address: 'г. Казань, ул. Тестовая, д. 15, кв. 78',
            totalAmount: '63200',
            status: 'cancelled',
            createdAt: new Date('2023-08-22')
          }
        ];
        return mockOrders;
      }
    },
  });
  
  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return apiRequest('PATCH', `/api/admin/orders/${orderId}`, { status });
    },
    onSuccess: () => {
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
  const pendingCount = orders?.filter(o => o.status === 'pending').length || 0;
  const processingCount = orders?.filter(o => o.status === 'processing').length || 0;
  const completedCount = orders?.filter(o => ['completed', 'delivered'].includes(o.status)).length || 0;
  const cancelledCount = orders?.filter(o => o.status === 'cancelled').length || 0;
  const totalSales = orders?.reduce((sum, order) => {
    if (order.status !== 'cancelled') {
      return sum + Number(order.totalAmount);
    }
    return sum;
  }, 0) || 0;
  
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
                          <div className="text-sm text-gray-600">{order.customerEmail}</div>
                          <div className="text-sm">{order.customerPhone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(Number(order.totalAmount))} ₽
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewOrderDetails(order)}
                            className="text-primary"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Детали
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        {searchTerm || statusFilter !== 'all' ? 
                          'Заказы не найдены. Попробуйте изменить параметры поиска.' : 
                          'Заказы не найдены.'}
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Заказ #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              от {selectedOrder ? new Date(selectedOrder.createdAt).toLocaleDateString('ru-RU') : ''}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Информация</TabsTrigger>
                <TabsTrigger value="items">Товары</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Информация о клиенте</h3>
                    <Card>
                      <CardContent className="p-4">
                        <p className="font-medium mb-1">{selectedOrder.customerName}</p>
                        <p className="text-sm mb-1">{selectedOrder.customerEmail}</p>
                        <p className="text-sm">{selectedOrder.customerPhone}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Адрес доставки</h3>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm">{selectedOrder.address}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Статус заказа</h3>
                    <Card>
                      <CardContent className="p-4">
                        <Select 
                          value={selectedOrder.status} 
                          onValueChange={handleStatusChange}
                          disabled={updateOrderStatusMutation.isPending}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {orderStatuses.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-2">Текущий статус: {getStatusBadge(selectedOrder.status)}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="items">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Товары в заказе</h3>
                <Card>
                  <CardContent className="p-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Товар</TableHead>
                          <TableHead className="text-center">Кол-во</TableHead>
                          <TableHead className="text-right">Цена</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getOrderItems(selectedOrder).map(item => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-xs text-gray-500">{item.options}</div>
                            </TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatPrice(Number(item.price))} ₽</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={2} className="text-right font-medium">
                            Итого:
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatPrice(Number(selectedOrder.totalAmount))} ₽
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}