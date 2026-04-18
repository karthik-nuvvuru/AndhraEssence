import { io, Socket } from "socket.io-client";
import { WS_BASE_URL, TIMEOUTS } from "@/utils/constants";
import { Platform } from "react-native";

// Get appropriate WebSocket URL based on platform
// For native (iOS/Android), localhost refers to the device itself, not the server
const getWebSocketUrl = (): string => {
  const baseUrl = WS_BASE_URL;
  // If already a production URL, use it
  if (baseUrl.includes("wss://") || baseUrl.includes("https://")) {
    return baseUrl.replace("https://", "wss://").replace("http://", "ws://");
  }
  // For native debug builds, use actual IP instead of localhost
  if (Platform.OS !== "web" && __DEV__) {
    // Users should set EXPO_PUBLIC_WS_URL to their server IP for testing on device
    return WS_BASE_URL;
  }
  return baseUrl;
};

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string) {
    if (this.socket?.connected && this.userId === userId) {
      return;
    }

    this.disconnect();
    this.userId = userId;

    const wsUrl = getWebSocketUrl();

    this.socket = io(wsUrl, {
      transports: ["websocket"],
      timeout: TIMEOUTS.WebSocket,
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    this.socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    this.socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    this.socket.on("subscribed", (data) => {
      console.log("Subscribed to order:", data.order_id);
    });

    this.socket.on("order_status_update", (data) => {
      console.log("Order status update:", data);
      // This will be handled by the store
    });

    this.socket.on("rider_location", (data) => {
      console.log("Rider location update:", data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  subscribeToOrder(orderId: string) {
    if (this.socket?.connected) {
      this.socket.emit("subscribe_order", { order_id: orderId });
    }
  }

  unsubscribeFromOrder(orderId: string) {
    if (this.socket?.connected) {
      this.socket.emit("unsubscribe_order", { order_id: orderId });
    }
  }

  sendRiderLocation(orderId: string, lat: number, lng: number) {
    if (this.socket?.connected) {
      this.socket.emit("rider_location", {
        order_id: orderId,
        lat,
        lng,
      });
    }
  }

  sendPing() {
    if (this.socket?.connected) {
      this.socket.emit("ping");
    }
  }

  onOrderStatusUpdate(callback: (data: any) => void) {
    this.socket?.on("order_status_update", callback);
  }

  onRiderLocation(callback: (data: any) => void) {
    this.socket?.on("rider_location", callback);
  }

  removeOrderStatusListener() {
    this.socket?.off("order_status_update");
  }

  removeRiderLocationListener() {
    this.socket?.off("rider_location");
  }

  subscribe(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  unsubscribe(event: string) {
    this.socket?.off(event);
  }
}

export const socketService = new SocketService();
