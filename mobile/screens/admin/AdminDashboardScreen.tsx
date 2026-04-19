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
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { colors, typography, spacing } from "@/theme";
import { adminApi } from "@/services/api/endpoints";

interface DashboardStats {
  total_users: number;
  total_restaurants: number;
  active_riders: number;
  orders_today: number;
  revenue_today: number;
}

export default function AdminDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const mockActivity = [
    { type: "user", message: "New user registered: john@example.com", time: "5 min ago" },
    { type: "restaurant", message: "New restaurant pending approval: Spice Garden", time: "15 min ago" },
    { type: "order", message: "Order AE202401011234 delivered", time: "30 min ago" },
    { type: "rider", message: "Rider John joined the platform", time: "1 hour ago" },
  ];
  const [recentActivity] = useState(mockActivity);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await adminApi.getDashboard();
        setStats(response.data);
      } catch (error) {
        // Fallback to mock data if API fails
        setStats({
          total_users: 1250,
          total_restaurants: 85,
          active_riders: 42,
          orders_today: 456,
          revenue_today: 125000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

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
          <Text style={styles.title}>Admin Dashboard</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.total_users ?? 0}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.total_restaurants ?? 0}</Text>
            <Text style={styles.statLabel}>Restaurants</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.active_riders ?? 0}</Text>
            <Text style={styles.statLabel}>Active Riders</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.orders_today ?? 0}</Text>
            <Text style={styles.statLabel}>Orders Today</Text>
          </Card>
        </View>

        {/* Revenue Card */}
        <Card style={styles.revenueCard}>
          <Text style={styles.revenueLabel}>Today's Revenue</Text>
          <Text style={styles.revenueValue}>₹{(stats?.revenue_today ?? 0).toLocaleString()}</Text>
        </Card>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>Users</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🍽️</Text>
            <Text style={styles.actionText}>Restaurants</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🛵</Text>
            <Text style={styles.actionText}>Riders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Card>
            {recentActivity.map((activity, index) => (
              <View
                key={index}
                style={[
                  styles.activityItem,
                  index < recentActivity.length - 1 && styles.activityItemBorder,
                ]}
              >
                <Text style={styles.activityMessage}>{activity.message}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            ))}
          </Card>
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    padding: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  statCard: {
    width: "48%",
    alignItems: "center",
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  revenueCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    alignItems: "center",
    backgroundColor: colors.success,
  },
  revenueLabel: {
    ...typography.body,
    color: colors.white,
  },
  revenueValue: {
    ...typography.h1,
    color: colors.white,
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
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
    paddingTop: 0,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  activityItem: {
    paddingVertical: spacing.sm,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityMessage: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  activityTime: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
