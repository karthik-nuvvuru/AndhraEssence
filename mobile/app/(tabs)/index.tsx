// Premium Home Screen - World-Class Food Delivery
import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView, Image, StatusBar, Animated, Dimensions, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, MapPin, ChevronDown, Clock, Star, UtensilsCrossed, Flame, Bell, X, Soup, Cookie, Coffee, Pizza, Sandwich, IceCream, GlassWater, Fish, Salad, PartyPopper, Heart } from "lucide-react-native";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { ShimmerCard } from "@/components/ui/Shimmer";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { restaurantApi } from "@/services/api/endpoints";
import { pluralize } from "@/utils/formatters";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Lucide icon components mapped to food categories — no emojis
const CATEGORY_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  "biryani": UtensilsCrossed,
  "south-indian": Soup,
  "starters": Flame,
  "curry": Flame,
  "chinese": Soup,
  "pizza": Pizza,
  "burgers": Sandwich,
  "rolls": Sandwich,
  "desserts": IceCream,
  "beverages": Coffee,
  "thali": Salad,
  "seafood": Fish,
};

const FOOD_CATEGORIES = [
  { id: "biryani", name: "Biryani" },
  { id: "south-indian", name: "South Indian" },
  { id: "starters", name: "Starters" },
  { id: "curry", name: "Curry" },
  { id: "chinese", name: "Chinese" },
  { id: "pizza", name: "Pizza" },
  { id: "burgers", name: "Burgers" },
  { id: "rolls", name: "Rolls" },
  { id: "desserts", name: "Desserts" },
  { id: "beverages", name: "Beverages" },
  { id: "thali", name: "Thali" },
  { id: "seafood", name: "Seafood" },
];

const OFFER_BANNERS = [
  { id: "1", title: "50% OFF", subtitle: "Up to ₹100 on your first order", bg: "#FF4500", textColor: "#FFFFFF" },
  { id: "2", title: "FREE DELIVERY", subtitle: "On orders above ₹200", bg: "#22C55E", textColor: "#FFFFFF" },
  { id: "3", title: "FLAT 30% OFF", subtitle: "On Andhra Spice Kitchen", bg: "#FFD60A", textColor: "#000000" },
  { id: "4", title: "WEEKEND SPECIAL", subtitle: "Biryani starting at ₹149", bg: "#FF6B35", textColor: "#FFFFFF" },
];

