import React, { useEffect } from "react";
import { Text, StyleSheet, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { colors, typography, spacing } from "@/theme";
import { useUIStore } from "@/store";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = React.useState(
    Platform.OS === "web"
      ? typeof window !== "undefined" ? window.navigator.onLine : true
      : true
  );
  const setStoreOnline = useUIStore((state) => state.setOnline);
  const translateY = useSharedValue(-100);

  useEffect(() => {
    if (!isOnline) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    } else {
      translateY.value = withSpring(-100, { damping: 15, stiffness: 150 });
    }
  }, [isOnline, translateY]);

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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (isOnline) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.errorBg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.error,
    zIndex: 999,
  },
  text: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: "500",
  },
});
