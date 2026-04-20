// Premium Login Screen - Glassmorphism Dark Theme
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { spacing, colors, typography, borderRadius } from "@/theme";
import { authApi } from "@/services/api/endpoints";
import { useAuthStore } from "@/store";
import { useToast } from "@/components/ui/Toast";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuthStore();
  const { showToast } = useToast();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const orb1Y = useRef(new Animated.Value(0)).current;
  const orb1Scale = useRef(new Animated.Value(1)).current;
  const orb2Y = useRef(new Animated.Value(0)).current;
  const orb2Scale = useRef(new Animated.Value(1)).current;

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
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(orb1Y, { toValue: -30, duration: 3000, useNativeDriver: true }),
            Animated.timing(orb1Scale, { toValue: 1.15, duration: 3000, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(orb1Y, { toValue: 0, duration: 3000, useNativeDriver: true }),
            Animated.timing(orb1Scale, { toValue: 1, duration: 3000, useNativeDriver: true }),
          ]),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(orb2Y, { toValue: 25, duration: 2500, useNativeDriver: true }),
            Animated.timing(orb2Scale, { toValue: 1.1, duration: 2500, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(orb2Y, { toValue: 0, duration: 2500, useNativeDriver: true }),
            Animated.timing(orb2Scale, { toValue: 1, duration: 2500, useNativeDriver: true }),
          ]),
        ])
      ),
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
    } catch (err: any) {
      Animated.sequence([
        Animated.timing(buttonScaleAnim, { toValue: 0.95, duration: 50, useNativeDriver: true }),
        Animated.timing(buttonScaleAnim, { toValue: 1.02, duration: 100, useNativeDriver: true }),
        Animated.timing(buttonScaleAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      ]).start();
      const message = err.response?.data?.detail || "Invalid email or password. Please try again.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper} testID="screen-login">
      {/* Animated Background */}
      <View style={styles.gradientBg}>
        <View style={styles.bgLayer1} />
        <Animated.View
          style={[
            styles.purpleOrb,
            {
              transform: [
                { translateY: orb1Y },
                { scale: orb1Scale },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.cyanOrb,
            {
              transform: [
                { translateY: orb2Y },
                { scale: orb2Scale },
              ],
            },
          ]}
        />
      </View>

      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.keyboardView}
        >
          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            {/* Logo */}
            <Animated.View style={[styles.logoBadge, { transform: [{ scale: fadeAnim }] }]}>
              <Text style={styles.logoText}>AE</Text>
            </Animated.View>

            <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
              Welcome Back
            </Animated.Text>
            <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
              Sign in to continue ordering
            </Animated.Text>

            {/* Form */}
            <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputWrapper, emailError && styles.inputError]}>
                  <Mail size={18} color={colors.textTertiary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textTertiary}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) validateEmail(text);
                    }}
                    onBlur={() => validateEmail(email)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    testID="input-email"
                  />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputWrapper, passwordError && styles.inputError]}>
                  <Lock size={18} color={colors.textTertiary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textTertiary}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) validatePassword(text);
                    }}
                    onBlur={() => validatePassword(password)}
                    secureTextEntry={!showPassword}
                    testID="input-password"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8} testID="btn-toggle-password">
                    {showPassword ? (
                      <EyeOff size={18} color={colors.textTertiary} />
                    ) : (
                      <Eye size={18} color={colors.textTertiary} />
                    )}
                  </Pressable>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              {/* Forgot */}
              <Pressable style={styles.forgotRow} onPress={() => Alert.alert("Reset Password", "Password reset flow will be available soon")} testID="btn-forgot-password">
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>
            </Animated.View>

            {/* CTA Button */}
            <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
              <Pressable
                style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
                onPress={handleLogin}
                disabled={loading}
                testID="btn-signin"
              >
                <View style={styles.ctaInner}>
                  {loading ? (
                    <Text style={styles.ctaLoadingText}>Signing in...</Text>
                  ) : (
                    <Text style={styles.ctaText}>Sign In</Text>
                  )}
                </View>
              </Pressable>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Pressable onPress={() => router.replace("/auth/register")} testID="btn-signup-link">
                <Text style={styles.signUpText}>Sign Up</Text>
              </Pressable>
            </View>

            {/* Demo hint */}
            <View style={styles.demoBox}>
              <Text style={styles.demoText}>Demo: customer@example.com / customer123</Text>
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
    backgroundColor: colors.background,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  bgLayer1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  purpleOrb: {
    position: "absolute",
    top: "-15%",
    right: "-20%",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.primaryGlowStrong,
  },
  cyanOrb: {
    position: "absolute",
    bottom: "-20%",
    left: "-15%",
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: colors.accentGlow,
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
    maxWidth: 400,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: "center",
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primaryGlow,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
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
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: spacing.sm,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: spacing.xs,
  },
  forgotText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "500",
  },
  ctaButton: {
    width: "100%",
    borderRadius: borderRadius.md,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  ctaButtonPressed: {
    opacity: 0.85,
  },
  ctaInner: {
    backgroundColor: colors.primary,
    paddingVertical: 17,
    alignItems: "center",
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: 0.3,
  },
  ctaLoadingText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  signUpText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  demoBox: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    width: "100%",
    alignItems: "center",
  },
  demoText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});