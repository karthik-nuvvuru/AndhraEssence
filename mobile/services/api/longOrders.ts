import apiClient from "./apiClient";
import type { Address } from "@/types/api";

// Cart Item type for long orders
export interface LongOrderCartItem {
  item_id: string;
  quantity: number;
}

// Long Order Category
export interface LongOrderCategory {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  items_count: number;
}

// Long Order Item
export interface LongOrderItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_veg: boolean;
  is_available: boolean;
  is_bestseller: boolean;
  preparation_days: number;
  stock_quantity: number;
  unit: string;
}

// Long Order Item Brief
export interface LongOrderItemBrief {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  preparation_days: number;
  unit: string;
}

// Cart Estimate
export interface CartEstimate {
  max_preparation_days: number;
  estimated_delivery_date: string;
  total_amount: number;
  subtotal: number;
  delivery_fee: number;
}

// Cart Validation
export interface CartValidation {
  is_valid: boolean;
  errors: string[];
  max_preparation_days: number;
  estimated_delivery_date: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
}

// Long Order Item Response (in order)
export interface LongOrderItemResponse {
  id: string;
  item_id: string;
  item_name: string;
  item_price: number;
  quantity: number;
  subtotal: number;
}

// Long Order
export interface LongOrder {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  estimated_delivery_date: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  items: LongOrderItemResponse[];
}

// Long Order Brief
export interface LongOrderBrief {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  items_count: number;
  estimated_delivery_date: string | null;
  created_at: string;
}

// Long Orders API
export const longOrdersApi = {
  // Categories
  getCategories: () =>
    apiClient.get<LongOrderCategory[]>("/long-orders/categories"),

  // Items
  getItems: (params?: {
    category_id?: string;
    is_bestseller?: boolean;
    is_available?: boolean;
    limit?: number;
  }) => apiClient.get<LongOrderItem[]>("/long-orders/items", { params }),

  getItem: (itemId: string) =>
    apiClient.get<LongOrderItem>(`/long-orders/items/${itemId}`),

  // Cart Estimate
  getCartEstimate: (items: LongOrderCartItem[], addressId: string) =>
    apiClient.get<CartEstimate>("/long-orders/cart/estimate", {
      params: { items, address_id: addressId },
    }),

  // Cart Validation
  validateCart: (items: LongOrderCartItem[], addressId: string) =>
    apiClient.post<CartValidation>("/long-orders/cart/validate", {
      items,
      address_id: addressId,
    }),

  // Orders
  createOrder: (data: {
    address_id: string;
    items: LongOrderCartItem[];
    payment_method?: string;
    promo_code?: string;
  }) => apiClient.post<LongOrder>("/long-orders/orders", data),

  getOrders: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get<{ items: LongOrderBrief[]; total: number; pages: number }>(
      "/long-orders/orders",
      { params }
    ),

  getOrder: (orderId: string) =>
    apiClient.get<LongOrder>(`/long-orders/orders/${orderId}`),

  cancelOrder: (orderId: string) =>
    apiClient.post(`/long-orders/orders/${orderId}/cancel`),
};
