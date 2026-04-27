// Vendor Order Detail Screen
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin, Clock, User, Package, Phone, ChevronRight } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { vendorApi } from "@/services/api/vendor";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const STATUS_CONFIG: Record<string, { color: string; label: string; next: string | null }> = {
  pending: { color: colors.warning, label: "Pending", next: "confirmed" },
  confirmed: { color: colors.info, label: "Confirmed", next: "preparing" },
  preparing: { color: colors.orderPreparing, label: "Preparing", next: "ready" },
  ready: { color: colors.orderReady, label: "Ready for Pickup", next: null },
  picked_up: { color: colors.info, label: "Picked Up", next: null },
  delivered: { color: colors.success, label: "Delivered", next: null },
  cancelled: { color: colors.error, label: "Cancelled", next: null },
};

interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  delivery_fee: number;
  discount_amount: number;
  items: Array<{
    id: string;
    item_name: string;
    item_price: number;
    quantity: number;
    subtotal: number;
  }>;
  placed_at: string;
  delivery_address: {
    address_line: string;
    city: string;
  };
}

export default function VendorOrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch order details from API
    setLoading(false);
  }, [params.id]);

  const updateStatus = async (newStatus: string) => {
    Alert.alert(
      "Update Status",
      `Mark order as ${STATUS_CONFIG[newStatus]?.label}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await vendorApi.updateOrderStatus(params.id as string, newStatus);
              router.back();
            } catch (error) {
              console.error("Failed to update status:", error);
              Alert.alert("Error", "Failed to update order status");
            }
          },
        },
      ]
    );
  };

  if (loading || !order) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LoadingSpinner />
      </View>
    );
  }

  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.orderNumber}>{order.order_number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: status.color + "20" }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Timeline */}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.statusTimeline}>
            {["pending", "confirmed", "preparing", "ready", "delivered"].map((s, i) => {
              const isActive = order.status === s || ["preparing", "ready", "delivered"].includes(order.status);
              const isPast = ["pending", "confirmed", "preparing", "ready", "delivered"].indexOf(order.status) > i;
              return (
                <View key={s} style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor: isPast ? colors.success : isActive ? status.color : colors.glass,
                        borderColor: isPast || isActive ? "transparent" : colors.border,
                      },
                    ]}
                  />
                  {i < 4 && (
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor: isPast ? colors.success : colors.glass,
                        },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </GlassCard>

        {/* Order Items */}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{item.quantity}x {item.item_name}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{item.subtotal.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₹{order.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <Text style={styles.totalValue}>₹{order.tax_amount.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery Fee</Text>
            <Text style={styles.totalValue}>₹{order.delivery_fee.toFixed(2)}</Text>
          </View>
          {order.discount_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.success }]}>Discount</Text>
              <Text style={[styles.totalValue, { color: colors.success }]}>
                -₹{order.discount_amount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>₹{order.total_amount.toFixed(2)}</Text>
          </View>
        </GlassCard>

        {/* Delivery Address */}
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressRow}>
            <MapPin size={16} color={colors.textTertiary} />
            <Text style={styles.addressText}>
              {order.delivery_address.address_line}, {order.delivery_address.city}
            </Text>
          </View>
        </GlassCard>

        {/* Action Button */}
        {status.next && (
          <Button
            title={`Mark as ${STATUS_CONFIG[status.next]?.label}`}
            onPress={() => updateStatus(status.next!)}
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
    paddingTop: 0,
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
  statusTimeline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timelineItem: {
    alignItems: "center",
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  timelineLine: {
    position: "absolute",
    top: 7,
    left: 20,
    width: 40,
    height: 2,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  itemPrice: {
    ...typography.body,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  totalLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  totalValue: {
    ...typography.body,
    color: colors.textSecondary,
  },
  grandTotalLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  grandTotalValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  addressRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  addressText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  actionButton: {
    marginTop: spacing.lg,
  },
});
