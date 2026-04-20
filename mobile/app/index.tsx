import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AndhraEssence</Text>
        <Text style={styles.subtitle}>Discover the best food delivery</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={() => router.replace("/onboarding")}>
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.buttonSecondary]} onPress={() => router.replace("/(tabs)")}>
          <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Skip to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A14",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#7C3AED",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
  },
  buttonContainer: {
    gap: 16,
    width: "100%",
    maxWidth: 300,
  },
  button: {
    backgroundColor: "#7C3AED",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#7C3AED",
  },
  buttonTextSecondary: {
    color: "#7C3AED",
  },
});