const FEATURED_ITEMS = [
  { id: "1", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500", name: "Hyderabadi Dum Biryani", rating: 4.5, time: "25-35 min", promo: "FREE DELIVERY", restaurant: "Paradise Biryani" },
  { id: "2", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500", name: "Andhra Chicken Curry", rating: 4.3, time: "30-40 min", promo: "20% OFF", restaurant: "Andhra Spice Kitchen" },
  { id: "3", image: "https://images.unsplash.com/photo-1626645738196-c2a72c7ac1d2?w=500", name: "Masala Dosa", rating: 4.7, time: "20-30 min", promo: "FREE DELIVERY", restaurant: "South Indian Grand" },
  { id: "4", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500", name: "Panneer Butter Masala", rating: 4.4, time: "25-35 min", promo: "15% OFF", restaurant: "Chutneys Restaurant" },
];

const MOCK_RESTAURANTS = [
  { id: "mock-1", name: "Paradise Biryani", cuisine_type: "Biryani, South Indian", address: "Road No. 36, Jubilee Hills", address_line1: "Jubilee Hills", city: "Hyderabad", rating: 4.5, review_count: 2340, delivery_fee: 40, minimum_order: 200, is_open: true, is_active: true, opening_time: "11:00", closing_time: "23:00", cover_image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500", promo_text: "FREE DELIVERY", estimated_delivery_time: "25-35 min", created_at: new Date().toISOString() },
  { id: "mock-2", name: "Andhra Spice Kitchen", cuisine_type: "Andhra, North Indian", address: "Kukatpally Main Road", address_line1: "Kukatpally", city: "Hyderabad", rating: 4.3, review_count: 1820, delivery_fee: 30, minimum_order: 150, is_open: true, is_active: true, opening_time: "12:00", closing_time: "22:00", cover_image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500", promo_text: "20% OFF", estimated_delivery_time: "30-40 min", created_at: new Date().toISOString() },
  { id: "mock-3", name: "South Indian Grand", cuisine_type: "South Indian, Dosa", address: "Banjara Hills Road No. 12", address_line1: "Banjara Hills", city: "Hyderabad", rating: 4.7, review_count: 3100, delivery_fee: 0, minimum_order: 250, is_open: true, is_active: true, opening_time: "06:00", closing_time: "22:00", cover_image_url: "https://images.unsplash.com/photo-1626645738196-c2a72c7ac1d2?w=500", promo_text: "FREE DELIVERY", estimated_delivery_time: "20-30 min", created_at: new Date().toISOString() },
  { id: "mock-4", name: "Chutneys Restaurant", cuisine_type: "Multi-cuisine, Indian", address: "Gachibowli Main Road", address_line1: "Gachibowli", city: "Hyderabad", rating: 4.1, review_count: 980, delivery_fee: 50, minimum_order: 300, is_open: true, is_active: true, opening_time: "11:00", closing_time: "23:00", cover_image_url: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500", promo_text: "15% OFF", estimated_delivery_time: "35-45 min", created_at: new Date().toISOString() },
  { id: "mock-5", name: "Meridian Restaurant", cuisine_type: "Continental, Chinese", address: "Hitech City Main Road", address_line1: "Hitech City", city: "Hyderabad", rating: 4.4, review_count: 1560, delivery_fee: 60, minimum_order: 400, is_open: false, is_active: true, opening_time: "12:00", closing_time: "22:00", cover_image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500", promo_text: "COMBO OFFER", estimated_delivery_time: "40-50 min", created_at: new Date().toISOString() },
  { id: "mock-6", name: "Rayalaseema Ruchulu", cuisine_type: "Rayalaseema, Andhra", address: "SR Nagar Main Road", address_line1: "SR Nagar", city: "Hyderabad", rating: 4.6, review_count: 2780, delivery_fee: 20, minimum_order: 100, is_open: true, is_active: true, opening_time: "11:30", closing_time: "22:30", cover_image_url: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=500", promo_text: "AUTHENTIC", estimated_delivery_time: "25-35 min", created_at: new Date().toISOString() },
  { id: "mock-7", name: "Hotel Shadab", cuisine_type: "Mughlai, Biryani", address: "MG Road, Secunderabad", address_line1: "MG Road", city: "Hyderabad", rating: 4.2, review_count: 1890, delivery_fee: 30, minimum_order: 200, is_open: true, is_active: true, opening_time: "11:00", closing_time: "23:00", cover_image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500", promo_text: "POPULAR", estimated_delivery_time: "30-40 min", created_at: new Date().toISOString() },
  { id: "mock-8", name: "Imperial Restaurant", cuisine_type: "Biryani, North Indian", address: "Abids Road", address_line1: "Abids", city: "Hyderabad", rating: 4.5, review_count: 2650, delivery_fee: 0, minimum_order: 250, is_open: true, is_active: true, opening_time: "12:00", closing_time: "22:30", cover_image_url: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500", promo_text: "FREE DELIVERY", estimated_delivery_time: "25-35 min", created_at: new Date().toISOString() },
  { id: "mock-9", name: "Bawarchi Restaurant", cuisine_type: "South Indian, Chinese", address: "RTC Cross Road", address_line1: "RTC Cross Roads", city: "Hyderabad", rating: 4.0, review_count: 3200, delivery_fee: 25, minimum_order: 150, is_open: true, is_active: true, opening_time: "11:00", closing_time: "22:00", cover_image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500", promo_text: "BEST SELLER", estimated_delivery_time: "30-40 min", created_at: new Date().toISOString() },
  { id: "mock-10", name: "Madhur Restaurant", cuisine_type: "Vegetarian, South Indian", address: "Koti Main Road", address_line1: "Koti", city: "Hyderabad", rating: 4.3, review_count: 1450, delivery_fee: 20, minimum_order: 100, is_open: true, is_active: true, opening_time: "06:00", closing_time: "22:00", cover_image_url: "https://images.unsplash.com/photo-1626645738196-c2a72c7ac1d2?w=500", promo_text: "PURE VEG", estimated_delivery_time: "20-30 min", created_at: new Date().toISOString() },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [restaurants, setRestaurants] = useState(MOCK_RESTAURANTS);
  const [filteredRestaurants, setFilteredRestaurants] = useState(MOCK_RESTAURANTS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [showVegOnly, setShowVegOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [notificationCount] = useState(3);
  const scrollY = new Animated.Value(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const bannerIndex = useRef(0);
  const bannerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      bannerIndex.current = (bannerIndex.current + 1) % OFFER_BANNERS.length;
      bannerScrollRef.current?.scrollTo({ x: bannerIndex.current * SCREEN_WIDTH, animated: true });
      Animated.spring(bannerAnim, { toValue: bannerIndex.current, useNativeDriver: false, tension: 50, friction: 8 }).start();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchRestaurants = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      const response = await restaurantApi.list({ page: 1, limit: 20, is_open: true });
      const items = response.data.items?.length > 0 ? response.data.items : MOCK_RESTAURANTS;
      setRestaurants(items as any);
      setFilteredRestaurants(items as any);
    } catch {
      setRestaurants(MOCK_RESTAURANTS as any);
      setFilteredRestaurants(MOCK_RESTAURANTS as any);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchRestaurants(); }, []);

  useEffect(() => {
    if (showVegOnly) {
      setFilteredRestaurants(restaurants.filter((r: any) => r.cuisine_type?.toLowerCase().includes("vegetarian") || r.promo_text?.toLowerCase().includes("veg")));
    } else if (selectedCategory) {
      const categoryMap: Record<string, string[]> = {
        "biryani": ["biryani"],
        "south-indian": ["south indian", "dosa"],
        "starters": ["starters", "appetizer"],
        "curry": ["curry", "gravy"],
        "chinese": ["chinese"],
        "pizza": ["pizza"],
        "burgers": ["burger", "burgers"],
        "rolls": ["rolls", "wrap"],
        "desserts": ["dessert", "sweets", "ice cream"],
        "beverages": ["beverage", "drinks", "juice"],
        "thali": ["thali"],
        "seafood": ["seafood", "fish", "prawn"],
      };
      const keywords = categoryMap[selectedCategory] || [selectedCategory];
      setFilteredRestaurants(restaurants.filter((r: any) => keywords.some((kw: string) => r.cuisine_type?.toLowerCase().includes(kw))));
    } else {
      setFilteredRestaurants(restaurants);
    }
  }, [showVegOnly, selectedCategory, restaurants]);

  const handleRefresh = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    fetchRestaurants(true);
  };

  const handleRestaurantPress = (restaurant: any) => router.push(`/restaurant/${restaurant.id}`);
  const handleCategoryPress = (categoryId: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const headerOpacity = scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0], extrapolate: "clamp" });
  const stickyHeaderOpacity = scrollY.interpolate({ inputRange: [60, 120], outputRange: [0, 1], extrapolate: "clamp" });
  const [stickyVisible, setStickyVisible] = useState(false);
  useEffect(() => {
    const listener = stickyHeaderOpacity.addListener(({ value }: any) => setStickyVisible(value > 0.5));
    return () => stickyHeaderOpacity.removeListener(listener);
  }, [stickyHeaderOpacity]);

  const fadeAnim = new Animated.Value(0);
  useEffect(() => { Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start(); }, []);

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.locationPill} onPress={() => setShowLocationSheet(true)} activeOpacity={0.8} testID="btn-location">
          <View style={styles.locationIconBox}><MapPin size={16} color={colors.primary} /></View>
          <View style={styles.locationTextContainer}>
            <Text style={styles.deliverToLabel}>Delivering to</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationCity} numberOfLines={1}>Hyderabad</Text>
              <ChevronDown size={14} color={colors.textSecondary} />
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7} testID="btn-notification">
          <Bell size={22} color={colors.textPrimary} />
          {notificationCount > 0 && <View style={styles.notificationBadge}><Text style={styles.notificationBadgeText}>{notificationCount}</Text></View>}
        </TouchableOpacity>
      </View>
      <Animated.View style={[styles.heroText, { opacity: headerOpacity }]}>
        <Text style={styles.heroTitle}>Hungry?</Text>
        <Text style={styles.heroSubtitle}>Order from the best Andhra restaurants</Text>
      </Animated.View>
      <Animated.View style={[styles.searchBarContainer, { opacity: headerOpacity }]}>
        <TouchableOpacity style={styles.searchBar} onPress={() => router.push("/(tabs)/search")} activeOpacity={0.8} testID="btn-search-bar">
          <Search size={18} color={colors.textTertiary} />
          <Text style={styles.searchPlaceholder}>Search for biryani, dosa, curry...</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );

  const renderOffersBanner = () => (
    <View style={styles.offersSection}>
      <ScrollView ref={bannerScrollRef as any} horizontal pagingEnabled showsHorizontalScrollIndicator={false} scrollEventThrottle={16}
        onScroll={(e: any) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          if (idx !== bannerIndex.current) { bannerIndex.current = idx; Animated.spring(bannerAnim, { toValue: idx, useNativeDriver: false, tension: 50, friction: 8 }).start(); }
        }}
        decelerationRate="fast" contentContainerStyle={styles.bannerScrollContent}>
        {OFFER_BANNERS.map((banner) => (
          <View key={banner.id} style={[styles.bannerCard, { backgroundColor: banner.bg }]}>
            <View style={styles.bannerContent}>
              <Text style={[styles.bannerTitle, { color: banner.textColor }]}>{banner.title}</Text>
              <Text style={[styles.bannerSubtitle, { color: banner.textColor }]}>{banner.subtitle}</Text>
            </View>
            <View style={styles.bannerDecor}>
              <PartyPopper size={36} color={banner.textColor} />
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.bannerDots}>
        {OFFER_BANNERS.map((_, idx) => {
          const opacity = bannerAnim.interpolate({ inputRange: [idx - 1, idx, idx + 1], outputRange: [0.3, 1, 0.3], extrapolate: "clamp" });
          return <Animated.View key={idx} style={[styles.bannerDot, { opacity }]} />;
        })}
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>What's on your mind?</Text>
        <TouchableOpacity activeOpacity={0.7} testID="btn-categories-see-all"><Text style={styles.seeAllLink}>See all</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll} decelerationRate="fast">
        {FOOD_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const IconComponent = CATEGORY_ICONS[cat.id] || UtensilsCrossed;
          return (
            <TouchableOpacity key={cat.id} style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              onPress={() => handleCategoryPress(cat.id)} activeOpacity={0.7} testID={`chip-category-${cat.id}`}>
              <View style={[styles.categoryIconBox, isActive && styles.categoryIconBoxActive]}>
                <IconComponent size={20} color={isActive ? colors.white : colors.primary} />
              </View>
              <Text style={[styles.categoryName, isActive && styles.categoryNameActive]}>{cat.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderTopPicks = () => (
    <View style={styles.topPicksSection}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleRow}><Flame size={20} color={colors.accent} /><Text style={styles.sectionTitle}>Top Picks for You</Text></View>
        <TouchableOpacity activeOpacity={0.7} testID="btn-top-picks-see-all"><Text style={styles.seeAllLink}>See all</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topPicksScroll} decelerationRate="fast" snapToInterval={220}>
        {FEATURED_ITEMS.map((item) => (
          <TouchableOpacity key={item.id} style={styles.topPickCard}
            onPress={() => router.push("/restaurant/mock-1")} activeOpacity={0.85} testID={`top-pick-${item.id}`}>
            <Image source={{ uri: item.image }} style={styles.topPickImage} />
            <View style={styles.topPickGradient} />
            <View style={styles.topPickPromo}><Text style={styles.topPickPromoText}>{item.promo}</Text></View>
            <TouchableOpacity style={styles.topPickHeart} activeOpacity={0.7}><Heart size={16} color={colors.error} /></TouchableOpacity>
            <View style={styles.topPickInfo}>
              <Text style={styles.topPickName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.topPickRestaurant} numberOfLines={1}>{item.restaurant}</Text>
              <View style={styles.topPickMeta}>
                <Star size={10} color={colors.accent} /><Text style={styles.topPickMetaText}>{item.rating}</Text>
                <View style={styles.topPickDot} />
                <Clock size={10} color={colors.textSecondary} /><Text style={styles.topPickMetaText}>{item.time}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderRestaurantsHeader = () => (
    <View style={styles.restaurantsHeader}>
      <View style={styles.restaurantsHeaderLeft}>
        <Text style={styles.restaurantsHeaderTitle}>All Restaurants</Text>
        <Text style={styles.restaurantsHeaderCount}>{pluralize(filteredRestaurants.length, "restaurant")}</Text>
      </View>
      <TouchableOpacity style={[styles.vegToggle, showVegOnly && styles.vegToggleActive]}
        onPress={() => { if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowVegOnly(!showVegOnly); }}
        activeOpacity={0.7} testID="btn-veg-filter">
        <View style={[styles.vegDot, { backgroundColor: colors.veg }]} />
        <Text style={[styles.vegToggleText, showVegOnly && styles.vegToggleTextActive]}>Pure Veg</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRestaurantItem = useCallback(({ item, index }: { item: any; index: number }) => (
    <View testID={`card-restaurant-${index}`}><RestaurantCard restaurant={item} onPress={() => handleRestaurantPress(item)} /></View>
  ), [handleRestaurantPress]);

  const renderSkeleton = () => <View style={styles.skeletonSection}>{[1, 2, 3, 4].map((i) => <ShimmerCard key={i} />)}</View>;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}><UtensilsCrossed size={40} color={colors.textTertiary} /></View>
      <Text style={styles.emptyTitle}>No restaurants found</Text>
      <Text style={styles.emptySubtext}>Try adjusting your filters or change location</Text>
      <TouchableOpacity style={styles.emptyButton} onPress={() => { setShowVegOnly(false); setSelectedCategory(null); }} activeOpacity={0.8} testID="btn-empty-reset">
        <Text style={styles.emptyButtonText}>Reset Filters</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLocationSheet = () => {
    if (!showLocationSheet) return null;
    return (
      <View style={styles.sheetOverlay}>
        <TouchableOpacity style={styles.sheetBackdrop} onPress={() => setShowLocationSheet(false)} activeOpacity={1} />
        <View style={styles.sheetContent}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Select Location</Text>
            <TouchableOpacity onPress={() => setShowLocationSheet(false)} style={styles.sheetClose}><X size={20} color={colors.textSecondary} /></TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.locationSheetItem} activeOpacity={0.7} testID="btn-use-current-location">
            <View style={styles.locationSheetIcon}><MapPin size={18} color={colors.primary} /></View>
            <View><Text style={styles.locationSheetTitle}>Use current location</Text><Text style={styles.locationSheetSub}>Detect your location automatically</Text></View>
          </TouchableOpacity>
          <View style={styles.sheetDivider} />
          {["Hyderabad", "Secunderabad", "Vijayawada", "Visakhapatnam", "Guntur"].map((city) => (
            <TouchableOpacity key={city} style={styles.locationSheetItem} onPress={() => setShowLocationSheet(false)} activeOpacity={0.7}>
              <View style={styles.locationSheetIcon}><MapPin size={18} color={colors.textSecondary} /></View>
              <Text style={styles.locationSheetCity}>{city}, Telangana</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderStickyHeader = () => (
    <Animated.View style={[styles.stickyHeader, { opacity: stickyHeaderOpacity, paddingTop: insets.top }]}>
      <View style={styles.stickyHeaderContent}>
        <TouchableOpacity style={styles.stickyLocationPill} onPress={() => {}}>
          <MapPin size={14} color={colors.primary} />
          <Text style={styles.stickyLocationText} numberOfLines={1}>Hyderabad</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
          <Bell size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      {renderStickyHeader()}
      {loading ? (
        <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
          {renderHeader()}
          <View style={styles.skeletonContent}>{renderSkeleton()}</View>
        </SafeAreaView>
      ) : (
        <Animated.FlatList
          data={filteredRestaurants}
          keyExtractor={(item: any) => item.id}
          renderItem={renderRestaurantItem}
          ListHeaderComponent={() => <View>{renderHeader()}{renderOffersBanner()}{renderCategories()}{renderTopPicks()}{renderRestaurantsHeader()}</View>}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} colors={[colors.primary]} progressBackgroundColor={colors.backgroundCard} />}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
          scrollEventThrottle={16}
        />
      )}
      {renderLocationSheet()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: 120 },
  skeletonContent: { flex: 1, paddingHorizontal: spacing.md },
  skeletonSection: { flex: 1, gap: spacing.md },
  header: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  locationPill: { flexDirection: "row", alignItems: "center", flex: 1 },
  locationIconBox: { width: 36, height: 36, borderRadius: borderRadius.md, backgroundColor: colors.primaryGlow, alignItems: "center", justifyContent: "center", marginRight: spacing.sm },
  locationTextContainer: { flex: 1 },
  deliverToLabel: { ...typography.small, color: colors.textTertiary, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationCity: { ...typography.h4, color: colors.textPrimary, fontWeight: "700" },
  notificationButton: { width: 44, height: 44, borderRadius: borderRadius.md, backgroundColor: colors.backgroundCard, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", position: "relative" },
  notificationBadge: { position: "absolute", top: -4, right: -4, backgroundColor: colors.primary, borderRadius: 10, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  notificationBadgeText: { color: colors.white, fontSize: 10, fontWeight: "700" },
  heroText: { marginBottom: spacing.md },
  heroTitle: { ...typography.hero, color: colors.textPrimary },
  heroSubtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  searchBarContainer: { marginBottom: spacing.sm },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: colors.backgroundCard, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.sm },
  searchPlaceholder: { ...typography.body, color: colors.textTertiary, flex: 1 },
  stickyHeader: { position: "absolute", top: 0, left: 0, right: 0, backgroundColor: colors.backgroundSecondary, borderBottomWidth: 1, borderBottomColor: colors.border, zIndex: 100, paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  stickyHeaderContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stickyLocationPill: { flexDirection: "row", alignItems: "center", backgroundColor: colors.backgroundCard, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xs, borderWidth: 1, borderColor: colors.border },
  stickyLocationText: { ...typography.bodySmall, color: colors.textPrimary, fontWeight: "600", maxWidth: 200 },
  offersSection: { marginBottom: spacing.lg },
  bannerScrollContent: { paddingRight: spacing.md },
  bannerCard: { width: SCREEN_WIDTH - spacing.md * 2, height: 100, borderRadius: borderRadius.lg, marginHorizontal: spacing.md, flexDirection: "row", alignItems: "center", padding: spacing.lg, overflow: "hidden" },
  bannerContent: { flex: 1 },
  bannerTitle: { fontSize: 22, fontWeight: "800", marginBottom: spacing.xs },
  bannerSubtitle: { fontSize: 13, fontWeight: "500", opacity: 0.9 },
  bannerDecor: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerDots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: spacing.sm },
  bannerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.5)" },
  categoriesSection: { marginBottom: spacing.lg },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.md, marginBottom: spacing.md },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, fontWeight: "700", letterSpacing: -0.2 },
  seeAllLink: { ...typography.bodySmall, color: colors.primary, fontWeight: "600" },
  categoriesScroll: { paddingHorizontal: spacing.md, gap: spacing.md },
  categoryChip: { width: 80, alignItems: "center", paddingVertical: spacing.md, paddingHorizontal: spacing.xs },
  categoryChipActive: {},
  categoryIconBox: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryIconBoxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryName: { ...typography.small, color: colors.textSecondary, textAlign: "center", fontWeight: "500" },
  categoryNameActive: { color: colors.primary, fontWeight: "700" },
  topPicksSection: { marginBottom: spacing.lg },
  topPicksScroll: { paddingHorizontal: spacing.md, paddingRight: spacing.xl },
  topPickCard: { width: 200, height: 260, borderRadius: borderRadius.lg, overflow: "hidden", marginRight: spacing.md, backgroundColor: colors.backgroundCard, borderWidth: 1, borderColor: colors.border, ...shadows.md },
  topPickImage: { width: "100%", height: 160, resizeMode: "cover" },
  topPickGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.1)" },
  topPickPromo: { position: "absolute", top: spacing.sm, left: spacing.sm, backgroundColor: colors.accent, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  topPickPromoText: { fontSize: 9, fontWeight: "800", color: colors.black, letterSpacing: 0.5 },
  topPickHeart: { position: "absolute", top: spacing.sm, right: spacing.sm, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  topPickHeartIcon: { fontSize: 16, color: colors.error },
  topPickInfo: { padding: spacing.sm },
  topPickName: { fontSize: 14, fontWeight: "700", color: colors.textPrimary, marginBottom: 2 },
  topPickRestaurant: { fontSize: 11, color: colors.textSecondary, marginBottom: spacing.xs },
  topPickMeta: { flexDirection: "row", alignItems: "center", gap: 3 },
  topPickMetaText: { fontSize: 11, color: colors.textSecondary, marginLeft: 2 },
  topPickDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.textTertiary, marginHorizontal: spacing.xs },
  restaurantsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.md, marginBottom: spacing.md, marginTop: spacing.sm },
  restaurantsHeaderLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  restaurantsHeaderTitle: { ...typography.h4, color: colors.textPrimary, fontWeight: "700" },
  restaurantsHeaderCount: { ...typography.bodySmall, color: colors.textTertiary },
  vegToggle: { flexDirection: "row", alignItems: "center", backgroundColor: colors.backgroundCard, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border, gap: spacing.xs },
  vegToggleActive: { backgroundColor: colors.successBg, borderColor: colors.success },
  vegDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: colors.veg },
  vegToggleText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: "500" },
  vegToggleTextActive: { color: colors.success, fontWeight: "600" },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.xxl * 2 },
  emptyIconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.backgroundCard, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", marginBottom: spacing.lg },
  emptyTitle: { ...typography.h2, color: colors.textSecondary, marginBottom: spacing.xs },
  emptySubtext: { ...typography.body, color: colors.textTertiary, textAlign: "center", marginBottom: spacing.lg },
  emptyButton: { backgroundColor: colors.primary, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.xl, borderRadius: borderRadius.md },
  emptyButtonText: { ...typography.button, color: colors.white, fontWeight: "600" },
  sheetOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 1000, justifyContent: "flex-end" },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  sheetContent: { backgroundColor: colors.backgroundCard, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.lg, maxHeight: 480 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginBottom: spacing.md },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
  sheetTitle: { ...typography.h3, color: colors.textPrimary, fontWeight: "700" },
  sheetClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  sheetDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  locationSheetItem: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, gap: spacing.md },
  locationSheetIcon: { width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  locationSheetTitle: { ...typography.body, color: colors.textPrimary, fontWeight: "600" },
  locationSheetSub: { ...typography.caption, color: colors.textSecondary },
  locationSheetCity: { ...typography.body, color: colors.textPrimary },
});
