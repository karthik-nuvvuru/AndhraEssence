// User Types
export interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: "customer" | "restaurant_owner" | "rider" | "admin";
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  created_at: string;
}

// Restaurant Types
export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description?: string;
  cuisine_type?: string;
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  logo_url?: string;
  cover_image_url?: string;
  rating: number;
  review_count: number;
  is_active: boolean;
  is_open: boolean;
  opening_time: string;
  closing_time: string;
  delivery_radius_km: number;
  minimum_order: number;
  delivery_fee: number;
  created_at: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_veg: boolean;
  is_available: boolean;
  is_featured: boolean;
  preparation_time_minutes: number;
  calories?: number;
  tags?: string[];
  sort_order: number;
}

// Order Types
export interface OrderItem {
  id: string;
  menu_item_id?: string;
  item_name: string;
  item_price: number;
  quantity: number;
  subtotal: number;
  special_instructions?: string;
}

export interface CartItem {
  menu_item_id: string;
  quantity: number;
  special_instructions?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  restaurant_id: string;
  rider_id?: string;
  address_id: string;
  subtotal: number;
  tax_amount: number;
  delivery_fee: number;
  discount_amount: number;
  promo_code?: string;
  total_amount: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  delivery_instructions?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  placed_at: string;
  confirmed_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  items?: OrderItem[];
  restaurant_name?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

export type PaymentMethod = "razorpay" | "wallet" | "cod";

// Rider Types
export interface Rider {
  id: string;
  user_id: string;
  vehicle_type?: string;
  vehicle_number?: string;
  license_number?: string;
  is_available: boolean;
  is_online: boolean;
  current_latitude?: number;
  current_longitude?: number;
}

// API Response Types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiError {
  detail: string;
}
