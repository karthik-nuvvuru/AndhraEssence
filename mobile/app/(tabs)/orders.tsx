import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { orderApi } from "@/services/api/endpoints";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Order } from "@/types/api";

// Status color mapping using design system colors
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

// Status display labels
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

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async (refresh: boolean = false) => {
    try {
      setError(null);
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = await orderApi.list();
      setOrders(response.data.items);
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
      setError(err?.message || "Failed to load orders. Please try again.");
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

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/order/${item.id}`)}
      activeOpacity={0.85}
    >
      {/* Glassmorphism overlay */}
      <View style={styles.glassOverlay} />

      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Text style={styles.restaurantName}>
            {item.restaurant_name || "Restaurant"}
          </Text>
          <Text style={styles.orderDate}>
            {formatDate(item.placed_at)} {item.placed_at && new Date(item.placed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Badge
          text={statusLabels[item.status] || item.status}
          variant={statusColors[item.status]}
          size="sm"
        />
      </View>

      {/* Items Summary */}
      <View style={styles.itemsSummary}>
        <Text style={styles.itemsText}>
          {(item.items ?? []).slice(0, 3).map(i => i.item_name).join(", ")}
          {(item.items?.length ?? 0) > 3 ? ` +${item.items!.length - 3} more` : ""}
        </Text>
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.orderFooterLeft}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.orderAmount}>
            {formatCurrency(item.total_amount)}
          </Text>
        </View>
        <View style={styles.viewDetailsContainer}>
          <Text style={styles.viewDetails}>View Details</Text>
          <Text style={styles.viewDetailsArrow}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
      </View>
      <Text style={styles.emptyTitle}>No orders yet</Text>
      <Text style={styles.emptySubtext}>
        Your order history will appear here
      </Text>
      <Button
        title="Start Ordering"
        onPress={() => router.push("/")}
        variant="primary"
        size="lg"
        style={styles.startOrderingButton}
      />
    </View>
  );

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading orders..." />;
  }

  if (error && orders.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>My Orders</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Retry"
            onPress={handleRetry}
            variant="primary"
            size="md"
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
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
    padding: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  list: {
    padding: spacing.md,
    paddingTop: 0,
  },
  orderCard: {
    backgroundColor: colors.glass,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.lg,
    marginBottom: spacing.md,
    overflow: "hidden",
    ...shadows.glass,
  },
  glassOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: colors.glass,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  orderHeaderLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  restaurantName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 18,
    marginBottom: 4,
  },
  orderDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  itemsSummary: {
    backgroundColor: colors.backgroundCard,
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
  },
  viewDetails: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
  },
  viewDetailsArrow: {
    fontSize: 18,
    color: colors.primary,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    ...shadows.glass,
  },
  emptyIcon: {
    fontSize: 56,
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
    minWidth: 180,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  retryButton: {
    minWidth: 120,
  },
});
