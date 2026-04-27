// Vendor Dashboard Screen
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Settings, Package, DollarSign, Star, Clock, ChevronRight } from "lucide-react-native";
import { colors, spacing, typography, borderRadius, shadows } from "@/theme";
import { useAuthStore } from "@/store";
import { vendorApi } from "@/services/api/vendor";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface DashboardStats {
  orders_today: number;
  orders_pending: number;
  revenue_today: number;
  revenue_week: number;
  rating: number;
  review_count: number;
}

export default function VendorDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const data = await vendorApi.getDashboard();
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
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.title}>{user?.full_name || "Vendor"}</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push("/vendor/settings")}
          >
            <Settings size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <GlassCard style={styles.statCard}>
            <View style={styles.statIcon}>
              <Package size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats?.orders_today || 0}</Text>
            <Text style={styles.statLabel}>Orders Today</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.warningBg }]}>
              <Clock size={20} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>{stats?.orders_pending || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.successBg }]}>
              <DollarSign size={20} color={colors.success} />
            </View>
            <Text style={styles.statValue}>₹{((stats?.revenue_today || 0)).toFixed(0)}</Text>
            <Text style={styles.statLabel}>Revenue Today</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.accentGlow }]}>
              <Star size={20} color={colors.accent} />
            </View>
            <Text style={styles.statValue}>{((stats?.rating || 0)).toFixed(1)}</Text>
            <Text style={styles.statLabel}>{stats?.review_count || 0} Reviews</Text>
          </GlassCard>
        </View>

        {/* Weekly Revenue */}
        <GlassCard style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <Text style={styles.revenueTitle}>This Week</Text>
            <Text style={styles.revenueValue}>₹{((stats?.revenue_week || 0)).toFixed(0)}</Text>
          </View>
          <Text style={styles.revenueSubtext}>Total revenue</Text>
        </GlassCard>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/vendor/orders")}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primaryGlow }]}>
              <Package size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Orders</Text>
            <ChevronRight size={16} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/vendor/menu")}>
            <View style={[styles.actionIcon, { backgroundColor: colors.infoBg }]}>
              <BarChart3 size={24} color={colors.info} />
            </View>
            <Text style={styles.actionLabel}>Menu</Text>
            <ChevronRight size={16} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/vendor/earnings")}>
            <View style={[styles.actionIcon, { backgroundColor: colors.successBg }]}>
              <DollarSign size={24} color={colors.success} />
            </View>
            <Text style={styles.actionLabel}>Earnings</Text>
            <ChevronRight size={16} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/vendor/settings")}>
            <View style={[styles.actionIcon, { backgroundColor: colors.warningBg }]}>
              <BarChart3 size={24} color={colors.warning} />
            </View>
            <Text style={styles.actionLabel}>Settings</Text>
            <ChevronRight size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.glass,
    justifyContent: "center",
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: "47%",
    padding: spacing.lg,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryGlow,
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
    marginBottom: spacing.xl,
  },
  revenueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  revenueTitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  revenueValue: {
    ...typography.h1,
    color: colors.success,
  },
  revenueSubtext: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    gap: spacing.md,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  actionLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flex: 1,
  },
});
