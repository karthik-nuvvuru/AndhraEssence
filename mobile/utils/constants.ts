// API Configuration
// In production, set EXPO_PUBLIC_API_URL and EXPO_PUBLIC_WS_URL environment variables
// For demo mode, set EXPO_PUBLIC_DEMO_API_URL to override the backend URL
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const demoApiUrl = process.env.EXPO_PUBLIC_DEMO_API_URL;
const wsUrl = process.env.EXPO_PUBLIC_WS_URL;

// Determine the appropriate backend URL based on environment
const getBackendUrl = () => {
  // Priority: 1. DEMO_API_URL (for demo deployments)
  //           2. EXPO_PUBLIC_API_URL (explicit production/dev URL)
  //           3. Fallback based on __DEV__
  if (demoApiUrl) {
    return demoApiUrl;
  }
  if (apiUrl) {
    return apiUrl;
  }
  // For dev mode in simulator, use host machine's IP for localhost
  // since simulator can't access host's localhost directly
  if (__DEV__) {
    // Use host IP for simulator dev mode
    return "http://192.168.1.8:8000/api/v1";
  }
  return "https://api.andhraessence.com/api/v1";
};

export const API_BASE_URL = getBackendUrl();

export const WS_BASE_URL = wsUrl ||
  (__DEV__ ? "ws://localhost:8000" : "wss://api.andhraessence.com");

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
  ONBOARDING_COMPLETED: "onboarding_completed",
  CART: "cart",
};

// Order Status
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY: "ready",
  PICKED_UP: "picked_up",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  RAZORPAY: "razorpay",
  WALLET: "wallet",
  COD: "cod",
} as const;

// User Roles
export const USER_ROLES = {
  CUSTOMER: "customer",
  RESTAURANT_OWNER: "restaurant_owner",
  RIDER: "rider",
  ADMIN: "admin",
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Timeouts
export const TIMEOUTS = {
  API_REQUEST: 30000,
  WebSocket: 60000,
};
