import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">О компании</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Компания «Матрасовъ» – ведущий российский производитель высококачественных матрасов и кроватей, заботящийся о здоровом сне своих клиентов.
          </p>
        </div>
        
        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* О нас */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Наша история</h2>
                <p className="text-gray-600 mb-4">
                  Компания «Матрасовъ» начала свою деятельность в 2010 году с небольшого производства. За короткий срок мы смогли стать одним из ведущих производителей матрасов и кроватей на российском рынке благодаря безупречному качеству продукции и внимательному отношению к потребностям клиентов.
                </p>
                <p className="text-gray-600 mb-4">
                  Наша компания специализируется на производстве ортопедических матрасов, которые обеспечивают правильное положение позвоночника во время сна и способствуют полноценному отдыху. Мы также производим стильные и удобные кровати, которые идеально дополняют наши матрасы.
                </p>
                <p className="text-gray-600">
                  Сегодня «Матрасовъ» – это современное производство, оснащенное передовым оборудованием, команда опытных специалистов и сеть фирменных магазинов по всей России.
                </p>
              </CardContent>
            </Card>
            
            {/* Наши преимущества */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Наши преимущества</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex">
                    <div className="flex-shrink-0 h-12 w-12 bg-[#8B2A82]/10 rounded-xl flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#8B2A82" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Высокое качество</h3>
                      <p className="text-gray-600 mt-1">Мы используем только высококачественные материалы и современные технологии производства.</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 h-12 w-12 bg-[#8B2A82]/10 rounded-xl flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#8B2A82" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Доступные цены</h3>
                      <p className="text-gray-600 mt-1">Прямое производство позволяет нам предлагать качественные товары по доступным ценам.</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 h-12 w-12 bg-[#8B2A82]/10 rounded-xl flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#8B2A82" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Здоровый сон</h3>
                      <p className="text-gray-600 mt-1">Наши ортопедические матрасы разработаны с учетом особенностей здорового сна.</p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 h-12 w-12 bg-[#8B2A82]/10 rounded-xl flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#8B2A82" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Гарантия качества</h3>
                      <p className="text-gray-600 mt-1">Мы предоставляем гарантию до 10 лет на нашу продукцию.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Наше производство */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Наше производство</h2>
                <p className="text-gray-600 mb-4">
                  Производство компании «Матрасовъ» оснащено современным оборудованием, что позволяет нам выпускать продукцию высочайшего качества. Мы используем только экологически чистые материалы, безопасные для здоровья.
                </p>
                <p className="text-gray-600 mb-4">
                  Каждый этап производства контролируется опытными специалистами, что позволяет исключить брак и обеспечить соответствие готовой продукции заявленным характеристикам.
                </p>
                <p className="text-gray-600">
                  Мы постоянно совершенствуем технологии производства, следим за мировыми тенденциями в области здорового сна и внедряем инновации, которые делают нашу продукцию еще более комфортной и полезной для здоровья.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-8">
            {/* Сертификаты */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Сертификаты</h2>
                <p className="text-gray-600 mb-4">
                  Вся продукция компании «Матрасовъ» сертифицирована и соответствует российским и международным стандартам качества.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="aspect-[3/4] bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center p-2">
                    <div className="text-center">
                      <span className="text-sm text-gray-500">ГОСТ Р</span>
                    </div>
                  </div>
                  <div className="aspect-[3/4] bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center p-2">
                    <div className="text-center">
                      <span className="text-sm text-gray-500">ISO 9001</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Команда */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Наша команда</h2>
                <p className="text-gray-600 mb-4">
                  В компании «Матрасовъ» работают опытные специалисты, преданные своему делу. Наши сотрудники регулярно проходят обучение и повышают квалификацию.
                </p>
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-[#8B2A82]/10 flex items-center justify-center flex-shrink-0 mr-4">
                      <span className="text-[#8B2A82] font-medium">АМ</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Александр Матвеев</h3>
                      <p className="text-sm text-gray-500">Генеральный директор</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-[#8B2A82]/10 flex items-center justify-center flex-shrink-0 mr-4">
                      <span className="text-[#8B2A82] font-medium">ЕК</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Екатерина Кузнецова</h3>
                      <p className="text-sm text-gray-500">Руководитель производства</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Наши клиенты */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Наши клиенты</h2>
                <p className="text-gray-600 mb-4">
                  Среди наших клиентов – гостиничные сети, санатории, медицинские учреждения и тысячи частных покупателей, которые ценят качество и комфорт.
                </p>
                <div className="mt-6">
                  <Link to="/contacts" className="text-[#8B2A82] hover:underline font-medium">
                    Свяжитесь с нами
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}