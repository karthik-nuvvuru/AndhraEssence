import apiClient from "./apiClient";
import type {
  User,
  Address,
  Restaurant,
  MenuItem,
  Order,
  PaymentMethod,
} from "@/types/api";

// Cart Item type (for order creation)
export interface CartItem {
  menu_item_id: string;
  quantity: number;
  special_instructions?: string;
}

// Auth API
export const authApi = {
  register: (data: {
    email: string;
    phone: string;
    password: string;
    full_name: string;
    role?: string;
  }) => apiClient.post("/auth/register", data),

  login: ({ email, password }: { email: string; password: string }) =>
    apiClient.post("/auth/login", { email, password }),

  refreshToken: (refreshToken: string) =>
    apiClient.post("/auth/refresh", { refresh_token: refreshToken }),

  logout: () => apiClient.post("/auth/logout"),

  getMe: () => apiClient.get<User>("/auth/me"),
};

// User API
export const userApi = {
  updateProfile: (data: Partial<User>) =>
    apiClient.put<User>("/users/me", data),

  getAddresses: () => apiClient.get<Address[]>("/users/me/addresses"),

  addAddress: (data: Omit<Address, "id" | "user_id" | "created_at">) =>
    apiClient.post<Address>("/users/me/addresses", data),

  updateAddress: (
    addressId: string,
    data: Partial<Address>
  ) =>
    apiClient.put<Address>(`/users/me/addresses/${addressId}`, data),

  deleteAddress: (addressId: string) =>
    apiClient.delete(`/users/me/addresses/${addressId}`),
};

// Restaurant API
export const restaurantApi = {
  list: (params?: {
    city?: string;
    cuisine?: string;
    min_rating?: number;
    is_open?: boolean;
    page?: number;
    limit?: number;
  }) => apiClient.get<{ items: Restaurant[]; total: number; pages: number }>(
    "/restaurants",
    { params }
  ),

  getById: (restaurantId: string) =>
    apiClient.get<Restaurant>(`/restaurants/${restaurantId}`),

  getMenu: (restaurantId: string) =>
    apiClient.get<MenuItem[]>(`/restaurants/${restaurantId}/menu`),

  create: (data: Partial<Restaurant>) =>
    apiClient.post<Restaurant>("/restaurants", data),

  update: (restaurantId: string, data: Partial<Restaurant>) =>
    apiClient.put<Restaurant>(`/restaurants/${restaurantId}`, data),
};

// Menu API
export const menuApi = {
  createCategory: (
    restaurantId: string,
    data: { name: string; description?: string; sort_order?: number }
  ) => apiClient.post(`/restaurants/${restaurantId}/categories`, data),

  updateCategory: (
    categoryId: string,
    data: { name?: string; description?: string; is_active?: boolean }
  ) => apiClient.put(`/menu/categories/${categoryId}`, data),

  createItem: (
    restaurantId: string,
    data: Partial<MenuItem>
  ) => apiClient.post<MenuItem>(`/restaurants/${restaurantId}/items`, data),

  updateItem: (
    itemId: string,
    data: Partial<MenuItem>
  ) => apiClient.put<MenuItem>(`/menu/items/${itemId}`, data),

  deleteItem: (itemId: string) =>
    apiClient.delete(`/menu/items/${itemId}`),
};

// Order API
export const orderApi = {
  create: (data: {
    restaurant_id: string;
    address_id: string;
    items: CartItem[];
    payment_method: PaymentMethod;
    promo_code?: string;
    delivery_instructions?: string;
  }) => apiClient.post<Order>("/orders", data),

  list: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get<{ items: Order[]; total: number; pages: number }>("/orders", {
      params,
    }),

  getById: (orderId: string) =>
    apiClient.get<Order>(`/orders/${orderId}`),

  updateStatus: (orderId: string, status: string, reason?: string) =>
    apiClient.put<Order>(`/orders/${orderId}/status`, { status, reason }),

  cancel: (orderId: string, reason?: string) =>
    apiClient.post(`/orders/${orderId}/cancel`, { reason }),
};

// Payment API
export const paymentApi = {
  createRazorpayOrder: (orderId: string, amount: number, currency: string = "INR") =>
    apiClient.post<{
      id: string;
      amount: number;
      currency: string;
      status: string;
    }>("/payments/create-order", {
      order_id: orderId,
      amount,
      currency,
    }),

  verifyPayment: (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) =>
    apiClient.post("/payments/verify", {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    }),
};

// Rider API
export const riderApi = {
  register: () => apiClient.post("/riders/register"),

  getProfile: () => apiClient.get("/riders/me"),

  updateProfile: (data: {
    vehicle_type?: string;
    vehicle_number?: string;
    is_online?: boolean;
    is_available?: boolean;
  }) => apiClient.put("/riders/me", data),

  updateLocation: (latitude: number, longitude: number) =>
    apiClient.put("/riders/location", {
      latitude,
      longitude,
    }),

  getAvailableOrders: () =>
    apiClient.get<any[]>("/riders/orders/available"),

  acceptOrder: (orderId: string) =>
    apiClient.post(`/riders/orders/${orderId}/accept`),

  getMyOrders: (status?: string) =>
    apiClient.get<any[]>("/riders/orders", { params: { status } }),
};

// Device API
export const deviceApi = {
  registerPushToken: (pushToken: string) =>
    apiClient.post("/devices/register-token", { push_token: pushToken }),

  unregisterPushToken: (pushToken: string) =>
    apiClient.delete(`/devices/unregister-token?push_token=${encodeURIComponent(pushToken)}`),
};

// Admin API
export const adminApi = {
  getDashboard: () =>
    apiClient.get<{
      total_users: number;
      total_restaurants: number;
      active_riders: number;
      orders_today: number;
      revenue_today: number;
      recent_orders: any[];
    }>("/admin/dashboard"),

  getUsers: (params?: { role?: string; is_active?: boolean }) =>
    apiClient.get<any[]>("/admin/users", { params }),

  toggleUserActive: (userId: string) =>
    apiClient.put(`/admin/users/${userId}/toggle-active`),

  getRestaurants: (params?: { is_active?: boolean }) =>
    apiClient.get<Restaurant[]>("/admin/restaurants", { params }),

  toggleRestaurantActive: (restaurantId: string) =>
    apiClient.put(`/admin/restaurants/${restaurantId}/toggle-active`),

  getAnalytics: (days?: number) =>
    apiClient.get("/admin/analytics", { params: { days } }),
};
