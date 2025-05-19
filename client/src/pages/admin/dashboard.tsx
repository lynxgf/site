import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Product, Order } from '@shared/schema';
import AdminSidebar from '@/components/admin/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Chart,
  ChartContainer,
  ChartLegend,
  ChartLegendItem,
  ChartTooltip,
  ChartTooltipContent,
  ChartTooltipItem,
} from '@/components/ui/chart';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart, Package, Users, CreditCard } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

export default function AdminDashboard() {
  // Mock data for dashboard stats (would come from API in real implementation)
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  
  // Fetch products
  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Fetch orders (mock data for now, would use real endpoint in production)
  const { data: orders } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    queryFn: async () => {
      // Mock order data until endpoint is implemented
      return [
        {
          id: 1,
          sessionId: '123',
          customerName: 'Иван Иванов',
          customerEmail: 'ivan@example.com',
          customerPhone: '+7 900 123-45-67',
          address: 'г. Москва, ул. Примерная, д. 1, кв. 123',
          totalAmount: '52400',
          status: 'completed',
          createdAt: new Date('2023-05-15')
        },
        {
          id: 2,
          sessionId: '456',
          customerName: 'Анна Петрова',
          customerEmail: 'anna@example.com',
          customerPhone: '+7 900 987-65-43',
          address: 'г. Санкт-Петербург, ул. Тестовая, д. 5, кв. 42',
          totalAmount: '41900',
          status: 'processing',
          createdAt: new Date('2023-05-20')
        },
        {
          id: 3,
          sessionId: '789',
          customerName: 'Сергей Смирнов',
          customerEmail: 'sergey@example.com',
          customerPhone: '+7 900 111-22-33',
          address: 'г. Екатеринбург, ул. Образцовая, д. 10, кв. 15',
          totalAmount: '28900',
          status: 'pending',
          createdAt: new Date('2023-05-25')
        }
      ];
    },
  });
  
  // Update stats when data is loaded
  useEffect(() => {
    if (products && orders) {
      setStats({
        totalSales: orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: new Set(orders.map(order => order.sessionId)).size,
      });
    }
  }, [products, orders]);
  
  // Prepare data for category distribution chart
  const categoryData = {
    labels: ['Кровати', 'Матрасы'],
    datasets: [
      {
        label: 'Количество товаров',
        data: [
          products?.filter(p => p.category === 'bed').length || 0,
          products?.filter(p => p.category === 'mattress').length || 0,
        ],
        backgroundColor: [
          'hsl(var(--chart-1))',
          'hsl(var(--chart-2))',
        ],
        borderColor: [
          'hsl(var(--chart-1))',
          'hsl(var(--chart-2))',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare data for order status chart
  const orderStatusData = {
    labels: ['Ожидает', 'В обработке', 'Выполнен'],
    datasets: [
      {
        label: 'Статус заказов',
        data: [
          orders?.filter(o => o.status === 'pending').length || 0,
          orders?.filter(o => o.status === 'processing').length || 0,
          orders?.filter(o => o.status === 'completed').length || 0,
        ],
        backgroundColor: [
          'hsl(var(--chart-3))',
          'hsl(var(--chart-1))',
          'hsl(var(--chart-2))',
        ],
        borderColor: [
          'hsl(var(--chart-3))',
          'hsl(var(--chart-1))',
          'hsl(var(--chart-2))',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6 lg:p-8 lg:ml-64">
        <h1 className="text-3xl font-bold mb-6">Панель управления</h1>
        
        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="mr-4 bg-primary-100 p-3 rounded-full">
                  <CreditCard className="h-8 w-8 text-primary-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Продажи</p>
                  <h3 className="text-2xl font-bold">{formatPrice(stats.totalSales)} ₽</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="mr-4 bg-green-100 p-3 rounded-full">
                  <ShoppingCart className="h-8 w-8 text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Заказы</p>
                  <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="mr-4 bg-blue-100 p-3 rounded-full">
                  <Package className="h-8 w-8 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Товары</p>
                  <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="mr-4 bg-purple-100 p-3 rounded-full">
                  <Users className="h-8 w-8 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Клиенты</p>
                  <h3 className="text-2xl font-bold">{stats.totalCustomers}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Распределение товаров</CardTitle>
              <CardDescription>Количество товаров по категориям</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <Pie data={categoryData} options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    }
                  }
                }} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Статусы заказов</CardTitle>
              <CardDescription>Распределение заказов по статусам</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <Pie data={orderStatusData} options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    }
                  }
                }} />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent orders */}
        <Card>
          <CardHeader>
            <CardTitle>Последние заказы</CardTitle>
            <CardDescription>Недавно размещенные заказы</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">№</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Клиент</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Дата</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Сумма</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders?.slice(0, 5).map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3">#{order.id}</td>
                      <td className="px-4 py-3">{order.customerName}</td>
                      <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                      <td className="px-4 py-3">{formatPrice(Number(order.totalAmount))} ₽</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status === 'completed' ? 'Выполнен' :
                           order.status === 'processing' ? 'В обработке' :
                           'Ожидает'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  
                  {(!orders || orders.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                        Заказы отсутствуют
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
