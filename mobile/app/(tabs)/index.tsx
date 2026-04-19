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
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { ShimmerCard } from "@/components/ui/Shimmer";
import { Button } from "@/components/ui/Button";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { restaurantApi } from "@/services/api/endpoints";
import type { Restaurant } from "@/types/api";

const CATEGORIES = [
  { id: "all", name: "All", emoji: "🔥" },
  { id: "biryani", name: "Biryani", emoji: "🍚" },
  { id: "south indian", name: "South Indian", emoji: "🥗" },
  { id: "starters", name: "Starters", emoji: "🍗" },
  { id: "curry", name: "Curry", emoji: "🍛" },
  { id: "desserts", name: "Desserts", emoji: "🍰" },
  { id: "andhra", name: "Andhra", emoji: "🌶️" },
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

  const AnimatedRestaurantCard: React.FC<{ restaurant: Restaurant; index: number; onPress: (r: Restaurant) => void }> = ({ restaurant, index, onPress }) => {
    const entryStyle = useAnimatedStyle(() => ({
      opacity: withDelay(index * 100, withTiming(1, { duration: 300 })),
      transform: [
        { translateY: withDelay(index * 100, withSpring(0)) },
      ],
    }));

    return (
      <Animated.View style={entryStyle}>
        <RestaurantCard restaurant={restaurant} onPress={() => onPress(restaurant)} />
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        decelerationRate="fast"
        snapToInterval={120}
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
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
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

      {/* Featured Section */}
      <View style={styles.featuredSection}>
        <Text style={styles.featuredTitle}>🔥 Top Picks for You</Text>
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
              <View style={styles.featuredOverlay} />
              <View style={styles.featuredPromo}>
                <Text style={styles.featuredPromoText}>{item.promo}</Text>
              </View>
              <View style={styles.featuredInfo}>
                <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.featuredMeta}>⭐ {item.rating} • {item.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Restaurants Section Header */}
      <View style={styles.restaurantsHeader}>
        <Text style={styles.sectionTitle}>🍽️ Restaurants near you</Text>
        <Text style={styles.restaurantCount}>{restaurants.length} places</Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🍽️</Text>
      <Text style={styles.emptyTitle}>No restaurants found</Text>
      <Text style={styles.emptySubtext}>Try adjusting your search or check back later</Text>
    </View>
  );

  const renderRestaurantItem = useCallback(({ item, index }: { item: Restaurant; index: number }) => (
    <AnimatedRestaurantCard restaurant={item} index={index} onPress={handleRestaurantPress} />
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
              <Text style={styles.locationIcon}>📍</Text>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>Deliver to</Text>
                <View style={styles.locationRow}>
                  <Text style={styles.locationText}>Hyderabad</Text>
                  <Text style={styles.locationArrow}>▼</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}>
              <Text style={styles.searchIcon}>🔍</Text>
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
          <Text style={styles.errorIcon}>😔</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Try Again" onPress={() => fetchRestaurants(1, true)} variant="primary" size="md" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Fixed Glassmorphism Header */}
      <View style={[styles.fixedHeader, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.glassHeader}>
          {/* Location Selector */}
          <TouchableOpacity style={styles.locationSelector} activeOpacity={0.7}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Deliver to</Text>
              <View style={styles.locationRow}>
                <Text style={styles.locationText}>Hyderabad</Text>
                <Text style={styles.locationArrow}>▼</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Search Bar */}
          <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Search restaurants or cuisines...</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <FlatList
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
    backgroundColor: "rgba(11, 11, 15, 0.85)",
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
  locationIcon: {
    fontSize: 20,
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
  },
  locationArrow: {
    fontSize: 10,
    color: colors.primary,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchPlaceholder: {
    ...typography.body,
    color: colors.textTertiary,
    flex: 1,
  },
  headerContent: {
    paddingTop: 140,
    paddingHorizontal: spacing.md,
  },
  categoriesContainer: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass,
    paddingHorizontal: spacing.md,
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
  categoryEmoji: {
    fontSize: 16,
    marginRight: spacing.xs,
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
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  featuredTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  featuredScroll: {
    paddingRight: spacing.md,
  },
  featuredCard: {
    width: 200,
    height: 140,
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
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  featuredPromo: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  featuredPromoText: {
    ...typography.small,
    color: colors.white,
    fontWeight: "700",
    fontSize: 9,
  },
  featuredInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  featuredName: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: "700",
  },
  featuredMeta: {
    ...typography.caption,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  restaurantsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: "700",
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
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
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
  errorIcon: {
    fontSize: 64,
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
});
