import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { colors, typography, spacing } from "@/theme";
import { orderApi } from "@/services/api/endpoints";
import { useOrderStore, useAuthStore } from "@/store";
import { socketService } from "@/services/websocket/socketService";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import type { Order } from "@/types/api";

const statusSteps = [
  { status: "pending", label: "Placed" },
  { status: "confirmed", label: "Confirmed" },
  { status: "preparing", label: "Preparing" },
  { status: "ready", label: "Ready" },
  { status: "picked_up", label: "Picked Up" },
  { status: "delivered", label: "Delivered" },
];

const statusIndex: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  ready: 3,
  picked_up: 4,
  delivered: 5,
  cancelled: -1,
  refunded: -1,
};

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentOrder, setCurrentOrder, updateOrder } = useOrderStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    return () => {
      socketService.removeOrderStatusListener();
      socketService.removeRiderLocationListener();
    };
  }, [id]);

  useEffect(() => {
    if (currentOrder?.id === id) {
      socketService.connect(useAuthStore.getState().user?.id || "");
      socketService.subscribeToOrder(id!);
      socketService.onOrderStatusUpdate((data) => {
        if (data.order_id === id) {
          updateOrder(id!, { status: data.status });
        }
      });
    }
  }, [currentOrder]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getById(id!);
      setCurrentOrder(response.data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await orderApi.cancel(id!);
      updateOrder(id!, { status: "cancelled" });
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  };

  if (loading || !currentOrder) {
    return <LoadingSpinner fullScreen text="Loading order..." />;
  }

  const orderStatus = currentOrder.status || "pending";
  const currentStep = statusIndex[orderStatus] || 0;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Header */}
        <View style={styles.header}>
          <Text style={styles.orderNumber}>{currentOrder.order_number}</Text>
          <Badge
            text={orderStatus.replace("_", " ").toUpperCase()}
            variant={orderStatus === "delivered" ? "success" : "info"}
          />
        </View>

        {/* Status Timeline */}
        <Card style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.timeline}>
            {statusSteps.map((step, index) => (
              <View
                key={step.status}
                style={[
                  styles.timelineStep,
                  index <= currentStep && styles.timelineStepCompleted,
                  index === currentStep && styles.timelineStepCurrent,
                ]}
              >
                <View
                  style={[
                    styles.timelineDot,
                    index <= currentStep && styles.timelineDotCompleted,
                  ]}
                />
                <Text
                  style={[
                    styles.timelineLabel,
                    index <= currentStep && styles.timelineLabelCompleted,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Order Details */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Order Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Restaurant</Text>
            <Text style={styles.detailValue}>
              {currentOrder.restaurant_name || "Restaurant"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Placed At</Text>
            <Text style={styles.detailValue}>
              {formatDateTime(currentOrder.placed_at || "")}
            </Text>
          </View>

          {currentOrder.items?.map((item: any, index: number) => (
            <View key={item.id || index} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.quantity}x {item.item_name}
              </Text>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.subtotal)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Payment Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(currentOrder.subtotal || 0)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(currentOrder.tax_amount || 0)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(currentOrder.delivery_fee || 0)}
            </Text>
          </View>

          {(currentOrder.discount_amount || 0) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                -{formatCurrency(currentOrder.discount_amount || 0)}
              </Text>
            </View>
          )}

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(currentOrder.total_amount || 0)}
            </Text>
          </View>
        </Card>

        {/* Actions */}
        {currentOrder.status === "pending" && (
          <View style={styles.actions}>
            <Button
              title="Cancel Order"
              onPress={() => handleCancel()}
              variant="outline"
              fullWidth
            />
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
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  orderNumber: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  timelineCard: {
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
  },
  timelineStep: {
    alignItems: "center",
    flex: 1,
  },
  timelineStepCompleted: {},
  timelineStepCurrent: {},
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.gray300,
    marginBottom: spacing.xs,
  },
  timelineDotCompleted: {
    backgroundColor: colors.success,
  },
  timelineLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
  timelineLabelCompleted: {
    color: colors.success,
    fontWeight: "600",
  },
  detailsCard: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    marginTop: spacing.sm,
  },
  itemName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  itemPrice: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  totalLabel: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  totalValue: {
    ...typography.h4,
    color: colors.primary,
  },
  actions: {
    marginTop: spacing.sm,
  },
});
