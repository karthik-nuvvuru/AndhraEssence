import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuItemCard } from "@/components/restaurant/MenuItemCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { colors, typography, spacing, borderRadius } from "@/theme";
import { restaurantApi } from "@/services/api/endpoints";
import { useCartStore } from "@/store";
import { formatCurrency } from "@/utils/formatters";
import type { Restaurant, MenuItem, MenuCategory } from "@/types/api";

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, getItemCount } = useCartStore();

  useEffect(() => {
    fetchRestaurantData();
  }, [id]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const [restaurantResponse, menuResponse] = await Promise.all([
        restaurantApi.getById(id!),
        restaurantApi.getMenu(id!),
      ]);

      setRestaurant(restaurantResponse.data);

      // Group menu items by category
      const categoriesMap = new Map<string, MenuCategory>();
      for (const item of menuResponse.data) {
        const categoryId = item.category_id || "uncategorized";
        if (!categoriesMap.has(categoryId)) {
          categoriesMap.set(categoryId, {
            id: categoryId,
            restaurant_id: id!,
            name: categoryId === "uncategorized" ? "Other" : "Category",
            sort_order: 0,
            is_active: true,
            items: [],
          });
        }
        categoriesMap.get(categoryId)!.items!.push(item);
      }

      setMenu(Array.from(categoriesMap.values()));
    } catch (error) {
      console.error("Failed to fetch restaurant:", error);
      Alert.alert("Error", "Failed to load restaurant details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      is_veg: item.is_veg,
    });
    Alert.alert("Added to cart", item.name);
  };

  if (loading || !restaurant) {
    return <LoadingSpinner fullScreen text="Loading restaurant..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView>
        {/* Header Image */}
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Restaurant Info */}
        <View style={styles.infoSection}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>{restaurant.name}</Text>
            {restaurant.is_open ? (
              <Badge text="Open" variant="success" />
            ) : (
              <Badge text="Closed" variant="error" />
            )}
          </View>

          <Text style={styles.cuisine}>
            {restaurant.cuisine_type || "Food"}
          </Text>

          <Text style={styles.address}>
            {restaurant.address_line}, {restaurant.city}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>⭐ {restaurant.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>{restaurant.review_count} reviews</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {formatCurrency(restaurant.delivery_fee)}
              </Text>
              <Text style={styles.statLabel}>Delivery</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {restaurant.minimum_order > 0
                  ? formatCurrency(restaurant.minimum_order)
                  : "None"}
              </Text>
              <Text style={styles.statLabel}>Min. Order</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {menu.map((category) => (
          <View key={category.id} style={styles.menuSection}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            {category.items?.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onAddToCart={() => handleAddToCart(item)}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Cart Footer */}
      {getItemCount() > 0 && (
        <View style={styles.cartFooter}>
          <Button
            title={`View Cart (${getItemCount()} items)`}
            onPress={() => router.push("/(tabs)/cart")}
            fullWidth
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageContainer: {
    height: 250,
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
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 72,
    fontWeight: "bold",
    color: colors.white,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  infoSection: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
    flex: 1,
  },
  cuisine: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  address: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  menuSection: {
    paddingTop: spacing.md,
  },
  categoryTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  cartFooter: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
});
