// Admin Dashboard Screen
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Users, Restaurant, Bike, Package, TrendingUp, ChevronRight, BarChart3 } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { adminApi } from "@/services/api/endpoints";
import { extendedAdminApi } from "@/services/api/admin";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface DashboardStats {
  total_users: number;
  total_restaurants: number;
  active_riders: number;
  orders_today: number;
  revenue_today: number;
  recent_orders: Array<{
    id: string;
    order_number: string;
    restaurant_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
}

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const data = await adminApi.getDashboard();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <GlassCard style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.infoBg }]}>
              <Users size={20} color={colors.info} />
            </View>
            <Text style={styles.statValue}>{stats?.total_users || 0}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.primaryGlow }]}>
              <Restaurant size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats?.total_restaurants || 0}</Text>
            <Text style={styles.statLabel}>Restaurants</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.successBg }]}>
              <Bike size={20} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{stats?.active_riders || 0}</Text>
            <Text style={styles.statLabel}>Active Riders</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.warningBg }]}>
              <Package size={20} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>{stats?.orders_today || 0}</Text>
            <Text style={styles.statLabel}>Orders Today</Text>
          </GlassCard>
        </View>

        {/* Revenue Card */}
        <GlassCard style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <View>
              <Text style={styles.revenueLabel}>Revenue Today</Text>
              <Text style={styles.revenueValue}>₹{(stats?.revenue_today || 0).toFixed(2)}</Text>
            </View>
            <TrendingUp size={24} color={colors.success} />
          </View>
        </GlassCard>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Management</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin/users")}>
            <View style={[styles.actionIcon, { backgroundColor: colors.infoBg }]}>
              <Users size={24} color={colors.info} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Users</Text>
              <Text style={styles.actionSubtext}>Manage user accounts</Text>
            </View>
            <ChevronRight size={16} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin/restaurants")}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primaryGlow }]}>
              <Restaurant size={24} color={colors.primary} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Restaurants</Text>
              <Text style={styles.actionSubtext}>Approve & manage</Text>
            </View>
            <ChevronRight size={16} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin/riders")}>
            <View style={[styles.actionIcon, { backgroundColor: colors.successBg }]}>
              <Bike size={24} color={colors.success} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Riders</Text>
              <Text style={styles.actionSubtext}>Approve & manage</Text>
            </View>
            <ChevronRight size={16} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin/promotions")}>
            <View style={[styles.actionIcon, { backgroundColor: colors.accentGlow }]}>
              <BarChart3 size={24} color={colors.accent} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Promotions</Text>
              <Text style={styles.actionSubtext}>Manage offers</Text>
            </View>
            <ChevronRight size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Recent Orders */}
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <GlassCard style={styles.ordersCard}>
          {stats?.recent_orders.map((order) => (
            <View key={order.id} style={styles.orderItem}>
              <View>
                <Text style={styles.orderNumber}>{order.order_number}</Text>
                <Text style={styles.orderRestaurant}>{order.restaurant_name}</Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderAmount}>₹{order.total_amount.toFixed(2)}</Text>
                <Text style={styles.orderStatus}>{order.status}</Text>
              </View>
            </View>
          ))}
          {(!stats?.recent_orders || stats.recent_orders.length === 0) && (
            <Text style={styles.emptyText}>No recent orders</Text>
          )}
        </GlassCard>
      </ScrollView>
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
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: "47%",
    alignItems: "center",
    padding: spacing.lg,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  revenueCard: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  revenueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  revenueLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  revenueValue: {
    ...typography.h1,
    color: colors.success,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  actionInfo: {
    flex: 1,
  },
  actionLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  actionSubtext: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  ordersCard: {
    padding: spacing.lg,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderNumber: {
    ...typography.body,
    color: colors.textPrimary,
  },
  orderRestaurant: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  orderRight: {
    alignItems: "flex-end",
  },
  orderAmount: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  orderStatus: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
});
