// Premium Restaurant Detail Screen - Glassmorphism Dark Theme
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MenuItemCard } from "@/components/restaurant/MenuItemCard";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { restaurantApi } from "@/services/api/endpoints";
import { useCartStore } from "@/store";
import { formatCurrency } from "@/utils/formatters";
import type { Restaurant, MenuItem, MenuCategory } from "@/types/api";
import { useToast } from "@/components/ui/Toast";

const HEADER_HEIGHT = 250;

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addItem, getItemCount, getSubtotal } = useCartStore();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

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
            name: categoryId === "uncategorized" ? "Other" : categoryId,
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
    const currentRestaurantId = useCartStore.getState().restaurantId;
    if (currentRestaurantId && currentRestaurantId !== id) {
      Alert.alert(
        "Different Restaurant",
        "Your cart contains items from another restaurant. Would you like to clear it and add this item?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear & Add",
            onPress: () => {
              useCartStore.setState({ items: [], restaurantId: id, restaurantName: restaurant?.name || '' });
              addItem({
                id: item.id,
                name: item.name,
                price: item.price,
                image_url: item.image_url,
                is_veg: item.is_veg,
              });
              showToast(`${item.name} added to cart`, "success");
            },
          },
        ]
      );
      return;
    }

    if (currentRestaurantId !== id) {
      useCartStore.setState({
        restaurantId: id,
        restaurantName: restaurant?.name || '',
      });
    }

    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      is_veg: item.is_veg,
    });
    showToast(`${item.name} added to cart`, "success");
  };

  const handleShare = async () => {
    showToast("Share link copied!", "success");
  };

  if (loading || !restaurant) {
    return <LoadingSpinner fullScreen text="Loading restaurant..." />;
  }

  const itemCount = getItemCount();
  const subtotal = getSubtotal();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Image */}
        <View style={styles.headerContainer}>
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

          {/* Gradient Overlay - Three layered views for gradient effect */}
          <View style={styles.gradientOverlay}>
            <View style={styles.gradientTop} />
            <View style={styles.gradientMiddle} />
            <View style={styles.gradientBottom} />
          </View>

          {/* Top Navigation */}
          <SafeAreaView style={styles.topNav} edges={["top"]}>
            {/* Back Button - Glass Circle */}
            <TouchableOpacity
              style={styles.glassButton}
              onPress={() => router.back()}
            >
              <Text style={styles.glassButtonText}>←</Text>
            </TouchableOpacity>

            {/* Share & Favorite Buttons */}
            <View style={styles.topNavRight}>
              <TouchableOpacity
                style={styles.glassButton}
                onPress={handleShare}
              >
                <Text style={styles.glassButtonText}>↗</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.glassButton, isFavorite && styles.favoriteActive]}
                onPress={() => setIsFavorite(!isFavorite)}
              >
                <Text style={styles.glassButtonText}>{isFavorite ? "♥" : "♡"}</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Restaurant Info Card - Overlapping Header */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.infoTitleSection}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <Text style={styles.cuisineType}>
                {restaurant.cuisine_type || "Food"}
              </Text>
            </View>
            <Badge
              text={restaurant.is_open ? "Open" : "Closed"}
              variant={restaurant.is_open ? "success" : "error"}
            />
          </View>

          <View style={styles.addressRow}>
            <Text style={styles.addressIcon}>📍</Text>
            <Text style={styles.addressText} numberOfLines={1}>
              {restaurant.address_line}, {restaurant.city}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <Text style={styles.statIcon}>⭐</Text>
                <Text style={styles.statValue}>
                  {restaurant.rating.toFixed(1)}
                </Text>
              </View>
              <Text style={styles.statLabel}>
                {restaurant.review_count}+ ratings
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>⏱ 30-40 min</Text>
              <Text style={styles.statLabel}>Delivery</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatCurrency(restaurant.delivery_fee)}
              </Text>
              <Text style={styles.statLabel}>Delivery Fee</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
          {menu.map((category) => (
            <View key={category.id} style={styles.menuSection}>
              {/* Category Header */}
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{category.name}</Text>
                <Text style={styles.categoryCount}>
                  {category.items?.length || 0} items
                </Text>
              </View>

              {/* Menu Items */}
              {category.items?.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onAddToCart={() => handleAddToCart(item)}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Cart Footer */}
      {itemCount > 0 && (
        <View style={[styles.cartFooter, { paddingBottom: insets.bottom > 0 ? insets.bottom + spacing.md : spacing.md }]}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartCount}>{itemCount} item{itemCount > 1 ? "s" : ""}</Text>
            <Text style={styles.cartSubtotal}>{formatCurrency(subtotal)}</Text>
          </View>
          <TouchableOpacity
            style={styles.viewCartButton}
            onPress={() => router.push("/(tabs)/cart")}
          >
            <Text style={styles.viewCartButtonText}>View Cart</Text>
            <Text style={styles.viewCartArrow}>→</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerContainer: {
    height: HEADER_HEIGHT,
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
    fontSize: 80,
    fontWeight: "bold",
    color: colors.white,
    opacity: 0.9,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientTop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0)",
  },
  gradientMiddle: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  gradientBottom: {
    flex: 2,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  topNav: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  glassButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(10px)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
  favoriteActive: {
    backgroundColor: "rgba(239, 68, 68, 0.4)",
    borderColor: colors.error,
  },
  glassButtonText: {
    fontSize: 20,
    color: colors.white,
    fontWeight: "600",
  },
  topNavRight: {
    flexDirection: "row",
  },
  infoCard: {
    marginHorizontal: spacing.md,
    marginTop: -60,
    padding: spacing.lg,
    backgroundColor: "rgba(28, 28, 34, 0.85)",
    backdropFilter: "blur(20px)",
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    ...shadows.glass,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  infoTitleSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  restaurantName: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  cuisineType: {
    ...typography.body,
    color: colors.textSecondary,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  addressIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  addressText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    fontSize: 14,
    marginRight: spacing.xs / 2,
  },
  statValue: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 14,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: colors.border,
  },
  menuContainer: {
    paddingTop: spacing.lg,
  },
  menuSection: {
    marginBottom: spacing.lg,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  categoryTitle: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: "700",
  },
  categoryCount: {
    ...typography.caption,
    color: colors.textTertiary,
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  cartFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: "rgba(28, 28, 34, 0.95)",
    backdropFilter: "blur(20px)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    ...shadows.glass,
  },
  cartInfo: {
    flex: 1,
  },
  cartCount: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 15,
  },
  cartSubtotal: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  viewCartButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.glow,
  },
  viewCartButtonText: {
    ...typography.button,
    color: colors.white,
    marginRight: spacing.sm,
  },
  viewCartArrow: {
    fontSize: 18,
    color: colors.white,
    fontWeight: "bold",
  },
});
