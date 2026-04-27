// Rider Active Delivery Screen
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Package, Phone, CheckCircle, Navigation } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { riderApi } from "@/services/api/endpoints";
import { extendedRiderApi } from "@/services/api/rider";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ActiveOrder {
  id: string;
  order_number: string;
  status: string;
  restaurant_name: string;
  pickup_address: string;
  delivery_address: string;
  items_count: number;
  total_amount: number;
}

export default function RiderDeliveryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [order, setOrder] = useState<ActiveOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orders = await riderApi.getMyOrders();
        const activeOrder = orders.find(
          (o: any) => ["ready", "picked_up", "in_transit"].includes(o.status)
        );
        setOrder(activeOrder);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params.id]);

  const confirmPickup = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      await extendedRiderApi.confirmPickup(order.id);
      Alert.alert("Success", "Pickup confirmed!");
      router.back();
    } catch (error) {
      console.error("Failed to confirm pickup:", error);
      Alert.alert("Error", "Failed to confirm pickup");
    } finally {
      setUpdating(false);
    }
  };

  const confirmDelivery = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      await extendedRiderApi.confirmDelivery(order.id);
      Alert.alert("Success", "Delivery completed!");
      router.back();
    } catch (error) {
      console.error("Failed to confirm delivery:", error);
      Alert.alert("Error", "Failed to confirm delivery");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LoadingSpinner />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Package size={48} color={colors.textTertiary} />
        <Text style={styles.emptyText}>No active delivery</Text>
      </View>
    );
  }

  const isPickup = order.status === "ready";
  const isInTransit = ["picked_up", "in_transit"].includes(order.status);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.orderNumber}>{order.order_number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: colors.warning + "20" }]}>
          <Text style={[styles.statusText, { color: colors.warning }]}>
            {isPickup ? "Ready for Pickup" : "In Transit"}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Restaurant Info */}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>{order.restaurant_name}</Text>
          <View style={styles.addressSection}>
            <View style={styles.addressHeader}>
              <View style={[styles.dot, { backgroundColor: colors.success }]} />
              <Text style={styles.addressLabel}>Pickup</Text>
            </View>
            <View style={styles.addressRow}>
              <MapPin size={16} color={colors.textTertiary} />
              <Text style={styles.addressText}>{order.pickup_address}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Delivery Address */}
        <GlassCard style={styles.card}>
          <View style={styles.addressSection}>
            <View style={styles.addressHeader}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Text style={styles.addressLabel}>Delivery</Text>
            </View>
            <View style={styles.addressRow}>
              <MapPin size={16} color={colors.textTertiary} />
              <Text style={styles.addressText}>{order.delivery_address}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Order Summary */}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items</Text>
            <Text style={styles.summaryValue}>{order.items_count}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order Total</Text>
            <Text style={styles.summaryValue}>₹{order.total_amount.toFixed(2)}</Text>
          </View>
        </GlassCard>

        {/* Action Button */}
        {isPickup && (
          <Button
            title={updating ? "Confirming..." : "Confirm Pickup"}
            onPress={confirmPickup}
            disabled={updating}
            style={styles.actionButton}
          />
        )}

        {isInTransit && (
          <Button
            title={updating ? "Completing..." : "Complete Delivery"}
            onPress={confirmDelivery}
            disabled={updating}
            style={styles.actionButton}
          />
        )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
  },
  orderNumber: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.button,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  addressSection: {
    marginBottom: spacing.sm,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  actionButton: {
    marginTop: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    marginTop: spacing.md,
  },
});
