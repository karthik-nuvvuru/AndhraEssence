// Premium Register Screen - Glassmorphism Dark Theme
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Mail, Lock, Phone, User, Eye, EyeOff } from "lucide-react-native";
import { spacing, colors, typography, borderRadius } from "@/theme";
import { authApi } from "@/services/api/endpoints";
import { useAuthStore } from "@/store";
import { getRoleRedirectPath } from "@/utils/roleRedirect";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { setAuth } = useAuthStore();

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email";
      }
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (phone.length < 10) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const loginResponse = await authApi.register({
        full_name: fullName,
        email,
        phone,
        password,
        role: "customer",
      });

      const { access_token, refresh_token } = loginResponse.data;

      const tempUser = {
        id: "",
        email: email,
        full_name: fullName,
        role: "customer" as const,
        phone: phone,
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

      Alert.alert("Success", "Account created successfully", [
        { text: "OK", onPress: () => router.replace(getRoleRedirectPath(user.role)) },
      ]);
    } catch (error: any) {
      Animated.sequence([
        Animated.timing(buttonScaleAnim, { toValue: 0.95, duration: 50, useNativeDriver: true }),
        Animated.timing(buttonScaleAnim, { toValue: 1.02, duration: 100, useNativeDriver: true }),
        Animated.timing(buttonScaleAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      ]).start();
      Alert.alert("Registration Failed", error?.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper} testID="screen-register">
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
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
              {/* Logo */}
              <Animated.View style={[styles.logoBadge, { transform: [{ scale: fadeAnim }] }]}>
                <Text style={styles.logoText}>AE</Text>
              </Animated.View>

              <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
                Create Account
              </Animated.Text>
              <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
                Sign up to start ordering
              </Animated.Text>

              {/* Form */}
              <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={[styles.inputWrapper, errors.fullName && styles.inputError]}>
                    <User size={18} color={colors.textTertiary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      placeholderTextColor={colors.textTertiary}
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                      testID="input-fullname"
                    />
                  </View>
                  {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                    <Mail size={18} color={colors.textTertiary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor={colors.textTertiary}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      testID="input-register-email"
                    />
                  </View>
                  {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone</Text>
                  <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
                    <Phone size={18} color={colors.textTertiary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your phone number"
                      placeholderTextColor={colors.textTertiary}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      testID="input-phone"
                    />
                  </View>
                  {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                    <Lock size={18} color={colors.textTertiary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Create a password"
                      placeholderTextColor={colors.textTertiary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      testID="input-register-password"
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8} testID="btn-toggle-register-password">
                      {showPassword ? (
                        <EyeOff size={18} color={colors.textTertiary} />
                      ) : (
                        <Eye size={18} color={colors.textTertiary} />
                      )}
                    </Pressable>
                  </View>
                  {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                    <Lock size={18} color={colors.textTertiary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm your password"
                      placeholderTextColor={colors.textTertiary}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      testID="input-confirm-password"
                    />
                    <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={8} testID="btn-toggle-confirm-password">
                      {showConfirmPassword ? (
                        <EyeOff size={18} color={colors.textTertiary} />
                      ) : (
                        <Eye size={18} color={colors.textTertiary} />
                      )}
                    </Pressable>
                  </View>
                  {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
                </View>
              </Animated.View>

              {/* CTA Button */}
              <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                <Pressable
                  style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
                  onPress={handleRegister}
                  disabled={loading}
                  testID="btn-create-account"
                >
                  <View style={styles.ctaInner}>
                    {loading ? (
                      <Text style={styles.ctaLoadingText}>Creating account...</Text>
                    ) : (
                      <Text style={styles.ctaText}>Create Account</Text>
                    )}
                  </View>
                </Pressable>
              </Animated.View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <Pressable onPress={() => router.replace("/auth/login")} testID="btn-signin-link">
                  <Text style={styles.signInText}>Sign In</Text>
                </Pressable>
              </View>
            </Animated.View>
          </ScrollView>
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
    left: "-20%",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.primaryGlowStrong,
  },
  cyanOrb: {
    position: "absolute",
    bottom: "-20%",
    right: "-15%",
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
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
  signInText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
});