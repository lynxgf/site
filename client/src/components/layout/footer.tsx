import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'wouter';
import { useEffect, useState } from 'react';
import { ShopSettings, useSettingsStore } from '@/lib/store';

export default function Footer() {
  const { settings, fetchSettings } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadSettings() {
      await fetchSettings();
      setIsLoading(false);
    }
    
    loadSettings();
  }, [fetchSettings]);
  
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Контактная информация */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone size={18} />
                <span>{!isLoading && settings ? settings.contactPhone : '+7 (495) 123-45-67'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} />
                <span>{!isLoading && settings ? settings.contactEmail : 'info@матрасовъ.рф'}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={18} />
                <span>{!isLoading && settings ? settings.address : 'г. Москва, ул. Матрасная, д. 1'}</span>
              </li>
            </ul>
            <div className="mt-4 flex gap-4">
              {!isLoading && settings && settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
                  <Instagram size={22} />
                </a>
              )}
              {!isLoading && settings && settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
                  <Facebook size={22} />
                </a>
              )}
              {!isLoading && settings && settings.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
                  <Twitter size={22} />
                </a>
              )}
            </div>
          </div>
          
          {/* Информация */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Информация</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:underline">О компании</Link></li>
              <li><Link href="/delivery" className="hover:underline">Доставка и оплата</Link></li>
              <li><Link href="/guarantees" className="hover:underline">Гарантии</Link></li>
              <li><Link href="/contacts" className="hover:underline">Контакты</Link></li>
              <li><Link href="/privacy" className="hover:underline">Политика конфиденциальности</Link></li>
            </ul>
          </div>
          
          {/* Каталог */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Каталог</h3>
            <ul className="space-y-2">
              <li><Link href="/products?category=mattresses" className="hover:underline">Матрасы</Link></li>
              <li><Link href="/products?category=beds" className="hover:underline">Кровати</Link></li>
              <li><Link href="/products?category=accessories" className="hover:underline">Аксессуары</Link></li>
              <li><Link href="/products?category=pillows" className="hover:underline">Подушки</Link></li>
              <li><Link href="/products?category=linens" className="hover:underline">Постельное белье</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-700">
          <p className="text-center">© {new Date().getFullYear()} {!isLoading && settings ? settings.shopName : 'Матрасовъ'}. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}