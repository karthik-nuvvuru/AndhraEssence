// Premium Restaurant Card - Liquid Glass Design
import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageErrorEventData, NativeSyntheticEvent } from "react-native";
import { Star, MapPin, Clock } from "lucide-react-native";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { formatCurrency } from "@/utils/formatters";
import type { Restaurant } from "@/types/api";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
}

// Fallback placeholder data - vibrant colors that look good as food placeholders
const FALLBACK_IMAGE_COLORS = [
  "#8B5CF6", // violet
  "#10B981", // emerald
  "#EF4444", // red
  "#3B82F6", // blue
  "#F59E0B", // amber
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
];

function getFallbackColor(name: string): string {
  if (!name) return FALLBACK_IMAGE_COLORS[0];
  const charCode = name.charCodeAt(0);
  return FALLBACK_IMAGE_COLORS[charCode % FALLBACK_IMAGE_COLORS.length];
}

function getInitials(name: string): string {
  if (!name) return "?";
  // Get first letter only for cleaner fallback
  return name.charAt(0).toUpperCase();
}

export const RestaurantCard: React.FC<RestaurantCardProps> = React.memo(({
  restaurant,
  onPress,
}) => {
  const [imageError, setImageError] = useState(false);
  const [_imageLoading, setImageLoading] = useState(true);

  // Null guards for all props
  const restaurantName = restaurant?.name ?? "Restaurant";
  const cuisineType = restaurant?.cuisine_type ?? "Indian";
  const addressLine1 = restaurant?.address_line1 ?? restaurant?.address ?? "";
  const city = restaurant?.city ?? "Hyderabad";
  const rating = typeof restaurant?.rating === "number" ? restaurant.rating : 0;
  const deliveryFee = typeof restaurant?.delivery_fee === "number" ? restaurant.delivery_fee : 40;
  const isOpen = restaurant?.is_open === true;
  const coverImageUrl = restaurant?.cover_image_url || restaurant?.image_url;

  const handleImageError = (e: NativeSyntheticEvent<ImageErrorEventData>) => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Determine what to show in the image area
  // Only show placeholder if no URL or image errored (not while loading)
  const showPlaceholder = !coverImageUrl || imageError;
  const placeholderColor = getFallbackColor(restaurantName);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.wrapper}>
      <View style={styles.card}>
        {/* Image section with gradient overlay */}
        <View style={styles.imageContainer}>
          {showPlaceholder ? (
            // Placeholder with initials
            <View style={[styles.placeholderImage, { backgroundColor: placeholderColor }]}>
              <Text style={styles.placeholderText}>{getInitials(restaurantName)}</Text>
            </View>
          ) : (
            <Image
              source={{ uri: coverImageUrl }}
              style={styles.coverImage}
              onError={handleImageError}
              onLoad={handleImageLoad}
              resizeMode="cover"
            />
          )}
          <View style={styles.gradientOverlay} />

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: isOpen ? colors.success : colors.error }]} />
            <Text style={styles.statusText}>{isOpen ? "Open" : "Closed"}</Text>
          </View>

          {/* Delivery Info */}
          <View style={styles.deliveryBadge}>
            <Clock size={11} color={colors.textPrimary} />
            <Text style={styles.deliveryTimeText}>
              ₹{deliveryFee} delivery
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{restaurantName}</Text>
            {rating > 0 && (
              <View style={styles.ratingBadge}>
                <Star size={10} color={colors.accent} />
                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              </View>
            )}
          </View>

          {cuisineType && (
            <View style={styles.cuisineRow}>
              <MapPin size={12} color={colors.textTertiary} />
              <Text style={styles.cuisine} numberOfLines={1}>{cuisineType}</Text>
            </View>
          )}

          <Text style={styles.address} numberOfLines={1}>
            {addressLine1}{addressLine1 && city ? `, ${city}` : city}
          </Text>

          {deliveryFee > 0 && (
            <Text style={styles.deliveryFeeText}>
              {formatCurrency(deliveryFee)} delivery
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
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.9)",
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
    flex: 1,
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
