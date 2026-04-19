// Premium Restaurant Card - Liquid Glass Design
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Star, MapPin, Clock } from "lucide-react-native";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { formatCurrency } from "@/utils/formatters";
import type { Restaurant } from "@/types/api";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = React.memo(({
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

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: restaurant.is_open ? colors.success : colors.error }]} />
            <Text style={styles.statusText}>{restaurant.is_open ? "Open" : "Closed"}</Text>
          </View>

          {/* Delivery Info */}
          <View style={styles.deliveryBadge}>
            <Clock size={11} color={colors.textPrimary} />
            <Text style={styles.deliveryTimeText}>
              {restaurant.delivery_fee ? `₹${restaurant.delivery_fee}` : '₹40'} delivery
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
            {restaurant.rating > 0 && (
              <View style={styles.ratingBadge}>
                <Star size={10} color={colors.accent} fill={colors.accent} />
                <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>

          {restaurant.cuisine_type && (
            <View style={styles.cuisineRow}>
              <MapPin size={12} color={colors.textTertiary} />
              <Text style={styles.cuisine}>{restaurant.cuisine_type}</Text>
            </View>
          )}

          <Text style={styles.address} numberOfLines={1}>
            {restaurant.address_line}{restaurant.city && `, ${restaurant.city}`}
          </Text>

          {restaurant.delivery_fee > 0 && (
            <Text style={styles.deliveryFeeText}>
              {formatCurrency(restaurant.delivery_fee)} delivery
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadows.sm,
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
    backgroundColor: colors.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: "bold",
    color: colors.primary,
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(0,0,0,0.25)",
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
    ...shadows.sm,
  },
  deliveryTimeText: {
    ...typography.small,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  content: {
    padding: spacing.md,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: "700",
    flex: 1,
    marginRight: spacing.sm,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  ratingText: {
    ...typography.small,
    color: colors.white,
    fontWeight: "700",
  },
  cuisineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: spacing.xs,
  },
  cuisine: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  address: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  deliveryFeeText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
  },
});