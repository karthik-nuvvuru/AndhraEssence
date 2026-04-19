// Premium Cart Screen - Liquid Glass Design
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Tag, Trash2, ShoppingBag } from "lucide-react-native";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { CartItem } from "@/components/ui/CartItem";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { useCartStore } from "@/store";
import { formatCurrency } from "@/utils/formatters";

const TAX_RATE = 0.05;
const DELIVERY_FEE = 40;
const PLATFORM_FEE = 5;

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    items,
    restaurantName,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
  } = useCartStore();

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const subtotal = getSubtotal();
  const taxAmount = subtotal * TAX_RATE;
  const total = subtotal + taxAmount + DELIVERY_FEE + PLATFORM_FEE - discountAmount;

  const handleApplyPromo = useCallback(() => {
    if (!promoCode.trim()) {
      Alert.alert("Error", "Please enter a promo code");
      return;
    }
    if (promoCode.toUpperCase().startsWith("SAVE")) {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setAppliedPromo(promoCode.toUpperCase());
      Alert.alert("Success", `Promo code applied! You save ${formatCurrency(discount)}`);
    } else {
      Alert.alert("Invalid Code", "This promo code is not valid");
    }
  }, [promoCode, subtotal]);

  const handleRemovePromo = useCallback(() => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoCode("");
  }, []);

  const handleIncrease = (itemId: string) => {
    const item = items.find((i) => i.menuItem.id === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity + 1);
    }
  };

  const handleDecrease = (itemId: string) => {
    const item = items.find((i) => i.menuItem.id === itemId);
    if (item) {
      const newQty = item.quantity - 1;
      if (newQty <= 0) {
        Alert.alert(
          "Remove Item",
          `Remove ${item.menuItem.name} from cart?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Remove",
              style: "destructive",
              onPress: () => removeItem(itemId),
            },
          ]
        );
      } else {
        updateQuantity(itemId, newQty);
      }
    }
  };

  const handleRemoveItem = (item: CartItem) => {
    Alert.alert(
      "Remove Item",
      `Remove ${item.menuItem.name} from cart?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeItem(item.menuItem.id),
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Remove all items from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: clearCart,
        },
      ]
    );
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const handleExplore = () => {
    router.push("/");
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <CartItem
      item={item}
      onIncrease={handleIncrease}
      onDecrease={handleDecrease}
      onRemove={handleRemoveItem}
    />
  );

  const renderBillBreakdown = () => (
    <GlassCard style={styles.billCard} variant="default" padding="md">
      <Text style={styles.billTitle}>Bill Details</Text>

      <View style={styles.billRow}>
        <Text style={styles.billLabel}>Item Total</Text>
        <Text style={styles.billValue}>{formatCurrency(subtotal)}</Text>
      </View>

      <View style={styles.billRow}>
        <Text style={styles.billLabel}>Taxes & GST (5%)</Text>
        <Text style={styles.billValue}>{formatCurrency(taxAmount)}</Text>
      </View>

      <View style={styles.billRow}>
        <Text style={styles.billLabel}>Delivery Fee</Text>
        <Text style={styles.billValue}>{formatCurrency(DELIVERY_FEE)}</Text>
      </View>

      <View style={styles.billRow}>
        <Text style={styles.billLabel}>Platform Fee</Text>
        <Text style={styles.billValue}>{formatCurrency(PLATFORM_FEE)}</Text>
      </View>

      {discountAmount > 0 && (
        <View style={[styles.billRow, styles.discountRow]}>
          <Text style={styles.discountLabel}>
            <Text style={styles.discountTag}>{appliedPromo}</Text> Discount
          </Text>
          <Text style={styles.discountValue}>-{formatCurrency(discountAmount)}</Text>
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
      </View>
    </GlassCard>
  );

  const renderPromoCode = () => (
    <GlassCard style={styles.promoCard} variant="default" padding="md">
      {appliedPromo ? (
        <View style={styles.appliedPromo}>
          <View style={styles.appliedPromoInfo}>
            <View style={styles.promoIconBox}>
              <Tag size={16} color={colors.success} />
            </View>
            <View>
              <Text style={styles.appliedPromoText}>{appliedPromo}</Text>
              <Text style={styles.appliedPromoSubtext}>Promo applied</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleRemovePromo} style={styles.removePromoBtn}>
            <Text style={styles.removePromoText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.promoInputRow}>
          <View style={styles.promoInputContainer}>
            <Tag size={16} color={colors.textTertiary} />
            <TextInput
              style={styles.promoInput}
              placeholder="Enter promo code"
              placeholderTextColor={colors.textTertiary}
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
              returnKeyType="done"
            />
          </View>
          <Button
            title="Apply"
            onPress={handleApplyPromo}
            variant="primary"
            size="sm"
            style={styles.applyButton}
          />
        </View>
      )}
    </GlassCard>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <ShoppingBag size={40} color={colors.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtext}>
        Add items from a restaurant to get started
      </Text>
      <Button
        title="Explore Restaurants"
        onPress={handleExplore}
        variant="primary"
        size="lg"
        style={styles.exploreButton}
      />
    </View>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Cart</Text>
        </View>
        {renderEmpty()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Your Cart</Text>
            {restaurantName && (
              <Text style={styles.restaurantName}>from {restaurantName}</Text>
            )}
          </View>
          <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
            <Trash2 size={16} color={colors.error} />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Cart Items */}
        <FlatList
          data={items}
          keyExtractor={(item) => item.menuItem.id}
          renderItem={renderCartItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={styles.footer}>
              {renderPromoCode()}
              {renderBillBreakdown()}
              <View style={styles.footerSpacer} />
            </View>
          }
        />

        {/* Sticky Checkout Button */}
        <View style={[styles.stickyFooter, { paddingBottom: insets.bottom > 0 ? insets.bottom + spacing.md : spacing.md }]}>
          <View style={styles.stickyContent}>
            <View style={styles.totalInfo}>
              <Text style={styles.stickyTotalLabel}>Total</Text>
              <Text style={styles.stickyTotalValue}>{formatCurrency(total)}</Text>
            </View>
            <Button
              title={`Checkout • ${formatCurrency(total)}`}
              onPress={handleCheckout}
              variant="gradient"
              size="lg"
              style={styles.checkoutButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  restaurantName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  clearText: {
    ...typography.body,
    color: colors.error,
    fontWeight: "500",
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  footer: {
    marginTop: spacing.sm,
  },
  promoCard: {
    marginBottom: spacing.md,
  },
  promoInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  promoInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.sm,
  },
  promoInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    marginLeft: spacing.xs,
  },
  applyButton: {
    minWidth: 80,
  },
  appliedPromo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appliedPromoInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  promoIconBox: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.successBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  appliedPromoText: {
    ...typography.bodyBold,
    color: colors.success,
  },
  appliedPromoSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  removePromoBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  removePromoText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: "500",
  },
  billCard: {
    marginBottom: spacing.md,
  },
  billTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  billLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  billValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  discountRow: {
    marginTop: spacing.xs,
  },
  discountLabel: {
    ...typography.body,
    color: colors.success,
  },
  discountTag: {
    ...typography.caption,
    backgroundColor: colors.successBg,
    color: colors.success,
    paddingHorizontal: spacing.xs,
    borderRadius: 4,
    overflow: "hidden",
  },
  discountValue: {
    ...typography.body,
    color: colors.success,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
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
  totalValue: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  footerSpacer: {
    height: 100,
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...shadows.glass,
  },
  stickyContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalInfo: {
    flex: 1,
  },
  stickyTotalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stickyTotalValue: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  checkoutButton: {
    flex: 1.5,
    marginLeft: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundCard,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  exploreButton: {
    minWidth: 220,
  },
});