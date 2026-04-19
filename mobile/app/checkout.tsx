// Premium Checkout Screen - Glassmorphism Dark Theme
// Zomato/Uber Eats quality with fintech/AI aesthetic

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { useCartStore } from "@/store";
import { orderApi, userApi } from "@/services/api/endpoints";
import { formatCurrency } from "@/utils/formatters";
import type { Address, PaymentMethod } from "@/types/api";
type TipAmount = 0 | 20 | 50 | 100 | "custom";

const DEFAULT_DELIVERY_FEE = 40;

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, restaurantId, restaurantName, getSubtotal, clearCart } = useCartStore();

  // State
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [tipAmount, setTipAmount] = useState<TipAmount>(0);
  const [customTip, setCustomTip] = useState("");
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await userApi.getAddresses();
      setAddresses(response.data);
      const defaultAddress = response.data.find((addr: Address) => addr.is_default) || response.data[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const subtotal = getSubtotal();
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = DEFAULT_DELIVERY_FEE;
  const platformFee = 5;
  const displayTip = useMemo(
    () => (tipAmount === "custom" ? parseInt(customTip) || 0 : (tipAmount as number)),
    [tipAmount, customTip]
  );
  const total = subtotal + tax + deliveryFee + platformFee + displayTip;

  const selectedAddress = useMemo(
    () => addresses.find(a => a.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId]
  );

  const getAddressIcon = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes("home")) return "🏠";
    if (lower.includes("work") || lower.includes("office")) return "💼";
    return "📍";
  };

  const handleTipSelect = (amount: TipAmount) => {
    if (tipAmount === amount) return;
    setTipAmount(amount);
    if (amount !== "custom") {
      setCustomTip("");
    }
  };

  const handleCustomTipChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");
    setCustomTip(numericText);
    if (numericText && tipAmount !== "custom") {
      setTipAmount("custom");
    }
  };

  const confirmPlaceOrder = () => {
    const address = addresses.find(a => a.id === selectedAddressId);
    Alert.alert(
      "Confirm Order",
      `Total: ${formatCurrency(total)}\nDelivery to: ${address?.address_line || "selected address"}\nPayment: ${paymentMethod === "razorpay" ? "Credit/Debit Card" : paymentMethod === "wallet" ? "Wallet" : "Cash on Delivery"}`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: handlePlaceOrder, style: "default" },
      ]
    );
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      Alert.alert("Error", "Your cart is empty");
      return;
    }

    if (!selectedAddressId) {
      Alert.alert("Error", "Please select a delivery address");
      return;
    }

    setLoading(true);
    try {
      const response = await orderApi.create({
        restaurant_id: restaurantId as string,
        address_id: selectedAddressId as string,
        items: items.map((item) => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          special_instructions: item.specialInstructions,
        })),
        payment_method: paymentMethod === "cod" ? "cash" : paymentMethod === "wallet" ? "wallet" : paymentMethod,
        delivery_instructions: deliveryInstructions,
        tip_amount: displayTip,
      });

      clearCart();
      router.replace(`/order/${response.data.id}`);
    } catch (error: any) {
      const message = error.response?.data?.detail || "Failed to place order";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add items to proceed with checkout</Text>
          <Button title="Browse Restaurants" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {/* Restaurant Banner */}
        {restaurantName && (
          <View style={styles.restaurantBanner}>
            <Text style={styles.restaurantIcon}>🍽</Text>
            <Text style={styles.restaurantName}>{restaurantName}</Text>
          </View>
        )}

        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <GlassCard style={styles.addressCard}>
            {loadingAddresses ? (
              <LoadingSpinner text="" />
            ) : addresses.length === 0 ? (
              <View style={styles.noAddressContainer}>
                <Text style={styles.noAddressText}>No saved addresses</Text>
                <Button title="Add Address" variant="outline" size="sm" onPress={() => {}} />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addressOption}
                onPress={() => {
                  const idx = addresses.findIndex(a => a.id === selectedAddressId);
                  const next = (idx + 1) % addresses.length;
                  setSelectedAddressId(addresses[next].id);
                }}
              >
                <View style={styles.addressIconContainer}>
                  <Text style={styles.addressIcon}>{selectedAddress ? getAddressIcon(selectedAddress.label) : "📍"}</Text>
                </View>
                <View style={styles.addressContent}>
                  {selectedAddress ? (
                    <>
                      <View style={styles.addressHeader}>
                        <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
                        {selectedAddress.is_default && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.addressText}>
                        {selectedAddress.address_line}, {selectedAddress.city}
                      </Text>
                      <Text style={styles.addressSubtext}>
                        {selectedAddress.state} {selectedAddress.postal_code}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.addressPlaceholder}>Select an address</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.changeButton}>
                  <Text style={styles.changeButtonText}>Change</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          </GlassCard>
        </View>

        {/* Delivery Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Instructions</Text>
          <View style={styles.instructionInputContainer}>
            <TextInput
              style={styles.instructionInput}
              placeholder="Add notes for delivery (optional)"
              placeholderTextColor={colors.textTertiary}
              value={deliveryInstructions}
              onChangeText={setDeliveryInstructions}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            {[
              { id: "razorpay", label: "Cards", icon: "💳" },
              { id: "wallet", label: "Wallet", icon: "👛" },
              { id: "cod", label: "Cash on Delivery", icon: "💵" },
            ].map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentPill,
                  paymentMethod === method.id && styles.paymentPillSelected,
                ]}
                onPress={() => setPaymentMethod(method.id as PaymentMethod)}
              >
                <Text style={styles.paymentIcon}>{method.icon}</Text>
                <Text
                  style={[
                    styles.paymentLabel,
                    paymentMethod === method.id && styles.paymentLabelSelected,
                  ]}
                >
                  {method.label}
                </Text>
                {paymentMethod === method.id && (
                  <View style={styles.paymentCheckmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tip Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add a tip</Text>
          <Text style={styles.tipSubtitle}>Support your delivery partner</Text>
          <View style={styles.tipRow}>
            {([0, 20, 50, 100] as const).map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.tipButton,
                  tipAmount === amount && styles.tipButtonActive,
                ]}
                onPress={() => handleTipSelect(amount)}
              >
                <Text style={[styles.tipText, tipAmount === amount && styles.tipTextActive]}>
                  {amount === 0 ? "No Tip" : `₹${amount}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.customTipContainer}>
            <TouchableOpacity
              style={[
                styles.customTipButton,
                tipAmount === "custom" && styles.customTipButtonActive,
              ]}
              onPress={() => handleTipSelect("custom")}
            >
              <Text style={[styles.customTipLabel, tipAmount === "custom" && styles.customTipLabelActive]}>
                Custom
              </Text>
            </TouchableOpacity>
            <TextInput
              style={[
                styles.customTipInput,
                tipAmount === "custom" && styles.customTipInputActive,
              ]}
              placeholder="Enter amount"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              value={customTip}
              onChangeText={handleCustomTipChange}
            />
          </View>
        </View>

        {/* Order Summary Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.summaryHeader}
            onPress={() => setSummaryExpanded(!summaryExpanded)}
          >
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryToggle}>
              <Text style={styles.itemCountText}>
                {items.length} item{items.length !== 1 ? "s" : ""}
              </Text>
              <Text style={styles.expandIcon}>{summaryExpanded ? "▲" : "▼"}</Text>
            </View>
          </TouchableOpacity>

          <GlassCard style={styles.summaryCard} padding="sm">
            {summaryExpanded && (
              <View style={styles.itemsList}>
                {items.map((item) => (
                  <View key={item.menuItem.id} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <View
                        style={[
                          styles.vegDot,
                          {
                            backgroundColor: item.menuItem.is_veg
                              ? colors.veg
                              : colors.nonVeg,
                          },
                        ]}
                      />
                      <Text style={styles.itemName}>{item.menuItem.name}</Text>
                    </View>
                    <View style={styles.itemRight}>
                      <Text style={styles.itemQty}>x{item.quantity}</Text>
                      <Text style={styles.itemPrice}>
                        {formatCurrency(item.menuItem.price * item.quantity)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Bill Breakdown */}
            <View style={styles.billBreakdown}>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Total</Text>
                <Text style={styles.billValue}>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Tax (5% GST)</Text>
                <Text style={styles.billValue}>{formatCurrency(tax)}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Fee</Text>
                <Text style={styles.billValue}>{formatCurrency(deliveryFee)}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Platform Fee</Text>
                <Text style={styles.billValue}>{formatCurrency(platformFee)}</Text>
              </View>
              {displayTip > 0 && (
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Tip</Text>
                  <Text style={styles.billValue}>{formatCurrency(displayTip)}</Text>
                </View>
              )}
              <View style={[styles.billRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Bottom Spacer for Footer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky Footer with Place Order Button */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.footerTotalContainer}>
            <Text style={styles.footerTotalLabel}>Total</Text>
            <Text style={styles.footerTotalValue}>{formatCurrency(total)}</Text>
          </View>
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={confirmPlaceOrder}
            disabled={loading || !selectedAddressId || loadingAddresses}
            activeOpacity={0.85}
          >
            <View style={styles.gradientButtonInner}>
              <View style={styles.gradientButtonOverlay} />
              <View style={styles.gradientButtonContent}>
                <Text style={styles.placeOrderText}>
                  {loading ? "Processing..." : "Place Order"}
                </Text>
                <Text style={styles.placeOrderArrow}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 140,
  },
  restaurantBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundCard,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  restaurantIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  restaurantName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  addressCard: {
    backgroundColor: colors.glass,
    borderColor: colors.glassBorder,
  },
  addressOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  addressIcon: {
    fontSize: 24,
  },
  addressContent: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  addressLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  defaultBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  defaultBadgeText: {
    ...typography.small,
    color: colors.success,
    fontWeight: "600",
  },
  addressText: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  addressSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  addressPlaceholder: {
    ...typography.body,
    color: colors.textTertiary,
  },
  changeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
  },
  changeButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
  },
  noAddressContainer: {
    alignItems: "center",
    padding: spacing.md,
  },
  noAddressText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  instructionInputContainer: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  instructionInput: {
    ...typography.body,
    color: colors.textPrimary,
    padding: spacing.md,
    minHeight: 80,
    textAlignVertical: "top",
  },
  paymentOptions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  paymentPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    minHeight: 56,
  },
  paymentPillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  paymentIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  paymentLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  paymentLabelSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  paymentCheckmark: {
    marginLeft: spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: "700",
  },
  tipSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  tipRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.glass,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  tipButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  tipText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  tipTextActive: {
    color: colors.primary,
  },
  customTipContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  customTipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.glass,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  customTipButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  customTipLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  customTipLabelActive: {
    color: colors.primary,
  },
  customTipInput: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
    ...typography.body,
    color: colors.textPrimary,
  },
  customTipInputActive: {
    borderColor: colors.primary,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  summaryToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  itemCountText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  expandIcon: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: colors.glass,
    borderColor: colors.glassBorder,
  },
  itemsList: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  vegDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  itemName: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemQty: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginRight: spacing.md,
  },
  itemPrice: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    minWidth: 70,
    textAlign: "right",
  },
  billBreakdown: {},
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  billLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  billValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  totalValue: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: "700",
  },
  bottomSpacer: {
    height: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.glass,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  footerTotalContainer: {
    flex: 1,
  },
  footerTotalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  footerTotalValue: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  placeOrderButton: {
    minWidth: 180,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    ...shadows.glow,
  },
  gradientButtonInner: {
    position: "relative",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  gradientButtonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  gradientButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
  },
  placeOrderText: {
    ...typography.button,
    color: colors.white,
    fontWeight: "700",
    marginRight: spacing.sm,
  },
  placeOrderArrow: {
    fontSize: 18,
    color: colors.white,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
});