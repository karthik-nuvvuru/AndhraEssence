import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { useAuthStore } from "@/store";

interface MenuItemProps {
  icon: string;
  title: string;
  onPress: () => void;
  isLast?: boolean;
  isDestructive?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress, isLast, isDestructive }) => (
  <TouchableOpacity
    style={[styles.menuItem, isLast && styles.menuItemLast]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemLeft}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuTitle, isDestructive && styles.menuTitleDestructive]}>
        {title}
      </Text>
    </View>
    <Text style={[styles.menuArrow, isDestructive && styles.menuArrowDestructive]}>›</Text>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user } = useAuthStore();

  const menuItems = [
    { icon: "🏠", title: "Addresses", onPress: () => router.push("/profile/addresses" as any) },
    { icon: "💳", title: "Payment Methods", onPress: () => Alert.alert("Coming Soon", "Payment methods will be available soon") },
    { icon: "🔔", title: "Notifications", onPress: () => Alert.alert("Coming Soon", "Notification settings will be available soon") },
    { icon: "❓", title: "Help & Support", onPress: () => Alert.alert("Help & Support", "Contact us at support@andhraessence.com") },
    { icon: "📜", title: "Terms & Conditions", onPress: () => Alert.alert("Terms", "Terms & Conditions will be displayed here") },
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarGlow} />
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
          </View>
          <Text style={styles.userName}>{user?.full_name || "Guest User"}</Text>
          <Text style={styles.userEmail}>{user?.email || "Welcome to AndhraEssence"}</Text>
        </View>

        {/* Settings Menu */}
        <View style={styles.menuSection}>
          <View style={styles.glassCard}>
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                icon={item.icon}
                title={item.title}
                onPress={item.onPress}
                isLast={index === menuItems.length - 1}
              />
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={styles.version}>AndhraEssence v1.0.0</Text>
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
  avatarGlow: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 58,
    backgroundColor: colors.primary,
    opacity: 0.2,
    blurRadius: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.glass,
    borderWidth: 2,
    borderColor: colors.glassBorder,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.glass,
  },
  avatarEmoji: {
    fontSize: 48,
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
  menuSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  glassCard: {
    backgroundColor: colors.glass,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: "hidden",
    ...shadows.glass,
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
  },
  menuIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  menuTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  menuTitleDestructive: {
    color: colors.error,
  },
  menuArrow: {
    fontSize: 24,
    color: colors.textTertiary,
  },
  menuArrowDestructive: {
    color: colors.error,
  },
  logoutSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing.md,
    ...shadows.glass,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  logoutText: {
    ...typography.bodyBold,
    color: colors.error,
  },
  version: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
});
