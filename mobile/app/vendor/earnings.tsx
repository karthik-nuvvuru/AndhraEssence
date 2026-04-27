// Vendor Earnings Screen
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TrendingUp, Calendar, DollarSign } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { vendorApi } from "@/services/api/vendor";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface EarningsEntry {
  date: string;
  orders_count: number;
  revenue: number;
}

const { width } = Dimensions.get("window");

export default function VendorEarningsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<{
    total_earnings: number;
    period_start: string;
    period_end: string;
    entries: EarningsEntry[];
  } | null>(null);

  const fetchEarnings = async () => {
    try {
      const data = await vendorApi.getEarnings(period);
      setEarnings(data);
    } catch (error) {
      console.error("Failed to fetch earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [period]);

  const maxRevenue = Math.max(...(earnings?.entries.map((e) => e.revenue) || [1]));

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

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(["day", "week", "month"] as const).map((p) => (
          <Text
            key={p}
            style={[styles.periodTab, period === p && styles.periodTabActive]}
            onPress={() => setPeriod(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </Text>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Total Earnings Card */}
        <GlassCard style={styles.totalCard}>
          <View style={styles.totalHeader}>
            <Text style={styles.totalLabel}>Total Earnings</Text>
            <DollarSign size={24} color={colors.success} />
          </View>
          <Text style={styles.totalAmount}>
            ₹{(earnings?.total_earnings || 0).toFixed(2)}
          </Text>
          <Text style={styles.periodLabel}>
            {earnings?.period_start} - {earnings?.period_end}
          </Text>
        </GlassCard>

        {/* Bar Chart */}
        <GlassCard style={styles.chartCard}>
          <Text style={styles.chartTitle}>Revenue Over Time</Text>
          <View style={styles.chart}>
            {earnings?.entries.map((entry, index) => {
              const height = (entry.revenue / maxRevenue) * 120;
              return (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(height, 4),
                          backgroundColor:
                            entry.revenue > 0 ? colors.primary : colors.glass,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>
                    {new Date(entry.date).getDate()}
                  </Text>
                </View>
              );
            })}
          </View>
        </GlassCard>

        {/* Earnings List */}
        <GlassCard style={styles.listCard}>
          <Text style={styles.listTitle}>Daily Breakdown</Text>
          {earnings?.entries.map((entry, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <Calendar size={14} color={colors.textTertiary} />
                <Text style={styles.listItemDate}>
                  {new Date(entry.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.listItemRight}>
                <Text style={styles.listItemOrders}>{entry.orders_count} orders</Text>
                <Text style={styles.listItemRevenue}>
                  ₹{entry.revenue.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
          {(!earnings?.entries || earnings.entries.length === 0) && (
            <Text style={styles.emptyText}>No earnings data for this period</Text>
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
  periodSelector: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    backgroundColor: colors.glass,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  periodTab: {
    flex: 1,
    textAlign: "center",
    paddingVertical: spacing.sm,
    ...typography.button,
    color: colors.textSecondary,
    borderRadius: borderRadius.sm,
  },
  periodTabActive: {
    backgroundColor: colors.primary,
    color: colors.white,
  },
  content: {
    padding: spacing.lg,
  },
  totalCard: {
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  totalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  totalAmount: {
    ...typography.hero,
    color: colors.success,
    marginVertical: spacing.sm,
  },
  periodLabel: {
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
    height: 160,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
  },
  barWrapper: {
    height: 120,
    justifyContent: "flex-end",
  },
  bar: {
    width: 24,
    borderRadius: borderRadius.sm,
    minHeight: 4,
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
  listItemRight: {
    alignItems: "flex-end",
  },
  listItemOrders: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  listItemRevenue: {
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
