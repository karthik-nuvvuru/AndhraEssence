import {
  getDevicePushTokenAsync,
} from "expo-notifications";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { deviceApi } from "@/services/api/endpoints";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type?: string;
  orderId?: string;
  restaurantId?: string;
  url?: string;
  [key: string]: unknown;
}

export interface DeviceTokenResponse {
  success: boolean;
  message?: string;
}

// Module-level storage for the push token
let storedPushToken: string | null = null;

/**
 * Get the stored push token
 * @returns The stored push token or null if not yet obtained
 */
export function getStoredPushToken(): string | null {
  return storedPushToken;
}

/**
 * Request notification permissions from the user
 * @returns The push token if granted, null otherwise
 */
export async function requestNotificationPermissions(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If we don't have permission yet, request it
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Return null if permission denied
    if (finalStatus !== "granted") {
      console.log("[NotificationService] Permission denied");
      return null;
    }

    // Get the push token
    const tokenData = await getDevicePushTokenAsync();
    const token = getPushTokenString(tokenData);

    console.log("[NotificationService] Permission granted, token:", token);
    return token;
  } catch (error) {
    console.error("[NotificationService] Error requesting permissions:", error);
    return null;
  }
}

/**
 * Get the push token string from the token data
 */
function getPushTokenString(tokenData: any): string {
  if (typeof tokenData === "string") {
    return tokenData;
  }
  return tokenData?.data || "";
}

/**
 * Register the device push token with the backend
 * @param token The push token string
 * @returns Success status
 */
export async function registerDeviceToken(token: string): Promise<DeviceTokenResponse> {
  try {
    const response = await deviceApi.registerPushToken(token);
    return { success: true, message: "Device token registered successfully" };
  } catch (error) {
    console.error("[NotificationService] Error registering device token:", error);
    return { success: false, message: "Failed to register device token" };
  }
}

/**
 * Request permissions and register the device token with backend
 * Should be called on app startup
 * @returns The push token if successful, null otherwise
 */
export async function initializeNotifications(): Promise<string | null> {
  const token = await requestNotificationPermissions();
  if (token) {
    storedPushToken = token;
    await registerDeviceToken(token);
  }
  return token;
}

/**
 * Handle incoming notifications
 * Sets up the notification received listener
 */
export function setupNotificationReceivedHandler(
  handler: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(handler);
}

/**
 * Handle notification tap / deep linking
 * Sets up the notification response listener
 * Returns the subscription which can be removed on cleanup
 */
export function setupNotificationTapHandler(
  handler: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

/**
 * Parse notification data for deep linking
 */
export function parseNotificationData(
  notification: Notifications.Notification | Notifications.NotificationResponse
): NotificationData {
  // NotificationResponse has notification.request.content.data
  // Notification has request.content.data
  const content = 'notification' in notification
    ? notification.notification.request.content
    : notification.request.content;
  const data = content.data as NotificationData;
  return {
    type: data?.type,
    orderId: data?.orderId,
    restaurantId: data?.restaurantId,
    url: data?.url,
    ...data,
  };
}

/**
 * Handle notification tap based on type and navigate accordingly
 */
export async function handleNotificationTap(
  response: Notifications.NotificationResponse
): Promise<void> {
  const data = parseNotificationData(response);
  const notificationType = data.type;

  console.log("[NotificationService] Handling notification tap:", notificationType, data);

  switch (notificationType) {
    case "order_update":
    case "order_status":
      if (data.orderId) {
        // Navigate to order tracking - use Linking for deep linking
        const deepLinkUrl = `andhraessence://order/${data.orderId}`;
        console.log("[NotificationService] Navigating to order:", deepLinkUrl);
        // The URL will be handled by the system's linking handler
      }
      break;

    case "restaurant":
      if (data.restaurantId) {
        const deepLinkUrl = `andhraessence://restaurant/${data.restaurantId}`;
        console.log("[NotificationService] Navigating to restaurant:", deepLinkUrl);
      }
      break;

    case "promotion":
    case "general":
    default:
      // Open the app to the home screen
      console.log("[NotificationService] Opening home screen");
      break;
  }
}

/**
 * Remove a notification subscription
 */
export function removeNotificationSubscription(
  subscription: Notifications.EventSubscription | undefined
): void {
  if (subscription) {
    subscription.remove();
  }
}

/**
 * Send a local notification (for testing)
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: NotificationData
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data as Record<string, unknown>,
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error("[NotificationService] Error sending local notification:", error);
  }
}
