// Rider Available Orders Screen
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Clock, Navigation, DollarSign } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { riderApi } from "@/services/api/endpoints";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface AvailableOrder {
  order_id: string;
  order_number: string;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  delivery_address: string;
  delivery_latitude: number;
  delivery_longitude: number;
  distance_km: number;
  estimated_pickup_time: string;
  earnings: number;
}

export default function RiderAvailableOrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const data = await riderApi.getAvailableOrders();
      setOrders(data);
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const acceptOrder = async (orderId: string) => {
    setAccepting(orderId);
    try {
      await riderApi.acceptOrder(orderId);
      Alert.alert("Success", "Order accepted! Check 'My Deliveries'.");
      fetchOrders();
    } catch (error) {
      console.error("Failed to accept order:", error);
      Alert.alert("Error", "Failed to accept order");
    } finally {
      setAccepting(null);
    }
  };

  const renderOrder = ({ item }: { item: AvailableOrder }) => (
    <GlassCard style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>{item.order_number}</Text>
        <View style={styles.earningsBadge}>
          <DollarSign size={12} color={colors.success} />
          <Text style={styles.earningsText}>₹{item.earnings.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.addressSection}>
        <View style={styles.addressHeader}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <Text style={styles.addressLabel}>Pickup</Text>
        </View>
        <View style={styles.addressRow}>
          <MapPin size={14} color={colors.textTertiary} />
          <Text style={styles.addressText}>{item.pickup_address}</Text>
        </View>
      </View>

      <View style={styles.addressSection}>
        <View style={styles.addressHeader}>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <Text style={styles.addressLabel}>Delivery</Text>
        </View>
        <View style={styles.addressRow}>
          <MapPin size={14} color={colors.textTertiary} />
          <Text style={styles.addressText}>{item.delivery_address}</Text>
        </View>
      </View>

      <View style={styles.orderMeta}>
        <View style={styles.metaItem}>
          <Navigation size={14} color={colors.textTertiary} />
          <Text style={styles.metaText}>{item.distance_km.toFixed(1)} km</Text>
        </View>
        <View style={styles.metaItem}>
          <Clock size={14} color={colors.textTertiary} />
          <Text style={styles.metaText}>
            {new Date(item.estimated_pickup_time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>

      <Button
        title={accepting === item.order_id ? "Accepting..." : "Accept Order"}
        onPress={() => acceptOrder(item.order_id)}
        disabled={accepting === item.order_id}
        style={styles.acceptButton}
      />
    </GlassCard>
  );

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
        <Text style={styles.title}>Available Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.order_id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Navigation size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No orders available</Text>
            <Text style={styles.emptySubtext}>Pull to refresh</Text>
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
    alignItems: "center",
    marginBottom: spacing.md,
  },
  orderNumber: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  earningsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 2,
  },
  earningsText: {
    ...typography.small,
    color: colors.success,
    fontWeight: "600",
  },
  addressSection: {
    marginBottom: spacing.md,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  addressLabel: {
    ...typography.small,
    color: colors.textSecondary,
    textTransform: "uppercase",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingLeft: spacing.lg,
  },
  addressText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  orderMeta: {
    flexDirection: "row",
    gap: spacing.xl,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  acceptButton: {
    marginTop: spacing.md,
  },
  empty: {
    alignItems: "center",
    paddingTop: spacing.xxxl,
  },
  emptyText: {
    ...typography.h4,
    color: colors.textTertiary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
