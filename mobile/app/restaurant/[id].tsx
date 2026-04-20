// Premium Restaurant Detail - World-Class Food Delivery
import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Alert, Dimensions, Animated, Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MenuItemCard } from "@/components/restaurant/MenuItemCard";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ArrowLeft, Share2, Heart, MapPin, Star, Clock, Truck, Flame, ChevronRight } from "lucide-react-native";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { restaurantApi } from "@/services/api/endpoints";
import { useCartStore } from "@/store";
import { formatCurrency } from "@/utils/formatters";
import type { MenuItem, MenuCategory } from "@/types/api";
import * as Haptics from "expo-haptics";
import { useToast } from "@/components/ui/Toast";

const HEADER_HEIGHT = 280;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MOCK_MENU: MenuCategory[] = [
  { id: "popular", name: "Popular", restaurant_id: "mock-1", display_order: 0, items: [
    { id: "p1", name: "Hyderabadi Dum Biryani", description: "Signature dish with aromatic rice and tender meat, slow-cooked in dum", price: 299, is_veg: false, is_bestseller: true, image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500", category_id: "popular", restaurant_id: "mock-1", is_available: true, prep_time: 35, category: "Popular", created_at: new Date().toISOString() },
    { id: "p2", name: "Chicken 65", description: "Crispy fried chicken with South Indian spices", price: 199, is_veg: false, is_bestseller: true, image_url: "https://images.unsplash.com/photo-1610057099431-df0568f70950?w=500", category_id: "popular", restaurant_id: "mock-1", is_available: true, prep_time: 20, category: "Popular", created_at: new Date().toISOString() },
    { id: "p3", name: "Paneer Tikka", description: "Grilled cottage cheese with bell peppers", price: 249, is_veg: true, is_bestseller: false, image_url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500", category_id: "popular", restaurant_id: "mock-1", is_available: true, prep_time: 25, category: "Popular", created_at: new Date().toISOString() },
  ]},
  { id: "starters", name: "Starters", restaurant_id: "mock-1", display_order: 1, items: [
    { id: "s1", name: "Chicken Fried Rice", description: "Wok-tossed rice with chicken and vegetables", price: 179, is_veg: false, is_bestseller: false, image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500", category_id: "starters", restaurant_id: "mock-1", is_available: true, prep_time: 20, category: "Starters", created_at: new Date().toISOString() },
    { id: "s2", name: "Veg Spring Rolls", description: "Crispy rolls stuffed with vegetables", price: 129, is_veg: true, is_bestseller: false, image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500", category_id: "starters", restaurant_id: "mock-1", is_available: true, prep_time: 15, category: "Starters", created_at: new Date().toISOString() },
    { id: "s3", name: "Chicken Lollipop", description: "Drumettes marinated in spices, fried crisp", price: 219, is_veg: false, is_bestseller: false, image_url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500", category_id: "starters", restaurant_id: "mock-1", is_available: true, prep_time: 20, category: "Starters", created_at: new Date().toISOString() },
  ]},
  { id: "main-course", name: "Main Course", restaurant_id: "mock-1", display_order: 2, items: [
    { id: "m1", name: "Andhra Chicken Curry", description: "Spicy chicken curry with traditional Andhra spices", price: 249, is_veg: false, is_bestseller: true, image_url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500", category_id: "main-course", restaurant_id: "mock-1", is_available: true, prep_time: 30, category: "Main Course", created_at: new Date().toISOString() },
    { id: "m2", name: "Dal Tadka", description: "Yellow dal tempered with cumin and garlic", price: 149, is_veg: true, is_bestseller: false, image_url: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=500", category_id: "main-course", restaurant_id: "mock-1", is_available: true, prep_time: 20, category: "Main Course", created_at: new Date().toISOString() },
    { id: "m3", name: "Mutton Curry", description: "Slow-cooked mutton in rich spicy gravy", price: 329, is_veg: false, is_bestseller: false, image_url: "https://images.unsplash.com/photo-1545247181-516773cae754?w=500", category_id: "main-course", restaurant_id: "mock-1", is_available: true, prep_time: 40, category: "Main Course", created_at: new Date().toISOString() },
    { id: "m4", name: "Butter Naan (2 pcs)", description: "Soft leavened bread brushed with butter", price: 69, is_veg: true, is_bestseller: false, image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500", category_id: "main-course", restaurant_id: "mock-1", is_available: true, prep_time: 10, category: "Main Course", created_at: new Date().toISOString() },
  ]},
  { id: "biryani", name: "Biryani", restaurant_id: "mock-1", display_order: 3, items: [
    { id: "b1", name: "Chicken Biryani", description: "Fragrant rice layered with spiced chicken and saffron", price: 259, is_veg: false, is_bestseller: true, image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500", category_id: "biryani", restaurant_id: "mock-1", is_available: true, prep_time: 35, category: "Biryani", created_at: new Date().toISOString() },
    { id: "b2", name: "Veg Biryani", description: "Aromatic rice with mixed vegetables and spices", price: 199, is_veg: true, is_bestseller: false, image_url: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=500", category_id: "biryani", restaurant_id: "mock-1", is_available: true, prep_time: 30, category: "Biryani", created_at: new Date().toISOString() },
    { id: "b3", name: "Mutton Biryani", description: "Premium mutton biryani with long-grain basmati", price: 379, is_veg: false, is_bestseller: false, image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500", category_id: "biryani", restaurant_id: "mock-1", is_available: true, prep_time: 40, category: "Biryani", created_at: new Date().toISOString() },
  ]},
  { id: "desserts", name: "Desserts", restaurant_id: "mock-1", display_order: 4, items: [
    { id: "d1", name: "Kheer", description: "Traditional rice pudding with cardamom", price: 89, is_veg: true, is_bestseller: false, image_url: "https://images.unsplash.com/photo-1571167530149-c1105da4c1c7?w=500", category_id: "desserts", restaurant_id: "mock-1", is_available: true, prep_time: 10, category: "Desserts", created_at: new Date().toISOString() },
    { id: "d2", name: "Gulab Jamun", description: "Deep-fried milk balls in sugar syrup", price: 79, is_veg: true, is_bestseller: false, image_url: "https://images.unsplash.com/photo-166619007778877-3d3d5c46c8c8?w=500", category_id: "desserts", restaurant_id: "mock-1", is_available: true, prep_time: 10, category: "Desserts", created_at: new Date().toISOString() },
  ]},
  { id: "beverages", name: "Beverages", restaurant_id: "mock-1", display_order: 5, items: [
    { id: "bv1", name: "Sweet Lassi", description: "Chilled yogurt drink with sugar and cardamom", price: 79, is_veg: true, is_bestseller: false, image_url: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=500", category_id: "beverages", restaurant_id: "mock-1", is_available: true, prep_time: 5, category: "Beverages", created_at: new Date().toISOString() },
    { id: "bv2", name: "Mango Lassi", description: "Creamy mango yogurt smoothie", price: 99, is_veg: true, is_bestseller: false, image_url: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=500", category_id: "beverages", restaurant_id: "mock-1", is_available: true, prep_time: 5, category: "Beverages", created_at: new Date().toISOString() },
    { id: "bv3", name: "Masala Chai", description: "Traditional spiced Indian tea", price: 49, is_veg: true, is_bestseller: false, image_url: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=500", category_id: "beverages", restaurant_id: "mock-1", is_available: true, prep_time: 5, category: "Beverages", created_at: new Date().toISOString() },
  ]},
];

const MOCK_RESTAURANT = {
  id: "mock-1", name: "Paradise Biryani", cuisine_type: "Biryani, South Indian, Andhra",
  address_line1: "Road No. 36, Jubilee Hills", city: "Hyderabad", rating: 4.5, review_count: 2340,
  delivery_fee: 40, minimum_order: 200, is_open: true, is_active: true,
  cover_image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
  promo_text: "FREE DELIVERY on orders above ₹200", estimated_delivery_time: "25-35 min",
  created_at: new Date().toISOString(),
};

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [restaurant] = useState(MOCK_RESTAURANT);
  const [menu] = useState<MenuCategory[]>(MOCK_MENU);
  const [loading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("popular");
  const { addItem, getItemCount, getSubtotal, items } = useCartStore();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const menuScrollRef = useRef<ScrollView>(null);

  const parallaxHeaderStyle = {
    transform: [{
      translateY: scrollY.interpolate({ inputRange: [-50, 0, HEADER_HEIGHT], outputRange: [20, 0, -HEADER_HEIGHT * 0.5], extrapolate: "clamp" }),
    }, {
      scale: scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.3, 1], extrapolate: "clamp" }),
    }],
  };

  const stickyHeaderOpacity = scrollY.interpolate({ inputRange: [HEADER_HEIGHT - 100, HEADER_HEIGHT], outputRange: [0, 1], extrapolate: "clamp" });
  const [stickyVisible, setStickyVisible] = useState(false);
  useEffect(() => {
    const listener = stickyHeaderOpacity.addListener(({ value }) => setStickyVisible(value > 0.5));
    return () => stickyHeaderOpacity.removeListener(listener);
  }, [stickyHeaderOpacity]);

  const handleCategoryPress = (categoryId: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(categoryId);
    const sectionIndex = menu.findIndex(c => c.id === categoryId);
    let offset = 0;
    for (let i = 0; i < sectionIndex; i++) {
      offset += 60 + (menu[i].items?.length ?? 0) * 100;
    }
    menuScrollRef.current?.scrollTo({ y: HEADER_HEIGHT + 200 + offset, animated: true });
  };

  const handleAddToCart = (item: MenuItem) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const currentRestaurantId = useCartStore.getState().restaurantId;
    if (currentRestaurantId && currentRestaurantId !== id) {
      Alert.alert("Different Restaurant", "Your cart has items from another restaurant. Clear it?", [
        { text: "Cancel", style: "cancel" },
        { text: "Clear & Add", onPress: () => {
          useCartStore.setState({ items: [], restaurantId: id, restaurantName: restaurant.name });
          addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url, is_veg: item.is_veg });
          showToast(`${item.name} added to cart`, "success");
        }},
      ]);
      return;
    }
    if (currentRestaurantId !== id) useCartStore.setState({ restaurantId: id, restaurantName: restaurant.name });
    addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url, is_veg: item.is_veg });
    showToast(`${item.name} added to cart`, "success");
  };

  const handleShare = () => showToast("Share link copied!", "success");
  const itemCount = getItemCount();
  const subtotal = getSubtotal();

  if (loading) return <LoadingSpinner fullScreen text="Loading restaurant..." />;

  return (
    <View style={styles.container} testID="screen-restaurant">
      {/* Parallax Hero */}
      <Animated.View style={[styles.heroContainer, parallaxHeaderStyle]} testID="hero-restaurant-image">
        {restaurant.cover_image_url ? (
          <Image source={{ uri: restaurant.cover_image_url }} style={styles.coverImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>{restaurant.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.heroGradient} />
      </Animated.View>

      {/* Top Navigation */}
      <SafeAreaView style={styles.topNav} edges={["top"]}>
        <TouchableOpacity style={styles.topNavButton} onPress={() => router.back()} testID="btn-back">
          <ArrowLeft size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.topNavRight}>
          <TouchableOpacity style={styles.topNavButton} onPress={handleShare} testID="btn-share">
            <Share2 size={22} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topNavButton} onPress={() => { setIsFavorite(!isFavorite); if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} testID="btn-favorite">
            <Heart size={22} color={isFavorite ? colors.error : colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Sticky Header */}
      <Animated.View style={[styles.stickyNav, { paddingTop: insets.top, opacity: stickyHeaderOpacity }]} pointerEvents={stickyVisible ? "auto" : "none"}>
        <View style={styles.stickyNavContent}>
          <TouchableOpacity style={styles.stickyBackButton} onPress={() => router.back()}>
            <ArrowLeft size={20} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.stickyNavTitle} numberOfLines={1}>{restaurant.name}</Text>
          <View style={styles.stickyNavRight}>
            <TouchableOpacity style={styles.stickyIconBtn} onPress={handleShare}>
              <Share2 size={20} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.stickyIconBtn} onPress={() => setIsFavorite(!isFavorite)}>
              <Heart size={20} color={isFavorite ? colors.error : colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        ref={menuScrollRef as any}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        <View style={{ height: HEADER_HEIGHT }} />

        {/* Restaurant Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.restaurantName} testID="text-restaurant-name">{restaurant.name}</Text>
            <Badge text={restaurant.is_open ? "Open" : "Closed"} variant={restaurant.is_open ? "success" : "error"} />
          </View>
          <Text style={styles.cuisineType}>{restaurant.cuisine_type}</Text>
          <View style={styles.addressRow}>
            <MapPin size={14} color={colors.textTertiary} />
            <Text style={styles.addressText} numberOfLines={1}>{restaurant.address_line1}, {restaurant.city}</Text>
          </View>
          {restaurant.promo_text && (
            <View style={styles.offerBanner} testID="banner-offer">
              <Flame size={14} color={colors.accent} />
              <Text style={styles.offerText}>{restaurant.promo_text}</Text>
            </View>
          )}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statHeader}><Star size={13} color={colors.accent} /><Text style={styles.statValue} testID="text-restaurant-rating">{restaurant.rating?.toFixed(1) || "4.0"}</Text></View>
              <Text style={styles.statLabel}>{restaurant.review_count || "100"}+ ratings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statHeader}><Clock size={13} color={colors.textPrimary} /><Text style={styles.statValue}>{restaurant.estimated_delivery_time || "30 min"}</Text></View>
              <Text style={styles.statLabel}>Delivery</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statHeader}><Truck size={13} color={colors.textPrimary} /><Text style={styles.statValue}>{formatCurrency(restaurant.delivery_fee || 40)}</Text></View>
              <Text style={styles.statLabel}>Delivery Fee</Text>
            </View>
          </View>
        </View>

        {/* Category Pills */}
        <View style={styles.categoryPillsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPillsScroll}>
            {menu.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, activeCategory === cat.id && styles.categoryPillActive]}
                onPress={() => handleCategoryPress(cat.id)}
                activeOpacity={0.7}
                testID={`pill-category-${cat.id}`}
              >
                <Text style={[styles.categoryPillText, activeCategory === cat.id && styles.categoryPillTextActive]} numberOfLines={1}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu Sections */}
        {menu.map((category) => (
          <View key={category.id} style={styles.menuSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{category.name}</Text>
              <Text style={styles.sectionCount}>{category.items?.length || 0} items</Text>
            </View>
            {category.items?.map((item, idx) => (
              <View key={item.id} testID={`card-menu-item-${item.id}`}>
                <MenuItemCard item={item} onAddToCart={() => handleAddToCart(item)} itemIndex={idx} />
              </View>
            ))}
          </View>
        ))}
      </Animated.ScrollView>

      {/* Sticky Cart Footer */}
      {itemCount > 0 && (
        <View style={[styles.cartFooter, { paddingBottom: insets.bottom > 0 ? insets.bottom + spacing.md : spacing.md }]}>
          <TouchableOpacity style={styles.cartFooterInner} onPress={() => router.push("/(tabs)/cart")} activeOpacity={0.85} testID="fab-view-cart">
            <View style={styles.cartInfo}>
              <Text style={styles.cartCount}>{itemCount} item{itemCount > 1 ? "s" : ""}</Text>
              <Text style={styles.cartSubtotal}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.viewCartButton}>
              <Text style={styles.viewCartButtonText}>View Cart</Text>
              <ChevronRight size={16} color={colors.white} />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  heroContainer: { position: "absolute", top: 0, left: 0, right: 0, height: HEADER_HEIGHT, zIndex: 0 },
  coverImage: { width: "100%", height: "100%", resizeMode: "cover" },
  placeholderImage: { width: "100%", height: "100%", backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  placeholderText: { fontSize: 80, fontWeight: "bold", color: colors.white, opacity: 0.9 },
  heroGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.2)" },
  topNav: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.md, zIndex: 10 },
  topNavButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  topNavRight: { flexDirection: "row", gap: spacing.sm },
  stickyNav: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 9, backgroundColor: colors.backgroundCard, borderBottomWidth: 1, borderBottomColor: colors.border },
  stickyNavContent: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  stickyBackButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  stickyNavTitle: { flex: 1, ...typography.bodyBold, color: colors.white, fontSize: 16 },
  stickyNavRight: { flexDirection: "row", gap: spacing.xs },
  stickyIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingBottom: 140 },
  infoCard: { margin: spacing.md, padding: spacing.lg, backgroundColor: colors.backgroundCard, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border },
  infoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.xs },
  restaurantName: { ...typography.h1, color: colors.textPrimary, flex: 1, marginRight: spacing.md },
  cuisineType: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md },
  addressRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md, gap: spacing.xs },
  addressText: { ...typography.bodySmall, color: colors.textTertiary, flex: 1 },
  offerBanner: { flexDirection: "row", alignItems: "center", backgroundColor: colors.accentGlow, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, marginBottom: spacing.md, gap: spacing.sm },
  offerText: { ...typography.bodySmall, color: colors.accent, fontWeight: "600", flex: 1 },
  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  statItem: { alignItems: "center", flex: 1 },
  statHeader: { flexDirection: "row", alignItems: "center", gap: 3 },
  statValue: { ...typography.bodyBold, color: colors.textPrimary, fontSize: 14 },
  statLabel: { ...typography.caption, color: colors.textTertiary, marginTop: 2, textAlign: "center" },
  statDivider: { width: 1, height: 35, backgroundColor: colors.border },
  categoryPillsContainer: { borderBottomWidth: 1, borderBottomColor: colors.border },
  categoryPillsScroll: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  categoryPill: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.backgroundCard, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border },
  categoryPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryPillText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: "500" },
  categoryPillTextActive: { color: colors.white, fontWeight: "700" },
  menuSection: { paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.md, backgroundColor: colors.background },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, fontWeight: "700" },
  sectionCount: { ...typography.caption, color: colors.textTertiary, backgroundColor: colors.backgroundCard, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  cartFooter: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: colors.backgroundCard, borderTopWidth: 1, borderTopColor: colors.border, ...shadows.glass },
  cartFooterInner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", margin: spacing.md },
  cartInfo: { flex: 1 },
  cartCount: { ...typography.bodyBold, color: colors.primary, fontSize: 15 },
  cartSubtotal: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  viewCartButton: { flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: borderRadius.md, gap: spacing.xs },
  viewCartButtonText: { ...typography.button, color: colors.white },
});
