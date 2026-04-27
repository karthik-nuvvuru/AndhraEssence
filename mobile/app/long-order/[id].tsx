// Long Order Item Detail Screen
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock, Leaf, ShoppingCart, ArrowLeft, Star, Check } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { longOrdersApi, type LongOrderItem } from "@/services/api/longOrders";
import { useLongOrderCartStore } from "@/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function LongOrderDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [item, setItem] = useState<LongOrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await longOrdersApi.getItem(params.id as string);
        setItem(data);
      } catch (error) {
        console.error("Failed to fetch item:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [params.id]);

  const addToCart = async () => {
    if (!item) return;

    setAdding(true);
    try {
      useLongOrderCartStore.getState().addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        preparation_days: item.preparation_days,
        unit: item.unit,
      }, quantity);
      Alert.alert("Added to Cart", `${quantity}x ${item.name} added to your long order cart.`, [
        { text: "Continue Shopping", style: "cancel" },
        { text: "View Cart", onPress: () => router.push("/long-order/cart") },
      ]);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      Alert.alert("Error", "Failed to add item to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LoadingSpinner />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.notFoundText}>Item not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push("/long-order/cart")}
        >
          <ShoppingCart size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Image */}
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Leaf size={64} color={colors.textTertiary} />
          </View>
        )}

        {/* Item Info */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <View style={[styles.vegBadge, { borderColor: item.is_veg ? colors.veg : colors.nonVeg }]}>
              <View style={[styles.vegDot, { backgroundColor: item.is_veg ? colors.veg : colors.nonVeg }]} />
            </View>
            <Text style={styles.itemName}>{item.name}</Text>
          </View>

          {item.is_bestseller && (
            <View style={styles.bestsellerBadge}>
              <Star size={14} color={colors.accent} fill={colors.accent} />
              <Text style={styles.bestsellerText}>Bestseller</Text>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
            <Text style={styles.unit}>per {item.unit}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={16} color={colors.textTertiary} />
              <Text style={styles.metaText}>{item.preparation_days} days preparation</Text>
            </View>
            <View style={styles.metaItem}>
              <Check size={16} color={item.is_available ? colors.success : colors.error} />
              <Text style={[styles.metaText, { color: item.is_available ? colors.success : colors.error }]}>
                {item.is_available ? "In Stock" : "Out of Stock"}
              </Text>
            </View>
          </View>

          {item.stock_quantity < 20 && item.is_available && (
            <View style={styles.stockWarning}>
              <Text style={styles.stockWarningText}>
                Only {item.stock_quantity} {item.unit}s left!
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        {item.description && (
          <GlassCard style={styles.descCard}>
            <Text style={styles.descTitle}>Description</Text>
            <Text style={styles.descText}>{item.description}</Text>
          </GlassCard>
        )}

        {/* Delivery Info */}
        <GlassCard style={styles.deliveryCard}>
          <Text style={styles.deliveryTitle}>Delivery Information</Text>
          <View style={styles.deliveryRow}>
            <Clock size={16} color={colors.textTertiary} />
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryLabel}>Preparation Time</Text>
              <Text style={styles.deliveryValue}>{item.preparation_days} days</Text>
            </View>
          </View>
          <View style={styles.deliveryRow}>
            <Leaf size={16} color={colors.textTertiary} />
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryLabel}>Freshly Prepared</Text>
              <Text style={styles.deliveryValue}>Made when you order</Text>
            </View>
          </View>
        </GlassCard>

        {/* Add to Cart */}
        <View style={styles.addToCartSection}>
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={item.stock_quantity}
            />
          </View>

          <Button
            title={adding ? "Adding..." : `Add to Cart - ₹${(item.price * quantity).toFixed(2)}`}
            onPress={addToCart}
            disabled={adding || !item.is_available || item.stock_quantity === 0}
            style={styles.addButton}
          />
        </View>
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
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.black + "60",
    justifyContent: "center",
    alignItems: "center",
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.black + "60",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  image: {
    width: "100%",
    height: 300,
  },
  imagePlaceholder: {
    backgroundColor: colors.glass,
    justifyContent: "center",
    alignItems: "center",
  },
  infoSection: {
    padding: spacing.lg,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  vegBadge: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemName: {
    ...typography.h2,
    color: colors.textPrimary,
    flex: 1,
  },
  bestsellerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  bestsellerText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  price: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  unit: {
    ...typography.body,
    color: colors.textTertiary,
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.xl,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  stockWarning: {
    marginTop: spacing.md,
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  stockWarningText: {
    ...typography.bodySmall,
    color: colors.warning,
    fontWeight: "600",
  },
  descCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  descTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  descText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  deliveryCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  deliveryTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  deliveryInfo: {},
  deliveryLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  deliveryValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  addToCartSection: {
    padding: spacing.lg,
  },
  quantitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  quantityLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  addButton: {
    marginTop: spacing.sm,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textTertiary,
  },
});
