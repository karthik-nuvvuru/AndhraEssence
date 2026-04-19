import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/theme";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.log("Index: isAuthenticated =", isAuthenticated);
    // Simple navigation after a short delay
    const timeout = setTimeout(() => {
      console.log("Index: Navigating to", isAuthenticated ? "/(tabs)" : "/auth");
      if (isAuthenticated) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth");
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [isAuthenticated, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Loading... isAuthenticated: {String(isAuthenticated)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 18,
  },
});
