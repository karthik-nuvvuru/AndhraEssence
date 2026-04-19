import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type { User, Address } from "@/types/api";

// Web-specific storage adapter using localStorage
const webStorage = {
  getItem: (name: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(name);
    }
    return null;
  },
  setItem: (name: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(name);
    }
  },
};

// Get the appropriate storage adapter based on platform
const getStorage = () => {
  if (Platform.OS === 'web') {
    return createJSONStorage(() => webStorage);
  }
  return createJSONStorage(() => AsyncStorage);
};

// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, token: string, refreshToken: string) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, token, refreshToken) =>
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
      storage: getStorage(),
    }
  )
);

// Cart Store
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  is_veg: boolean;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;

  addItem: (menuItem: MenuItem, quantity?: number, instructions?: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,

      addItem: (menuItem, quantity = 1, instructions = "") => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (i) => i.menuItem.id === menuItem.id && i.specialInstructions === instructions
        );

        if (existingIndex >= 0) {
          const newItems = [...items];
          newItems[existingIndex].quantity += quantity;
          set({ items: newItems });
        } else {
          set({
            items: [...items, { menuItem, quantity, specialInstructions: instructions }],
          });
        }
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.menuItem.id !== itemId) });
        } else {
          set({
            items: get().items.map((i) =>
              i.menuItem.id === itemId ? { ...i, quantity } : i
            ),
          });
        }
      },

      removeItem: (itemId) =>
        set({ items: get().items.filter((i) => i.menuItem.id !== itemId) }),

      clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),

      getSubtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.menuItem.price * item.quantity,
          0
        ),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "cart-storage",
      storage: getStorage(),
    }
  )
);

// Order Store
interface Order {
  id?: string;
  order_number?: string;
  customer_id?: string;
  restaurant_id?: string;
  rider_id?: string;
  address_id?: string;
  subtotal?: number;
  tax_amount?: number;
  delivery_fee?: number;
  discount_amount?: number;
  promo_code?: string;
  total_amount?: number;
  status?: string;
  payment_method?: string;
  payment_status?: string;
  delivery_instructions?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  placed_at?: string;
  confirmed_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at?: string;
  items?: Array<{
    id?: string;
    menu_item_id?: string;
    item_name: string;
    item_price: number;
    quantity: number;
    subtotal: number;
    special_instructions?: string;
  }>;
  restaurant_name?: string;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  trackingOrderId: string | null;

  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  setCurrentOrder: (order: Order | null) => void;
  setTrackingOrderId: (orderId: string | null) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  trackingOrderId: null,

  setOrders: (orders) => set({ orders }),

  addOrder: (order) =>
    set({ orders: [order, ...get().orders] }),

  updateOrder: (orderId, updates) =>
    set({
      orders: get().orders.map((o) =>
        o.id === orderId ? { ...o, ...updates } : o
      ),
      currentOrder:
        get().currentOrder?.id === orderId
          ? { ...get().currentOrder, ...updates }
          : get().currentOrder,
    }),

  setCurrentOrder: (order) => set({ currentOrder: order }),

  setTrackingOrderId: (orderId) => set({ trackingOrderId: orderId }),
}));

// UI Store
interface UIState {
  isOnline: boolean;
  isLocationEnabled: boolean;
  currentLocation: { lat: number; lng: number } | null;

  setOnline: (online: boolean) => void;
  setLocationEnabled: (enabled: boolean) => void;
  setCurrentLocation: (location: { lat: number; lng: number } | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isOnline: true,
  isLocationEnabled: false,
  currentLocation: null,

  setOnline: (online) => set({ isOnline: online }),
  setLocationEnabled: (enabled) => set({ isLocationEnabled: enabled }),
  setCurrentLocation: (location) => set({ currentLocation: location }),
}));
