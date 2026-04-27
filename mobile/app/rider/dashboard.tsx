// Rider Dashboard Screen
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Package, DollarSign, Star, Power, Circle, ChevronRight } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { useAuthStore, useUIStore } from "@/store";
import { riderApi } from "@/services/api/endpoints";
import { extendedRiderApi } from "@/services/api/rider";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface RiderStats {
  total_deliveries: number;
  total_earnings: number;
  average_rating: number | null;
}

export default function RiderDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isOnline = useUIStore((s) => s.isOnline);
  const setOnline = useUIStore((s) => s.setOnline);
  const [stats, setStats] = useState<RiderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchStats = async () => {
    try {
      const history = await extendedRiderApi.getDeliveryHistory(50);
      setStats({
        total_deliveries: history.total_deliveries,
        total_earnings: history.total_earnings,
        average_rating: history.average_rating,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const toggleOnlineStatus = async () => {
    setUpdatingStatus(true);
    try {
      await riderApi.updateProfile({ is_online: !isOnline });
      setOnline(!isOnline);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingStatus(false);
    }
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
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.title}>{user?.full_name || "Rider"}</Text>
          </View>
        </View>

        {/* Online Toggle Card */}
        <GlassCard style={styles.onlineCard}>
          <View style={styles.onlineRow}>
            <View>
              <Text style={styles.onlineTitle}>Online Status</Text>
              <Text style={[styles.onlineSubtitle, { color: isOnline ? colors.success : colors.error }]}>
                {isOnline ? "You're visible to customers" : "You're invisible"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleOnlineStatus}
              disabled={updatingStatus}
              style={styles.toggleButton}
            >
              {isOnline ? (
                <Power size={48} color={colors.success} />
              ) : (
                <Circle size={48} color={colors.textTertiary} />
              )}
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <GlassCard style={styles.statCard}>
            <Package size={20} color={colors.primary} />
            <Text style={styles.statValue}>{stats?.total_deliveries || 0}</Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <DollarSign size={20} color={colors.success} />
            <Text style={styles.statValue}>₹{((stats?.total_earnings || 0)).toFixed(0)}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </GlassCard>

          <GlassCard style={styles.statCard}>
            <Star size={20} color={colors.accent} />
            <Text style={styles.statValue}>{((stats?.average_rating || 0)).toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </GlassCard>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/rider/available-orders")}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primaryGlow }]}>
              <Package size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Available Orders</Text>
            <ChevronRight size={16} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/rider/history")}>
            <View style={[styles.actionIcon, { backgroundColor: colors.infoBg }]}>
              <MapPin size={24} color={colors.info} />
            </View>
            <Text style={styles.actionLabel}>Delivery History</Text>
            <ChevronRight size={16} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/rider/earnings")}>
            <View style={[styles.actionIcon, { backgroundColor: colors.successBg }]}>
              <DollarSign size={24} color={colors.success} />
            </View>
            <Text style={styles.actionLabel}>Earnings</Text>
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
  onlineCard: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  onlineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  onlineTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  onlineSubtitle: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
  toggleButton: {
    padding: spacing.xs,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    width: "31%",
    alignItems: "center",
    padding: spacing.md,
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  statLabel: {
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
