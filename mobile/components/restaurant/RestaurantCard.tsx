import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { colors, typography, spacing, borderRadius } from "@/theme";
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
    <Card onPress={onPress} style={styles.card} padding="sm">
      <View style={styles.imageContainer}>
        {restaurant.cover_image_url ? (
          <Image
            source={{ uri: restaurant.cover_image_url }}
            style={styles.coverImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>
              {restaurant.name.charAt(0)}
            </Text>
          </View>
        )}
        {!restaurant.is_open && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>Currently Closed</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>
          {restaurant.cuisine_type && (
            <Badge
              text={restaurant.cuisine_type}
              variant="gray"
              size="sm"
            />
          )}
        </View>

        <Text style={styles.address} numberOfLines={1}>
          {restaurant.address_line}, {restaurant.city}
        </Text>

        <View style={styles.footer}>
          <View style={styles.rating}>
            <Text style={styles.ratingIcon}>⭐</Text>
            <Text style={styles.ratingText}>
              {restaurant.rating.toFixed(1)}
            </Text>
            <Text style={styles.reviewCount}>
              ({restaurant.review_count})
            </Text>
          </View>

          <View style={styles.delivery}>
            <Text style={styles.deliveryFee}>
              {formatCurrency(restaurant.delivery_fee)}
            </Text>
            <Text style={styles.deliveryLabel}> delivery</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  imageContainer: {
    height: 150,
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: "bold",
    color: colors.white,
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  closedText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
  content: {
    padding: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.h4,
    flex: 1,
    marginRight: spacing.sm,
  },
  address: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingIcon: {
    fontSize: 14,
    marginRight: spacing.xs / 2,
  },
  ratingText: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  reviewCount: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs / 2,
  },
  delivery: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryFee: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  deliveryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
