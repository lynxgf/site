import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import AdminSidebar from '@/components/admin/sidebar';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Удаляем импорт несуществующего компонента
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { DataTable } from '@/components/ui/data-table';
import { Calendar as CalendarIcon, DownloadCloud, FileJson, FileText, Filter, Users, Package, ShoppingCart } from 'lucide-react';

export default function AdminExport() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('orders');
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  
  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/admin/orders'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/orders');
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
    },
    enabled: activeTab === 'orders',
  });
  
  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/products');
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Error fetching products:', error);
        return [];
      }
    },
    enabled: activeTab === 'products',
  });
  
  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/users');
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    },
    enabled: activeTab === 'users',
  });
  
  const handleExport = () => {
    let dataToExport: any[] = [];
    let filename = '';
    
    // Determine which data to export based on active tab
    switch (activeTab) {
      case 'orders':
        dataToExport = orders;
        filename = `orders_export_${format(new Date(), 'yyyyMMdd')}`;
        break;
      case 'products':
        dataToExport = products;
        filename = `products_export_${format(new Date(), 'yyyyMMdd')}`;
        break;
      case 'users':
        dataToExport = users;
        filename = `users_export_${format(new Date(), 'yyyyMMdd')}`;
        break;
      default:
        break;
    }
    
    // Apply date filter if we have a date range
    if (dateRange.from && activeTab === 'orders') {
      dataToExport = dataToExport.filter((item: any) => {
        const itemDate = new Date(item.createdAt);
        if (dateRange.from && dateRange.to) {
          return itemDate >= dateRange.from && itemDate <= dateRange.to;
        } else if (dateRange.from) {
          return itemDate >= dateRange.from;
        }
        return true;
      });
    }
    
    if (dataToExport.length === 0) {
      toast({
        title: 'Нет данных для экспорта',
        description: 'Пожалуйста, убедитесь, что выбранная категория содержит данные',
        variant: 'destructive',
      });
      return;
    }
    
    // Export data based on selected format
    if (exportFormat === 'csv') {
      exportCSV(dataToExport, filename);
    } else if (exportFormat === 'json') {
      exportJSON(dataToExport, filename);
    }
  };
  
  const exportCSV = (data: any[], filename: string) => {
    // Get headers from first data item
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    data.forEach(item => {
      const row = headers.map(header => {
        const value = item[header];
        // Handle special cases for CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        } else if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        } else {
          return value;
        }
      }).join(',');
      csvContent += row + '\n';
    });
    
    // Create downloadable link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Экспорт успешно выполнен',
      description: `Файл ${filename}.csv был создан и загружен`,
    });
  };
  
  const exportJSON = (data: any[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Экспорт успешно выполнен',
      description: `Файл ${filename}.json был создан и загружен`,
    });
  };
  
  const isLoading = ordersLoading || productsLoading || usersLoading;
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6 lg:p-8 lg:ml-64">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Экспорт данных</h1>
          <p className="text-gray-600 mt-2">Экспортируйте данные из вашего магазина для аналитики и отчетов</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Экспорт заказов</CardTitle>
              <CardDescription>Выгрузите информацию о заказах из магазина</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-8 h-8 text-primary p-1.5 bg-primary/10 rounded-lg" />
                  <div>
                    <p className="font-medium">{Array.isArray(orders) ? orders.length : 0} заказов</p>
                    <p className="text-sm text-gray-500">Доступно для экспорта</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setActiveTab('orders');
                  }}
                >
                  Выбрать
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Экспорт товаров</CardTitle>
              <CardDescription>Выгрузите каталог товаров вашего магазина</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="w-8 h-8 text-blue-600 p-1.5 bg-blue-50 rounded-lg" />
                  <div>
                    <p className="font-medium">{Array.isArray(products) ? products.length : 0} товаров</p>
                    <p className="text-sm text-gray-500">Доступно для экспорта</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setActiveTab('products');
                  }}
                >
                  Выбрать
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Экспорт пользователей</CardTitle>
              <CardDescription>Выгрузите данные о пользователях магазина</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-8 h-8 text-green-600 p-1.5 bg-green-50 rounded-lg" />
                  <div>
                    <p className="font-medium">{Array.isArray(users) ? users.length : 0} пользователей</p>
                    <p className="text-sm text-gray-500">Доступно для экспорта</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setActiveTab('users');
                  }}
                >
                  Выбрать
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  {activeTab === 'orders' && 'Экспорт заказов'}
                  {activeTab === 'products' && 'Экспорт товаров'}
                  {activeTab === 'users' && 'Экспорт пользователей'}
                </CardTitle>
                <CardDescription>
                  Настройте параметры экспорта и выберите формат файла
                </CardDescription>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="orders" className="px-3">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Заказы
                  </TabsTrigger>
                  <TabsTrigger value="products" className="px-3">
                    <Package className="h-4 w-4 mr-2" />
                    Товары
                  </TabsTrigger>
                  <TabsTrigger value="users" className="px-3">
                    <Users className="h-4 w-4 mr-2" />
                    Пользователи
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
              <div>
                <div className="bg-gray-50 p-4 rounded-lg min-h-[300px] mb-4">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent">
                        <span className="sr-only">Загрузка...</span>
                      </div>
                      <p className="ml-3">Загрузка данных...</p>
                    </div>
                  ) : (
                    <TabsContent value="orders" className="m-0">
                      {Array.isArray(orders) && orders.length > 0 ? (
                        <div className="overflow-auto max-h-[400px]">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Клиент</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {orders.slice(0, 10).map((order: any) => (
                                <tr key={order.id}>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{order.customerName}</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{Number(order.totalAmount).toLocaleString('ru-RU')} ₽</td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                      ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                                        'bg-yellow-100 text-yellow-800'}`}>
                                      {order.status === 'completed' ? 'Выполнен' : 
                                       order.status === 'processing' ? 'В обработке' : 
                                       'Ожидает'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {orders.length > 10 && (
                            <div className="py-2 px-4 text-center text-sm text-gray-500">
                              Показаны первые 10 из {orders.length} заказов. При экспорте будут выгружены все заказы.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
                          <ShoppingCart className="h-12 w-12 mb-2 opacity-20" />
                          <p>Нет доступных заказов для экспорта</p>
                        </div>
                      )}
                    </TabsContent>
                  )}
                  
                  <TabsContent value="products" className="m-0">
                    {Array.isArray(products) && products.length > 0 ? (
                      <div className="overflow-auto max-h-[400px]">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {products.slice(0, 10).map((product: any) => (
                              <tr key={product.id}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{product.id}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{Number(product.basePrice).toLocaleString('ru-RU')} ₽</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {product.inStock ? 'В наличии' : 'Нет в наличии'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {products.length > 10 && (
                          <div className="py-2 px-4 text-center text-sm text-gray-500">
                            Показаны первые 10 из {products.length} товаров. При экспорте будут выгружены все товары.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
                        <Package className="h-12 w-12 mb-2 opacity-20" />
                        <p>Нет доступных товаров для экспорта</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="users" className="m-0">
                    {Array.isArray(users) && users.length > 0 ? (
                      <div className="overflow-auto max-h-[400px]">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя пользователя</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {users.slice(0, 10).map((user: any) => (
                              <tr key={user.id}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '-'}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {user.isAdmin ? 'Администратор' : 'Клиент'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {users.length > 10 && (
                          <div className="py-2 px-4 text-center text-sm text-gray-500">
                            Показаны первые 10 из {users.length} пользователей. При экспорте будут выгружены все пользователи.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
                        <Users className="h-12 w-12 mb-2 opacity-20" />
                        <p>Нет доступных пользователей для экспорта</p>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Параметры экспорта</CardTitle>
                    <CardDescription>Настройте формат выгрузки данных</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="exportFormat">Формат файла</Label>
                      <Select value={exportFormat} onValueChange={setExportFormat}>
                        <SelectTrigger id="exportFormat">
                          <SelectValue placeholder="Выберите формат" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">
                            <div className="flex items-center">
                              <FileText className="mr-2 h-4 w-4" />
                              <span>CSV</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="json">
                            <div className="flex items-center">
                              <FileJson className="mr-2 h-4 w-4" />
                              <span>JSON</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {activeTab === 'orders' && (
                      <div className="space-y-2">
                        <Label>Период</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from ? (
                                  format(dateRange.from, 'dd.MM.yyyy')
                                ) : (
                                  <span>От</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={dateRange.from}
                                onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.to ? (
                                  format(dateRange.to, 'dd.MM.yyyy')
                                ) : (
                                  <span>До</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={dateRange.to}
                                onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full mt-6 justify-center"
                      onClick={handleExport}
                      disabled={isLoading}
                    >
                      <DownloadCloud className="mr-2 h-4 w-4" />
                      Экспортировать данные
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}