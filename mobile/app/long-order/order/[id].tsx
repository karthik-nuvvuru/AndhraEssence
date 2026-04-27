// Long Order Detail Screen
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Package, Clock, MapPin, ArrowLeft, X } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { longOrdersApi, type LongOrder } from "@/services/api/longOrders";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending: { color: colors.warning, label: "Pending" },
  confirmed: { color: colors.info, label: "Confirmed" },
  preparing: { color: colors.orderPreparing, label: "Preparing" },
  shipped: { color: colors.info, label: "Shipped" },
  delivered: { color: colors.success, label: "Delivered" },
  cancelled: { color: colors.error, label: "Cancelled" },
};

export default function LongOrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [order, setOrder] = useState<LongOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await longOrdersApi.getOrder(params.id as string);
        setOrder(data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params.id]);

  const cancelOrder = async () => {
    if (!order) return;

    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await longOrdersApi.cancelOrder(order.id);
              router.back();
            } catch (error) {
              console.error("Failed to cancel order:", error);
              Alert.alert("Error", "Failed to cancel order");
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
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
        <Text style={styles.notFoundText}>Order not found</Text>
      </View>
    );
  }

  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const canCancel = ["pending", "confirmed", "preparing"].includes(order.status);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.orderNumber}>{order.order_number}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color + "20" }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Timeline */}
        <GlassCard style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.timeline}>
            {["pending", "confirmed", "preparing", "shipped", "delivered"]
              .concat(order.status === "cancelled" ? ["cancelled"] : [])
              .map((s, i) => {
                const statuses = ["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"];
                const currentIndex = statuses.indexOf(order.status);
                const stepIndex = statuses.indexOf(s);
                const isPast = stepIndex <= currentIndex;
                const isCancelled = order.status === "cancelled" && s === "cancelled";

                return (
                  <View key={s} style={styles.timelineItem}>
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor: isPast ? colors.success : colors.glass,
                          borderColor: isPast ? "transparent" : colors.border,
                        },
                      ]}
                    >
                      {isCancelled && <X size={10} color={colors.error} />}
                    </View>
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
                    <Text style={[styles.timelineLabel, isPast && styles.timelineLabelActive]}>
                      {STATUS_CONFIG[s]?.label || s}
                    </Text>
                  </View>
                );
              })}
          </View>
        </GlassCard>

        {/* Delivery Estimate */}
        {order.estimated_delivery_date && (
          <GlassCard style={styles.deliveryCard}>
            <View style={styles.deliveryRow}>
              <Clock size={20} color={colors.primary} />
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryLabel}>Estimated Delivery</Text>
                <Text style={styles.deliveryDate}>
                  {new Date(order.estimated_delivery_date).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </Text>
              </View>
            </View>
          </GlassCard>
        )}

        {/* Order Items */}
        <GlassCard style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
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
            <Text style={styles.totalLabel}>Delivery Fee</Text>
            <Text style={styles.totalValue}>
              {order.delivery_fee === 0 ? "FREE" : `₹${order.delivery_fee.toFixed(2)}`}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>₹{order.total_amount.toFixed(2)}</Text>
          </View>
        </GlassCard>

        {/* Payment Info */}
        <GlassCard style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Method</Text>
            <Text style={styles.paymentValue}>{order.payment_method}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Status</Text>
            <Text style={[styles.paymentValue, { color: order.payment_status === "completed" ? colors.success : colors.warning }]}>
              {order.payment_status}
            </Text>
          </View>
        </GlassCard>

        {/* Cancel Button */}
        {canCancel && (
          <Button
            title={cancelling ? "Cancelling..." : "Cancel Order"}
            onPress={cancelOrder}
            disabled={cancelling}
            variant="secondary"
            style={styles.cancelButton}
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
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  orderNumber: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.small,
    fontWeight: "600",
  },
  content: {
    padding: spacing.lg,
    paddingTop: 0,
    paddingBottom: spacing.xxxl,
  },
  timelineCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  timeline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  timelineItem: {
    alignItems: "center",
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineLine: {
    position: "absolute",
    top: 10,
    left: 24,
    width: 40,
    height: 2,
  },
  timelineLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  timelineLabelActive: {
    color: colors.success,
  },
  deliveryCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.primaryGlow,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  deliveryInfo: {},
  deliveryLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  deliveryDate: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  itemsCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
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
  paymentCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  paymentLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  paymentValue: {
    ...typography.body,
    color: colors.textPrimary,
    textTransform: "capitalize",
  },
  cancelButton: {
    marginTop: spacing.lg,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textTertiary,
  },
});
