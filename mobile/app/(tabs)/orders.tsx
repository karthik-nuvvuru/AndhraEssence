// Premium Orders Screen - Liquid Glass Design
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Package, ChevronRight, Star } from "lucide-react-native";
import { Badge } from "@/components/ui/Badge";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { orderApi } from "@/services/api/endpoints";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Order } from "@/types/api";

const statusColors: Record<string, "warning" | "info" | "success" | "error" | "gray" | "primary"> = {
  pending: "warning",
  confirmed: "info",
  preparing: "primary",
  ready: "error",
  picked_up: "info",
  in_transit: "info",
  delivered: "success",
  cancelled: "error",
  refunded: "gray",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const statusSteps = [
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "in_transit", label: "On the way" },
  { key: "delivered", label: "Delivered" },
];

function getStepIndex(status: string): number {
  return statusSteps.findIndex((s) => s.key === status);
}

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pulse animation for active timeline dot
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const fetchOrders = async (refresh: boolean = false) => {
    try {
      setError(null);
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = await orderApi.list();
      setOrders(response.data.items ?? []);
    } catch (err: any) {
      // Orders fetch failed
      setError(err?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchOrders(true);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const renderOrderCard = ({ item, index }: { item: Order; index: number }) => {
    const stepIndex = getStepIndex(item.status);
    const isDeliveredOrCancelled = item.status === "delivered" || item.status === "cancelled";

    return (
      <TouchableOpacity
        style={[styles.orderCard, item.status === "cancelled" && styles.orderCardCancelled]}
        onPress={() => router.push(`/order/${item.id}`)}
        activeOpacity={0.85}
        testID={`card-order-${index}`}
      >
        {/* Status Timeline - only for active orders */}
        {!isDeliveredOrCancelled && item.status !== "pending" && (
          <View style={styles.statusTimeline}>
            {statusSteps.map((step, idx) => (
              <View key={step.key} style={styles.timelineStep}>
                {idx === stepIndex ? (
                  <Animated.View
                    style={[
                      styles.timelineDot,
                      styles.timelineDotActive,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  />
                ) : (
                  <View
                    style={[
                      styles.timelineDot,
                      idx < stepIndex ? styles.timelineDotActive : styles.timelineDotInactive,
                    ]}
                  />
                )}
                {idx < statusSteps.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      idx < stepIndex ? styles.timelineLineActive : styles.timelineLineInactive,
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <View style={styles.restaurantIconBox}>
              <Package size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.restaurantName}>
                {item.restaurant_name || "Restaurant"}
              </Text>
              <Text style={styles.orderDate}>
                {item.placed_at ? formatDate(item.placed_at) : ""} {item.placed_at && new Date(item.placed_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
          <View testID="badge-status">
            <Badge
              text={statusLabels[item.status] || item.status}
              variant={statusColors[item.status]}
              size="sm"
            />
          </View>
        </View>

        {/* Items Summary */}
        <View style={styles.itemsSummary}>
          <Text style={styles.itemsText} numberOfLines={1}>
            {(item.items ?? []).slice(0, 3).map(i => i.item_name).join(", ")}
            {(item.items?.length ?? 0) > 3 ? ` +${item.items!.length - 3} more` : ""}
          </Text>
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.orderFooterLeft}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.orderAmount} testID="text-order-total">
              {formatCurrency(item.total_amount)}
            </Text>
          </View>
          <View style={styles.viewDetailsContainer}>
            <Text style={styles.viewDetails}>View Details</Text>
            <ChevronRight size={16} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Package size={40} color={colors.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>No orders yet</Text>
      <Text style={styles.emptySubtext}>
        Your order history will appear here
      </Text>
      <TouchableOpacity
        style={styles.startOrderingButton}
        onPress={() => router.push("/")}
      >
        <Text style={styles.startOrderingText}>Start Ordering</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>My Orders</Text>
        </View>
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.skeletonCard} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error && orders.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>My Orders</Text>
        </View>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Package size={40} color={colors.error} />
          </View>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]} testID="screen-orders">
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        {orders.length > 0 && (
          <Text style={styles.orderCountBadge}>{orders.length}</Text>
        )}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderCard}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.backgroundCard}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  orderCountBadge: {
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  list: {
    padding: spacing.md,
    paddingTop: 0,
  },
  orderCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    overflow: "hidden",
    ...shadows.sm,
  },
  orderCardCancelled: {
    opacity: 0.7,
  },
  statusTimeline: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timelineStep: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineDotActive: {
    backgroundColor: colors.primary,
  },
  timelineDotInactive: {
    backgroundColor: colors.border,
  },
  timelineLine: {
    flex: 1,
    height: 2,
  },
  timelineLineActive: {
    backgroundColor: colors.primary,
  },
  timelineLineInactive: {
    backgroundColor: colors.border,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  orderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: spacing.sm,
  },
  restaurantIconBox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  restaurantName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 3,
  },
  orderDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  itemsSummary: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  itemsText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginRight: spacing.xs,
  },
  orderAmount: {
    ...typography.h3,
    color: colors.accent,
    fontWeight: "700",
  },
  viewDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewDetails: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  startOrderingButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  startOrderingText: {
    ...typography.button,
    color: colors.white,
    fontWeight: "600",
  },
  skeletonContainer: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  skeletonCard: {
    height: 120,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.errorBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: "600",
  },
});