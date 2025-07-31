import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { db, CATEGORIES, CategoryKey } from '@/lib/db';
import { auth } from '@/lib/auth';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateListingModal({ isOpen, onClose, onSuccess }: CreateListingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<CategoryKey | ''>('');
  const [condition, setCondition] = useState<'new' | 'excellent' | 'good' | 'fair' | 'poor' | ''>('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('');
    setCondition('');
    setLocation('');
    setTags('');
    setImageUrl('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      setError('Необходимо авторизоваться для создания объявления');
      setIsLoading(false);
      return;
    }

    // Валидация
    if (!title.trim() || !description.trim() || !price || !category || !condition || !location.trim()) {
      setError('Заполните все обязательные поля');
      setIsLoading(false);
      return;
    }

    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      setError('Введите корректную цену');
      setIsLoading(false);
      return;
    }

    try {
      const newListing = db.createListing({
        userId: currentUser.id,
        title: title.trim(),
        description: description.trim(),
        price: priceNumber,
        category: category as CategoryKey,
        condition: condition as 'new' | 'excellent' | 'good' | 'fair' | 'poor',
        images: imageUrl ? [imageUrl] : [],
        location: location.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        status: 'active',
      });

      if (newListing) {
        setSuccess('Объявление успешно создано!');
        setTimeout(() => {
          resetForm();
          onSuccess();
          onClose();
        }, 1000);
      } else {
        setError('Ошибка создания объявления');
      }
    } catch (error) {
      setError('Ошибка создания объявления');
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon name="Plus" size={20} className="mr-2" />
            Разместить объявление
          </CardTitle>
          <CardDescription>
            Заполните информацию о товаре для размещения на платформе
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-4 border-destructive">
              <Icon name="AlertCircle" size={16} />
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-500">
              <Icon name="CheckCircle" size={16} />
              <AlertDescription className="text-green-600">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Название товара *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: iPhone 14 Pro Max 256GB"
                  required
                />
              </div>

              <div>
                <Label htmlFor="price">Цена (₽) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="50000"
                  min="1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Категория *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORIES).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition">Состояние *</Label>
                <Select value={condition} onValueChange={setCondition} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите состояние" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Новое</SelectItem>
                    <SelectItem value="excellent">Отличное</SelectItem>
                    <SelectItem value="good">Хорошее</SelectItem>
                    <SelectItem value="fair">Удовлетворительное</SelectItem>
                    <SelectItem value="poor">Плохое</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Местоположение *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Москва"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Описание *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Подробное описание товара, состояние, особенности..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">Ссылка на изображение</Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Вставьте ссылку на изображение или оставьте пустым
              </p>
            </div>

            <div>
              <Label htmlFor="tags">Теги (через запятую)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="смартфон, apple, 256gb, новый"
              />
              <p className="text-xs text-gray-500 mt-1">
                Добавьте ключевые слова для лучшего поиска
              </p>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Разместить объявление
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Отмена
              </Button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Советы по созданию объявления:</p>
                <ul className="text-xs space-y-1">
                  <li>• Используйте четкие и описательные названия</li>
                  <li>• Укажите точное состояние товара</li>
                  <li>• Добавьте теги для лучшего поиска</li>
                  <li>• Указывайте реальную цену</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}