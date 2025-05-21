import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'wouter';
import { useEffect, useState } from 'react';
import { ShopSettings, useSettingsStore } from '@/lib/store';

export default function Footer() {
  const { settings, fetchSettings } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(true);
  
  // Загружаем настройки при монтировании и периодически обновляем их
  useEffect(() => {
    async function loadSettings() {
      await fetchSettings();
      setIsLoading(false);
    }
    
    // Загружаем настройки сразу
    loadSettings();
    
    // Создаем интервал для периодического обновления
    const intervalId = setInterval(() => {
      fetchSettings();
    }, 5000); // Проверяем обновления каждые 5 секунд (увеличено время)
    
    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(intervalId);
  }, [fetchSettings]);
  
  return (
    <footer className="bg-primary mt-auto">
      <div className="container mx-auto py-10 text-black">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Контактная информация */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-black">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone size={18} className="text-black" />
                <span className="text-black">{!isLoading && settings ? settings.contactPhone : '+7 (495) 123-45-67'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} className="text-black" />
                <span className="text-black">{!isLoading && settings ? settings.contactEmail : 'info@матрасовъ.рф'}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={18} className="text-black" />
                <span className="text-black">{!isLoading && settings ? settings.address : 'г. Москва, ул. Матрасная, д. 1'}</span>
              </li>
            </ul>
            <div className="mt-4 flex gap-4">
              {!isLoading && settings && settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-700 transition-colors">
                  <Instagram size={22} />
                </a>
              )}
              {!isLoading && settings && settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-700 transition-colors">
                  <Facebook size={22} />
                </a>
              )}
              {!isLoading && settings && settings.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-700 transition-colors">
                  <Twitter size={22} />
                </a>
              )}
            </div>
          </div>
          
          {/* Информация */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-black">Информация</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:underline text-black">О компании</Link></li>
              <li><Link href="/delivery" className="hover:underline text-black">Доставка и оплата</Link></li>
              <li><Link href="/guarantees" className="hover:underline text-black">Гарантии</Link></li>
              <li><Link href="/contacts" className="hover:underline text-black">Контакты</Link></li>
              <li><Link href="/privacy" className="hover:underline text-black">Политика конфиденциальности</Link></li>
            </ul>
          </div>
          
          {/* Каталог */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-black">Каталог</h3>
            <ul className="space-y-2">
              <li><Link href="/products?category=mattresses" className="hover:underline text-black">Матрасы</Link></li>
              <li><Link href="/products?category=beds" className="hover:underline text-black">Кровати</Link></li>
              <li><Link href="/products?category=accessories" className="hover:underline text-black">Аксессуары</Link></li>
              <li><Link href="/products?category=pillows" className="hover:underline text-black">Подушки</Link></li>
              <li><Link href="/products?category=linens" className="hover:underline text-black">Постельное белье</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-700">
          <p className="text-center text-black font-medium">© {new Date().getFullYear()} {!isLoading && settings ? settings.shopName : 'Матрасовъ'}. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}