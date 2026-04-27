// Rider Delivery History Screen
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Package, MapPin, Star, Clock } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { extendedRiderApi } from "@/services/api/rider";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface DeliveryEntry {
  order_id: string;
  order_number: string;
  restaurant_name: string;
  customer_address: string;
  earnings: number;
  rating: number | null;
  delivered_at: string;
}

export default function RiderHistoryScreen() {
  const insets = useSafeAreaInsets();
  const [deliveries, setDeliveries] = useState<DeliveryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<{
    total_deliveries: number;
    total_earnings: number;
    average_rating: number | null;
  } | null>(null);

  const fetchHistory = async () => {
    try {
      const data = await extendedRiderApi.getDeliveryHistory(50);
      setDeliveries(data.deliveries);
      setStats({
        total_deliveries: data.total_deliveries,
        total_earnings: data.total_earnings,
        average_rating: data.average_rating,
      });
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const renderDelivery = ({ item }: { item: DeliveryEntry }) => (
    <GlassCard style={styles.deliveryCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>{item.order_number}</Text>
        <View style={styles.earningsBadge}>
          <Text style={styles.earningsText}>₹{item.earnings.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.restaurantRow}>
        <Package size={14} color={colors.textTertiary} />
        <Text style={styles.restaurantName}>{item.restaurant_name}</Text>
      </View>

      <View style={styles.addressRow}>
        <MapPin size={14} color={colors.textTertiary} />
        <Text style={styles.addressText}>{item.customer_address}</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <Clock size={12} color={colors.textMuted} />
          <Text style={styles.deliveryTime}>
            {new Date(item.delivered_at).toLocaleString()}
          </Text>
        </View>
        {item.rating && (
          <View style={styles.ratingBadge}>
            <Star size={12} color={colors.accent} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        )}
      </View>
    </GlassCard>
  );

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
        <Text style={styles.title}>Delivery History</Text>
      </View>

      {/* Stats Summary */}
      {stats && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total_deliveries}</Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹{stats.total_earnings.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.average_rating?.toFixed(1) || "-"}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>
      )}

      <FlatList
        data={deliveries}
        keyExtractor={(item) => item.order_id}
        renderItem={renderDelivery}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Package size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No deliveries yet</Text>
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
  statsRow: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  list: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  deliveryCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  orderNumber: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  earningsBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  earningsText: {
    ...typography.small,
    color: colors.success,
    fontWeight: "600",
  },
  restaurantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  restaurantName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  addressText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  deliveryTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    ...typography.small,
    color: colors.accent,
    fontWeight: "600",
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
