import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Platform, LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastProvider } from "@/components/ui/Toast";

LogBox.ignoreLogs([
  "AsyncStorage: Failed to create new storage volume",
]);

function RootLayoutNav() {
  useEffect(() => {
    if (Platform.OS === "web") return;
    async function init() {
      try {
        const notificationModule = await import("@/services/notifications/notificationService");
        await notificationModule.initializeNotifications();
      } catch (error) {}
    }
    init();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="restaurant/[id]" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="order/[id]" />
      <Stack.Screen name="long-order" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="vendor" />
      <Stack.Screen name="rider" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
          <RootLayoutNav />
        </ToastProvider>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}