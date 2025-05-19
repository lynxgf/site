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

// Auth state
interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  username: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Auth store
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isAdmin: false,
  username: null,
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
        throw new Error(errorData.message || 'Login failed');
      }
      
      const userData = await res.json();
      
      set({ 
        isAuthenticated: true, 
        isAdmin: userData.isAdmin,
        username: userData.username,
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Login failed', 
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
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
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
    } catch (error) {
      set({ isLoading: false });
    }
  }
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
