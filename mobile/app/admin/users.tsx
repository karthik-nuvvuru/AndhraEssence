// Admin Users Management Screen
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { User, Shield, ChefHat, Bike, Search } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { adminApi } from "@/services/api/endpoints";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface UserItem {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

const ROLE_ICONS: Record<string, any> = {
  customer: User,
  restaurant_owner: ChefHat,
  rider: Bike,
  admin: Shield,
};

const ROLE_COLORS: Record<string, string> = {
  customer: colors.info,
  restaurant_owner: colors.primary,
  rider: colors.success,
  admin: colors.warning,
};

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const params: any = {};
      if (roleFilter) params.role = roleFilter;
      const data = await adminApi.getUsers(params);
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const toggleUserActive = async (userId: string) => {
    try {
      await adminApi.toggleUserActive(userId);
      fetchUsers();
    } catch (error) {
      console.error("Failed to toggle user:", error);
      Alert.alert("Error", "Failed to update user status");
    }
  };

  const renderUser = ({ item }: { item: UserItem }) => {
    const RoleIcon = ROLE_ICONS[item.role] || User;
    const roleColor = ROLE_COLORS[item.role] || colors.info;

    return (
      <GlassCard style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={[styles.roleIcon, { backgroundColor: roleColor + "20" }]}>
            <RoleIcon size={18} color={roleColor} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.full_name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.is_active ? colors.successBg : colors.errorBg },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: item.is_active ? colors.success : colors.error },
              ]}
            >
              {item.is_active ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        <View style={styles.userMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Role</Text>
            <Text style={[styles.metaValue, { color: roleColor }]}>
              {item.role.replace("_", " ")}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Verified</Text>
            <Text style={[styles.metaValue, { color: item.is_verified ? colors.success : colors.warning }]}>
              {item.is_verified ? "Yes" : "No"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => toggleUserActive(item.id)}
        >
          <Text style={styles.toggleButtonText}>
            {item.is_active ? "Deactivate" : "Activate"}
          </Text>
        </TouchableOpacity>
      </GlassCard>
    );
  };

  const roleTabs = [
    { key: null, label: "All" },
    { key: "customer", label: "Customers" },
    { key: "restaurant_owner", label: "Vendors" },
    { key: "rider", label: "Riders" },
    { key: "admin", label: "Admins" },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
      </View>

      {/* Role Filter */}
      <View style={styles.filterTabs}>
        {roleTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key || "all"}
            style={[styles.filterTab, roleFilter === tab.key && styles.filterTabActive]}
            onPress={() => setRoleFilter(tab.key)}
          >
            <Text
              style={[
                styles.filterTabText,
                roleFilter === tab.key && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <User size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.white,
  },
  list: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  userCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.small,
    fontWeight: "600",
  },
  userMeta: {
    flexDirection: "row",
    gap: spacing.xl,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaItem: {},
  metaLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  metaValue: {
    ...typography.body,
    textTransform: "capitalize",
  },
  toggleButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.glass,
    alignItems: "center",
  },
  toggleButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  empty: {
    alignItems: "center",
    paddingTop: spacing.xxxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    marginTop: spacing.md,
  },
});
