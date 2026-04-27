// Vendor Orders Management Screen
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Package, Clock, CheckCircle, ChefHat, Bell, ArrowRight } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { vendorApi } from "@/services/api/vendor";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
  total_amount: number;
  items_count: number;
  placed_at: string;
  delivery_address: string;
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: colors.warning, label: "Pending" },
  confirmed: { icon: CheckCircle, color: colors.info, label: "Confirmed" },
  preparing: { icon: ChefHat, color: colors.orderPreparing, label: "Preparing" },
  ready: { icon: Bell, color: colors.orderReady, label: "Ready" },
  picked_up: { icon: ArrowRight, color: colors.info, label: "Picked Up" },
  delivered: { icon: CheckCircle, color: colors.success, label: "Delivered" },
  cancelled: { icon: Clock, color: colors.error, label: "Cancelled" },
};

export default function VendorOrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const data = await vendorApi.getOrders(params);
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await vendorApi.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const getNextStatus = (current: string): string | null => {
    const transitions: Record<string, string> = {
      pending: "confirmed",
      confirmed: "preparing",
      preparing: "ready",
    };
    return transitions[current] || null;
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const StatusIcon = status.icon;
    const nextStatus = getNextStatus(item.status);

    return (
      <GlassCard style={styles.orderCard}>
        <TouchableOpacity onPress={() => router.push(`/vendor/order/${item.id}`)}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>{item.order_number}</Text>
              <Text style={styles.customerName}>{item.customer_name}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.color + "20" }]}>
              <StatusIcon size={14} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.detailRow}>
              <Package size={14} color={colors.textTertiary} />
              <Text style={styles.detailText}>{item.items_count} items</Text>
            </View>
            <Text style={styles.orderAmount}>₹{item.total_amount.toFixed(2)}</Text>
          </View>

          <Text style={styles.orderTime}>
            {new Date(item.placed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>

          {nextStatus && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => updateOrderStatus(item.id, nextStatus)}
            >
              <Text style={styles.actionButtonText}>
                Mark as {STATUS_CONFIG[nextStatus]?.label}
              </Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </GlassCard>
    );
  };

  const statusTabs = [
    { key: null, label: "All" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "preparing", label: "Preparing" },
    { key: "ready", label: "Ready" },
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
        <Text style={styles.title}>Orders</Text>
      </View>

      {/* Status Filter Tabs */}
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
            <Text style={styles.emptyText}>No orders found</Text>
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
    paddingBottom: spacing.sm,
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
    ...typography.bodySmall,
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
    marginBottom: spacing.sm,
  },
  orderNumber: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  customerName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  statusText: {
    ...typography.small,
    fontWeight: "600",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  detailText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  orderAmount: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  orderTime: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    alignItems: "center",
  },
  actionButtonText: {
    ...typography.button,
    color: colors.white,
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
