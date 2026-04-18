import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { colors, typography, spacing } from "@/theme";
import { useUIStore } from "@/store";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(
    Platform.OS === "web"
      ? typeof window !== "undefined" ? window.navigator.onLine : true
      : true
  );
  const setStoreOnline = useUIStore((state) => state.setOnline);

  useEffect(() => {
    if (Platform.OS === "web") {
      const handleOnline = () => {
        setIsOnline(true);
        setStoreOnline(true);
      };
      const handleOffline = () => {
        setIsOnline(false);
        setStoreOnline(false);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, [setStoreOnline]);

  if (isOnline) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.errorBg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.error,
  },
  text: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: "500",
  },
});
