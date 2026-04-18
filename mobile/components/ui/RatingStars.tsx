import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, typography, spacing } from "@/theme";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  style?: ViewStyle;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = "md",
  showValue = true,
  style,
}) => {
  const sizes = {
    sm: { star: 12, text: 11 },
    md: { star: 14, text: 13 },
    lg: { star: 16, text: 15 },
  };

  const s = sizes[size];

  const renderStar = (index: number) => {
    const filled = rating >= index + 1;
    const halfFilled = rating >= index + 0.5;

    return (
      <Text
        key={index}
        style={[
          styles.star,
          { fontSize: s.star },
          filled || halfFilled ? styles.starFilled : styles.starEmpty,
        ]}
      >
        ★
      </Text>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.stars}>
        {[0, 1, 2, 3, 4].map(renderStar)}
      </View>
      {showValue && (
        <Text style={[styles.value, { fontSize: s.text }]}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

interface RatingBadgeProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  reviewCount,
  size = "md",
  style,
}) => {
  const sizes = {
    sm: { height: 22, paddingH: 6, text: 11 },
    md: { height: 26, paddingH: 8, text: 12 },
    lg: { height: 30, paddingH: 10, text: 14 },
  };

  const s = sizes[size];

  return (
    <View style={[styles.badge, { height: s.height, paddingHorizontal: s.paddingH }, style]}>
      <Text style={[styles.badgeStar, { fontSize: s.text - 1 }]}>★</Text>
      <Text style={[styles.badgeText, { fontSize: s.text }]}>{rating.toFixed(1)}</Text>
      {reviewCount !== undefined && (
        <Text style={[styles.badgeReviews, { fontSize: s.text - 1 }]}>
          {reviewCount}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  stars: {
    flexDirection: "row",
    marginRight: spacing.xs,
  },
  star: {
    marginRight: 1,
  },
  starFilled: {
    color: colors.warning,
  },
  starEmpty: {
    color: colors.textTertiary,
  },
  value: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warningBg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  badgeStar: {
    color: colors.warning,
    marginRight: 2,
  },
  badgeText: {
    ...typography.small,
    fontWeight: "600",
    color: colors.warning,
  },
  badgeReviews: {
    ...typography.small,
    color: colors.textSecondary,
    marginLeft: 4,
  },
});
