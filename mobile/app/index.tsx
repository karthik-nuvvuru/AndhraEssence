import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuthStore } from "@/store";
import { colors } from "@/theme";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const hasNavigated = useRef(false);
  const [isReady, setIsReady] = useState(false);

  // Wait for router to be ready before navigating
  useEffect(() => {
    const timeout = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Only navigate after:
    // 1. Router is ready (small delay for navigator to mount)
    // 2. Store has finished loading (hydrated from storage)
    // 3. We haven't already navigated
    if (isReady && !isLoading && !hasNavigated.current) {
      hasNavigated.current = true;
      if (isAuthenticated) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth");
      }
    }
  }, [isReady, isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <LoadingSpinner text="Loading..." fullScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
