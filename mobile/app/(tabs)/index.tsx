// Premium Home Screen - Liquid Glass Design System
import React, { useState, useEffect, useCallback } from "react";
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
import { Search, MapPin, ChevronDown, Clock, Star, UtensilsCrossed } from "lucide-react-native";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { ShimmerCard } from "@/components/ui/Shimmer";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { restaurantApi } from "@/services/api/endpoints";
import type { Restaurant } from "@/types/api";

const CATEGORIES = [
  { id: "all", name: "All" },
  { id: "biryani", name: "Biryani" },
  { id: "south indian", name: "South Indian" },
  { id: "starters", name: "Starters" },
  { id: "curry", name: "Curry" },
  { id: "desserts", name: "Desserts" },
  { id: "andhra", name: "Andhra" },
];

const FEATURED_ITEMS = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500",
    name: "Hyderabadi Biryani House",
    rating: 4.5,
    time: "25-35 min",
    promo: "FREE DELIVERY",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500",
    name: "Andhra Spice Kitchen",
    rating: 4.3,
    time: "30-40 min",
    promo: "FREE DELIVERY",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1626645738196-c2a72c7ac1d2?w=500",
    name: "South Indian Grand",
    rating: 4.7,
    time: "20-30 min",
    promo: "FREE DELIVERY",
  },
];

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
    inputRange: [0, 80],
    outputRange: [1, 0.95],
    extrapolate: Animated.Interpolation.CLAMP,
  });

  const renderHeader = () => (
    <View style={[styles.headerContent, { paddingTop: insets.top + 80 }]}>
      {/* Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionLabel}>Explore</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          decelerationRate="fast"
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryPill,
                selectedCategory === cat.id && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryIconBox, selectedCategory === cat.id && styles.categoryIconBoxActive]}>
                <UtensilsCrossed size={14} color={selectedCategory === cat.id ? colors.white : colors.primary} />
              </View>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat.id && styles.categoryTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Section */}
      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.featuredTitle}>Top Picks</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScroll}
          decelerationRate="fast"
          snapToInterval={210}
        >
          {FEATURED_ITEMS.map((item) => (
            <View key={item.id} style={styles.featuredCard}>
              <Image source={{ uri: item.image }} style={styles.featuredImage} />
              <View style={styles.featuredGradient} />
              <View style={styles.featuredPromo}>
                <Text style={styles.featuredPromoText}>{item.promo}</Text>
              </View>
              <View style={styles.featuredInfo}>
                <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
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

      {/* Restaurants Section */}
      <View style={styles.restaurantsSection}>
        <View style={styles.restaurantsHeaderRow}>
          <Text style={styles.sectionTitle}>Restaurants</Text>
          <Text style={styles.restaurantCount}>{restaurants.length} places</Text>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <UtensilsCrossed size={40} color={colors.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>No restaurants found</Text>
      <Text style={styles.emptySubtext}>Try adjusting your search or check back later</Text>
    </View>
  );

  const renderRestaurantItem = useCallback(({ item }: { item: Restaurant }) => (
    <RestaurantCard restaurant={item} onPress={() => handleRestaurantPress(item)} />
  ), [handleRestaurantPress]);

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
        <View style={[styles.fixedHeader, { paddingTop: spacing.lg }]}>
          <View style={styles.glassHeader}>
            <TouchableOpacity style={styles.locationSelector} activeOpacity={0.7}>
              <View style={styles.locationIconBox}>
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
            <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}>
              <Search size={16} color={colors.textTertiary} />
              <Text style={styles.searchPlaceholder}>Search restaurants or cuisines...</Text>
            </TouchableOpacity>
          </View>
        </View>
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
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchRestaurants(1, true)}>
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
      <Animated.View style={[styles.fixedHeader, { paddingTop: insets.top + spacing.sm }, { opacity: headerOpacity }]}>
        <View style={styles.glassHeader}>
          {/* Location Selector */}
          <TouchableOpacity style={styles.locationSelector} activeOpacity={0.7}>
            <View style={styles.locationIconBox}>
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
            style={styles.searchBar}
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/search")}
          >
            <Search size={16} color={colors.textTertiary} />
            <Text style={styles.searchPlaceholder}>Search restaurants or cuisines...</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={renderRestaurantItem}
        ListHeaderComponent={renderHeader}
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
          { useNativeDriver: true }
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
    backgroundColor: "rgba(11, 11, 15, 0.92)",
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
  locationIconBox: {
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchPlaceholder: {
    ...typography.body,
    color: colors.textTertiary,
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerContent: {
    paddingHorizontal: spacing.md,
  },
  categoriesSection: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  categoriesContainer: {
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundCard,
    paddingRight: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryIconBox: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs,
  },
  categoryIconBoxActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  categoryText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  categoryTextActive: {
    color: colors.white,
    fontWeight: "600",
  },
  featuredSection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  featuredTitle: {
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
  featuredScroll: {
    paddingRight: spacing.md,
  },
  featuredCard: {
    width: 200,
    height: 150,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    marginRight: spacing.md,
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  featuredPromo: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  featuredPromoText: {
    ...typography.small,
    color: colors.white,
    fontWeight: "700",
    fontSize: 9,
    letterSpacing: 0.3,
  },
  featuredInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  featuredName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
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
  restaurantsSection: {
    marginBottom: spacing.sm,
  },
  restaurantsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  restaurantCount: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },
  skeletonContent: {
    flex: 1,
    paddingTop: 140,
    paddingHorizontal: spacing.md,
  },
  skeletonContainer: {
    flex: 1,
  },
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
});