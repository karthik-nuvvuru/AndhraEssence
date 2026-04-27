// Long Order Cart Screen
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Trash2, ShoppingBag, Clock, ArrowRight, MapPin } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { longOrdersApi } from "@/services/api/longOrders";
import { useLongOrderCartStore } from "@/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { userApi } from "@/services/api/endpoints";
import type { Address } from "@/types/api";

export default function LongOrderCartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const items = useLongOrderCartStore((state) => state.items);
  const updateQuantity = useLongOrderCartStore((state) => state.updateQuantity);
  const removeItem = useLongOrderCartStore((state) => state.removeItem);
  const clearCart = useLongOrderCartStore((state) => state.clearCart);
  const getSubtotal = useLongOrderCartStore((state) => state.getSubtotal);
  const getMaxPrepDays = useLongOrderCartStore((state) => state.getMaxPrepDays);
  const setAddress = useLongOrderCartStore((state) => state.setAddress);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [placing, setPlacing] = useState(false);

  const subtotal = getSubtotal();
  const maxPrepDays = getMaxPrepDays();
  const deliveryFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await userApi.getAddresses();
        setAddresses(data);
        const defaultAddr = data.find((a: Address) => a.is_default) || data[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setAddress(defaultAddr.id);
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      }
    };
    fetchAddresses();
  }, []);

  const estimatedDeliveryDate = new Date();
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + maxPrepDays + 2);

  const placeOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert("Error", "Please select a delivery address");
      return;
    }

    setPlacing(true);
    try {
      const orderData = {
        address_id: selectedAddressId,
        items: items.map((item) => ({
          item_id: item.menuItem.id,
          quantity: item.quantity,
        })),
      };

      await longOrdersApi.createOrder(orderData);
      clearCart();
      Alert.alert("Order Placed!", "Your long order has been placed successfully.", [
        { text: "View Orders", onPress: () => router.push("/long-order/orders") },
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Failed to place order:", error);
      Alert.alert("Error", "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert("Empty Cart", "Add some items to your cart first.");
      return;
    }
    placeOrder();
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ShoppingBag size={64} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>Your Long Order Cart is Empty</Text>
        <Text style={styles.emptySubtitle}>
          Add homemade food, pickles, and traditional items
        </Text>
        <Button
          title="Start Shopping"
          onPress={() => router.back()}
          style={styles.shopButton}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Long Order Cart</Text>
        <Text style={styles.subtitle}>Homemade & Traditional</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Delivery Estimate */}
        <GlassCard style={styles.estimateCard}>
          <View style={styles.estimateHeader}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.estimateTitle}>Estimated Delivery</Text>
          </View>
          <Text style={styles.estimateDate}>
            {estimatedDeliveryDate.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </Text>
          <Text style={styles.estimateNote}>
            ({maxPrepDays} days preparation + 2 days delivery)
          </Text>
        </GlassCard>

        {/* Cart Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Items ({items.length})</Text>
          {items.map((item) => (
            <GlassCard key={item.menuItem.id} style={styles.itemCard}>
              <View style={styles.itemRow}>
                {item.menuItem.image_url ? (
                  <Image
                    source={{ uri: item.menuItem.image_url }}
                    style={styles.itemImage}
                  />
                ) : (
                  <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                    <Text style={styles.itemImagePlaceholderText}>
                      {item.menuItem.name.charAt(0)}
                    </Text>
                  </View>
                )}

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.menuItem.name}
                  </Text>
                  <Text style={styles.itemUnit}>per {item.menuItem.unit}</Text>
                  <View style={styles.itemPrepTime}>
                    <Clock size={12} color={colors.textTertiary} />
                    <Text style={styles.itemPrepText}>
                      {item.menuItem.preparation_days} days prep
                    </Text>
                  </View>
                </View>

                <View style={styles.itemActions}>
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(val) => updateQuantity(item.menuItem.id, val)}
                    min={1}
                    max={99}
                  />
                  <Text style={styles.itemPrice}>
                    ₹{(item.menuItem.price * item.quantity).toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeItem(item.menuItem.id)}
                    style={styles.removeButton}
                  >
                    <Trash2 size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={styles.addressSection}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {addresses.map((addr) => (
            <TouchableOpacity
              key={addr.id}
              style={[
                styles.addressCard,
                selectedAddressId === addr.id && styles.addressCardSelected,
              ]}
              onPress={() => {
                setSelectedAddressId(addr.id);
                setAddress(addr.id);
              }}
            >
              <View style={styles.addressHeader}>
                <MapPin size={16} color={colors.textTertiary} />
                <Text style={styles.addressLabel}>{addr.label}</Text>
                {addr.is_default && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={styles.addressText}>{addr.address_line}</Text>
              <Text style={styles.addressCity}>
                {addr.city}, {addr.state} {addr.postal_code}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bill Summary */}
        <GlassCard style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Bill Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={[styles.summaryValue, deliveryFee === 0 && styles.freeDelivery]}>
              {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}
            </Text>
          </View>
          {subtotal < 500 && (
            <Text style={styles.freeDeliveryNote}>
              Add ₹{(500 - subtotal).toFixed(2)} more for free delivery
            </Text>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
          </View>
        </GlassCard>

        {/* Place Order */}
        <Button
          title={placing ? "Placing Order..." : `Place Order - ₹${total.toFixed(2)}`}
          onPress={handleCheckout}
          disabled={placing || !selectedAddressId}
          style={styles.placeOrderButton}
        />
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
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  content: {
    padding: spacing.lg,
    paddingTop: 0,
    paddingBottom: spacing.xxxl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  shopButton: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  estimateCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.primaryGlow,
  },
  estimateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  estimateTitle: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  estimateDate: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  estimateNote: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  itemsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  itemCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
  },
  itemImagePlaceholder: {
    backgroundColor: colors.glass,
    justifyContent: "center",
    alignItems: "center",
  },
  itemImagePlaceholderText: {
    ...typography.h3,
    color: colors.textTertiary,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  itemUnit: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  itemPrepTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  itemPrepText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  itemActions: {
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  itemPrice: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  removeButton: {
    padding: spacing.xs,
  },
  addressSection: {
    marginBottom: spacing.lg,
  },
  addressCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  addressLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  defaultBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.xs,
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
    color: colors.textSecondary,
  },
  addressCity: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  summaryCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  freeDelivery: {
    color: colors.success,
  },
  freeDeliveryNote: {
    ...typography.caption,
    color: colors.success,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  totalLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  totalValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  placeOrderButton: {
    marginTop: spacing.sm,
  },
});
