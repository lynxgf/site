import React from 'react';
import { TipCard } from '@/components/tips/tip-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TipsPage() {
  // Данные для советов по матрасам
  const mattressTips = [
    {
      id: 'mattress-type',
      title: 'Какой тип матраса выбрать?',
      description: 'Узнайте о различных типах матрасов (пружинные, беспружинные, гибридные) и их особенностях, чтобы сделать правильный выбор для вашего сна.',
      image: 'https://images.pexels.com/photos/4210337/pexels-photo-4210337.jpeg?auto=compress&cs=tinysrgb&w=1200',
      link: '/tips/mattress-types',
    },
    {
      id: 'mattress-firmness',
      title: 'Как определить нужную жесткость?',
      description: 'Жесткость матраса должна соответствовать вашему весу, предпочтениям и проблемам со здоровьем. Узнайте, как выбрать оптимальную жесткость.',
      image: 'https://images.pexels.com/photos/6782568/pexels-photo-6782568.jpeg?auto=compress&cs=tinysrgb&w=1200',
      link: '/tips/mattress-firmness',
    },
    {
      id: 'mattress-size',
      title: 'Как выбрать размер матраса?',
      description: 'Правильный размер матраса обеспечивает комфортный сон. Рассказываем о стандартных и нестандартных размерах и правилах их выбора.',
      image: 'https://images.pexels.com/photos/4352247/pexels-photo-4352247.jpeg?auto=compress&cs=tinysrgb&w=1200',
      link: '/tips/mattress-size',
    },
    {
      id: 'mattress-materials',
      title: 'Материалы матрасов: преимущества и недостатки',
      description: 'Обзор основных материалов, используемых в матрасах: латекс, кокосовая койра, пена с эффектом памяти, независимые пружины и другие.',
      image: 'https://images.pexels.com/photos/5490898/pexels-photo-5490898.jpeg?auto=compress&cs=tinysrgb&w=1200',
      link: '/tips/mattress-materials',
    },
    {
      id: 'mattress-health',
      title: 'Матрас и здоровье: что нужно знать',
      description: 'Как правильно выбрать матрас при проблемах со спиной, суставами или аллергиями. Советы от экспертов для здорового сна.',
      image: 'https://images.pexels.com/photos/4506108/pexels-photo-4506108.jpeg?auto=compress&cs=tinysrgb&w=1200',
      link: '/tips/mattress-health',
    },
    {
      id: 'mattress-care',
      title: 'Уход за матрасом: продлеваем срок службы',
      description: 'Практические советы по уходу за матрасом, чтобы он служил долго и сохранял свои ортопедические свойства. Чистка, защита, переворачивание.',
      image: 'https://images.pexels.com/photos/4149038/pexels-photo-4149038.jpeg?auto=compress&cs=tinysrgb&w=1200',
      link: '/tips/mattress-care',
    },
  ];

  // Данные для советов по кроватям
  const bedTips = [
    {
      id: 'bed-style',
      title: 'Выбираем стиль кровати',
      description: 'Обзор основных стилей кроватей: классические, современные, минималистичные, и как они вписываются в разные интерьеры.',
      image: 'https://images.pexels.com/photos/6186812/pexels-photo-6186812.jpeg?auto=compress&cs=tinysrgb&w=1200',
      link: '/tips/bed-styles',
    },
    {
      id: 'bed-materials',
      title: 'Материалы для кроватей: что выбрать?',
      description: 'Сравнение дерева, металла, МДФ и других материалов для каркаса кровати. Их преимущества, недостатки и особенности ухода.',
      image: 'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=1200',
      link: '/tips/bed-materials',
    },
    {
      id: 'bed-base',
      title: 'Основание кровати: какое лучше?',
      description: 'Различные типы оснований (ортопедическое, реечное, сплошное) и их влияние на комфорт и долговечность матраса.',
      image: 'https://images.pexels.com/photos/3773584/pexels-photo-3773584.png?auto=compress&cs=tinysrgb&w=1200',
      link: '/tips/bed-base',
    },
    {
      id: 'bed-storage',
      title: 'Кровати с системой хранения',
      description: 'Варианты кроватей с ящиками и подъемным механизмом. Их особенности, преимущества и на что обратить внимание при выборе.',
      image: 'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg?auto=compress&cs=tinysrgb&w=1200',
      link: '/tips/bed-storage',
    },
    {
      id: 'bed-headboard',
      title: 'Изголовье кровати: практичность и стиль',
      description: 'Типы изголовий, популярные материалы и обивки, их практические функции и роль в дизайне спальни.',
      image: 'https://images.pexels.com/photos/6585598/pexels-photo-6585598.jpeg?auto=compress&cs=tinysrgb&w=1200',
      link: '/tips/bed-headboard',
    },
    {
      id: 'bed-size',
      title: 'Размеры кроватей: что подойдет для вашей спальни',
      description: 'Как правильно выбрать размер кровати с учетом площади комнаты, количества спящих и их роста.',
      image: 'https://images.pexels.com/photos/7319094/pexels-photo-7319094.jpeg?auto=compress&cs=tinysrgb&w=1200',
      link: '/tips/bed-size',
    },
  ];

  // Данные для советов по сну и здоровью
  const sleepTips = [
    {
      id: 'sleep-position',
      title: 'Как поза во сне влияет на выбор матраса',
      description: 'Для разных поз сна (на спине, боку, животе) нужны разные типы матрасов. Узнайте, какой подойдет именно вам.',
      image: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=1200',
      link: '/tips/sleep-position',
    },
    {
      id: 'sleep-environment',
      title: 'Создаем идеальную среду для сна',
      description: 'Советы по обустройству спальни, выбору постельного белья, подушек и одеял для комфортного и здорового сна.',
      image: 'https://images.pexels.com/photos/6489093/pexels-photo-6489093.jpeg?auto=compress&cs=tinysrgb&w=1200',
      link: '/tips/sleep-environment',
    },
    {
      id: 'sleep-tech',
      title: 'Технологии для качественного сна',
      description: 'Обзор современных технологий и гаджетов, которые помогают улучшить качество сна: от умных матрасов до трекеров сна.',
      image: 'https://images.pexels.com/photos/3846022/pexels-photo-3846022.jpeg?auto=compress&cs=tinysrgb&w=1200',
      link: '/tips/sleep-technology',
    },
    {
      id: 'sleep-children',
      title: 'Особенности выбора матрасов для детей',
      description: 'Как выбрать подходящий матрас для ребенка с учетом возраста, скорости роста и особенностей развития позвоночника.',
      image: 'https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?auto=compress&cs=tinysrgb&w=1200',
      link: '/tips/children-sleep',
    },
    {
      id: 'sleep-couples',
      title: 'Матрасы для пар: как найти компромисс',
      description: 'Решения для пар с разными предпочтениями по весу и жесткости: двусторонние матрасы, раздельные основания и другие варианты.',
      image: 'https://images.pexels.com/photos/5490925/pexels-photo-5490925.jpeg?auto=compress&cs=tinysrgb&w=1200',
      link: '/tips/couples-mattress',
    },
    {
      id: 'sleep-back-pain',
      title: 'Как выбрать матрас при болях в спине',
      description: 'Рекомендации экспертов по выбору матраса для людей с проблемами спины, грыжами и другими заболеваниями позвоночника.',
      image: 'https://images.pexels.com/photos/4506078/pexels-photo-4506078.jpeg?auto=compress&cs=tinysrgb&w=1200',
      link: '/tips/back-pain-mattress',
    },
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Полезные советы</h1>
          <p className="text-xl text-gray-600">
            Мы собрали полезную информацию о матрасах, кроватях и здоровом сне, чтобы помочь вам сделать правильный выбор для комфортного отдыха
          </p>
        </div>

        <Tabs defaultValue="mattress" className="max-w-5xl mx-auto">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white">
              <TabsTrigger value="mattress" className="px-6 py-3 text-base">Матрасы</TabsTrigger>
              <TabsTrigger value="bed" className="px-6 py-3 text-base">Кровати</TabsTrigger>
              <TabsTrigger value="sleep" className="px-6 py-3 text-base">Сон и здоровье</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="mattress">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mattressTips.map((tip) => (
                <TipCard 
                  key={tip.id}
                  title={tip.title}
                  description={tip.description}
                  image={tip.image}
                  linkText="Читать подробнее"
                  link={tip.link}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="bed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bedTips.map((tip) => (
                <TipCard 
                  key={tip.id}
                  title={tip.title}
                  description={tip.description}
                  image={tip.image}
                  linkText="Читать подробнее"
                  link={tip.link}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="sleep">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sleepTips.map((tip) => (
                <TipCard 
                  key={tip.id}
                  title={tip.title}
                  description={tip.description}
                  image={tip.image}
                  linkText="Читать подробнее"
                  link={tip.link}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="max-w-3xl mx-auto mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Нужна персональная консультация?</h2>
          <p className="text-gray-600 mb-8">
            Наши специалисты с удовольствием ответят на все ваши вопросы и помогут подобрать идеальный матрас или кровать
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-[#8e2b85] hover:bg-[#76236e] px-8 py-6 h-auto text-base">Получить консультацию</Button>
            <Button variant="outline" className="border-[#8e2b85] text-[#8e2b85] hover:bg-[#faf5fa] px-8 py-6 h-auto text-base">
              <a href="tel:+74951234567">Позвонить нам</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}