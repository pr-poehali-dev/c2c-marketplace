import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const navigationItems = [
    { name: 'Главная', icon: 'Home', active: true },
    { name: 'Каталог', icon: 'Grid3x3', active: false },
    { name: 'Сообщения', icon: 'MessageCircle', active: false },
    { name: 'Избранное', icon: 'Heart', active: false },
    { name: 'Профиль', icon: 'User', active: false },
    { name: 'Безопасность', icon: 'Shield', active: false },
    { name: 'Помощь', icon: 'HelpCircle', active: false },
  ];

  const categories = [
    { name: 'Электроника', icon: 'Smartphone', count: '12К+' },
    { name: 'Одежда', icon: 'Shirt', count: '8К+' },
    { name: 'Дом и сад', icon: 'Home', count: '5К+' },
    { name: 'Транспорт', icon: 'Car', count: '3К+' },
    { name: 'Спорт', icon: 'Dumbbell', count: '2К+' },
    { name: 'Книги', icon: 'Book', count: '1К+' },
  ];

  const featuredProducts = [
    {
      id: 1,
      title: 'iPhone 14 Pro Max 256GB',
      price: '85 000 ₽',
      location: 'Москва',
      seller: 'Анна К.',
      rating: 4.9,
      verified: true,
      image: '/img/b35ae446-c430-4e89-b093-4a5879e31684.jpg',
      condition: 'Отличное',
      views: 245,
      isFlashSale: true,
      discount: 15,
      originalPrice: '100 000 ₽'
    },
    {
      id: 2,
      title: 'Куртка зимняя North Face XL',
      price: '12 500 ₽',
      location: 'СПб',
      seller: 'Михаил Р.',
      rating: 4.7,
      verified: true,
      image: '/img/df5de5b4-122d-4524-8374-5ad821c8fed2.jpg',
      condition: 'Хорошее',
      views: 128,
      isFlashSale: false
    },
    {
      id: 3,
      title: 'MacBook Air M2 512GB',
      price: '95 000 ₽',
      location: 'Екатеринбург',
      seller: 'Елена В.',
      rating: 5.0,
      verified: true,
      image: '/img/01098b5a-6639-438f-9840-72bec186cc2d.jpg',
      condition: 'Как новое',
      views: 189,
      isFlashSale: true,
      discount: 10,
      originalPrice: '105 000 ₽'
    },
    {
      id: 4,
      title: 'Велосипед горный Trek 29"',
      price: '45 000 ₽',
      location: 'Казань',
      seller: 'Дмитрий П.',
      rating: 4.8,
      verified: false,
      image: '/placeholder.svg',
      condition: 'Хорошее',
      views: 96,
      isFlashSale: false
    }
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="ShoppingBag" size={18} className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">TradePlatform</h1>
              </div>
              
              <nav className="hidden md:flex space-x-6">
                {navigationItems.slice(0, 4).map((item) => (
                  <button
                    key={item.name}
                    className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      item.active 
                        ? 'text-primary bg-primary/10' 
                        : 'text-gray-700 hover:text-primary hover:bg-gray-100'
                    }`}
                  >
                    <Icon name={item.icon as any} size={16} />
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Icon name="Shield" size={16} className="text-accent" />
                <span className="text-sm font-medium text-gray-700">Безопасные сделки</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm">
                  <Icon name="Bell" size={16} />
                </Button>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-white text-sm">ИП</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Безопасная торговая платформа
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Покупайте и продавайте с гарантией безопасности. ИИ-модерация, escrow-платежи, проверенные продавцы.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="flex">
                <Input
                  type="text"
                  placeholder="Поиск товаров... (ИИ подскажет лучшие варианты)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-lg h-14 pr-32"
                />
                <Button className="absolute right-1 top-1 h-12 px-6">
                  <Icon name="Search" size={20} className="mr-2" />
                  Найти
                </Button>
              </div>
              
              <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Icon name="Sparkles" size={14} className="text-accent" />
                  <span>ИИ-поиск</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="MapPin" size={14} className="text-primary" />
                  <span>Геолокация</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Clock" size={14} className="text-warning" />
                  <span>Быстрая продажа</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Categories */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Icon name="Grid3x3" size={20} className="mr-2" />
                  Категории
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon name={category.icon as any} size={18} className="text-gray-600" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" size="sm">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Разместить объявление
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Icon name="Camera" size={16} className="mr-2" />
                  Продать по фото
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Icon name="ArrowLeftRight" size={16} className="mr-2" />
                  Предложить обмен
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="featured" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="featured">Рекомендации</TabsTrigger>
                <TabsTrigger value="flash">
                  <Icon name="Zap" size={16} className="mr-1" />
                  Флеш-распродажи
                </TabsTrigger>
                <TabsTrigger value="new">Новинки</TabsTrigger>
              </TabsList>
              
              <TabsContent value="featured" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {featuredProducts.map((product) => (
                    <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        {product.isFlashSale && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-error text-white">
                              <Icon name="Zap" size={12} className="mr-1" />
                              -{product.discount}%
                            </Badge>
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Button size="sm" variant="ghost" className="w-8 h-8 p-0 bg-white/80 hover:bg-white">
                            <Icon name="Heart" size={14} />
                          </Button>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          <Icon name="Eye" size={12} className="inline mr-1" />
                          {product.views}
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {product.condition}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            {product.verified && (
                              <Icon name="BadgeCheck" size={14} className="text-accent" />
                            )}
                            <span className="text-xs text-gray-500 flex items-center">
                              <Icon name="Star" size={12} className="text-warning mr-1" />
                              {product.rating}
                            </span>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            {product.isFlashSale && (
                              <span className="text-sm text-gray-500 line-through mr-2">
                                {product.originalPrice}
                              </span>
                            )}
                            <span className="text-xl font-bold text-gray-900">
                              {product.price}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Icon name="MapPin" size={12} />
                            <span>{product.location}</span>
                          </div>
                          <span>{product.seller}</span>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <Button size="sm" className="flex-1">
                            <Icon name="MessageCircle" size={14} className="mr-1" />
                            Написать
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Icon name="Phone" size={14} className="mr-1" />
                            Звонок
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="flash" className="mt-6">
                <div className="text-center py-12">
                  <Icon name="Zap" size={48} className="mx-auto text-warning mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Флеш-распродажи</h3>
                  <p className="text-gray-600">Ограниченные по времени предложения со скидками до 50%</p>
                </div>
              </TabsContent>
              
              <TabsContent value="new" className="mt-6">
                <div className="text-center py-12">
                  <Icon name="Plus" size={48} className="mx-auto text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Новые поступления</h3>
                  <p className="text-gray-600">Свежие объявления от проверенных продавцов</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon name="ShoppingBag" size={18} className="text-white" />
                </div>
                <h3 className="text-lg font-bold">TradePlatform</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Безопасная торговая платформа нового поколения с ИИ-модерацией и защищенными платежами.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Покупателям</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Как покупать безопасно</li>
                <li>Гарантии платформы</li>
                <li>Возврат средств</li>
                <li>Отзывы и рейтинги</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Продавцам</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Как продавать эффективно</li>
                <li>ИИ-помощник продавца</li>
                <li>Продвижение товаров</li>
                <li>Верификация аккаунта</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Поддержка</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Центр помощи</li>
                <li>Связаться с нами</li>
                <li>Безопасность</li>
                <li>Правила платформы</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 flex items-center justify-between text-sm text-gray-400">
            <p>&copy; 2024 TradePlatform. Все права защищены.</p>
            <div className="flex items-center space-x-4">
              <Icon name="Shield" size={16} />
              <span>SSL-защита</span>
              <Icon name="CheckCircle" size={16} />
              <span>Лицензированная платформа</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;