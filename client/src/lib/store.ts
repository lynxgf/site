import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Size, FabricCategory, Fabric } from '@shared/schema';

// Cart item type
export type CartItem = {
  id: number;
  productId: number;
  quantity: number;
  selectedSize: string;
  customWidth?: number;
  customLength?: number;
  selectedFabricCategory: string;
  selectedFabric: string;
  hasLiftingMechanism: boolean;
  price: number;
  product?: {
    id: number;
    name: string;
    images: string[];
    basePrice: string;
    discount: number;
  };
};

// Product configuration type for product page
export type ProductConfiguration = {
  selectedSize: string;
  customWidth: number;
  customLength: number;
  selectedFabricCategory: string;
  selectedFabric: string;
  hasLiftingMechanism: boolean;
};

// State for cart
interface CartState {
  sessionId: string | null;
  cartItems: CartItem[];
  isCartLoading: boolean;
  isCartUpdating: boolean;
  cartError: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  updateCartItem: (id: number, updates: Partial<CartItem>) => Promise<void>;
  removeCartItem: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

// Cart store
export const useCartStore = create<CartState>((set, get) => ({
  sessionId: null,
  cartItems: [],
  isCartLoading: false,
  isCartUpdating: false,
  cartError: null,
  
  fetchCart: async () => {
    set({ isCartLoading: true, cartError: null });
    try {
      // First get the session
      const sessionRes = await fetch('/api/session');
      const sessionData = await sessionRes.json();
      
      set({ sessionId: sessionData.sessionId });
      
      // Then fetch cart
      const cartRes = await fetch('/api/cart');
      const cartItems = await cartRes.json();
      
      set({ cartItems, isCartLoading: false });
    } catch (error) {
      set({ 
        cartError: error instanceof Error ? error.message : 'Error fetching cart', 
        isCartLoading: false 
      });
    }
  },
  
  addToCart: async (item) => {
    set({ isCartUpdating: true, cartError: null });
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error adding to cart');
      }
      
      // Refresh cart after adding
      await get().fetchCart();
      set({ isCartUpdating: false });
    } catch (error) {
      set({ 
        cartError: error instanceof Error ? error.message : 'Error adding to cart', 
        isCartUpdating: false 
      });
    }
  },
  
  updateCartItem: async (id, updates) => {
    set({ isCartUpdating: true, cartError: null });
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error updating cart item');
      }
      
      // Refresh cart after update
      await get().fetchCart();
      set({ isCartUpdating: false });
    } catch (error) {
      set({ 
        cartError: error instanceof Error ? error.message : 'Error updating cart item', 
        isCartUpdating: false 
      });
    }
  },
  
  removeCartItem: async (id) => {
    set({ isCartUpdating: true, cartError: null });
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error removing cart item');
      }
      
      // Refresh cart after removal
      await get().fetchCart();
      set({ isCartUpdating: false });
    } catch (error) {
      set({ 
        cartError: error instanceof Error ? error.message : 'Error removing cart item', 
        isCartUpdating: false 
      });
    }
  },
  
  clearCart: async () => {
    set({ isCartUpdating: true, cartError: null });
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error clearing cart');
      }
      
      set({ cartItems: [], isCartUpdating: false });
    } catch (error) {
      set({ 
        cartError: error instanceof Error ? error.message : 'Error clearing cart', 
        isCartUpdating: false 
      });
    }
  }
}));

// User profile type
export type UserProfile = {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  isAdmin: boolean;
};

// Auth state
interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  username: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getUserProfile: () => Promise<UserProfile | null>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

// Auth store
export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isAdmin: false,
  username: null,
  user: null,
  isLoading: false,
  error: null,
  
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Неверное имя пользователя или пароль');
      }
      
      const userData = await res.json();
      
      set({ 
        isAuthenticated: true, 
        isAdmin: userData.isAdmin,
        username: userData.username,
        user: userData,
        isLoading: false,
        error: null
      });
      
      // Загружаем полный профиль пользователя
      await get().getUserProfile();
      
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Ошибка входа', 
        isLoading: false 
      });
      return false;
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    try {
      await fetch('/api/logout', { method: 'POST' });
      set({ 
        isAuthenticated: false, 
        isAdmin: false,
        username: null,
        user: null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка выхода из системы'
      });
    }
  },
  
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/session');
      const data = await res.json();
      
      set({ 
        isAuthenticated: data.isLoggedIn, 
        isAdmin: data.isAdmin,
        isLoading: false 
      });
      
      // Если пользователь авторизован, загружаем его профиль
      if (data.isLoggedIn) {
        await get().getUserProfile();
      }
    } catch (error) {
      set({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка проверки авторизации'
      });
    }
  },
  
  getUserProfile: async () => {
    try {
      if (!get().isAuthenticated) {
        return null;
      }
      
      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить профиль пользователя');
      }
      
      const profileData = await response.json();
      
      set({
        user: profileData,
        username: profileData.username,
        isAdmin: profileData.isAdmin,
      });
      
      return profileData;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ошибка загрузки профиля',
      });
      return null;
    }
  },
  
  updateUserProfile: async (updates) => {
    try {
      if (!get().isAuthenticated) {
        return null;
      }
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Не удалось обновить профиль');
      }
      
      const updatedProfile = await response.json();
      
      set({
        user: updatedProfile,
        username: updatedProfile.username,
      });
      
      return updatedProfile;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ошибка обновления профиля',
      });
      return null;
    }
  },
  
  updatePassword: async (currentPassword, newPassword) => {
    try {
      if (!get().isAuthenticated) {
        return false;
      }
      
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword: newPassword,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Не удалось обновить пароль');
      }
      
      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Ошибка обновления пароля',
      });
      return false;
    }
  },
}));

