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
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { colors, typography, spacing } from "@/theme";
import { riderApi } from "@/services/api/endpoints";

interface RiderStats {
  todayDeliveries: number;
  earnings: number;
  rating: number;
}

export default function RiderDashboardScreen() {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RiderStats>({
    todayDeliveries: 12,
    earnings: 1850,
    rating: 4.8,
  });

  const mockStats = {
    todayDeliveries: 12,
    earnings: 1850,
    rating: 4.8,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available orders and my orders
        const [availableOrders, myOrders] = await Promise.all([
          riderApi.getAvailableOrders(),
          riderApi.getMyOrders(),
        ]);
        // Update stats based on real data if available
        // For now, using mock data as the API response structure may vary
      } catch (error) {
        // Fallback to mock data if API fails
        setStats(mockStats);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
          <Text style={styles.title}>Rider Dashboard</Text>
        </View>

        {/* Online/Offline Toggle */}
        <Card style={styles.toggleCard}>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>
              {isOnline ? "Online" : "Offline"}
            </Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isOnline ? styles.toggleButtonActive : styles.toggleButtonInactive,
              ]}
              onPress={() => setIsOnline(!isOnline)}
            >
              <View
                style={[
                  styles.toggleKnob,
                  isOnline
                    ? styles.toggleKnobActive
                    : styles.toggleKnobInactive,
                ]}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.toggleHint}>
            {isOnline
              ? "You're receiving delivery requests"
              : "Go online to start receiving orders"}
          </Text>
        </Card>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.todayDeliveries}</Text>
            <Text style={styles.statLabel}>Today's Deliveries</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>₹{stats.earnings}</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📦</Text>
            <Text style={styles.actionText}>Available Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🗺️</Text>
            <Text style={styles.actionText}>My Deliveries</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💰</Text>
            <Text style={styles.actionText}>Earnings</Text>
          </TouchableOpacity>
        </View>

        {/* Current Order */}
        {isOnline && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Delivery</Text>
            <Card style={styles.currentOrderCard}>
              <Text style={styles.noOrderText}>
                No active delivery
              </Text>
              <Button
                title="View Available Orders"
                variant="outline"
                onPress={() => {}}
              />
            </Card>
          </View>
        )}
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
  toggleCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  toggleLabel: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  toggleButton: {
    width: 56,
    height: 32,
    borderRadius: 16,
    padding: 2,
  },
  toggleButtonActive: {
    backgroundColor: colors.success,
  },
  toggleButtonInactive: {
    backgroundColor: colors.gray300,
  },
  toggleKnob: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  toggleKnobActive: {
    alignSelf: "flex-end",
  },
  toggleKnobInactive: {
    alignSelf: "flex-start",
  },
  toggleHint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
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
  currentOrderCard: {
    alignItems: "center",
    padding: spacing.lg,
  },
  noOrderText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});
