import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  User,
  ArrowUpDown, 
  Pencil, 
  Trash2,
  Shield,
  CalendarDays,
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

// User interface
interface UserData {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  isAdmin: boolean;
  createdAt: Date;
  lastLogin?: Date;
  ordersCount?: number;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userEdits, setUserEdits] = useState<Partial<UserData>>({});
  
  // Fetch users
  const { data: users = [], isLoading, error } = useQuery<UserData[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/users');
        const data = response as any;
        return data as UserData[];
      } catch (error) {
        // В реальном приложении здесь будет API
        // Для демонстрации используем мок-данные
        const mockUsers: UserData[] = [
          {
            id: 1,
            username: 'admin',
            email: 'admin@matrasov.ru',
            firstName: 'Админ',
            lastName: 'Администраторов',
            phone: '+7 900 123-45-67',
            address: null,
            isAdmin: true,
            createdAt: new Date('2023-01-15'),
            lastLogin: new Date('2023-08-28'),
            ordersCount: 0
          },
          {
            id: 2,
            username: 'ivan',
            email: 'ivan@example.com',
            firstName: 'Иван',
            lastName: 'Иванов',
            phone: '+7 900 111-22-33',
            address: 'г. Москва, ул. Примерная, д. 1, кв. 123',
            isAdmin: false,
            createdAt: new Date('2023-03-10'),
            lastLogin: new Date('2023-08-25'),
            ordersCount: 3
          },
          {
            id: 3,
            username: 'anna',
            email: 'anna@example.com',
            firstName: 'Анна',
            lastName: 'Петрова',
            phone: '+7 900 444-55-66',
            address: 'г. Санкт-Петербург, ул. Тестовая, д. 5, кв. 42',
            isAdmin: false,
            createdAt: new Date('2023-04-20'),
            lastLogin: new Date('2023-08-20'),
            ordersCount: 1
          },
          {
            id: 4,
            username: 'mikhail',
            email: 'mikhail@example.com',
            firstName: 'Михаил',
            lastName: 'Сидоров',
            phone: '+7 900 777-88-99',
            address: 'г. Екатеринбург, ул. Образцовая, д. 10, кв. 15',
            isAdmin: false,
            createdAt: new Date('2023-05-05'),
            lastLogin: new Date('2023-08-15'),
            ordersCount: 2
          },
          {
            id: 5,
            username: 'elena',
            email: 'elena@example.com',
            firstName: 'Елена',
            lastName: 'Смирнова',
            phone: '+7 900 222-33-44',
            address: 'г. Новосибирск, ул. Пример, д. 7, кв. 33',
            isAdmin: false,
            createdAt: new Date('2023-06-12'),
            lastLogin: undefined,
            ordersCount: 0
          }
        ];
        return mockUsers;
      }
    },
  });
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: { id: number; updates: Partial<UserData> }) => {
      return apiRequest('PATCH', `/api/admin/users/${userData.id}`, userData.updates);
    },
    onSuccess: () => {
      toast({
        title: 'Успех',
        description: 'Данные пользователя успешно обновлены',
      });
      
      // Close dialog and invalidate users query
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить данные пользователя',
        variant: 'destructive',
      });
    },
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Успех',
        description: 'Пользователь успешно удален',
      });
      
      // Close dialog and invalidate users query
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить пользователя',
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
  
  // Filter and sort users
  const filteredAndSortedUsers = users 
    ? [...users]
        .filter(user => 
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.phone && user.phone.includes(searchTerm))
        )
        .sort((a, b) => {
          let aValue: any = a[sortField as keyof UserData] ?? '';
          let bValue: any = b[sortField as keyof UserData] ?? '';
          
          if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        })
    : [];
  
  // Edit user
  const editUser = (user: UserData) => {
    setSelectedUser(user);
    setUserEdits({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      isAdmin: user.isAdmin
    });
    setIsEditDialogOpen(true);
  };
  
  // Delete user
  const confirmDeleteUser = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle user update
  const handleUpdateUser = async () => {
    if (selectedUser && Object.keys(userEdits).length > 0) {
      updateUserMutation.mutate({ 
        id: selectedUser.id, 
        updates: userEdits
      });
    }
  };
  
  // Handle user delete
  const handleDeleteUser = async () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6 lg:p-8 lg:ml-64">
        <h1 className="text-3xl font-bold mb-6">Управление пользователями</h1>
        
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle>Поиск пользователей</CardTitle>
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
        
        {/* Users table */}
        {isLoading ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent">
              <span className="sr-only">Загрузка...</span>
            </div>
            <p className="mt-4 text-gray-500">Загрузка пользователей...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-600">Произошла ошибка при загрузке пользователей. Пожалуйста, попробуйте позже.</p>
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
                        ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('username')}
                      >
                        Пользователь
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Контактная информация</TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('createdAt')}
                      >
                        Регистрация
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Заказы</TableHead>
                    <TableHead className="text-center">Роль</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.length > 0 ? (
                    filteredAndSortedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{user.username}</div>
                          {user.firstName && user.lastName && (
                            <div className="text-sm text-gray-600">
                              {user.firstName} {user.lastName}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center mb-1">
                              <Mail className="h-3 w-3 mr-2 text-gray-400" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center mb-1">
                                <Phone className="h-3 w-3 mr-2 text-gray-400" />
                                {user.phone}
                              </div>
                            )}
                            {user.address && (
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-2 text-gray-400" />
                                <span className="truncate max-w-[200px]">{user.address}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <CalendarDays className="h-4 w-4 mr-2 text-gray-400" />
                            {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                          </div>
                          {user.lastLogin && (
                            <div className="text-xs text-gray-500 mt-1">
                              Последний вход: {new Date(user.lastLogin).toLocaleDateString('ru-RU')}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <ShoppingBag className="h-4 w-4 mr-2 text-gray-400" />
                            {user.ordersCount || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {user.isAdmin ? (
                            <Badge className="bg-primary text-white">
                              <Shield className="h-3 w-3 mr-1" />
                              Админ
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50">
                              <User className="h-3 w-3 mr-1" />
                              Клиент
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => editUser(user)}
                              title="Редактировать"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => confirmDeleteUser(user)}
                              title="Удалить"
                              disabled={user.isAdmin && user.username === 'admin'} // Запрещаем удаление основного админа
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
                        {searchTerm ? 'Пользователи не найдены. Попробуйте изменить параметры поиска.' : 'Пользователи не найдены.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
      
      {/* Edit user dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редактирование пользователя</DialogTitle>
            <DialogDescription>
              {selectedUser ? `@${selectedUser.username} (ID: ${selectedUser.id})` : ''}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firstName" className="text-right">
                  Имя
                </Label>
                <Input
                  id="firstName"
                  value={userEdits.firstName || ''}
                  onChange={(e) => setUserEdits({...userEdits, firstName: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastName" className="text-right">
                  Фамилия
                </Label>
                <Input
                  id="lastName"
                  value={userEdits.lastName || ''}
                  onChange={(e) => setUserEdits({...userEdits, lastName: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userEdits.email || ''}
                  onChange={(e) => setUserEdits({...userEdits, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Телефон
                </Label>
                <Input
                  id="phone"
                  value={userEdits.phone || ''}
                  onChange={(e) => setUserEdits({...userEdits, phone: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Адрес
                </Label>
                <Input
                  id="address"
                  value={userEdits.address || ''}
                  onChange={(e) => setUserEdits({...userEdits, address: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isAdmin" className="text-right">
                  Админ
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="isAdmin"
                    checked={userEdits.isAdmin}
                    onCheckedChange={(checked) => setUserEdits({...userEdits, isAdmin: checked})}
                    disabled={selectedUser.username === 'admin'} // Запрещаем менять роль основного админа
                  />
                  <Label htmlFor="isAdmin" className="text-sm text-gray-500">
                    {userEdits.isAdmin ? 'Да' : 'Нет'}
                  </Label>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleUpdateUser}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы собираетесь удалить пользователя "{selectedUser?.username}". 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
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