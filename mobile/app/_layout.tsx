import React, { useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import {
  initializeNotifications,
  setupNotificationTapHandler,
  handleNotificationTap,
  removeNotificationSubscription,
  registerDeviceToken,
  getStoredPushToken,
  type Notifications,
} from "@/services/notifications/notificationService";
import * as Notifications from "expo-notifications";

function RootLayoutNav() {
  const { user, isAuthenticated } = useAuth();
  const role = user?.role;
  const notificationTapSubscription = useRef<Notifications.EventSubscription | null>(null);
  const hasRegisteredToken = useRef(false);

  // Initialize notifications on app startup - request permissions
  useEffect(() => {
    initializeNotifications();
  }, []);

  // Setup notification tap handler for deep linking
  useEffect(() => {
    notificationTapSubscription.current = setupNotificationTapHandler(
      (response: Notifications.NotificationResponse) => {
        handleNotificationTap(response);
      }
    );

    return () => {
      removeNotificationSubscription(notificationTapSubscription.current);
    };
  }, []);

  // Register device token when user logs in
  useEffect(() => {
    const registerTokenOnLogin = async () => {
      if (isAuthenticated && !hasRegisteredToken.current) {
        hasRegisteredToken.current = true;
        // Get the stored push token - in production this should be retrieved
        // from AsyncStorage or a global state after initializeNotifications sets it
        const token = await getStoredPushToken();
        if (token) {
          await registerDeviceToken(token);
        }
      } else if (!isAuthenticated) {
        // Reset on logout so token can be re-registered on next login
        hasRegisteredToken.current = false;
      }
    };

    registerTokenOnLogin();
  }, [isAuthenticated]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="restaurant/[id]" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="order/[id]" />
      {/* Dashboard screens based on user role */}
      {role === "admin" && (
        <Stack.Screen
          name="screens/admin/AdminDashboardScreen"
          options={{ title: "Admin Dashboard" }}
        />
      )}
      {role === "restaurant_owner" && (
        <Stack.Screen
          name="screens/restaurant/RestaurantDashboardScreen"
          options={{ title: "Restaurant Dashboard" }}
        />
      )}
      {role === "rider" && (
        <Stack.Screen
          name="screens/rider/RiderDashboardScreen"
          options={{ title: "Rider Dashboard" }}
        />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
