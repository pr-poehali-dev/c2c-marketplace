import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { auth } from '@/lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state  
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await auth.login({
      email: loginEmail,
      password: loginPassword,
    });

    setIsLoading(false);

    if (result.success) {
      setSuccess('Успешная авторизация!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } else {
      setError(result.error || 'Ошибка авторизации');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (registerPassword.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setIsLoading(false);
      return;
    }

    const result = await auth.register({
      email: registerEmail,
      password: registerPassword,
      name: registerName,
      phone: registerPhone,
    });

    setIsLoading(false);

    if (result.success) {
      setSuccess('Регистрация успешна! Добро пожаловать в Swoply!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } else {
      setError(result.error || 'Ошибка регистрации');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="ShoppingBag" size={18} className="text-white" />
            </div>
            <CardTitle className="text-2xl">Swoply</CardTitle>
          </div>
          <CardDescription>
            Войдите в аккаунт или создайте новый
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

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="example@mail.ru"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Пароль</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Ваш пароль"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                        Вход...
                      </>
                    ) : (
                      'Войти'
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={onClose}>
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-name">Имя</Label>
                  <Input
                    id="register-name"
                    type="text"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="Ваше имя"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="example@mail.ru"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-phone">Телефон (необязательно)</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="+7 (900) 123-45-67"
                  />
                </div>
                <div>
                  <Label htmlFor="register-password">Пароль</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                        Регистрация...
                      </>
                    ) : (
                      'Создать аккаунт'
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={onClose}>
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Создавая аккаунт, вы соглашаетесь с</p>
            <p>
              <button className="text-primary hover:underline">Правилами использования</button>
              {' '}и{' '}
              <button className="text-primary hover:underline">Политикой конфиденциальности</button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}