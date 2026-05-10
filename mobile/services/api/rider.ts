import apiClient from "./apiClient";

// Extended Rider API
export const extendedRiderApi = {
  confirmPickup: (orderId: string) =>
    apiClient.post("/riders/pickup", { order_id: orderId }),

  confirmDelivery: (orderId: string, signatureImage?: string) =>
    apiClient.post("/riders/deliver", { order_id: orderId, signature_image: signatureImage }),

  getDeliveryHistory: (limit: number = 50) =>
    apiClient.get<{
      total_deliveries: number;
      total_earnings: number;
      average_rating: number | null;
      deliveries: Array<{
        order_id: string;
        order_number: string;
        restaurant_name: string;
        customer_address: string;
        earnings: number;
        rating: number | null;
        delivered_at: string;
      }>;
    }>("/riders/history", { params: { limit } }),

  submitRating: (orderId: string, rating: number, comment?: string) =>
    apiClient.post("/riders/rating", { order_id: orderId, rating, comment }),
};
