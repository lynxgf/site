import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from '@/components/admin/sidebar';
import { ShopSettings, useSettingsStore } from '@/lib/store';

export default function AdminSettings() {
  const { toast } = useToast();
  const { settings, isLoading, error, fetchSettings, updateSettings } = useSettingsStore();
  const [formValues, setFormValues] = useState<ShopSettings | null>(null);
  
  // Загружаем настройки при монтировании компонента
  useEffect(() => {
    async function loadSettings() {
      await fetchSettings();
    }
    loadSettings();
  }, [fetchSettings]);
  
  // Обновляем форму когда настройки загружены
  useEffect(() => {
    if (settings) {
      setFormValues(settings);
    }
  }, [settings]);
  
  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formValues) return;
    
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };
  
  // Обработчик изменения переключателей
  const handleSwitchChange = (name: string, checked: boolean) => {
    if (!formValues) return;
    
    setFormValues({
      ...formValues,
      [name]: checked,
    });
  };
  
  // Обработчик изменения числовых полей
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formValues) return;
    
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: parseInt(value, 10),
    });
  };
  
  // Сохранение настроек
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formValues) return;
    
    try {
      const success = await updateSettings(formValues);
      
      if (success) {
        toast({
          title: "Настройки обновлены",
          description: "Настройки магазина успешно сохранены",
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось сохранить настройки",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при сохранении настроек",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading || !formValues) {
    return (
      <div className="flex min-h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">Настройки магазина</h1>
            <div className="flex items-center justify-center h-40">
              <p>Загрузка настроек...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-6">Настройки магазина</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-4 mb-6 rounded">
              {error}
            </div>
          )}
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general">
            <TabsList className="mb-6">
              <TabsTrigger value="general">Общие настройки</TabsTrigger>
              <TabsTrigger value="delivery">Доставка</TabsTrigger>
              <TabsTrigger value="payment">Оплата</TabsTrigger>
              <TabsTrigger value="notifications">Уведомления</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Информация о магазине</CardTitle>
                    <CardDescription>
                      Основная информация о вашем магазине, которая отображается на сайте
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="shopName">Название магазина</Label>
                        <Input 
                          id="shopName" 
                          name="shopName" 
                          value={formValues.shopName} 
                          onChange={handleChange} 
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="shopDescription">Описание магазина</Label>
                        <Textarea 
                          id="shopDescription" 
                          name="shopDescription" 
                          value={formValues.shopDescription} 
                          onChange={handleChange} 
                          rows={3}
                        />
                      </div>
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
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="contactEmail">Email</Label>
                        <Input 
                          id="contactEmail" 
                          name="contactEmail" 
                          value={formValues.contactEmail} 
                          onChange={handleChange} 
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="contactPhone">Телефон</Label>
                        <Input 
                          id="contactPhone" 
                          name="contactPhone" 
                          value={formValues.contactPhone} 
                          onChange={handleChange} 
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="address">Адрес</Label>
                        <Input 
                          id="address" 
                          name="address" 
                          value={formValues.address} 
                          onChange={handleChange} 
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="workingHours">Часы работы</Label>
                        <Input 
                          id="workingHours" 
                          name="workingHours" 
                          value={formValues.workingHours} 
                          onChange={handleChange} 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Социальные сети</CardTitle>
                    <CardDescription>
                      Ссылки на ваши страницы в социальных сетях
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="instagramUrl">Instagram</Label>
                        <Input 
                          id="instagramUrl" 
                          name="instagramUrl" 
                          value={formValues.instagramUrl} 
                          onChange={handleChange} 
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="facebookUrl">Facebook</Label>
                        <Input 
                          id="facebookUrl" 
                          name="facebookUrl" 
                          value={formValues.facebookUrl} 
                          onChange={handleChange} 
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="twitterUrl">Twitter</Label>
                        <Input 
                          id="twitterUrl" 
                          name="twitterUrl" 
                          value={formValues.twitterUrl} 
                          onChange={handleChange} 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="delivery">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Настройки доставки</CardTitle>
                    <CardDescription>
                      Настройте параметры доставки для вашего магазина
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Бесплатная доставка</Label>
                          <p className="text-sm text-muted-foreground">
                            Включить бесплатную доставку при определенной сумме заказа
                          </p>
                        </div>
                        <Switch 
                          checked={formValues.enableFreeDelivery} 
                          onCheckedChange={(checked) => handleSwitchChange('enableFreeDelivery', checked)} 
                        />
                      </div>
                      
                      {formValues.enableFreeDelivery && (
                        <div className="grid gap-2">
                          <Label htmlFor="freeDeliveryThreshold">Сумма для бесплатной доставки (руб.)</Label>
                          <Input 
                            id="freeDeliveryThreshold" 
                            name="freeDeliveryThreshold" 
                            type="number" 
                            value={formValues.freeDeliveryThreshold} 
                            onChange={handleNumberChange} 
                          />
                        </div>
                      )}
                      
                      <div className="grid gap-2">
                        <Label htmlFor="deliveryPriceLocal">Стоимость доставки по городу (руб.)</Label>
                        <Input 
                          id="deliveryPriceLocal" 
                          name="deliveryPriceLocal" 
                          type="number" 
                          value={formValues.deliveryPriceLocal} 
                          onChange={handleNumberChange} 
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="deliveryPriceRegional">Стоимость доставки по региону (руб.)</Label>
                        <Input 
                          id="deliveryPriceRegional" 
                          name="deliveryPriceRegional" 
                          type="number" 
                          value={formValues.deliveryPriceRegional} 
                          onChange={handleNumberChange} 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="payment">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Способы оплаты</CardTitle>
                    <CardDescription>
                      Настройте доступные способы оплаты
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Оплата наличными</Label>
                          <p className="text-sm text-muted-foreground">
                            Разрешить оплату наличными при получении
                          </p>
                        </div>
                        <Switch 
                          checked={formValues.enableCashPayment} 
                          onCheckedChange={(checked) => handleSwitchChange('enableCashPayment', checked)} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Оплата картой</Label>
                          <p className="text-sm text-muted-foreground">
                            Разрешить оплату картой при получении
                          </p>
                        </div>
                        <Switch 
                          checked={formValues.enableCardPayment} 
                          onCheckedChange={(checked) => handleSwitchChange('enableCardPayment', checked)} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Онлайн оплата</Label>
                          <p className="text-sm text-muted-foreground">
                            Разрешить онлайн оплату на сайте
                          </p>
                        </div>
                        <Switch 
                          checked={formValues.enableOnlinePayment} 
                          onCheckedChange={(checked) => handleSwitchChange('enableOnlinePayment', checked)} 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Email уведомления</CardTitle>
                    <CardDescription>
                      Настройте email уведомления для клиентов
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Подтверждение заказа</Label>
                          <p className="text-sm text-muted-foreground">
                            Отправлять email с подтверждением заказа
                          </p>
                        </div>
                        <Switch 
                          checked={formValues.sendOrderConfirmation} 
                          onCheckedChange={(checked) => handleSwitchChange('sendOrderConfirmation', checked)} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Уведомление об отправке</Label>
                          <p className="text-sm text-muted-foreground">
                            Отправлять email когда заказ отправлен
                          </p>
                        </div>
                        <Switch 
                          checked={formValues.sendShippingNotification} 
                          onCheckedChange={(checked) => handleSwitchChange('sendShippingNotification', checked)} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Напоминания о брошенной корзине</Label>
                          <p className="text-sm text-muted-foreground">
                            Отправлять напоминания о товарах в корзине
                          </p>
                        </div>
                        <Switch 
                          checked={formValues.sendAbandonedCartReminder} 
                          onCheckedChange={(checked) => handleSwitchChange('sendAbandonedCartReminder', checked)} 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Настройки маркетинговых писем</CardTitle>
                    <CardDescription>
                      Настройте маркетинговые email-рассылки
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Рассылка новостей</Label>
                          <p className="text-sm text-muted-foreground">
                            Отправлять новости и обновления клиентам
                          </p>
                        </div>
                        <Switch 
                          checked={formValues.sendNewsletter} 
                          onCheckedChange={(checked) => handleSwitchChange('sendNewsletter', checked)} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Уведомления о скидках</Label>
                          <p className="text-sm text-muted-foreground">
                            Отправлять уведомления о скидках и акциях
                          </p>
                        </div>
                        <Switch 
                          checked={formValues.sendPromotions} 
                          onCheckedChange={(checked) => handleSwitchChange('sendPromotions', checked)} 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-end">
            <Button type="submit">Сохранить настройки</Button>
          </div>
        </form>
        </div>
      </main>
    </div>
  );
}