// Простая база данных в localStorage для демонстрации
// В реальном проекте используйте PostgreSQL, MongoDB или Firebase

export interface User {
  id: string;
  email: string;
  phone?: string;
  password: string;
  name: string;
  verified: boolean;
  avatar?: string;
  createdAt: string;
  rating: number;
  reviewsCount: number;
}

export interface Listing {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
  images: string[];
  location: string;
  tags: string[];
  status: 'active' | 'sold' | 'draft' | 'archived';
  views: number;
  favorites: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  listingId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

class Database {
  private getFromStorage<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Users
  getUsers(): User[] {
    return this.getFromStorage<User>('swoply_users');
  }

  getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  getUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.email === email) || null;
  }

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'rating' | 'reviewsCount'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      rating: 5.0,
      reviewsCount: 0,
    };
    users.push(newUser);
    this.saveToStorage('swoply_users', users);
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...updates };
    this.saveToStorage('swoply_users', users);
    return users[index];
  }

  // Listings
  getListings(): Listing[] {
    return this.getFromStorage<Listing>('swoply_listings');
  }

  getListingById(id: string): Listing | null {
    const listings = this.getListings();
    return listings.find(listing => listing.id === id) || null;
  }

  getListingsByUserId(userId: string): Listing[] {
    const listings = this.getListings();
    return listings.filter(listing => listing.userId === userId);
  }

  getListingsByCategory(category: string): Listing[] {
    const listings = this.getListings();
    return listings.filter(listing => 
      listing.category === category && listing.status === 'active'
    );
  }

  searchListings(query: string, filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
  }): Listing[] {
    let listings = this.getListings().filter(listing => listing.status === 'active');
    
    // Поиск по названию и описанию
    if (query) {
      const searchTerm = query.toLowerCase();
      listings = listings.filter(listing => 
        listing.title.toLowerCase().includes(searchTerm) ||
        listing.description.toLowerCase().includes(searchTerm) ||
        listing.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Фильтры
    if (filters) {
      if (filters.category) {
        listings = listings.filter(listing => listing.category === filters.category);
      }
      if (filters.minPrice !== undefined) {
        listings = listings.filter(listing => listing.price >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        listings = listings.filter(listing => listing.price <= filters.maxPrice!);
      }
      if (filters.location) {
        listings = listings.filter(listing => 
          listing.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
    }

    return listings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createListing(listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'favorites'>): Listing {
    const listings = this.getListings();
    const newListing: Listing = {
      ...listingData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      favorites: [],
    };
    listings.push(newListing);
    this.saveToStorage('swoply_listings', listings);
    return newListing;
  }

  updateListing(id: string, updates: Partial<Listing>): Listing | null {
    const listings = this.getListings();
    const index = listings.findIndex(listing => listing.id === id);
    if (index === -1) return null;
    
    listings[index] = { 
      ...listings[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.saveToStorage('swoply_listings', listings);
    return listings[index];
  }

  deleteListing(id: string): boolean {
    const listings = this.getListings();
    const index = listings.findIndex(listing => listing.id === id);
    if (index === -1) return false;
    
    listings.splice(index, 1);
    this.saveToStorage('swoply_listings', listings);
    return true;
  }

  incrementViews(id: string): void {
    const listing = this.getListingById(id);
    if (listing) {
      this.updateListing(id, { views: listing.views + 1 });
    }
  }

  toggleFavorite(listingId: string, userId: string): boolean {
    const listing = this.getListingById(listingId);
    if (!listing) return false;

    const favorites = [...listing.favorites];
    const index = favorites.indexOf(userId);
    
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(userId);
    }

    this.updateListing(listingId, { favorites });
    return index === -1; // возвращает true если добавили в избранное
  }

  // Messages
  getMessages(): Message[] {
    return this.getFromStorage<Message>('swoply_messages');
  }

  getMessagesByListing(listingId: string): Message[] {
    const messages = this.getMessages();
    return messages.filter(msg => msg.listingId === listingId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  getConversations(userId: string): Message[] {
    const messages = this.getMessages();
    return messages.filter(msg => 
      msg.senderId === userId || msg.receiverId === userId
    );
  }

  createMessage(messageData: Omit<Message, 'id' | 'timestamp'>): Message {
    const messages = this.getMessages();
    const newMessage: Message = {
      ...messageData,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    messages.push(newMessage);
    this.saveToStorage('swoply_messages', messages);
    return newMessage;
  }
}

export const db = new Database();

// Категории товаров
export const CATEGORIES = {
  electronics: 'Электроника',
  clothing: 'Одежда',
  home: 'Дом и сад',
  transport: 'Транспорт',
  sports: 'Спорт',
  books: 'Книги',
  beauty: 'Красота',
  toys: 'Игрушки',
  services: 'Услуги',
  other: 'Другое'
} as const;

export type CategoryKey = keyof typeof CATEGORIES;