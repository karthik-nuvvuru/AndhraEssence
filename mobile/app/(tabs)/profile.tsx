// Premium Profile Screen - Liquid Glass Design
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  FileText,
  LogOut,
  Settings,
  ChevronRight,
  Shield,
  User,
  Mail,
  Phone,
  ShoppingBag,
  Gift,
  Star,
} from "lucide-react-native";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { useAuthStore } from "@/store";

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  isLast?: boolean;
  isDestructive?: boolean;
  testID?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, subtitle, onPress, isLast, isDestructive, testID }) => (
  <TouchableOpacity
    style={[styles.menuItem, isLast && styles.menuItemLast]}
    onPress={onPress}
    activeOpacity={0.7}
    testID={testID}
  >
    <View style={styles.menuItemLeft}>
      <View style={[styles.menuIconBox, isDestructive && styles.menuIconBoxDestructive]}>
        {icon}
      </View>
      <View style={styles.menuItemContent}>
        <Text style={[styles.menuTitle, isDestructive && styles.menuTitleDestructive]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <ChevronRight size={18} color={colors.textTertiary} />
  </TouchableOpacity>
);

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();

  // Pulse animation for avatar glow
  const avatarPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(avatarPulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(avatarPulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [avatarPulseAnim]);

  const menuItems = [
    { icon: <MapPin size={18} color={colors.primary} />, title: "My Addresses", subtitle: "Manage delivery addresses", onPress: () => router.push("/profile/addresses"), testID: "btn-my-addresses" },
    { icon: <CreditCard size={18} color={colors.primary} />, title: "Payment Methods", subtitle: "Cards, wallets, UPI", onPress: () => Alert.alert("Coming Soon", "Payment methods will be available soon"), testID: "btn-payment-methods" },
    { icon: <Bell size={18} color={colors.primary} />, title: "Notifications", subtitle: "Preferences and history", onPress: () => Alert.alert("Coming Soon", "Notification settings will be available soon"), testID: "btn-notifications" },
  ];

  const supportItems = [
    { icon: <HelpCircle size={18} color={colors.textSecondary} />, title: "Help & Support", onPress: () => Alert.alert("Help & Support", "Contact us at support@andhraessence.com"), testID: "btn-help-support" },
    { icon: <FileText size={18} color={colors.textSecondary} />, title: "Terms & Conditions", onPress: () => Alert.alert("Terms", "Terms & Conditions will be displayed here"), testID: "btn-terms" },
    { icon: <Shield size={18} color={colors.textSecondary} />, title: "Privacy Policy", onPress: () => Alert.alert("Privacy", "Privacy Policy will be displayed here"), testID: "btn-privacy" },
  ];

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          useAuthStore.getState().logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const initials = getInitials(user?.full_name || "GU");

  return (
    <SafeAreaView style={styles.container} edges={["top"]} testID="screen-profile">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom > 0 ? insets.bottom + spacing.lg : spacing.lg }]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {/* 3-layer gradient glow with pulse */}
            <Animated.View
              style={[
                styles.avatarGlowOuter,
                { transform: [{ scale: avatarPulseAnim }] },
              ]}
            />
            <Animated.View
              style={[
                styles.avatarGlowMiddle,
                { transform: [{ scale: avatarPulseAnim }] },
              ]}
            />
            <Animated.View
              style={[
                styles.avatarGlowInner,
                { transform: [{ scale: avatarPulseAnim }] },
              ]}
            />
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials} testID="avatar-user">{initials}</Text>
            </View>
          </View>
          <Text style={styles.userName} testID="text-user-name">{user?.full_name || "Guest User"}</Text>
          <Text style={styles.userEmail} testID="text-user-email">{user?.email || "Welcome to AndhraEssence"}</Text>
          {user?.phone && (
            <View style={styles.phoneRow}>
              <Phone size={13} color={colors.textTertiary} />
              <Text style={styles.userPhone}>{user.phone}</Text>
            </View>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox} testID="stat-orders">
            <View style={styles.statIconBox}>
              <ShoppingBag size={16} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statBoxDivider} />
          <View style={styles.statBox} testID="stat-rewards">
            <View style={styles.statIconBox}>
              <Gift size={16} color={colors.accent} />
            </View>
            <Text style={styles.statValue}>240</Text>
            <Text style={styles.statLabel}>Rewards</Text>
          </View>
          <View style={styles.statBoxDivider} />
          <View style={styles.statBox} testID="stat-reviews">
            <View style={styles.statIconBox}>
              <Star size={16} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.glassCard}>
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                onPress={item.onPress}
                isLast={index === menuItems.length - 1}
                testID={item.testID}
              />
            ))}
          </View>
        </View>

        {/* Support */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>Support</Text>
          <View style={styles.glassCard}>
            {supportItems.map((item, index) => (
              <MenuItem
                key={index}
                icon={item.icon}
                title={item.title}
                onPress={item.onPress}
                isLast={index === supportItems.length - 1}
                testID={item.testID}
              />
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <View style={styles.appInfoCard}>
            <View style={styles.appInfoLeft}>
              <View style={styles.appIconBox}>
                <Text style={styles.appIconText}>AE</Text>
              </View>
              <View>
                <Text style={styles.appName}>AndhraEssence</Text>
                <Text style={styles.appVersion}>Version 1.0.0</Text>
              </View>
            </View>
            <View style={styles.appBadge}>
              <Text style={styles.appBadgeText}>v1.0</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
            testID="btn-logout"
          >
            <View style={styles.logoutIconBox}>
              <LogOut size={18} color={colors.error} />
            </View>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing.md,
  },
  avatarGlowOuter: {
    position: "absolute",
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 68,
    backgroundColor: colors.primary,
    opacity: 0.1,
  },
  avatarGlowMiddle: {
    position: "absolute",
    top: -14,
    left: -14,
    right: -14,
    bottom: -14,
    borderRadius: 62,
    backgroundColor: colors.primary,
    opacity: 0.18,
  },
  avatarGlowInner: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 56,
    backgroundColor: colors.primary,
    opacity: 0.3,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryGlow,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.glass,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 1,
  },
  userName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  userPhone: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  statBoxDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: "700",
    marginBottom: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  menuSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontWeight: "600",
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
  },
  glassCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  menuIconBoxDestructive: {
    backgroundColor: colors.errorBg,
  },
  menuItemContent: {
    flex: 1,
  },
  menuTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  menuTitleDestructive: {
    color: colors.error,
  },
  menuSubtitle: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  appInfoSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  appInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  appInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  appIconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  appIconText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary,
  },
  appName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  appVersion: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  appBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appBadgeText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  logoutSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing.md,
    gap: spacing.sm,
  },
  logoutIconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.errorBg,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    ...typography.bodyBold,
    color: colors.error,
  },
});