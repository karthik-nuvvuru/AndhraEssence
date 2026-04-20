import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, Phone, Package, UtensilsCrossed, Clock, MapPin, Copy, ChevronLeft } from "lucide-react-native";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { orderApi } from "@/services/api/endpoints";
import { useOrderStore, useAuthStore } from "@/store";
import { socketService } from "@/services/websocket/socketService";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import type { OrderStatus } from "@/types/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Status flow for timeline
const statusSteps: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Order Placed" },
  { status: "confirmed", label: "Confirmed" },
  { status: "preparing", label: "Preparing" },
  { status: "ready", label: "Ready for Pickup" },
  { status: "picked_up", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
];

const statusIndex: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  ready: 3,
  picked_up: 4,
  in_transit: 4,
  delivered: 5,
  cancelled: -1,
  refunded: -1,
};

const statusDisplayColors: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: colors.warningBg, text: colors.warning, border: colors.warning },
  confirmed: { bg: colors.infoBg, text: colors.info, border: colors.info },
  preparing: { bg: colors.primaryGlow, text: colors.primary, border: colors.primary },
  ready: { bg: colors.errorBg, text: colors.error, border: colors.error },
  picked_up: { bg: colors.secondaryLight + "25", text: colors.secondary, border: colors.secondary },
  in_transit: { bg: colors.secondaryLight + "25", text: colors.secondary, border: colors.secondary },
  delivered: { bg: colors.successBg, text: colors.success, border: colors.success },
  cancelled: { bg: colors.errorBg, text: colors.error, border: colors.error },
};

