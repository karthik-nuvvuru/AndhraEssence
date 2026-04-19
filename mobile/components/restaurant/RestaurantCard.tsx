import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { formatCurrency } from "@/utils/formatters";
import type { Restaurant } from "@/types/api";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.wrapper}>
      <View style={styles.card}>
        {/* Image section with gradient overlay */}
        <View style={styles.imageContainer}>
          {restaurant.cover_image_url ? (
            <Image source={{ uri: restaurant.cover_image_url }} style={styles.coverImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>{restaurant.name.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.gradientOverlay} />

          {/* Status Badge - Top Left */}
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: restaurant.is_open ? colors.success : colors.error }]} />
            <Text style={styles.statusText}>{restaurant.is_open ? "Open" : "Closed"}</Text>
          </View>

          {/* Delivery Time - Bottom Right */}
          <View style={styles.deliveryBadge}>
            <Text style={styles.deliveryTimeText}>🕐 {restaurant.delivery_fee ? `₹${restaurant.delivery_fee}` : '₹40'} delivery</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>

          {restaurant.cuisine_type && (
            <Text style={styles.cuisine}>🍴 {restaurant.cuisine_type}</Text>
          )}

          <Text style={styles.address} numberOfLines={1}>
            {restaurant.address_line}{restaurant.city && `, ${restaurant.city}`}
          </Text>

          <View style={styles.footer}>
            {/* Rating Badge */}
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
            </View>

            {/* Delivery Fee */}
            <Text style={styles.deliveryFee}>{formatCurrency(restaurant.delivery_fee)} delivery</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.glass,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: "hidden",
    ...shadows.glass,
  },
  imageContainer: {
    height: 200,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: "bold",
    color: colors.white,
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  statusBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    ...typography.small,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  deliveryBadge: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  deliveryTimeText: {
    ...typography.small,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  content: {
    padding: spacing.md,
    backgroundColor: colors.backgroundCard,
  },
  name: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  cuisine: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  address: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  ratingIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  ratingText: {
    ...typography.small,
    color: colors.white,
    fontWeight: "700",
  },
  deliveryFee: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: "600",
  },
});