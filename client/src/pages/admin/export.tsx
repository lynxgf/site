import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  DownloadCloud, 
  FileJson, 
  FileText, 
  Users, 
  Package, 
  ShoppingCart, 
  Upload,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatPrice } from '@/lib/utils';

export default function AdminExport() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [exportFormat, setExportFormat] = useState('csv');
  const [importFormat, setImportFormat] = useState('csv');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
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
    console.log('Export начался. Активная вкладка:', activeTab);
    
    let dataToExport: any[] = [];
    let filename = '';
    
    // Determine which data to export based on active tab
    switch (activeTab) {
      case 'orders':
        dataToExport = Array.isArray(orders) ? orders : [];
        filename = `orders_export_${format(new Date(), 'yyyyMMdd')}`;
        break;
      case 'products':
        dataToExport = Array.isArray(products) ? products : [];
        filename = `products_export_${format(new Date(), 'yyyyMMdd')}`;
        break;
      case 'users':
        dataToExport = Array.isArray(users) ? users : [];
        filename = `users_export_${format(new Date(), 'yyyyMMdd')}`;
        break;
      default:
        dataToExport = [];
        filename = `export_${format(new Date(), 'yyyyMMdd')}`;
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
    
    // Проверка на наличие данных для экспорта
    if (!Array.isArray(dataToExport) || dataToExport.length === 0) {
      console.error('Нет данных для экспорта:', dataToExport);
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
    // Проверка на пустые данные
    if (!data || data.length === 0) {
      toast({
        title: 'Ошибка экспорта',
        description: 'Нет данных для экспорта',
        variant: 'destructive',
      });
      return;
    }
    
    try {
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
    } catch (error) {
      console.error('Ошибка экспорта CSV:', error);
      toast({
        title: 'Ошибка экспорта',
        description: 'Не удалось создать CSV файл',
        variant: 'destructive',
      });
    }
  };
  
  const exportJSON = (data: any[], filename: string) => {
    // Проверка на пустые данные
    if (!data || data.length === 0) {
      toast({
        title: 'Ошибка экспорта',
        description: 'Нет данных для экспорта',
        variant: 'destructive',
      });
      return;
    }
    
    try {
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
    } catch (error) {
      console.error('Ошибка экспорта JSON:', error);
      toast({
        title: 'Ошибка экспорта',
        description: 'Не удалось создать JSON файл',
        variant: 'destructive',
      });
    }
  };
  
  // Функция для обработки выбранного файла
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setImportFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let data: any[] = [];
        
        if (importFormat === 'csv') {
          // Обработка CSV
          const lines = content.split('\n');
          const headers = lines[0].split(',');
          
          data = lines.slice(1).filter(line => line.trim()).map(line => {
            const values = line.split(',');
            const item: any = {};
            
            headers.forEach((header, index) => {
              // Проверка на пустое значение
              if (values[index] !== undefined) {
                let value = values[index];
                
                // Обработка строк в кавычках
                if (value.startsWith('"') && value.endsWith('"')) {
                  value = value.substring(1, value.length - 1).replace(/""/g, '"');
                }
                
                // Попытка преобразовать числа
                const num = Number(value);
                item[header] = !isNaN(num) && value !== '' ? num : value;
              }
            });
            
            return item;
          });
        } else if (importFormat === 'json') {
          // Обработка JSON
          data = JSON.parse(content);
        }
        
        setImportPreview(data.slice(0, 5)); // Показываем только первые 5 записей для предпросмотра
        toast({
          title: 'Файл успешно загружен',
          description: `Загружено ${data.length} записей`,
        });
      } catch (error) {
        console.error('Ошибка при обработке файла:', error);
        toast({
          title: 'Ошибка при обработке файла',
          description: 'Пожалуйста, проверьте формат файла и попробуйте снова',
          variant: 'destructive',
        });
      }
    };
    
    reader.onerror = () => {
      toast({
        title: 'Ошибка при чтении файла',
        description: 'Не удалось прочитать файл',
        variant: 'destructive',
      });
    };
    
    reader.readAsText(file);
  };
  
  // Мутация для импорта данных в базу
  const importMutation = useMutation({
    mutationFn: async (data: any[]) => {
      const endpoint = activeTab === 'products' ? '/api/admin/products/import'
               : activeTab === 'orders' ? '/api/admin/orders/import'
               : '/api/admin/users/import';
      
      return await apiRequest('POST', endpoint, data);
    },
    onSuccess: () => {
      toast({
        title: 'Импорт завершен успешно',
        description: 'Данные успешно импортированы в базу данных',
      });
      
      // Обновляем данные после импорта
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      
      // Сбрасываем состояние
      setImportFile(null);
      setImportPreview([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: any) => {
      console.error('Ошибка при импорте данных:', error);
      toast({
        title: 'Ошибка при импорте',
        description: error.message || 'Не удалось импортировать данные',
        variant: 'destructive',
      });
    },
  });
  
  // Обработка импорта
  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, выберите файл для импорта',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          let data: any[] = [];
          
          if (importFormat === 'csv') {
            // Обработка CSV
            const lines = content.split('\n');
            const headers = lines[0].split(',');
            
            data = lines.slice(1).filter(line => line.trim()).map(line => {
              const values = line.split(',');
              const item: any = {};
              
              headers.forEach((header, index) => {
                if (values[index] !== undefined) {
                  let value = values[index];
                  
                  if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1).replace(/""/g, '"');
                  }
                  
                  const num = Number(value);
                  item[header] = !isNaN(num) && value !== '' ? num : value;
                }
              });
              
              return item;
            });
          } else if (importFormat === 'json') {
            // Обработка JSON
            data = JSON.parse(content);
          }
          
          // Запускаем мутацию для импорта данных
          importMutation.mutate(data);
        } catch (error) {
          console.error('Ошибка при обработке файла:', error);
          toast({
            title: 'Ошибка при обработке файла',
            description: 'Пожалуйста, проверьте формат файла и попробуйте снова',
            variant: 'destructive',
          });
        }
      };
      
      reader.onerror = () => {
        toast({
          title: 'Ошибка при чтении файла',
          description: 'Не удалось прочитать файл',
          variant: 'destructive',
        });
      };
      
      reader.readAsText(importFile);
    } catch (error) {
      console.error('Ошибка при импорте:', error);
      toast({
        title: 'Ошибка при импорте',
        description: 'Пожалуйста, проверьте файл и попробуйте снова',
        variant: 'destructive',
      });
    }
  };
  
  const isLoading = ordersLoading || productsLoading || usersLoading || importMutation.isPending;
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6 lg:p-8 lg:ml-64">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Управление данными</h1>
          <p className="text-gray-600 mt-2">Импорт и экспорт данных вашего магазина</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 mb-6">
          {/* Блок импорта данных */}
          <Card className="shadow-md border-t-4 border-t-purple-600">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl font-bold">
                <Upload className="w-5 h-5 mr-2" />
                Импорт данных
              </CardTitle>
              <CardDescription>
                Загрузите данные из CSV или JSON файла
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                <div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="importDataType">Тип данных</Label>
                        <Select 
                          value={activeTab} 
                          onValueChange={setActiveTab}
                        >
                          <SelectTrigger id="importDataType">
                            <SelectValue placeholder="Выберите тип данных" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="orders">
                              <div className="flex items-center">
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                <span>Заказы</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="products">
                              <div className="flex items-center">
                                <Package className="mr-2 h-4 w-4" />
                                <span>Товары</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="users">
                              <div className="flex items-center">
                                <Users className="mr-2 h-4 w-4" />
                                <span>Пользователи</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="importFormat">Формат файла</Label>
                        <Select 
                          value={importFormat} 
                          onValueChange={setImportFormat}
                        >
                          <SelectTrigger id="importFormat">
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
                    </div>
                    
                    <div>
                      <Label htmlFor="importFile">Выберите файл</Label>
                      <div className="flex items-center mt-1.5 flex-col sm:flex-row space-y-2 sm:space-y-0">
                        <Input 
                          ref={fileInputRef}
                          id="importFile" 
                          type="file" 
                          accept={importFormat === 'csv' ? '.csv' : '.json'} 
                          onChange={handleFileChange}
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleImport} 
                          disabled={!importFile || importMutation.isPending}
                          className="w-full sm:w-auto sm:ml-2 bg-purple-600 hover:bg-purple-700 text-lg font-medium py-5 px-8"
                        >
                          {importMutation.isPending ? (
                            <>
                              <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                              Импорт...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-5 w-5" />
                              ИМПОРТИРОВАТЬ
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {importPreview.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Предпросмотр импорта (первые 5 записей):</h3>
                        <div className="overflow-auto max-h-[300px] bg-white rounded border">
                          <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                {Object.keys(importPreview[0]).map((header) => (
                                  <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {importPreview.map((item, index) => (
                                <tr key={index}>
                                  {Object.values(item).map((value: any, i) => (
                                    <td key={i} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">Инструкции:</h3>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li className="flex">
                      <span className="mr-2">1.</span>
                      <span>Выберите тип данных (заказы, товары или пользователи)</span>
                    </li>
                    <li className="flex">
                      <span className="mr-2">2.</span>
                      <span>Выберите формат файла (CSV или JSON)</span>
                    </li>
                    <li className="flex">
                      <span className="mr-2">3.</span>
                      <span>Загрузите файл с данными</span>
                    </li>
                    <li className="flex">
                      <span className="mr-2">4.</span>
                      <span>Проверьте предпросмотр данных и нажмите "Импортировать"</span>
                    </li>
                  </ul>
                  
                  <div className="mt-4">
                    <Alert className="bg-blue-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Структура данных</AlertTitle>
                      <AlertDescription>
                        Убедитесь, что структура данных в файле соответствует структуре базы данных
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Блок экспорта данных */}
          <Card className="shadow-md border-t-4 border-t-blue-600">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl font-bold">
                <DownloadCloud className="w-5 h-5 mr-2" />
                Экспорт данных
              </CardTitle>
              <CardDescription>
                Экспортируйте данные для аналитики и отчетов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                <div>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="orders" className="flex items-center">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span>Заказы</span>
                      </TabsTrigger>
                      <TabsTrigger value="products" className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Товары</span>
                      </TabsTrigger>
                      <TabsTrigger value="users" className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Пользователи</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <div className="bg-gray-50 p-4 rounded-lg min-h-[300px] mt-4 mb-4">
                      {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent">
                            <span className="sr-only">Загрузка...</span>
                          </div>
                          <p className="ml-3">Загрузка данных...</p>
                        </div>
                      ) : (
                        <>
                          {activeTab === 'orders' && (
                            <>
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
                                            {new Date(order.createdAt).toLocaleDateString()}
                                          </td>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {typeof order.totalAmount === 'string' 
                                              ? formatPrice(parseFloat(order.totalAmount))
                                              : formatPrice(order.totalAmount)}
                                          </td>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                              'bg-yellow-100 text-yellow-800'
                                            }`}>
                                              {order.status === 'completed' && 'Завершен'}
                                              {order.status === 'processing' && 'В обработке'}
                                              {order.status === 'cancelled' && 'Отменен'}
                                              {order.status === 'pending' && 'Ожидает'}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-center py-10">
                                  <p className="text-gray-500">Нет данных для отображения</p>
                                </div>
                              )}
                            </>
                          )}
                          
                          {activeTab === 'products' && (
                            <>
                              {Array.isArray(products) && products.length > 0 ? (
                                <div className="overflow-auto max-h-[400px]">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {products.slice(0, 10).map((product: any) => (
                                        <tr key={product.id}>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">#{product.id}</td>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {typeof product.basePrice === 'string' 
                                              ? formatPrice(parseFloat(product.basePrice))
                                              : formatPrice(product.basePrice)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-center py-10">
                                  <p className="text-gray-500">Нет данных для отображения</p>
                                </div>
                              )}
                            </>
                          )}
                          
                          {activeTab === 'users' && (
                            <>
                              {Array.isArray(users) && users.length > 0 ? (
                                <div className="overflow-auto max-h-[400px]">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя пользователя</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {users.slice(0, 10).map((user: any) => (
                                        <tr key={user.id}>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">#{user.id}</td>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                              user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                              {user.isAdmin ? 'Администратор' : 'Пользователь'}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-center py-10">
                                  <p className="text-gray-500">Нет данных для отображения</p>
                                </div>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </Tabs>
                  
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    {/* Фильтры для экспорта */}
                    {activeTab === 'orders' && (
                      <div className="space-y-1 w-full md:w-auto">
                        <Label htmlFor="date-range">Диапазон дат</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="date-range"
                              variant="outline"
                              className="w-full justify-start text-left font-normal h-10"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.from ? (
                                dateRange.to ? (
                                  <>
                                    {format(dateRange.from, 'dd.MM.yyyy')} - {format(dateRange.to, 'dd.MM.yyyy')}
                                  </>
                                ) : (
                                  format(dateRange.from, 'dd.MM.yyyy')
                                )
                              ) : (
                                <span>Выберите даты</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="range"
                              selected={dateRange}
                              onSelect={(range) => setDateRange(range as any)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                    
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                      <div className="space-y-1 w-full md:w-auto">
                        <Label htmlFor="export-format">Формат экспорта</Label>
                        <Select value={exportFormat} onValueChange={setExportFormat}>
                          <SelectTrigger id="export-format" className="w-full md:w-[180px]">
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
                      <Button 
                        onClick={handleExport} 
                        className="mt-auto w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-lg py-5 px-8"
                      >
                        <DownloadCloud className="mr-2 h-5 w-5" />
                        ЭКСПОРТИРОВАТЬ
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">Инструкции:</h3>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li className="flex">
                      <span className="mr-2">1.</span>
                      <span>Выберите тип данных для экспорта</span>
                    </li>
                    <li className="flex">
                      <span className="mr-2">2.</span>
                      <span>Примените необходимые фильтры</span>
                    </li>
                    <li className="flex">
                      <span className="mr-2">3.</span>
                      <span>Выберите формат экспорта (CSV или JSON)</span>
                    </li>
                    <li className="flex">
                      <span className="mr-2">4.</span>
                      <span>Нажмите кнопку "Экспортировать"</span>
                    </li>
                  </ul>
                  
                  <div className="mt-4">
                    <Alert className="bg-amber-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Примечание</AlertTitle>
                      <AlertDescription>
                        Экспортируются только первые 1000 записей. Используйте фильтры для более точных результатов.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}