// Long Order History Screen
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Package, Clock, ChevronRight } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { longOrdersApi, type LongOrderBrief } from "@/services/api/longOrders";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending: { color: colors.warning, label: "Pending" },
  confirmed: { color: colors.info, label: "Confirmed" },
  preparing: { color: colors.orderPreparing, label: "Preparing" },
  shipped: { color: colors.info, label: "Shipped" },
  delivered: { color: colors.success, label: "Delivered" },
  cancelled: { color: colors.error, label: "Cancelled" },
};

export default function LongOrderHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [orders, setOrders] = useState<LongOrderBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const data = await longOrdersApi.getOrders(params);
      setOrders(data.items);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await longOrdersApi.cancelOrder(orderId);
      fetchOrders();
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  };

  const renderOrder = ({ item }: { item: LongOrderBrief }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/long-order/order/${item.id}`)}
        activeOpacity={0.8}
      >
        <GlassCard style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>{item.order_number}</Text>
              <Text style={styles.orderItems}>{item.items_count} items</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.color + "20" }]}>
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>

          <View style={styles.orderMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Total</Text>
              <Text style={styles.metaValue}>₹{item.total_amount.toFixed(2)}</Text>
            </View>
            {item.estimated_delivery_date && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Est. Delivery</Text>
                <Text style={styles.metaValue}>
                  {new Date(item.estimated_delivery_date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.orderFooter}>
            <View style={styles.orderDate}>
              <Clock size={12} color={colors.textMuted} />
              <Text style={styles.orderDateText}>
                {new Date(item.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} />
          </View>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  const statusTabs = [
    { key: null, label: "All" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "preparing", label: "Preparing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
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
        <Text style={styles.title}>My Long Orders</Text>
      </View>

      {/* Status Filter */}
      <View style={styles.filterTabs}>
        {statusTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key || "all"}
            style={[styles.filterTab, statusFilter === tab.key && styles.filterTabActive]}
            onPress={() => setStatusFilter(tab.key)}
          >
            <Text
              style={[
                styles.filterTabText,
                statusFilter === tab.key && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Package size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No long orders yet</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.shopLink}>Start shopping</Text>
            </TouchableOpacity>
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
  orderCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  orderNumber: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  orderItems: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
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
  orderMeta: {
    flexDirection: "row",
    gap: spacing.xl,
    marginBottom: spacing.md,
  },
  metaItem: {},
  metaLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  metaValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  orderDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  orderDateText: {
    ...typography.caption,
    color: colors.textMuted,
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
  shopLink: {
    ...typography.button,
    color: colors.primary,
    marginTop: spacing.md,
  },
});
