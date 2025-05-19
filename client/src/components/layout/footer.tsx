import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">О компании LuxBed</h3>
            <p className="text-sm leading-relaxed">
              Мы производим высококачественные матрасы и кровати с 2005 года. Наши изделия сочетают в себе инновационные технологии, экологичные материалы и современный дизайн.
            </p>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Каталог</h3>
            <ul className="space-y-2">
              <li><Link href="/products/bed" className="text-sm hover:text-white">Кровати</Link></li>
              <li><Link href="/products/mattress" className="text-sm hover:text-white">Матрасы</Link></li>
              <li><Link href="#" className="text-sm hover:text-white">Подушки</Link></li>
              <li><Link href="#" className="text-sm hover:text-white">Аксессуары</Link></li>
              <li><Link href="#" className="text-sm hover:text-white">Новинки</Link></li>
              <li><Link href="#" className="text-sm hover:text-white">Распродажа</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Информация</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm hover:text-white">Доставка и оплата</Link></li>
              <li><Link href="#" className="text-sm hover:text-white">Гарантия</Link></li>
              <li><Link href="#" className="text-sm hover:text-white">Возврат и обмен</Link></li>
              <li><Link href="#" className="text-sm hover:text-white">Статьи и обзоры</Link></li>
              <li><Link href="#" className="text-sm hover:text-white">Контакты</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3"></i>
                <span className="text-sm">г. Москва, ул. Спальная, 123</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-phone-alt mt-1 mr-3"></i>
                <span className="text-sm">+7 (495) 123-45-67</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-envelope mt-1 mr-3"></i>
                <span className="text-sm">info@luxbed.ru</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <h4 className="text-white text-sm font-semibold mb-3">Мы в соцсетях</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white" aria-label="VKontakte">
                  <i className="fab fa-vk text-xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-white" aria-label="Telegram">
                  <i className="fab fa-telegram text-xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-white" aria-label="Instagram">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a href="#" className="text-gray-300 hover:text-white" aria-label="YouTube">
                  <i className="fab fa-youtube text-xl"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <hr className="border-gray-700 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} LuxBed. Все права защищены.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="text-sm hover:text-white">Политика конфиденциальности</Link>
            <Link href="#" className="text-sm hover:text-white">Пользовательское соглашение</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