interface RiderInfo {
  id: string;
  name: string;
  phone: string;
  photo_url?: string;
}

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentOrder, setCurrentOrder, updateOrder } = useOrderStore();
  const [loading, setLoading] = useState(true);
  const [riderInfo, setRiderInfo] = useState<RiderInfo | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for active step
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

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
          if (data.rider) {
            setRiderInfo(data.rider);
          }
        }
      });
      return () => {
        socketService.removeOrderStatusListener();
      };
    }
  }, [currentOrder]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getById(id!);
      setCurrentOrder(response.data as any);
      // Mock rider info for demo if order is in transit
      if (response.data.status === "picked_up" || response.data.status === "in_transit") {
        setRiderInfo({
          id: "rider-1",
          name: "Rajesh Kumar",
          phone: "+919876543210",
        });
      }
    } catch (error) {
      // Order fetch failed
    } finally {
      setLoading(false);
    }
  };

  const handleCallRider = () => {
    if (riderInfo?.phone) {
      Linking.openURL(`tel:${riderInfo.phone}`);
    }
  };

  if (loading || !currentOrder) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>Loading order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const orderStatus = currentOrder.status || "pending";
  const currentStep = statusIndex[orderStatus] ?? 0;
  const statusStyle = statusDisplayColors[orderStatus] || statusDisplayColors.pending;
  const isCancelled = orderStatus === "cancelled" || orderStatus === "refunded";

  // Get ETA based on status
  const getETA = () => {
    if (orderStatus === "delivered") return "Delivered";
    if (orderStatus === "cancelled") return "Cancelled";
    switch (currentStep) {
      case 0: return "25-35 min";
      case 1: return "20-30 min";
      case 2: return "15-25 min";
      case 3: return "10-15 min";
      case 4: return "5-10 min";
      default: return "25-35 min";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]} testID="screen-order-tracking">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="btn-back">
            <ChevronLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Track Order</Text>
            <Text style={styles.headerSubtitle}>{currentOrder.order_number}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]} testID="banner-status">
          <View style={styles.statusBannerContent}>
            <Text style={[styles.statusBannerText, { color: statusStyle.text }]} testID="text-status">
              {orderStatus.replace("_", " ").toUpperCase()}
            </Text>
            {!isCancelled && (
              <View style={styles.etaContainer}>
                <Text style={styles.etaLabel}>ETA</Text>
                <Text style={[styles.etaValue, { color: statusStyle.text }]} testID="text-eta">{getETA()}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapCard} testID="map-placeholder">
          <View style={styles.mapContent}>
            <View style={styles.mapGradient}>
              <View style={styles.mapPinContainer}>
                <MapPin size={48} color={colors.primary} />
              </View>
              <View style={styles.mapOverlay}>
                <Text style={styles.mapLabel}>Live Tracking</Text>
                <Text style={styles.mapSubtext}>Real-time location updates</Text>
              </View>
            </View>
            <View style={styles.mapRouteLines}>
              <View style={styles.routeLine} />
              <View style={[styles.routeLine, styles.routeLineActive]} />
            </View>
          </View>
        </View>

        {/* Delivery Timeline - Vertical Stepper */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Delivery Progress</Text>
          <View style={styles.timeline}>
            {statusSteps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              const isPending = index > currentStep;
              const isLast = index === statusSteps.length - 1;

              return (
                <View key={step.status} style={styles.timelineStep}>
                  {/* Connector Line */}
                  {!isLast && (
                    <View style={styles.timelineConnectorContainer}>
                      <View
                        style={[
                          styles.timelineConnector,
                          isCompleted && styles.timelineConnectorCompleted,
                          isCurrent && styles.timelineConnectorActive,
                        ]}
                      />
                    </View>
                  )}

                  {/* Step Content */}
                  <View style={styles.timelineStepContent}>
                    {/* Dot */}
                    <View style={styles.timelineDotContainer}>
                      <Animated.View
                        style={[
                          styles.timelineDot,
                          isCompleted && styles.timelineDotCompleted,
                          isCurrent && styles.timelineDotCurrent,
                          isPending && styles.timelineDotPending,
                          isCurrent && {
                            transform: [{ scale: pulseAnim }],
                          },
                        ]}
                      >
                        {isCompleted ? (
                          <Check size={10} color={colors.white} />
                        ) : isCurrent ? (
                          <View style={styles.timelinePulse} />
                        ) : null}
                      </Animated.View>
                    </View>

                    {/* Label */}
                    <View style={styles.timelineLabelContainer}>
                      <Text
                        style={[
                          styles.timelineLabel,
                          isCompleted && styles.timelineLabelCompleted,
                          isCurrent && styles.timelineLabelCurrent,
                          isPending && styles.timelineLabelPending,
                        ]}
                      >
                        {step.label}
                      </Text>
                      {isCurrent && (
                        <Text style={styles.timelineTime}>Now</Text>
                      )}
                      {isCompleted && index === 0 && currentOrder.placed_at && (
                        <Text style={styles.timelineTime}>
                          {formatDateTime(currentOrder.placed_at).split(",")[1]?.trim() || ""}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Rider Info Card */}
        {(orderStatus === "picked_up" || orderStatus === "in_transit") && riderInfo && (
          <View style={styles.riderCard}>
            <View style={styles.riderCardGlass}>
              <View style={styles.riderInfo}>
                <View style={styles.riderAvatar}>
                  <Package size={28} color={colors.primary} />
                </View>
                <View style={styles.riderDetails}>
                  <Text style={styles.riderLabel}>Your Rider</Text>
                  <Text style={styles.riderName}>{riderInfo.name}</Text>
                </View>
              </View>
              <View style={styles.riderActions}>
                <TouchableOpacity style={styles.callButton} onPress={handleCallRider}>
                  <Phone size={16} color={colors.white} />
                  <Text style={styles.callText}>Call</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Order Details Card */}
        <View style={styles.detailsCard} testID="card-order-details">
          <View style={styles.detailsCardGlass}>
            <View style={styles.restaurantHeader}>
              <UtensilsCrossed size={28} color={colors.primary} />
              <View>
                <Text style={styles.restaurantName}>
                  {currentOrder.restaurant_name || "Restaurant Name"}
                </Text>
                <Text style={styles.orderIdText} testID="text-order-number">Order #{currentOrder.order_number}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.itemsHeader}>Order Items</Text>
            <View style={styles.itemsSection}>
              {currentOrder.items?.map((item: any, index: number) => (
                <View
                  key={item.id || index}
                  style={[styles.itemRow, index > 0 && styles.itemBorder]}
                >
                  <View style={styles.itemLeft}>
                    <View
                      style={[
                        styles.itemDot,
                        { backgroundColor: item.is_veg ? colors.veg : colors.nonVeg },
                      ]}
                    />
                    <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                    <Text style={styles.itemName}>{item.item_name}</Text>
                  </View>
                  <Text style={styles.itemPrice}>{formatCurrency(item.subtotal)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(currentOrder.total_amount || 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.paymentCard}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment</Text>
            <View style={styles.paymentBadge}>
              <Text style={styles.paymentMethod}>
                {currentOrder.payment_method?.toUpperCase() || "Razorpay"}
              </Text>
            </View>
          </View>
        </View>

        {/* Spacer for bottom safe area */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.primary,
    borderTopColor: "transparent",
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundCard,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: "center",
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
  headerSpacer: {
    width: 44,
  },
  statusBanner: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statusBannerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBannerText: {
    ...typography.h4,
    fontWeight: "700",
    letterSpacing: 1,
  },
  etaContainer: {
    alignItems: "flex-end",
  },
  etaLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  etaValue: {
    ...typography.h4,
    fontWeight: "700",
  },
  mapCard: {
    height: 200,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapContent: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
  },
  mapGradient: {
    flex: 1,
    backgroundColor: colors.backgroundElevated,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  mapOverlay: {
    alignItems: "center",
  },
  mapPinContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  mapLabel: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  mapSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  mapRouteLines: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    height: 4,
    flexDirection: "row",
    gap: spacing.xs,
  },
  routeLine: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  routeLineActive: {
    backgroundColor: colors.primary,
  },
  timelineCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timelineTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  timeline: {
    paddingLeft: spacing.xs,
  },
  timelineStep: {
    flexDirection: "row",
    minHeight: 60,
  },
  timelineConnectorContainer: {
    width: 24,
    alignItems: "center",
    marginRight: spacing.md,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    borderRadius: 1,
  },
  timelineConnectorCompleted: {
    backgroundColor: colors.success,
  },
  timelineConnectorActive: {
    backgroundColor: colors.primary,
  },
  timelineStepContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timelineDotContainer: {
    marginRight: spacing.md,
    marginTop: 4,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDotCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  timelineDotCurrent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  timelineDotPending: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.border,
  },
  timelinePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  timelineLabelContainer: {
    flex: 1,
    paddingTop: 2,
    paddingBottom: spacing.md,
  },
  timelineLabel: {
    ...typography.body,
    color: colors.textTertiary,
  },
  timelineLabelCompleted: {
    color: colors.success,
    fontWeight: "600",
  },
  timelineLabelCurrent: {
    color: colors.primary,
    fontWeight: "700",
  },
  timelineLabelPending: {
    color: colors.textTertiary,
  },
  timelineTime: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  riderCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  riderCardGlass: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  riderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  riderAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundElevated,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  riderDetails: {},
  riderLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  riderName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  riderActions: {},
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  callText: {
    ...typography.button,
    color: colors.white,
  },
  detailsCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  detailsCardGlass: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  restaurantHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  restaurantName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  orderIdText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  itemsHeader: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  itemsSection: {},
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  itemBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  itemQuantity: {
    ...typography.bodyBold,
    color: colors.primary,
    marginRight: spacing.xs,
    minWidth: 30,
  },
  itemName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  itemPrice: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  totalAmount: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: "700",
  },
  paymentCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  paymentBadge: {
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  paymentMethod: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});