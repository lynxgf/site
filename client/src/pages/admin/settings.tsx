import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import AdminSidebar from '@/components/admin/sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Store, 
  Truck, 
  CreditCard, 
  Mail, 
  MessageSquare, 
  PhoneCall,
  Save,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Smartphone
} from 'lucide-react';

// Interface for shop settings
interface ShopSettings {
  // General settings
  shopName: string;
  shopDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  workingHours: string;
  
  // Social media
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  
  // Delivery settings
  enableFreeDelivery: boolean;
  freeDeliveryThreshold: number;
  deliveryPriceLocal: number;
  deliveryPriceRegional: number;
  
  // Payment settings
  enableCashPayment: boolean;
  enableCardPayment: boolean;
  enableOnlinePayment: boolean;
  
  // Email notifications
  sendOrderConfirmation: boolean;
  sendOrderStatusUpdates: boolean;
  sendOrderShipped: boolean;
  
  // SMS notifications
  enableSmsNotifications: boolean;
  smsOrderConfirmation: boolean;
  smsOrderStatusUpdate: boolean;
}

export default function AdminSettings() {
  const { toast } = useToast();
  
  // Fetch settings
  const { data: settings, isLoading } = useQuery<ShopSettings>({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/settings');
        return response as ShopSettings;
      } catch (error) {
        // Для демонстрации используем мок-данные
        return {
          // General settings
          shopName: 'Матрасовъ',
          shopDescription: 'Магазин высококачественных матрасов и кроватей',
          contactEmail: 'info@матрасовъ.рф',
          contactPhone: '+7 (495) 123-45-67',
          address: 'г. Москва, ул. Матрасная, д. 1',
          workingHours: 'ПН-ВС: 10:00 - 20:00',
          
          // Social media
          instagramUrl: 'https://instagram.com/matrasov',
          facebookUrl: 'https://facebook.com/matrasov',
          twitterUrl: '',
          
          // Delivery settings
          enableFreeDelivery: true,
          freeDeliveryThreshold: 20000,
          deliveryPriceLocal: 1000,
          deliveryPriceRegional: 3000,
          
          // Payment settings
          enableCashPayment: true,
          enableCardPayment: true,
          enableOnlinePayment: true,
          
          // Email notifications
          sendOrderConfirmation: true,
          sendOrderStatusUpdates: true,
          sendOrderShipped: true,
          
          // SMS notifications
          enableSmsNotifications: true,
          smsOrderConfirmation: true,
          smsOrderStatusUpdate: false,
        };
      }
    },
  });
  
  // State for form values
  const [formValues, setFormValues] = useState<ShopSettings>({
    // Initialize with empty values
    shopName: '',
    shopDescription: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    workingHours: '',
    instagramUrl: '',
    facebookUrl: '',
    twitterUrl: '',
    enableFreeDelivery: false,
    freeDeliveryThreshold: 0,
    deliveryPriceLocal: 0,
    deliveryPriceRegional: 0,
    enableCashPayment: false,
    enableCardPayment: false,
    enableOnlinePayment: false,
    sendOrderConfirmation: false,
    sendOrderStatusUpdates: false,
    sendOrderShipped: false,
    enableSmsNotifications: false,
    smsOrderConfirmation: false,
    smsOrderStatusUpdate: false,
  });
  
  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormValues(settings);
    }
  }, [settings]);
  
  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: ShopSettings) => {
      return apiRequest('PUT', '/api/admin/settings', newSettings);
    },
    onSuccess: () => {
      toast({
        title: 'Успех',
        description: 'Настройки магазина успешно обновлены',
      });
      
      // Invalidate settings query
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить настройки магазина',
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    updateSettingsMutation.mutate(formValues);
  };
  
  // Handle input change
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle number input change
  const handleNumberInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setFormValues(prev => ({ ...prev, [name]: Number(value) }));
  };
  
  // Handle switch change
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormValues(prev => ({ ...prev, [name]: checked }));
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-8 lg:ml-64">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent">
              <span className="sr-only">Загрузка...</span>
            </div>
            <p className="mt-4 text-gray-500">Загрузка настроек...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6 lg:p-8 lg:ml-64">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Настройки магазина</h1>
          <p className="text-gray-600 mt-2">Управление общими настройками вашего магазина</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="general" className="px-4 py-2">
                <Store className="h-4 w-4 mr-2" />
                Общие настройки
              </TabsTrigger>
              <TabsTrigger value="delivery" className="px-4 py-2">
                <Truck className="h-4 w-4 mr-2" />
                Доставка
              </TabsTrigger>
              <TabsTrigger value="payment" className="px-4 py-2">
                <CreditCard className="h-4 w-4 mr-2" />
                Оплата
              </TabsTrigger>
              <TabsTrigger value="notifications" className="px-4 py-2">
                <Mail className="h-4 w-4 mr-2" />
                Уведомления
              </TabsTrigger>
            </TabsList>
            
            {/* General Settings */}
            <TabsContent value="general">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Информация о магазине</CardTitle>
                    <CardDescription>
                      Основная информация о вашем магазине, которая отображается на сайте
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="shopName">Название магазина</Label>
                      <Input
                        id="shopName"
                        name="shopName"
                        value={formValues.shopName}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shopDescription">Описание магазина</Label>
                      <Textarea
                        id="shopDescription"
                        name="shopDescription"
                        value={formValues.shopDescription}
                        onChange={handleInputChange}
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Контактная информация</CardTitle>
                    <CardDescription>
                      Контактные данные для связи с вашим магазином
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email</Label>
                      <div className="flex">
                        <Mail className="h-4 w-4 mr-2 mt-3 text-gray-400" />
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          type="email"
                          value={formValues.contactEmail}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Телефон</Label>
                      <div className="flex">
                        <PhoneCall className="h-4 w-4 mr-2 mt-3 text-gray-400" />
                        <Input
                          id="contactPhone"
                          name="contactPhone"
                          value={formValues.contactPhone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Адрес</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formValues.address}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="workingHours">Часы работы</Label>
                      <Input
                        id="workingHours"
                        name="workingHours"
                        value={formValues.workingHours}
                        onChange={handleInputChange}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Социальные сети</CardTitle>
                    <CardDescription>
                      Ссылки на ваши страницы в социальных сетях
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="instagramUrl">Instagram</Label>
                        <div className="flex">
                          <Instagram className="h-4 w-4 mr-2 mt-3 text-gray-400" />
                          <Input
                            id="instagramUrl"
                            name="instagramUrl"
                            value={formValues.instagramUrl}
                            onChange={handleInputChange}
                            placeholder="URL профиля Instagram"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="facebookUrl">Facebook</Label>
                        <div className="flex">
                          <Facebook className="h-4 w-4 mr-2 mt-3 text-gray-400" />
                          <Input
                            id="facebookUrl"
                            name="facebookUrl"
                            value={formValues.facebookUrl}
                            onChange={handleInputChange}
                            placeholder="URL страницы Facebook"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="twitterUrl">Twitter</Label>
                        <div className="flex">
                          <Twitter className="h-4 w-4 mr-2 mt-3 text-gray-400" />
                          <Input
                            id="twitterUrl"
                            name="twitterUrl"
                            value={formValues.twitterUrl}
                            onChange={handleInputChange}
                            placeholder="URL профиля Twitter"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Delivery Settings */}
            <TabsContent value="delivery">
              <Card>
                <CardHeader>
                  <CardTitle>Настройки доставки</CardTitle>
                  <CardDescription>
                    Настройки условий доставки товаров
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="enableFreeDelivery" className="text-base">Бесплатная доставка</Label>
                      <p className="text-sm text-gray-500">
                        Включить бесплатную доставку при достижении пороговой суммы заказа
                      </p>
                    </div>
                    <Switch
                      id="enableFreeDelivery"
                      checked={formValues.enableFreeDelivery}
                      onCheckedChange={(checked) => handleSwitchChange('enableFreeDelivery', checked)}
                    />
                  </div>
                  
                  {formValues.enableFreeDelivery && (
                    <div className="space-y-2">
                      <Label htmlFor="freeDeliveryThreshold">Минимальная сумма для бесплатной доставки (₽)</Label>
                      <Input
                        id="freeDeliveryThreshold"
                        name="freeDeliveryThreshold"
                        type="number"
                        min="0"
                        value={formValues.freeDeliveryThreshold}
                        onChange={handleNumberInputChange}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="deliveryPriceLocal">Стоимость доставки по городу (₽)</Label>
                    <Input
                      id="deliveryPriceLocal"
                      name="deliveryPriceLocal"
                      type="number"
                      min="0"
                      value={formValues.deliveryPriceLocal}
                      onChange={handleNumberInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deliveryPriceRegional">Стоимость доставки по области (₽)</Label>
                    <Input
                      id="deliveryPriceRegional"
                      name="deliveryPriceRegional"
                      type="number"
                      min="0"
                      value={formValues.deliveryPriceRegional}
                      onChange={handleNumberInputChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Payment Settings */}
            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>Способы оплаты</CardTitle>
                  <CardDescription>
                    Настройка доступных способов оплаты
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="enableCashPayment" className="text-base">Оплата наличными</Label>
                      <p className="text-sm text-gray-500">
                        Разрешить оплату наличными при доставке
                      </p>
                    </div>
                    <Switch
                      id="enableCashPayment"
                      checked={formValues.enableCashPayment}
                      onCheckedChange={(checked) => handleSwitchChange('enableCashPayment', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="enableCardPayment" className="text-base">Оплата картой при получении</Label>
                      <p className="text-sm text-gray-500">
                        Разрешить оплату банковской картой при доставке
                      </p>
                    </div>
                    <Switch
                      id="enableCardPayment"
                      checked={formValues.enableCardPayment}
                      onCheckedChange={(checked) => handleSwitchChange('enableCardPayment', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="enableOnlinePayment" className="text-base">Онлайн-оплата</Label>
                      <p className="text-sm text-gray-500">
                        Разрешить онлайн-оплату заказа на сайте
                      </p>
                    </div>
                    <Switch
                      id="enableOnlinePayment"
                      checked={formValues.enableOnlinePayment}
                      onCheckedChange={(checked) => handleSwitchChange('enableOnlinePayment', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Notification Settings */}
            <TabsContent value="notifications">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Email-уведомления</CardTitle>
                    <CardDescription>
                      Настройка автоматических email-уведомлений
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="sendOrderConfirmation" className="text-base">Подтверждение заказа</Label>
                        <p className="text-sm text-gray-500">
                          Отправлять email-уведомление при оформлении заказа
                        </p>
                      </div>
                      <Switch
                        id="sendOrderConfirmation"
                        checked={formValues.sendOrderConfirmation}
                        onCheckedChange={(checked) => handleSwitchChange('sendOrderConfirmation', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="sendOrderStatusUpdates" className="text-base">Обновление статуса</Label>
                        <p className="text-sm text-gray-500">
                          Отправлять email-уведомление при изменении статуса заказа
                        </p>
                      </div>
                      <Switch
                        id="sendOrderStatusUpdates"
                        checked={formValues.sendOrderStatusUpdates}
                        onCheckedChange={(checked) => handleSwitchChange('sendOrderStatusUpdates', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="sendOrderShipped" className="text-base">Отправка заказа</Label>
                        <p className="text-sm text-gray-500">
                          Отправлять email-уведомление при отправке заказа
                        </p>
                      </div>
                      <Switch
                        id="sendOrderShipped"
                        checked={formValues.sendOrderShipped}
                        onCheckedChange={(checked) => handleSwitchChange('sendOrderShipped', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>SMS-уведомления</CardTitle>
                    <CardDescription>
                      Настройка автоматических SMS-уведомлений
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="enableSmsNotifications" className="text-base">Включить SMS-уведомления</Label>
                        <p className="text-sm text-gray-500">
                          Разрешить отправку SMS-уведомлений клиентам
                        </p>
                      </div>
                      <Switch
                        id="enableSmsNotifications"
                        checked={formValues.enableSmsNotifications}
                        onCheckedChange={(checked) => handleSwitchChange('enableSmsNotifications', checked)}
                      />
                    </div>
                    
                    {formValues.enableSmsNotifications && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="smsOrderConfirmation" className="text-base">Подтверждение заказа</Label>
                            <p className="text-sm text-gray-500">
                              Отправлять SMS при оформлении заказа
                            </p>
                          </div>
                          <Switch
                            id="smsOrderConfirmation"
                            checked={formValues.smsOrderConfirmation}
                            onCheckedChange={(checked) => handleSwitchChange('smsOrderConfirmation', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="smsOrderStatusUpdate" className="text-base">Обновление статуса</Label>
                            <p className="text-sm text-gray-500">
                              Отправлять SMS при изменении статуса заказа
                            </p>
                          </div>
                          <Switch
                            id="smsOrderStatusUpdate"
                            checked={formValues.smsOrderStatusUpdate}
                            onCheckedChange={(checked) => handleSwitchChange('smsOrderStatusUpdate', checked)}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end">
            <Button 
              type="submit"
              className="px-6"
              disabled={updateSettingsMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateSettingsMutation.isPending ? 'Сохранение...' : 'Сохранить настройки'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}