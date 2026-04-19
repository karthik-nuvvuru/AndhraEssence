// Premium Home Screen - Cinematic Glassmorphism Design
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, MapPin, ChevronDown, Clock, Star, UtensilsCrossed, Flame } from "lucide-react-native";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { ShimmerCard } from "@/components/ui/Shimmer";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { restaurantApi } from "@/services/api/endpoints";
import type { Restaurant } from "@/types/api";

const FOOD_CATEGORIES = [
  { id: "biryani", name: "Biryani", emoji: "🍚" },
  { id: "south-indian", name: "South Indian", emoji: "🥘" },
  { id: "starters", name: "Starters", emoji: "🍗" },
  { id: "curry", name: "Curry", emoji: "🍛" },
  { id: "desserts", name: "Desserts", emoji: "🍨" },
  { id: "andhra", name: "Andhra", emoji: "🌶️" },
  { id: "drinks", name: "Drinks", emoji: "🥤" },
];

const FEATURED_ITEMS = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500",
    name: "Hyderabadi Dum Biryani",
    rating: 4.5,
    time: "25-35 min",
    promo: "FREE DELIVERY",
    restaurant: "Paradise Biryani",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500",
    name: "Andhra Chicken Curry",
    rating: 4.3,
    time: "30-40 min",
    promo: "20% OFF",
    restaurant: "Andhra Spice Kitchen",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1626645738196-c2a72c7ac1d2?w=500",
    name: "Masala Dosa",
    rating: 4.7,
    time: "20-30 min",
    promo: "FREE DELIVERY",
    restaurant: "South Indian Grand",
  },
];

