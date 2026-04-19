import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuthStore } from "@/store";
import { colors } from "@/theme";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Only navigate once
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      if (isAuthenticated) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth");
      }
    }
  }, [isAuthenticated]);

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
