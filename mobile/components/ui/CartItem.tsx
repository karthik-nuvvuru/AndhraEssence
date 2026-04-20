// Premium Cart Item Component with Swipe-to-Delete
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Trash2, UtensilsCrossed } from "lucide-react-native";
import { GlassCard } from "@/components/ui/GlassCard";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { colors, typography, spacing, borderRadius } from "@/theme";
import { formatCurrency } from "@/utils/formatters";
import type { CartItem as CartItemType } from "@/store";

interface CartItemProps {
  item: CartItemType;
  onIncrease: (itemId: string) => void;
  onDecrease: (itemId: string) => void;
  onRemove: (item: CartItemType) => void;
  itemIndex?: number;
}

export const CartItem = React.memo(function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  itemIndex = 0,
}: CartItemProps) {
  const translateX = useSharedValue(0);

  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = Math.min(0, e.translationX);
    })
    .onEnd((e) => {
      if (e.translationX < -100) {
        runOnJS(onRemove)(item);
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View style={[styles.cartItemAnimated, animatedStyle]}>
        <GlassCard style={styles.cartItem} variant="elevated" padding="md">
          <View style={styles.cartItemInner}>
            {/* Food Image */}
            <View style={styles.imageContainer}>
              {item.menuItem.image_url ? (
                <Image
                  source={{ uri: item.menuItem.image_url }}
                  style={styles.foodImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <UtensilsCrossed size={28} color={colors.textTertiary} />
                </View>
              )}
              {/* Veg/Non-veg Badge */}
              <View
                style={[
                  styles.vegBadge,
                  {
                    borderColor: item.menuItem.is_veg ? colors.veg : colors.nonVeg,
                    backgroundColor: item.menuItem.is_veg
                      ? "rgba(16, 185, 129, 0.15)"
                      : "rgba(239, 68, 68, 0.15)",
                  },
                ]}
              >
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
              </View>
            </View>

            {/* Item Details */}
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.menuItem.name}
              </Text>
              <Text style={styles.itemVariant}>
                {item.menuItem.is_veg ? "Vegetarian" : "Non-Vegetarian"}
              </Text>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.menuItem.price)}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.itemActions}>
              <QuantityStepper
                value={item.quantity}
                onIncrease={() => onIncrease(item.menuItem.id)}
                onDecrease={() => onDecrease(item.menuItem.id)}
                size="sm"
                itemIndex={itemIndex}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemove(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                testID={`btn-remove-${itemIndex}`}
              >
                <Trash2 size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  cartItemAnimated: {
    marginBottom: spacing.sm,
  },
  cartItem: {
    marginBottom: 0,
  },
  cartItemInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    marginRight: spacing.md,
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  vegBadge: {
    position: "absolute",
    top: -4,
    left: -4,
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  itemVariant: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  itemPrice: {
    ...typography.body,
    color: colors.accent,
    fontWeight: "600",
  },
  itemActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 80,
  },
  removeButton: {
    padding: spacing.xs,
    marginTop: spacing.xs,
  },
});