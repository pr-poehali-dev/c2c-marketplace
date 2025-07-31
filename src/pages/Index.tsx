import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import AuthModal from '@/components/AuthModal';
import CreateListingModal from '@/components/CreateListingModal';
import { auth } from '@/lib/auth';
import { db, CATEGORIES, Listing, CategoryKey, User } from '@/lib/db';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  
  // Modals
  const [showAuth, setShowAuth] = useState(false);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showPhotoSell, setShowPhotoSell] = useState(false);
  const [showExchange, setShowExchange] = useState(false);
  
  // Search filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    setCurrentUser(auth.getCurrentUser());
    loadListings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, minPrice, maxPrice, selectedLocation, listings]);

  const loadListings = () => {
    const allListings = db.getListings().filter(listing => listing.status === 'active');
    setListings(allListings);
  };

  const applyFilters = () => {
    let filtered = [...listings];

    if (searchQuery) {
      filtered = db.searchListings(searchQuery);
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(listing => listing.category === selectedCategory);
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        filtered = filtered.filter(listing => listing.price >= min);
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        filtered = filtered.filter(listing => listing.price <= max);
      }
    }

    if (selectedLocation) {
      filtered = filtered.filter(listing => 
        listing.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleCreateListing = () => {
    if (!currentUser) {
      setShowAuth(true);
      return;
    }
    setShowCreateListing(true);
  };

  const handleAuthSuccess = () => {
    setCurrentUser(auth.getCurrentUser());
  };

  const handleListingSuccess = () => {
    loadListings();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  const getConditionText = (condition: string) => {
    const conditions = {
      new: 'Новое',
      excellent: 'Отличное', 
      good: 'Хорошее',
      fair: 'Удовлетворительное',
      poor: 'Плохое'
    };
    return conditions[condition as keyof typeof conditions] || condition;
  };

  const getUserById = (userId: string) => {
    return db.getUserById(userId);
  };

  const renderListingCard = (listing: Listing) => {
    const seller = getUserById(listing.userId);
    
    return (
      <Card key={listing.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="relative">
          <img
            src={listing.images[0] || '/placeholder.svg'}
            alt={listing.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute top-2 right-2">
            <Button size="sm" variant="ghost" className="w-8 h-8 p-0 bg-white/80 hover:bg-white">
              <Icon name="Heart" size={14} />
            </Button>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            <Icon name="Eye" size={12} className="inline mr-1" />
            {listing.views}
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              {getConditionText(listing.condition)}
            </Badge>
            <div className="flex items-center space-x-1">
              {seller?.verified && (
                <Icon name="BadgeCheck" size={14} className="text-accent" />
              )}
              <span className="text-xs text-gray-500 flex items-center">
                <Icon name="Star" size={12} className="text-warning mr-1" />
                {seller?.rating.toFixed(1) || '5.0'}
              </span>
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-primary">
              {formatPrice(listing.price)}
            </span>
            <Badge variant="secondary" className="text-xs">
              {CATEGORIES[listing.category as CategoryKey]}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <Icon name="MapPin" size={12} />
              <span>{listing.location}</span>
            </div>
            <span>{seller?.name || 'Пользователь'}</span>
          </div>

          {listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {listing.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button size="sm" className="flex-1">
              <Icon name="MessageCircle" size={14} className="mr-1" />
              Написать
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Icon name="Phone" size={14} className="mr-1" />
              Позвонить
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const navigationItems = [
    { name: 'Главная', icon: 'Home', page: 'home' },
    { name: 'Каталог', icon: 'Grid3x3', page: 'catalog' },
    { name: 'Сообщения', icon: 'MessageCircle', page: 'messages' },
    { name: 'Избранное', icon: 'Heart', page: 'favorites' },
    { name: 'Профиль', icon: 'User', page: 'profile' },
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

  const messages = [
    { id: 1, user: 'Анна К.', message: 'Добрый день! iPhone еще актуален?', time: '2 мин назад', unread: true },
    { id: 2, user: 'Михаил Р.', message: 'Спасибо за покупку!', time: '1 час назад', unread: false },
    { id: 3, user: 'Елена В.', message: 'Можно встретиться завтра?', time: '3 часа назад', unread: true },
  ];

  const favorites = [
    { id: 1, title: 'iPhone 13 Pro 128GB', price: '65 000 ₽', image: '/img/b35ae446-c430-4e89-b093-4a5879e31684.jpg' },
    { id: 2, title: 'Кроссовки Nike Air Max', price: '8 500 ₽', image: '/placeholder.svg' },
    { id: 3, title: 'Наушники Sony WH-1000XM4', price: '15 000 ₽', image: '/placeholder.svg' },
  ];

  const CreateListingModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Разместить объявление</CardTitle>
          <CardDescription>Создайте новое объявление для продажи</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Название товара</Label>
            <Input id="title" placeholder="Например: iPhone 14 Pro Max" />
          </div>
          <div>
            <Label htmlFor="price">Цена (₽)</Label>
            <Input id="price" type="number" placeholder="50000" />
          </div>
          <div>
            <Label htmlFor="category">Категория</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Электроника</SelectItem>
                <SelectItem value="clothing">Одежда</SelectItem>
                <SelectItem value="home">Дом и сад</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea id="description" placeholder="Подробное описание товара..." />
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setShowCreateListing(false)} className="flex-1">
              Опубликовать
            </Button>
            <Button onClick={() => setShowCreateListing(false)} variant="outline">
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const PhotoSellModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Продать по фото</CardTitle>
          <CardDescription>ИИ определит товар и создаст объявление автоматически</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Icon name="Camera" size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Загрузите фото товара</p>
            <Button variant="outline">
              <Icon name="Upload" size={16} className="mr-2" />
              Выбрать фото
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setShowPhotoSell(false)} className="flex-1">
              Анализировать
            </Button>
            <Button onClick={() => setShowPhotoSell(false)} variant="outline">
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ExchangeModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Предложить обмен</CardTitle>
          <CardDescription>Обменяйте свой товар на нужный</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Что предлагаете</Label>
            <Input placeholder="Например: MacBook Pro 13" />
          </div>
          <div>
            <Label>На что хотите обменять</Label>
            <Input placeholder="Например: iPhone 14" />
          </div>
          <div>
            <Label>Доплата (если нужна)</Label>
            <Input type="number" placeholder="10000" />
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setShowExchange(false)} className="flex-1">
              Предложить
            </Button>
            <Button onClick={() => setShowExchange(false)} variant="outline">
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'catalog':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Каталог товаров</h2>
              <p className="text-gray-600">{filteredListings.length} объявлений</p>
            </div>

            {/* Фильтры */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Все категории" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все категории</SelectItem>
                        {Object.entries(CATEGORIES).map(([key, name]) => (
                          <SelectItem key={key} value={key}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Input
                      placeholder="Мин. цена"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      type="number"
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Макс. цена"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      type="number"
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Город"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map(renderListingCard)}
            </div>

            {filteredListings.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
                <p className="text-gray-600 mb-4">Попробуйте изменить параметры поиска</p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setMinPrice('');
                  setMaxPrice('');
                  setSelectedLocation('');
                }}>
                  Сбросить фильтры
                </Button>
              </div>
            )}
          </div>
        );
      
      case 'messages':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Сообщения</h2>
            {!currentUser ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Icon name="MessageCircle" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Войдите в аккаунт, чтобы просматривать сообщения</p>
                  <Button onClick={() => setShowAuth(true)}>Войти</Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Icon name="MessageCircle" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Пока нет сообщений</p>
                </CardContent>
              </Card>
            )}
          </div>
        );
      
      case 'favorites':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Избранное</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <img src={item.image} alt={item.title} className="w-full h-48 object-cover rounded-t-lg" />
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-xl font-bold text-primary">{item.price}</p>
                    <Button className="w-full mt-3">
                      <Icon name="MessageCircle" size={16} className="mr-2" />
                      Написать
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Профиль</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarFallback className="text-2xl">ИП</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold mb-2">Иван Петров</h3>
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Icon name="Star" size={16} className="text-warning" />
                    <span className="font-semibold">4.9</span>
                    <span className="text-gray-500">(127 отзывов)</span>
                  </div>
                  <Badge className="mb-4">
                    <Icon name="BadgeCheck" size={14} className="mr-1" />
                    Верифицирован
                  </Badge>
                  <Button className="w-full">Редактировать профиль</Button>
                </CardContent>
              </Card>
              
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Статистика</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">47</p>
                        <p className="text-sm text-gray-600">Продано</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-accent">12</p>
                        <p className="text-sm text-gray-600">Активных</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-warning">5</p>
                        <p className="text-sm text-gray-600">Избранное</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Мои объявления</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold">iPhone 14 Pro Max</p>
                          <p className="text-sm text-gray-600">85 000 ₽ • 245 просмотров</p>
                        </div>
                        <Badge>Активно</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold">MacBook Air M2</p>
                          <p className="text-sm text-gray-600">95 000 ₽ • 189 просмотров</p>
                        </div>
                        <Badge variant="secondary">Продано</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Безопасная торговая платформа
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Покупайте и продавайте с гарантией безопасности. Реальные пользователи, реальные товары.
                </p>
                
                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                  <div className="flex">
                    <Input
                      type="text"
                      placeholder="Поиск товаров... (например: iPhone, Nike, Samsung)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-lg h-14 pr-32"
                    />
                    <Button type="submit" className="absolute right-1 top-1 h-12 px-6">
                      <Icon name="Search" size={20} className="mr-2" />
                      Найти
                    </Button>
                  </div>
                </form>
                  
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
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <aside className="lg:col-span-1">
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
                        onClick={() => setCurrentPage('catalog')}
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

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Быстрые действия</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={() => setShowCreateListing(true)} className="w-full justify-start" size="sm">
                      <Icon name="Plus" size={16} className="mr-2" />
                      Разместить объявление
                    </Button>
                    <Button onClick={() => setShowPhotoSell(true)} variant="outline" className="w-full justify-start" size="sm">
                      <Icon name="Camera" size={16} className="mr-2" />
                      Продать по фото
                    </Button>
                    <Button onClick={() => setShowExchange(true)} variant="outline" className="w-full justify-start" size="sm">
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
          </>
        );
    }
  };

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
                <h1 className="text-xl font-bold text-gray-900">Swoply</h1>
              </div>
              
              <nav className="hidden md:flex space-x-6">
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setCurrentPage(item.page)}
                    className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === item.page 
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
                {currentUser ? (
                  <>
                    <Button variant="ghost" size="sm">
                      <Icon name="Bell" size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCurrentPage('profile')}
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setShowAuth(true)} size="sm">
                    <Icon name="User" size={16} className="mr-2" />
                    Войти
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
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
                <h3 className="text-lg font-bold">Swoply</h3>
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
            <p>&copy; 2024 Swoply. Все права защищены.</p>
            <div className="flex items-center space-x-4">
              <Icon name="Shield" size={16} />
              <span>SSL-защита</span>
              <Icon name="CheckCircle" size={16} />
              <span>Лицензированная платформа</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showAuth && (
        <AuthModal 
          isOpen={showAuth} 
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
      
      {showCreateListing && (
        <CreateListingModal 
          isOpen={showCreateListing} 
          onClose={() => setShowCreateListing(false)}
          onSuccess={handleListingSuccess}
        />
      )}
    </div>
  );
};

export default Index;