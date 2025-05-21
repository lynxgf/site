import { useEffect, useState } from 'react';
import { ShopSettings, useSettingsStore } from '@/lib/store';

export default function HeaderInfoBar() {
  const { settings, fetchSettings } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(true);
  
  // Важно: добавляем периодический опрос API для обновления настроек в хедере
  useEffect(() => {
    async function loadSettings() {
      await fetchSettings();
      setIsLoading(false);
    }
    
    // Загружаем настройки сразу
    loadSettings();
    
    // Создаем интервал для периодического обновления (каждые 3 секунды)
    const intervalId = setInterval(() => {
      fetchSettings();
    }, 3000);
    
    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(intervalId);
  }, [fetchSettings]);
  
  return (
    <div className="bg-gray-900 py-2 px-4 text-sm hidden md:block">
      <div className="container mx-auto flex justify-between text-neutral-100">
        <div className="flex space-x-6">
          <a href={`tel:${!isLoading && settings ? settings.contactPhone : '+7 (495) 123-45-67'}`} className="flex items-center text-gray-300 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            {!isLoading && settings ? settings.contactPhone : '+7 (495) 123-45-67'}
          </a>
          <a href={`mailto:${!isLoading && settings ? settings.contactEmail : 'info@матрасовъ.рф'}`} className="flex items-center text-gray-300 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            {!isLoading && settings ? settings.contactEmail : 'info@матрасовъ.рф'}
          </a>
        </div>
        <div className="flex items-center space-x-5">
          <span className="flex items-center text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {!isLoading && settings ? settings.workingHours : 'ПН-ВС: 10:00 - 20:00'}
          </span>
          <a href="/delivery" className="text-gray-300 hover:text-white">Доставка и оплата</a>
          <a href="/warranty" className="text-gray-300 hover:text-white">Гарантия</a>
          <a href="/privacy" className="text-gray-300 hover:text-white">Политика конфиденциальности</a>
        </div>
      </div>
    </div>
  );
}