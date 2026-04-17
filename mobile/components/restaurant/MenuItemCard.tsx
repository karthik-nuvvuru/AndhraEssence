import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Badge } from "@/components/ui/Badge";
import { colors, typography, spacing, borderRadius } from "@/theme";
import { formatCurrency } from "@/utils/formatters";
import type { MenuItem } from "@/types/api";

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: () => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onAddToCart,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.details}>
          <View style={styles.header}>
            <View style={styles.vegIndicator}>
              <View style={[styles.vegBox, item.is_veg ? styles.veg : styles.nonVeg]}>
                <View style={item.is_veg ? styles.vegDot : styles.nonVegDot} />
              </View>
            </View>
            <Text style={styles.name}>{item.name}</Text>
          </View>

          {item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.footer}>
            <Text style={styles.price}>{formatCurrency(item.price)}</Text>
            {item.is_featured && (
              <Badge text="Featured" variant="warning" size="sm" />
            )}
          </View>
        </View>

        {item.image_url && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image_url }} style={styles.image} />
            <TouchableOpacity style={styles.addButton} onPress={onAddToCart}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        )}

        {!item.image_url && item.is_available && (
          <TouchableOpacity style={styles.addButtonLarge} onPress={onAddToCart}>
            <Text style={styles.addButtonTextLarge}>ADD</Text>
          </TouchableOpacity>
        )}

        {!item.is_available && (
          <View style={styles.unavailable}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  content: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
  },
  details: {
    flex: 1,
    paddingRight: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  vegIndicator: {
    marginRight: spacing.xs,
  },
  vegBox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  veg: {
    borderColor: colors.success,
  },
  nonVeg: {
    borderColor: colors.error,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  nonVegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  name: {
    ...typography.body,
    fontWeight: "600",
    flex: 1,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  price: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  addButton: {
    position: "absolute",
    bottom: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  addButtonLarge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: spacing.xs,
  },
  addButtonTextLarge: {
    color: colors.primary,
    ...typography.bodySmall,
    fontWeight: "600",
  },
  unavailable: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray200,
  },
  unavailableText: {
    color: colors.textLight,
    ...typography.caption,
  },
});
