import React, { useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

function RootLayoutNav() {
  const { user, isAuthenticated } = useAuth();
  const role = user?.role;

  // Initialize notifications on app startup - request permissions
  // Only run on native platforms (not web)
  useEffect(() => {
    if (Platform.OS === "web") return;

    async function init() {
      try {
        const notificationModule = await import("@/services/notifications/notificationService");
        await notificationModule.initializeNotifications();
      } catch (error) {
        console.warn("Failed to initialize notifications:", error);
      }
    }

    init();
  }, []);

  // Register device token when user logs in
  useEffect(() => {
    const registerTokenOnLogin = async () => {
      if (isAuthenticated) {
        try {
          const notificationModule = await import("@/services/notifications/notificationService");
          const token = notificationModule.getStoredPushToken();
          if (token) {
            await notificationModule.registerDeviceToken(token);
          }
        } catch (error) {
          console.warn("Failed to register device token:", error);
        }
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
        <ToastProvider>
          <OfflineBanner />
          <StatusBar style="dark" />
          <RootLayoutNav />
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
