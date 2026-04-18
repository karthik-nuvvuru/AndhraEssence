import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Animated,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, spacing } from "@/theme";
import { authApi } from "@/services/api/endpoints";
import { useAuthStore } from "@/store";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { setAuth } = useAuthStore();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (emailValue: string) => {
    if (!emailValue) {
      setEmailError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError("Please enter a valid email");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (passwordValue: string) => {
    if (!passwordValue) {
      setPasswordError("Password is required");
      return false;
    }
    if (passwordValue.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    try {
      setLoading(true);
      const loginResponse = await authApi.login({ email, password });
      const { access_token, refresh_token } = loginResponse.data;

      const tempUser = {
        id: "",
        email: email,
        full_name: "",
        role: "customer" as const,
        phone: "",
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
      };
      setAuth(tempUser, access_token, refresh_token);

      const userResponse = await authApi.getMe();
      const user = userResponse.data;
      setAuth(
        {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          phone: user.phone || "",
          is_active: user.is_active,
          is_verified: user.is_verified,
          created_at: user.created_at,
        },
        access_token,
        refresh_token
      );
      router.replace("/");
    } catch {
      // Shake animation on error
      Animated.sequence([
        Animated.timing(buttonScaleAnim, { toValue: 0.95, duration: 50, useNativeDriver: true }),
        Animated.timing(buttonScaleAnim, { toValue: 1.02, duration: 100, useNativeDriver: true }),
        Animated.timing(buttonScaleAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      ]).start();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Dark gradient background */}
      <View style={styles.gradientBg}>
        <View style={styles.bgLayer1} />
        <View style={styles.purpleOrb} />
        <View style={styles.cyanOrb} />
      </View>

      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            {/* Logo */}
            <Animated.View style={[styles.logoBadge, { transform: [{ scale: fadeAnim }] }]}>
              <Text style={styles.logoText}>AE</Text>
            </Animated.View>

            <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
              AndhraEssence
            </Animated.Text>
            <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
              Premium Food Delivery
            </Animated.Text>

            {/* Inputs */}
            <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputWrapper, emailError && styles.inputError]}>
                  <Text style={styles.inputIcon}>✉️</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) validateEmail(text);
                    }}
                    onBlur={() => validateEmail(email)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputWrapper, passwordError && styles.inputError]}>
                  <Text style={styles.inputIcon}>🔐</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) validatePassword(text);
                    }}
                    onBlur={() => validatePassword(password)}
                    secureTextEntry
                  />
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              {/* Forgot */}
              <Pressable style={styles.forgotRow}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>
            </Animated.View>

            {/* CTA Button */}
            <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
              <Pressable
                style={({ pressed }) => [
                  styles.ctaButton,
                  pressed && styles.ctaButtonPressed,
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                <View style={styles.ctaInner}>
                  <Text style={styles.ctaText}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Pressable onPress={() => router.replace("/auth/register" as any)}>
                <Text style={styles.signUpText}>Sign Up</Text>
              </Pressable>
            </View>

            {/* Demo hint */}
            <View style={styles.demoBox}>
              <Text style={styles.demoText}>Use: customer@example.com / customer123</Text>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: "relative",
    backgroundColor: "#0B0B0F",
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  bgLayer1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0A0A14",
  },
  purpleOrb: {
    position: "absolute",
    top: "-20%",
    right: "-25%",
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "rgba(124, 58, 237, 0.25)",
    blurRadius: 80,
  },
  cyanOrb: {
    position: "absolute",
    bottom: "-25%",
    left: "-15%",
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    blurRadius: 100,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "rgba(255, 255, 255, 0.035)",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: spacing.xl,
    alignItems: "center",
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#7C3AED",
    letterSpacing: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.45)",
    fontWeight: "500",
    marginBottom: spacing.xl,
  },
  form: {
    width: "100%",
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.4)",
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  inputError: {
    borderColor: "rgba(239, 68, 68, 0.5)",
  },
  inputIcon: {
    fontSize: 17,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: spacing.xs,
  },
  forgotText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.4)",
    fontWeight: "500",
  },
  ctaButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  ctaButtonPressed: {
    opacity: 0.85,
  },
  ctaInner: {
    backgroundColor: "#7C3AED",
    paddingVertical: 17,
    alignItems: "center",
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.4)",
  },
  signUpText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C3AED",
  },
  demoBox: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.025)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderStyle: "dashed",
    width: "100%",
    alignItems: "center",
  },
  demoText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.25)",
  },
});