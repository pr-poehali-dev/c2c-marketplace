import { db, User } from './db';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    // Восстанавливаем сессию при загрузке
    this.loadSession();
  }

  private loadSession(): void {
    const sessionData = localStorage.getItem('swoply_session');
    if (sessionData) {
      const { userId } = JSON.parse(sessionData);
      this.currentUser = db.getUserById(userId);
    }
  }

  private saveSession(user: User): void {
    localStorage.setItem('swoply_session', JSON.stringify({
      userId: user.id,
      timestamp: new Date().toISOString()
    }));
  }

  private clearSession(): void {
    localStorage.removeItem('swoply_session');
  }

  // Простая хеш-функция для демонстрации
  private hashPassword(password: string): string {
    // В реальном проекте используйте bcrypt или подобные библиотеки
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Конвертируем в 32-битное число
    }
    return hash.toString();
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = db.getUserByEmail(credentials.email);
      
      if (!user) {
        return { success: false, error: 'Пользователь не найден' };
      }

      const hashedPassword = this.hashPassword(credentials.password);
      if (user.password !== hashedPassword) {
        return { success: false, error: 'Неверный пароль' };
      }

      this.currentUser = user;
      this.saveSession(user);

      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Ошибка авторизации' };
    }
  }

  async register(data: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Проверяем, существует ли пользователь
      const existingUser = db.getUserByEmail(data.email);
      if (existingUser) {
        return { success: false, error: 'Пользователь с таким email уже существует' };
      }

      // Создаем нового пользователя
      const hashedPassword = this.hashPassword(data.password);
      const newUser = db.createUser({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        verified: false, // В реальном проекте требуется подтверждение email/SMS
      });

      this.currentUser = newUser;
      this.saveSession(newUser);

      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: 'Ошибка регистрации' };
    }
  }

  logout(): void {
    this.currentUser = null;
    this.clearSession();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: 'Пользователь не авторизован' };
    }

    try {
      const updatedUser = db.updateUser(this.currentUser.id, updates);
      if (updatedUser) {
        this.currentUser = updatedUser;
        return { success: true, user: updatedUser };
      }
      return { success: false, error: 'Ошибка обновления профиля' };
    } catch (error) {
      return { success: false, error: 'Ошибка обновления профиля' };
    }
  }

  // Имитация отправки кода подтверждения
  async sendVerificationCode(email: string): Promise<{ success: boolean; error?: string }> {
    // В реальном проекте здесь будет отправка email или SMS
    console.log(`Код подтверждения отправлен на ${email}: 123456`);
    return { success: true };
  }

  // Имитация проверки кода подтверждения
  async verifyCode(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    // В реальном проекте здесь будет проверка кода
    if (code === '123456') {
      const user = db.getUserByEmail(email);
      if (user) {
        db.updateUser(user.id, { verified: true });
        return { success: true };
      }
    }
    return { success: false, error: 'Неверный код подтверждения' };
  }
}

export const auth = new AuthService();