// Rider Earnings Screen
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DollarSign, Calendar, TrendingUp } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { extendedRiderApi } from "@/services/api/rider";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface DeliveryEntry {
  order_id: string;
  order_number: string;
  earnings: number;
  delivered_at: string;
}

const { width } = Dimensions.get("window");

export default function RiderEarningsScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<DeliveryEntry[]>([]);
  const [stats, setStats] = useState({
    total_deliveries: 0,
    total_earnings: 0,
    average_rating: null as number | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await extendedRiderApi.getDeliveryHistory(100);
        setDeliveries(data.deliveries.map((d: any) => ({
          order_id: d.order_id,
          order_number: d.order_number,
          earnings: d.earnings,
          delivered_at: d.delivered_at,
        })));
        setStats({
          total_deliveries: data.total_deliveries,
          total_earnings: data.total_earnings,
          average_rating: data.average_rating,
        });
      } catch (error) {
        console.error("Failed to fetch earnings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Group earnings by day
  const earningsByDay = deliveries.reduce((acc: Record<string, number>, delivery) => {
    const day = new Date(delivery.delivered_at).toLocaleDateString();
    acc[day] = (acc[day] || 0) + delivery.earnings;
    return acc;
  }, {});

  const sortedDays = Object.entries(earningsByDay).sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
  );

  const maxEarnings = Math.max(...Object.values(earningsByDay), 1);

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
        <Text style={styles.title}>Earnings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary Card */}
        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryLabel}>Total Earnings</Text>
            <DollarSign size={24} color={colors.success} />
          </View>
          <Text style={styles.summaryAmount}>₹{stats.total_earnings.toFixed(2)}</Text>
          <Text style={styles.summarySubtext}>
            {stats.total_deliveries} deliveries
          </Text>
        </GlassCard>

        {/* Daily Breakdown */}
        <GlassCard style={styles.chartCard}>
          <Text style={styles.chartTitle}>Daily Earnings</Text>
          <View style={styles.chart}>
            {sortedDays.slice(0, 7).map(([day, earnings], index) => {
              const height = (earnings / maxEarnings) * 100;
              return (
                <View key={day} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <Text style={styles.barValue}>₹{earnings.toFixed(0)}</Text>
                    <View
                      style={[
                        styles.bar,
                        { height: Math.max(height, 2) },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>
                    {new Date(day).toLocaleDateString([], { weekday: "short" })}
                  </Text>
                </View>
              );
            })}
          </View>
        </GlassCard>

        {/* History List */}
        <GlassCard style={styles.listCard}>
          <Text style={styles.listTitle}>Recent Deliveries</Text>
          {sortedDays.map(([day, earnings]) => (
            <View key={day} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <Calendar size={14} color={colors.textTertiary} />
                <Text style={styles.listItemDate}>{day}</Text>
              </View>
              <Text style={styles.listItemEarnings}>₹{earnings.toFixed(2)}</Text>
            </View>
          ))}
          {sortedDays.length === 0 && (
            <Text style={styles.emptyText}>No earnings yet</Text>
          )}
        </GlassCard>
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
  header: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.lg,
  },
  summaryCard: {
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryAmount: {
    ...typography.hero,
    color: colors.success,
    marginVertical: spacing.sm,
  },
  summarySubtext: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  chartCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  chartTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 180,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
  },
  barWrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 140,
  },
  barValue: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
    fontSize: 9,
  },
  bar: {
    width: 28,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    minHeight: 2,
  },
  barLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  listCard: {
    padding: spacing.lg,
  },
  listTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  listItemDate: {
    ...typography.body,
    color: colors.textPrimary,
  },
  listItemEarnings: {
    ...typography.bodyBold,
    color: colors.success,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
});
