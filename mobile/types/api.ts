// API Types for AndhraEssence Mobile App

export interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  address: string;
  address_line1?: string;
  city: string;
  rating: number;
  review_count?: number;
  delivery_fee: number;
  minimum_order: number;
  is_open: boolean;
  is_active: boolean;
  image_url?: string;
  cover_image_url?: string;
  promo_text?: string;
  estimated_delivery_time?: string;
  opening_time: string;
  closing_time: string;
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_veg: boolean;
  is_available: boolean;
  is_bestseller: boolean;
  is_featured?: boolean;
  prep_time: number;
  preparation_time_minutes?: number;
  category: string;
  category_id?: string;
  created_at: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id?: string;
  name: string;
  description?: string;
  display_order: number;
  items?: MenuItem[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  special_instructions?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  restaurant_id: string;
  restaurant_name?: string;
  address_id: string;
  subtotal: number;
  tax_amount: number;
  delivery_fee: number;
  discount_amount: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  promo_code?: string;
  delivery_instructions?: string;
  created_at: string;
  placed_at?: string;
  confirmed_at?: string;
  preparing_at?: string;
  ready_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  items?: Array<{ item_name: string; quantity: number; price: number }>;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export type UserRole =
  | "customer"
  | "restaurant_owner"
  | "rider"
  | "admin";

export interface Address {
  id: string;
  user_id: string;
  label: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: "card" | "wallet" | "upi";
  last4?: string;
  brand?: string;
  is_default: boolean;
  created_at: string;
}

export interface Rider {
  id: string;
  user_id: string;
  current_latitude?: number;
  current_longitude?: number;
  is_online: boolean;
  is_available: boolean;
  rating: number;
  total_deliveries: number;
  created_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}
