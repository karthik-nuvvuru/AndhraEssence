// Default delivery fee - should come from restaurant data in production
const DEFAULT_DELIVERY_FEE = 40;

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { colors, typography, spacing } from "@/theme";
import { useCartStore } from "@/store";
import { orderApi } from "@/services/api/endpoints";
import { formatCurrency } from "@/utils/formatters";

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, restaurantId, getSubtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [promoCode, setPromoCode] = useState("");

  const subtotal = getSubtotal();
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = DEFAULT_DELIVERY_FEE;
  const total = subtotal + tax + deliveryFee;

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      Alert.alert("Error", "Your cart is empty");
      return;
    }

    setLoading(true);
    try {
      const response = await orderApi.create({
        restaurant_id: restaurantId,
        address_id: "address-id", // This needs to come from user's saved addresses
        items: items.map((item) => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          special_instructions: item.specialInstructions,
        })),
        payment_method: "razorpay",
        delivery_instructions: deliveryInstructions,
      });

      clearCart();
      router.replace(`/order/${response.data.id}`);
    } catch (error: any) {
      const message =
        error.response?.data?.detail || "Failed to place order";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Button title="Browse Restaurants" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Delivery Address */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Text style={styles.addressText}>
            Add your delivery address
          </Text>
          <Button
            title="Select Address"
            variant="outline"
            onPress={() => {}}
          />
        </Card>

        {/* Promo Code */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
          <Input
            placeholder="Enter promo code"
            value={promoCode}
            onChangeText={setPromoCode}
          />
        </Card>

        {/* Order Summary */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          {items.map((item) => (
            <View key={item.menuItem.id} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.quantity}x {item.menuItem.name}
              </Text>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.menuItem.price * item.quantity)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Payment Summary */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Details</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Item Total</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (5% GST)</Text>
            <Text style={styles.summaryValue}>{formatCurrency(tax)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(deliveryFee)}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </Card>

        {/* Delivery Instructions */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Instructions</Text>
          <Input
            placeholder="Add notes for delivery (optional)"
            value={deliveryInstructions}
            onChangeText={setDeliveryInstructions}
            multiline
            numberOfLines={3}
          />
        </Card>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Total</Text>
          <Text style={styles.footerTotalValue}>{formatCurrency(total)}</Text>
        </View>
        <Button
          title={loading ? "Processing..." : "Place Order"}
          onPress={handlePlaceOrder}
          loading={loading}
          disabled={loading}
        />
      </View>
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
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  addressText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  itemName: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  itemPrice: {
    ...typography.body,
    color: colors.textSecondary,
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
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  footerTotal: {},
  footerTotalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footerTotalValue: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.h4,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});
