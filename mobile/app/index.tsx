// Premium Landing Screen
import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { colors, typography, spacing, borderRadius } from "@/theme";
import { useAuthStore } from "@/store";
import { STORAGE_KEYS } from "@/utils/constants";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    opacity.value = withTiming(1, { duration: 600 });
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });

    // Floating animation
    float.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    // Check if user is already authenticated or has completed onboarding
    const checkInitialState = async () => {
      try {
        const onboardingCompleted = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        const isAuth = useAuthStore.getState().isAuthenticated;
        if (isAuth) {
          router.replace("/(tabs)");
        } else if (onboardingCompleted === "true") {
          router.replace("/auth/login");
        }
        // else stay on landing page
      } catch {}
    };
    checkInitialState();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: float.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.gradientBg}>
        <View style={styles.purpleOrb1} />
        <View style={styles.purpleOrb2} />
        <View style={styles.cyanOrb} />
      </View>

      <Animated.View style={[styles.content, animatedStyle]}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIconBox}>
            <Text style={styles.logoText}>AE</Text>
          </View>
        </View>
        <Text style={styles.title}>AndhraEssence</Text>
        <Text style={styles.subtitle}>Discover the finest Andhra cuisine delivered to your doorstep</Text>
      </Animated.View>

      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [styles.buttonPrimary, pressed && styles.buttonPrimaryPressed]}
          onPress={() => router.replace("/onboarding")}
        >
          <Text style={styles.buttonPrimaryText}>Get Started</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.buttonSecondary, pressed && styles.buttonSecondaryPressed]}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.buttonSecondaryText}>Skip to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "space-between",
    paddingVertical: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: spacing.lg,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  purpleOrb1: {
    position: "absolute",
    top: "-20%",
    right: "-20%",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primaryGlowStrong,
    opacity: 0.4,
  },
  purpleOrb2: {
    position: "absolute",
    top: "30%",
    left: "-25%",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.primaryGlow,
    opacity: 0.3,
  },
  cyanOrb: {
    position: "absolute",
    bottom: "15%",
    right: "-15%",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.accentGlow,
    opacity: 0.25,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logoIconBox: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: colors.primaryGlow,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        boxShadow: `0 0 40px ${colors.primary}60`,
      },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
    }),
  },
  logoText: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 2,
  },
  title: {
    ...typography.hero,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
    lineHeight: 24,
  },
  buttonContainer: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 4,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  buttonPrimaryPressed: {
    opacity: 0.85,
  },
  buttonPrimaryText: {
    ...typography.button,
    color: colors.white,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.md + 4,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  buttonSecondaryPressed: {
    opacity: 0.7,
  },
  buttonSecondaryText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});