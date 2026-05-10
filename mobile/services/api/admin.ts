import apiClient from "./apiClient";

// Extended Admin API
export const extendedAdminApi = {
  getPendingRestaurants: () =>
    apiClient.get<any[]>("/admin/restaurants/pending"),

  approveRestaurant: (restaurantId: string) =>
    apiClient.patch(`/admin/restaurants/${restaurantId}/approve`),

  getPendingRiders: () =>
    apiClient.get<any[]>("/admin/riders/pending"),

  approveRider: (userId: string) =>
    apiClient.patch(`/admin/riders/${userId}/approve`),

  updateUserRole: (userId: string, role: string) =>
    apiClient.patch(`/admin/users/${userId}/role`, { role }),

  getPromotions: (isActive?: boolean) =>
    apiClient.get<any[]>("/admin/promotions", { params: { is_active: isActive } }),

  createPromotion: (data: {
    code: string;
    discount_type: string;
    discount_value: number;
    min_order_amount?: number;
    max_uses?: number;
    valid_from: string;
    valid_until: string;
    is_active?: boolean;
  }) => apiClient.post("/admin/promotions", data),

  updatePromotion: (
    promotionId: string,
    data: {
      code?: string;
      discount_type?: string;
      discount_value?: number;
      min_order_amount?: number;
      max_uses?: number;
      valid_from?: string;
      valid_until?: string;
      is_active?: boolean;
    }
  ) => apiClient.patch(`/admin/promotions/${promotionId}`, data),

  deletePromotion: (promotionId: string) =>
    apiClient.delete(`/admin/promotions/${promotionId}`),

  createAnnouncement: (data: {
    title: string;
    body: string;
    target_roles: string[];
    is_active?: boolean;
  }) => apiClient.post("/admin/announcements", data),

  getSettings: () =>
    apiClient.get<{
      platform_name: string;
      support_email: string;
      support_phone: string;
      commission_rate: number;
      min_order_amount: number;
      delivery_radius_km: number;
    }>("/admin/settings"),

  updateSettings: (data: {
    platform_name?: string;
    support_email?: string;
    support_phone?: string;
    commission_rate?: number;
    min_order_amount?: number;
    delivery_radius_km?: number;
  }) => apiClient.patch("/admin/settings", data),
};
