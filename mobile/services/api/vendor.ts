import apiClient from "./apiClient";

// Vendor API
export const vendorApi = {
  getDashboard: () =>
    apiClient.get<{
      orders_today: number;
      orders_pending: number;
      revenue_today: number;
      revenue_week: number;
      rating: number;
      review_count: number;
    }>("/vendor/dashboard"),

  getOrders: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get<{
      items: any[];
      total: number;
      page: number;
      limit: number;
      pages: number;
    }>("/vendor/orders", { params }),

  updateOrderStatus: (orderId: string, status: string) =>
    apiClient.patch(`/vendor/orders/${orderId}/status`, status, {
      headers: { "Content-Type": "application/json" },
      data: { status },
    }),

  getMenu: () => apiClient.get<any[]>("/vendor/menu"),

  createCategory: (data: { name: string; description?: string; sort_order?: number }) =>
    apiClient.post("/vendor/menu/categories", data),

  updateCategory: (
    categoryId: string,
    data: { name?: string; description?: string; sort_order?: number; is_active?: boolean }
  ) => apiClient.patch(`/vendor/menu/categories/${categoryId}`, data),

  deleteCategory: (categoryId: string) =>
    apiClient.delete(`/vendor/menu/categories/${categoryId}`),

  createMenuItem: (
    data: {
      category_id: string;
      name: string;
      price: number;
      description?: string;
      image_url?: string;
      is_veg?: boolean;
      is_available?: boolean;
      is_featured?: boolean;
      preparation_time_minutes?: number;
      calories?: number;
      tags?: string[];
      sort_order?: number;
    }
  ) => apiClient.post("/vendor/menu/items", data),

  updateMenuItem: (
    itemId: string,
    data: {
      name?: string;
      price?: number;
      description?: string;
      image_url?: string;
      is_veg?: boolean;
      is_available?: boolean;
      is_featured?: boolean;
      preparation_time_minutes?: number;
      calories?: number;
      tags?: string[];
      sort_order?: number;
    }
  ) => apiClient.patch(`/vendor/menu/items/${itemId}`, data),

  toggleItemAvailability: (itemId: string, isAvailable: boolean) =>
    apiClient.patch(`/vendor/menu/items/${itemId}/availability`, { is_available: isAvailable }),

  deleteMenuItem: (itemId: string) =>
    apiClient.delete(`/vendor/menu/items/${itemId}`),

  getEarnings: (period: "day" | "week" | "month" = "week") =>
    apiClient.get<{
      total_earnings: number;
      period_start: string;
      period_end: string;
      entries: Array<{ date: string; orders_count: number; revenue: number }>;
    }>("/vendor/earnings", { params: { period } }),

  updateRestaurant: (data: {
    name?: string;
    description?: string;
    cuisine_type?: string;
    phone?: string;
    email?: string;
    delivery_fee?: number;
    minimum_order?: number;
    is_open?: boolean;
    opening_time?: string;
    closing_time?: string;
    delivery_radius_km?: number;
  }) => apiClient.patch("/vendor/restaurant", data),
};