// Product configuration store (for product page)
interface ConfigurationState {
  selectedSize: string;
  customWidth: number;
  customLength: number;
  selectedFabricCategory: string;
  selectedFabric: string;
  hasLiftingMechanism: boolean;
  
  setSelectedSize: (size: string) => void;
  setCustomDimensions: (width: number, length: number) => void;
  setSelectedFabricCategory: (category: string) => void;
  setSelectedFabric: (fabric: string) => void;
  toggleLiftingMechanism: () => void;
  resetConfiguration: () => void;
}

// Initial configuration values
const initialConfig = {
  selectedSize: 'double',
  customWidth: 160,
  customLength: 200,
  selectedFabricCategory: 'standard',
  selectedFabric: 'beige',
  hasLiftingMechanism: false
};

// Product configuration store
export const useConfigurationStore = create<ConfigurationState>((set) => ({
  ...initialConfig,
  
  setSelectedSize: (size) => set({ selectedSize: size }),
  
  setCustomDimensions: (width, length) => set({ 
    customWidth: width, 
    customLength: length 
  }),
  
  setSelectedFabricCategory: (category) => set({ 
    selectedFabricCategory: category 
  }),
  
  setSelectedFabric: (fabric) => set({ 
    selectedFabric: fabric 
  }),
  
  toggleLiftingMechanism: () => set((state) => ({ 
    hasLiftingMechanism: !state.hasLiftingMechanism 
  })),
  
  resetConfiguration: () => set(initialConfig)
}));

// Интерфейс для настроек магазина
export interface ShopSettings {
  // General settings
  shopName: string;
  shopDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  workingHours: string;
  
  // Social media
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  
  // Delivery settings
  enableFreeDelivery: boolean;
  freeDeliveryThreshold: number;
  deliveryPriceLocal: number;
  deliveryPriceRegional: number;
  
  // Payment settings
  enableCashPayment: boolean;
  enableCardPayment: boolean;
  enableOnlinePayment: boolean;
  
  // Email notifications
  sendOrderConfirmation: boolean;
  sendOrderStatusUpdates: boolean;
  sendOrderShipped: boolean;
  
  // SMS notifications
  enableSmsNotifications: boolean;
  smsOrderConfirmation: boolean;
  smsOrderStatusUpdate: boolean;
}

// Состояние настроек магазина
interface SettingsState {
  settings: ShopSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<ShopSettings | null>;
  updateSettings: (newSettings: ShopSettings) => Promise<boolean>;
}

// Значения по умолчанию для настроек
const defaultSettings: ShopSettings = {
  shopName: 'Матрасовъ',
  shopDescription: 'Магазин высококачественных матрасов и кроватей',
  contactEmail: 'info@матрасовъ.рф',
  contactPhone: '+7 (495) 123-45-67',
  address: 'г. Москва, ул. Матрасная, д. 1',
  workingHours: 'ПН-ВС: 10:00 - 20:00',
  instagramUrl: 'https://instagram.com/matrasov',
  facebookUrl: 'https://facebook.com/matrasov',
  twitterUrl: '',
  enableFreeDelivery: true,
  freeDeliveryThreshold: 20000,
  deliveryPriceLocal: 1000,
  deliveryPriceRegional: 3000,
  enableCashPayment: true,
  enableCardPayment: true,
  enableOnlinePayment: true,
  sendOrderConfirmation: true,
  sendOrderStatusUpdates: true,
  sendOrderShipped: true,
  enableSmsNotifications: true,
  smsOrderConfirmation: true,
  smsOrderStatusUpdate: false,
};

// Создаем хранилище для настроек магазина
export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,
  
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      // Для обычных пользователей используем публичный эндпоинт
      const url = '/api/settings';
      const res = await fetch(url);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Ошибка загрузки настроек');
      }
      
      const settingsData = await res.json();
      set({ settings: settingsData, isLoading: false });
      return settingsData;
    } catch (error) {
      // Если настройки не были загружены, используем значения по умолчанию
      set({ 
        settings: defaultSettings,
        error: error instanceof Error ? error.message : 'Ошибка загрузки настроек', 
        isLoading: false 
      });
      return defaultSettings;
    }
  },
  
  updateSettings: async (newSettings: ShopSettings) => {
    set({ isLoading: true, error: null });
    try {
      // Только для админов
      const url = '/api/admin/settings';
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Ошибка обновления настроек');
      }
      
      const updatedSettings = await res.json();
      set({ settings: updatedSettings, isLoading: false });
      
      // Инвалидируем кеш настроек, чтобы все компоненты обновились
      queryClient.invalidateQueries({queryKey: ['/api/settings']});
      queryClient.invalidateQueries({queryKey: ['/api/admin/settings']});
      
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Ошибка обновления настроек', 
        isLoading: false 
      });
      return false;
    }
  }
}));