function LiveDot() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[
        styles.liveDot,
        { transform: [{ scale: pulseAnim }] },
      ]}
    />
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const scrollY = new Animated.Value(0);
  const searchBarAnim = useRef(new Animated.Value(1)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, []);

  const fetchRestaurants = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      setError(null);
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      const response = await restaurantApi.list({
        page: pageNum,
        limit: 20,
        is_open: true,
      });

      const { items, pages } = response.data;
      if (refresh || pageNum === 1) {
        setRestaurants(items);
      } else {
        setRestaurants((prev) => [...prev, ...items]);
      }
      setHasMore(pageNum < pages);
      setPage(pageNum);
    } catch (err: any) {
      console.error("Failed to fetch restaurants:", err);
      setError(err?.message || "Failed to load restaurants");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleRefresh = () => fetchRestaurants(1, true);
  const handleLoadMore = () => {
    if (hasMore && !loading && !refreshing) fetchRestaurants(page + 1);
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    router.push(`/restaurant/${restaurant.id}`);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0.92],
    extrapolate: "clamp",
  });

  const searchBarScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: "clamp",
  });

  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: "clamp",
  });

  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const heroScale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 1.08],
    extrapolate: "clamp",
  });

  const renderHero = () => (
    <Animated.View
      style={[
        styles.heroContainer,
        {
          paddingTop: insets.top,
          opacity: heroOpacity,
          transform: [{ translateY: heroTranslateY }, { scale: heroScale }],
        },
      ]}
    >
      {/* Cinematic gradient background */}
      <View style={styles.heroGradientBg}>
        <View style={styles.heroGradientLayer1} />
        <View style={styles.heroGradientLayer2} />
        <View style={styles.heroGradientOverlay} />
      </View>

      {/* Location Row with Live Dot */}
      <View style={styles.heroLocationRow}>
        <View style={styles.locationIconBox}>
          <MapPin size={18} color={colors.white} />
        </View>
        <View style={styles.locationTextContainer}>
          <View style={styles.locationTopRow}>
            <Text style={styles.deliverTo}>Deliver to</Text>
            <View style={styles.liveIndicator}>
              <LiveDot />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>
          <View style={styles.locationBottomRow}>
            <Text style={styles.locationCity}>Hyderabad, Telangana</Text>
            <ChevronDown size={16} color={colors.white} />
          </View>
        </View>
      </View>

      {/* Greeting */}
      <View style={styles.heroGreeting}>
        <Text style={styles.heroGreetingText}>Hungry?</Text>
        <Text style={styles.heroGreetingSubtext}>
          Order from the best Andhra restaurants
        </Text>
      </View>

      {/* Morphing Search Bar */}
      <Animated.View
        style={[
          styles.heroSearchContainer,
          {
            opacity: searchBarOpacity,
            transform: [{ scale: searchBarScale }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.8}
          onPress={() => router.push("/(tabs)/search")}
        >
          <Search size={18} color={colors.textTertiary} />
          <Text style={styles.searchPlaceholder}>
            Search for biryani, dosa, curry...
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );

  const renderFoodCategories = () => (
    <View style={styles.categoriesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>What's on your mind?</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        decelerationRate="fast"
        snapToInterval={90}
      >
        {FOOD_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryItem,
              selectedCategory === cat.id && styles.categoryItemActive,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.categoryIconContainer,
                selectedCategory === cat.id && styles.categoryIconActive,
              ]}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            </View>
            <Text
              style={[
                styles.categoryName,
                selectedCategory === cat.id && styles.categoryNameActive,
              ]}
              numberOfLines={1}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFeaturedSection = () => (
    <View style={styles.featuredSection}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Flame size={20} color={colors.accent} />
          <Text style={styles.sectionTitle}>Top Picks for You</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredScroll}
        decelerationRate="fast"
        snapToInterval={220}
      >
        {FEATURED_ITEMS.map((item) => (
          <View key={item.id} style={styles.featuredCard}>
            <Image source={{ uri: item.image }} style={styles.featuredImage} />
            <View style={styles.featuredGradient} />
            <View style={styles.featuredPromoBadge}>
              <Text style={styles.featuredPromoText}>{item.promo}</Text>
            </View>
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.featuredRestaurant} numberOfLines={1}>
                {item.restaurant}
              </Text>
              <View style={styles.featuredMeta}>
                <Star size={11} color={colors.accent} fill={colors.accent} />
                <Text style={styles.featuredMetaText}>{item.rating}</Text>
                <View style={styles.metaDot} />
                <Clock size={11} color="rgba(255,255,255,0.7)" />
                <Text style={styles.featuredMetaText}>{item.time}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderRestaurantsHeader = () => (
    <View style={styles.restaurantsHeaderRow}>
      <Text style={styles.restaurantsHeaderTitle}>All Restaurants</Text>
      <Text style={styles.restaurantsCount}>{restaurants.length} places</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <UtensilsCrossed size={40} color={colors.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>No restaurants found</Text>
      <Text style={styles.emptySubtext}>
        Try adjusting your search or check back later
      </Text>
    </View>
  );

  const renderRestaurantItem = useCallback(
    ({ item }: { item: Restaurant }) => (
      <RestaurantCard
        restaurant={item}
        onPress={() => handleRestaurantPress(item)}
      />
    ),
    [handleRestaurantPress]
  );

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((i) => (
        <ShimmerCard key={i} />
      ))}
    </View>
  );

  if (loading && page === 1) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        {renderHero()}
        <View style={styles.skeletonContent}>{renderSkeletonLoader()}</View>
      </SafeAreaView>
    );
  }

  if (error && restaurants.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Search size={40} color={colors.error} />
          </View>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchRestaurants(1, true)}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Fixed Glassmorphism Header */}
      <Animated.View
        style={[
          styles.fixedHeader,
          {
            paddingTop: insets.top + spacing.sm,
            opacity: headerOpacity,
          },
        ]}
      >
        <View style={styles.glassHeader}>
          {/* Location Selector */}
          <TouchableOpacity style={styles.locationSelector} activeOpacity={0.7}>
            <View style={styles.locationIconBoxHeader}>
              <MapPin size={16} color={colors.primary} />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Deliver to</Text>
              <View style={styles.locationRow}>
                <Text style={styles.locationText}>Hyderabad</Text>
                <ChevronDown size={14} color={colors.primary} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Search Bar */}
          <TouchableOpacity
            style={styles.searchBarHeader}
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/search")}
          >
            <Search size={16} color={colors.textTertiary} />
            <Text style={styles.searchPlaceholderHeader}>
              Search biryani, dosa...
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={renderRestaurantItem}
        ListHeaderComponent={() => (
          <View>
            {renderHero()}
            {renderFoodCategories()}
            {renderFeaturedSection()}
            {renderRestaurantsHeader()}
          </View>
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: spacing.md,
  },
  glassHeader: {
    backgroundColor: "rgba(13, 13, 13, 0.92)",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.glass,
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  locationIconBoxHeader: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    ...typography.small,
    color: colors.textTertiary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginRight: spacing.xs,
    fontSize: 15,
  },
  searchBarHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchPlaceholderHeader: {
    ...typography.body,
    color: colors.textTertiary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },
  skeletonContent: {
    flex: 1,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skeletonContainer: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.errorBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  errorText: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: "600",
  },

  // Hero styles
  heroContainer: {
    position: "relative",
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  heroGradientBg: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  heroGradientLayer1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1A0A00",
  },
  heroGradientLayer2: {
    position: "absolute",
    top: "-20%",
    right: "-30%",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primaryGlowStrong,
    opacity: 0.6,
  },
  heroGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  heroLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  locationIconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    ...shadows.coral,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  deliverTo: {
    ...typography.small,
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.liveGreen,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  liveText: {
    ...typography.small,
    color: colors.white,
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  locationBottomRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationCity: {
    ...typography.h4,
    color: colors.white,
    fontWeight: "700",
    marginRight: spacing.xs,
  },
  heroGreeting: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  heroGreetingText: {
    ...typography.hero,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  heroGreetingSubtext: {
    ...typography.body,
    color: "rgba(255,255,255,0.7)",
  },
  heroSearchContainer: {
    paddingHorizontal: spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    ...shadows.sm,
  },
  searchPlaceholder: {
    ...typography.body,
    color: colors.textTertiary,
    flex: 1,
  },

  // Categories
  categoriesSection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  seeAllText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
  },
  categoriesContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  categoryItem: {
    alignItems: "center",
    width: 72,
  },
  categoryItemActive: {},
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundCard,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  categoryIconActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryName: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: "center",
    fontWeight: "500",
  },
  categoryNameActive: {
    color: colors.primary,
    fontWeight: "700",
  },

  // Featured
  featuredSection: {
    marginBottom: spacing.lg,
  },
  featuredScroll: {
    paddingRight: spacing.md,
  },
  featuredCard: {
    width: 200,
    height: 160,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    marginRight: spacing.md,
    position: "relative",
    ...shadows.md,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  featuredPromoBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  featuredPromoText: {
    ...typography.small,
    color: colors.black,
    fontWeight: "800",
    fontSize: 9,
    letterSpacing: 0.5,
  },
  featuredInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  featuredName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 2,
  },
  featuredRestaurant: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 3,
  },
  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  featuredMetaText: {
    ...typography.small,
    color: "rgba(255,255,255,0.85)",
    marginLeft: 3,
    fontWeight: "500",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: spacing.xs,
  },

  // Restaurants header
  restaurantsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  restaurantsHeaderTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  restaurantsCount: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },

  // Empty
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl * 2,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundCard,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: "center",
  },
});
