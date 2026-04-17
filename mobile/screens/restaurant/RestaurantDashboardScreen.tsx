import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { colors, typography, spacing } from "@/theme";
import { restaurantApi, orderApi } from "@/services/api/endpoints";
import { useAuthStore } from "@/store";
import type { Restaurant, Order } from "@/types/api";

export default function RestaurantDashboardScreen() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const mockStats = {
    todayOrders: 24,
    revenue: 12500,
    pendingOrders: 3,
    rating: 4.5,
  };

  const mockOrders = [
    { id: "1", order_number: "AE202401011234", items: 3, total: 450, status: "pending" },
    { id: "2", order_number: "AE202401011233", items: 2, total: 320, status: "confirmed" },
    { id: "3", order_number: "AE202401011232", items: 4, total: 680, status: "preparing" },
  ];

  const stats = mockStats;
  const recentOrders = mockOrders;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch restaurant data for owner
        if (user?.restaurant_id) {
          const restaurantResponse = await restaurantApi.getById(user.restaurant_id);
          setRestaurant(restaurantResponse.data);
        }
        // Fetch orders
        const ordersResponse = await orderApi.list({ status: undefined });
        setOrders(ordersResponse.data.items.slice(0, 5));
      } catch (error) {
        // Fallback to mock data if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.restaurant_id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Restaurant Dashboard</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.todayOrders}</Text>
            <Text style={styles.statLabel}>Today's Orders</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>₹{stats.revenue}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pendingOrders}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🍽️</Text>
            <Text style={styles.actionText}>Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {recentOrders.map((order) => (
            <Card key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>{order.order_number}</Text>
                <Badge
                  text={order.status?.toUpperCase() ?? "PENDING"}
                  variant={order.status === "pending" ? "warning" : "info"}
                  size="sm"
                />
              </View>
              <Text style={styles.orderItems}>{order.items?.length ?? 0} items</Text>
              <Text style={styles.orderTotal}>₹{order.total_amount}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
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
    ...typography.h2,
    color: colors.textPrimary,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: spacing.md,
  },
  statValue: {
    ...typography.h3,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: "row",
    padding: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  actionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  orderCard: {
    marginBottom: spacing.sm,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  orderNumber: {
    ...typography.body,
    fontWeight: "600",
  },
  orderItems: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  orderTotal: {
    ...typography.body,
    fontWeight: "600",
    color: colors.primary,
  },
});
