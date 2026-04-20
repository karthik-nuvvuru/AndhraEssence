import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Platform, LogBox } from "react-native";

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
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="restaurant/[id]" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="order/[id]" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootLayoutNav />
    </SafeAreaProvider>
  );
}