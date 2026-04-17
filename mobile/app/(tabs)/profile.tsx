import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { colors, typography, spacing, borderRadius } from "@/theme";
import { useAuthStore } from "@/store";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const menuItems = [
    { icon: "👤", title: "Edit Profile", onPress: () => {} },
    { icon: "📍", title: "Saved Addresses", onPress: () => {} },
    { icon: "💳", title: "Payment Methods", onPress: () => {} },
    { icon: "🔔", title: "Notifications", onPress: () => {} },
    { icon: "🔒", title: "Privacy & Security", onPress: () => {} },
    { icon: "❓", title: "Help & Support", onPress: () => {} },
    { icon: "ℹ️", title: "About", onPress: () => {} },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.full_name?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.full_name || "User"}</Text>
            <Text style={styles.email}>{user?.email || ""}</Text>
            <Text style={styles.phone}>{user?.phone || ""}</Text>
          </View>
        </Card>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.logoutSection}>
          <Button
            title="Log Out"
            onPress={handleLogout}
            variant="outline"
            fullWidth
          />
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    padding: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  profileCard: {
    marginHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  email: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  phone: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  menuSection: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
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
  menuArrow: {
    fontSize: 24,
    color: colors.textLight,
  },
  logoutSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  version: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
});
