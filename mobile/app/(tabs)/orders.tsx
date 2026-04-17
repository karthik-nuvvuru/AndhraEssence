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
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { colors, typography, spacing } from "@/theme";
import { orderApi } from "@/services/api/endpoints";
import { formatCurrency, formatRelativeTime } from "@/utils/formatters";
import type { Order } from "@/types/api";

const statusColors: Record<string, "warning" | "info" | "success" | "error" | "gray"> = {
  pending: "warning",
  confirmed: "info",
  preparing: "info",
  ready: "error",
  picked_up: "info",
  in_transit: "info",
  delivered: "success",
  cancelled: "error",
  refunded: "gray",
};

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async (refresh: boolean = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = await orderApi.list();
      setOrders(response.data.items);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <Card
      onPress={() => router.push(`/order/${item.id}`)}
      style={styles.orderCard}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{item.order_number}</Text>
        <Badge
          text={item.status.replace("_", " ").toUpperCase()}
          variant={statusColors[item.status]}
          size="sm"
        />
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.restaurantName}>
          {item.restaurant_name || "Restaurant"}
        </Text>
        <Text style={styles.orderAmount}>
          {formatCurrency(item.total_amount)}
        </Text>
      </View>

      <Text style={styles.orderTime}>{formatRelativeTime(item.placed_at)}</Text>
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyText}>No orders yet</Text>
      <Text style={styles.emptySubtext}>
        Your order history will appear here
      </Text>
    </View>
  );

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading orders..." />;
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
          />
        }
      />
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
  list: {
    padding: spacing.md,
    paddingTop: 0,
  },
  orderCard: {
    marginBottom: spacing.md,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  orderNumber: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  restaurantName: {
    ...typography.body,
    color: colors.textSecondary,
  },
  orderAmount: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  orderTime: {
    ...typography.caption,
    color: colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.h4,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textLight,
    textAlign: "center",
  },
});
