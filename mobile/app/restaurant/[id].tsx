// Premium Restaurant Detail - Swiggy/Zomato Style
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MenuItemCard } from "@/components/restaurant/MenuItemCard";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  ArrowLeft,
  Share2,
  Heart,
  MapPin,
  Star,
  Clock,
  Truck,
  Flame,
} from "lucide-react-native";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { restaurantApi } from "@/services/api/endpoints";
import { useCartStore } from "@/store";
import { formatCurrency } from "@/utils/formatters";
import type { Restaurant, MenuItem, MenuCategory } from "@/types/api";
import { useToast } from "@/components/ui/Toast";

const HEADER_HEIGHT = 280;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const { addItem, getItemCount, getSubtotal } = useCartStore();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const scrollY = useRef(new Animated.Value(0)).current;
  const categoryRefs = useRef<Map<string, View>>(new Map());
  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [HEADER_HEIGHT - 100, HEADER_HEIGHT],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const listener = stickyHeaderOpacity.addListener(({ value }) => {
      setStickyVisible(value > 0.5);
    });
    return () => stickyHeaderOpacity.removeListener(listener);
  }, [stickyHeaderOpacity]);

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

      const categoriesMap = new Map<string, MenuCategory>();
      for (const item of menuResponse.data) {
        const categoryId = item.category_id || "uncategorized";
        if (!categoriesMap.has(categoryId)) {
          categoriesMap.set(categoryId, {
            id: categoryId,
            restaurant_id: id!,
            name: categoryId === "uncategorized" ? "Other" : categoryId,
            display_order: 0,
            is_active: true as any,
            items: [],
          });
        }
        categoriesMap.get(categoryId)!.items!.push(item);
      }

      const menuArray = Array.from(categoriesMap.values());
      setMenu(menuArray);
      if (menuArray.length > 0) {
        setActiveCategory(menuArray[0].id);
      }
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
        "Your cart has items from another restaurant. Clear it and add this item?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear & Add",
            onPress: () => {
              useCartStore.setState({
                items: [],
                restaurantId: id,
                restaurantName: restaurant?.name || "",
              });
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
        restaurantName: restaurant?.name || "",
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

  const handleCategoryPress = (categoryId: string) => {
    setActiveCategory(categoryId);
    const ref = categoryRefs.current.get(categoryId);
    if (ref) {
      ref.measure((_x, _y, _w, _h, _px, py) => {
        // Scroll to approximate position
      });
    }
  };

  if (loading || !restaurant) {
    return <LoadingSpinner fullScreen text="Loading restaurant..." />;
  }

  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const deliveryTime = restaurant.estimated_delivery_time || "30-40 min";

  const parallaxHeaderStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [-100, 0, HEADER_HEIGHT],
          outputRange: [30, 0, -HEADER_HEIGHT / 2],
          extrapolate: "clamp",
        }),
      },
      {
        scale: scrollY.interpolate({
          inputRange: [-100, 0],
          outputRange: [1.3, 1],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Parallax Hero Image */}
      <Animated.View style={[styles.headerImageContainer, parallaxHeaderStyle]}>
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
        <View style={styles.heroGradient} />
      </Animated.View>

      {/* Sticky Navigation Bar */}
      <Animated.View
        style={[
          styles.stickyNav,
          {
            paddingTop: insets.top,
            opacity: stickyHeaderOpacity,
          },
        ]}
        pointerEvents={stickyVisible ? "auto" : "none"}
      >
        <View style={styles.stickyNavContent}>
          <TouchableOpacity
            style={styles.stickyBackButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.stickyNavTitle} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <View style={styles.stickyNavRight}>
            <TouchableOpacity style={styles.stickyIconBtn} onPress={handleShare}>
              <Share2 size={20} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stickyIconBtn}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Heart
                size={20}
                color={isFavorite ? colors.error : colors.white}
                fill={isFavorite ? colors.error : "transparent"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Top Navigation (fades out) */}
      <SafeAreaView style={styles.topNav} edges={["top"]}>
        <TouchableOpacity
          style={styles.topNavButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.topNavRight}>
          <TouchableOpacity style={styles.topNavButton} onPress={handleShare}>
            <Share2 size={22} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topNavButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Heart
              size={22}
              color={isFavorite ? colors.error : colors.white}
              fill={isFavorite ? colors.error : "transparent"}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Spacer for parallax */}
        <View style={styles.headerSpacer} />

        {/* Restaurant Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.infoTitleSection}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <Text style={styles.cuisineType}>
                {restaurant.cuisine_type || "Andhra Cuisine"}
              </Text>
            </View>
            <Badge
              text={restaurant.is_open ? "Open" : "Closed"}
              variant={restaurant.is_open ? "success" : "error"}
            />
          </View>

          <View style={styles.addressRow}>
            <MapPin size={14} color={colors.textTertiary} />
            <Text style={styles.addressText} numberOfLines={1}>
              {restaurant.address_line1}, {restaurant.city}
            </Text>
          </View>

          {/* Offer Banner */}
          {restaurant.promo_text && (
            <View style={styles.offerBanner}>
              <Flame size={14} color={colors.accent} />
              <Text style={styles.offerText}>{restaurant.promo_text}</Text>
            </View>
          )}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <Star size={13} color={colors.accent} fill={colors.accent} />
                <Text style={styles.statValue}>
                  {restaurant.rating?.toFixed(1) || "4.0"}
                </Text>
              </View>
              <Text style={styles.statLabel}>
                {restaurant.review_count || "100"}+ ratings
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                <Clock size={13} color={colors.white} /> {deliveryTime}
              </Text>
              <Text style={styles.statLabel}>Delivery</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                <Truck size={13} color={colors.white} />{" "}
                {formatCurrency(restaurant.delivery_fee || 40)}
              </Text>
              <Text style={styles.statLabel}>Delivery Fee</Text>
            </View>
          </View>
        </View>

        {/* Category Pills */}
        <View style={styles.categoryPillsContainer}>
          <ScrollableCategoryPills
            categories={menu}
            activeCategory={activeCategory}
            onCategoryPress={handleCategoryPress}
          />
        </View>

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
          {menu.map((category) => (
            <View
              key={category.id}
              ref={(ref) => {
                if (ref) categoryRefs.current.set(category.id, ref);
              }}
              style={styles.menuSection}
            >
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{category.name}</Text>
                <Text style={styles.categoryCount}>
                  {category.items?.length || 0} items
                </Text>
              </View>

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
      </Animated.ScrollView>

      {/* Sticky Cart Footer */}
      {itemCount > 0 && (
        <View
          style={[
            styles.cartFooter,
            {
              paddingBottom:
                insets.bottom > 0 ? insets.bottom + spacing.md : spacing.md,
            },
          ]}
        >
          <View style={styles.cartInfo}>
            <Text style={styles.cartCount}>
              {itemCount} item{itemCount > 1 ? "s" : ""}
            </Text>
            <Text style={styles.cartSubtotal}>
              {formatCurrency(subtotal)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.viewCartButton}
            onPress={() => router.push("/(tabs)/cart")}
          >
            <Text style={styles.viewCartButtonText}>View Cart</Text>
            <View style={styles.viewCartArrow}>
              <Text style={styles.viewCartArrowText}>→</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

interface ScrollableCategoryPillsProps {
  categories: MenuCategory[];
  activeCategory: string;
  onCategoryPress: (id: string) => void;
}

function ScrollableCategoryPills({
  categories,
  activeCategory,
  onCategoryPress,
}: ScrollableCategoryPillsProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const index = categories.findIndex((c) => c.id === activeCategory);
    if (index >= 0 && scrollRef.current) {
      scrollRef.current.scrollTo({
        x: index * 120,
        animated: true,
      });
    }
  }, [activeCategory]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryPillsScroll}
    >
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.categoryPill,
            activeCategory === cat.id && styles.categoryPillActive,
          ]}
          onPress={() => onCategoryPress(cat.id)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.categoryPillText,
              activeCategory === cat.id && styles.categoryPillTextActive,
            ]}
            numberOfLines={1}
          >
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerImageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 0,
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
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
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
    zIndex: 10,
  },
  topNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  topNavRight: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  stickyNav: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9,
    backgroundColor: colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stickyNavContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  stickyBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  stickyNavTitle: {
    flex: 1,
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 16,
  },
  stickyNavRight: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  stickyIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerSpacer: {
    height: HEADER_HEIGHT,
  },
  infoCard: {
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
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
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cuisineType: {
    ...typography.body,
    color: colors.textSecondary,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  addressText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    flex: 1,
  },
  offerBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accentGlow,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  offerText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: "600",
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
    gap: 3,
  },
  statValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
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
  categoryPillsContainer: {
    marginTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryPillsScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  categoryPillTextActive: {
    color: colors.white,
    fontWeight: "700",
  },
  menuContainer: {
    paddingTop: spacing.sm,
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
    color: colors.textPrimary,
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
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
    ...shadows.coral,
  },
  viewCartButtonText: {
    ...typography.button,
    color: colors.white,
    marginRight: spacing.sm,
  },
  viewCartArrow: {},
  viewCartArrowText: {
    fontSize: 18,
    color: colors.white,
    fontWeight: "bold",
  },
});
