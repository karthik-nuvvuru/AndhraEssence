// Premium Search Screen - World-Class Food Delivery
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, X, TrendingUp, Clock, MapPin, Flame, ChefHat } from "lucide-react-native";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { ShimmerCard } from "@/components/ui/Shimmer";
import { colors, typography, spacing, borderRadius } from "@/theme";
import { restaurantApi } from "@/services/api/endpoints";
import type { Restaurant } from "@/types/api";
import * as Haptics from "expo-haptics";

const MOCK_RESTAURANTS: Restaurant[] = [
  { id: "mock-1", name: "Paradise Biryani", cuisine_type: "Biryani, South Indian", address: "Road No. 36, Jubilee Hills", address_line1: "Jubilee Hills", city: "Hyderabad", rating: 4.5, review_count: 2340, delivery_fee: 40, minimum_order: 200, is_open: true, is_active: true, cover_image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500", promo_text: "FREE DELIVERY", estimated_delivery_time: "25-35 min", opening_time: "11:00", closing_time: "23:00", created_at: new Date().toISOString() },
  { id: "mock-2", name: "Andhra Spice Kitchen", cuisine_type: "Andhra, North Indian", address: "Kukatpally Main Road", address_line1: "Kukatpally", city: "Hyderabad", rating: 4.3, review_count: 1820, delivery_fee: 30, minimum_order: 150, is_open: true, is_active: true, cover_image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500", promo_text: "20% OFF", estimated_delivery_time: "30-40 min", opening_time: "12:00", closing_time: "22:00", created_at: new Date().toISOString() },
  { id: "mock-3", name: "South Indian Grand", cuisine_type: "South Indian, Dosa", address: "Banjara Hills Road No. 12", address_line1: "Banjara Hills", city: "Hyderabad", rating: 4.7, review_count: 3100, delivery_fee: 0, minimum_order: 250, is_open: true, is_active: true, cover_image_url: "https://images.unsplash.com/photo-1626645738196-c2a72c7ac1d2?w=500", promo_text: "FREE DELIVERY", estimated_delivery_time: "20-30 min", opening_time: "06:00", closing_time: "22:00", created_at: new Date().toISOString() },
  { id: "mock-6", name: "Rayalaseema Ruchulu", cuisine_type: "Rayalaseema, Andhra", address: "SR Nagar Main Road", address_line1: "SR Nagar", city: "Hyderabad", rating: 4.6, review_count: 2780, delivery_fee: 20, minimum_order: 100, is_open: true, is_active: true, cover_image_url: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=500", promo_text: "AUTHENTIC", estimated_delivery_time: "25-35 min", opening_time: "11:30", closing_time: "22:30", created_at: new Date().toISOString() },
  { id: "mock-7", name: "Hotel Shadab", cuisine_type: "Mughlai, Biryani", address: "MG Road, Secunderabad", address_line1: "MG Road", city: "Hyderabad", rating: 4.2, review_count: 1890, delivery_fee: 30, minimum_order: 200, is_open: true, is_active: true, cover_image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500", promo_text: "POPULAR", estimated_delivery_time: "30-40 min", opening_time: "11:00", closing_time: "23:00", created_at: new Date().toISOString() },
  { id: "mock-8", name: "Imperial Restaurant", cuisine_type: "Biryani, North Indian", address: "Abids Road", address_line1: "Abids", city: "Hyderabad", rating: 4.5, review_count: 2650, delivery_fee: 0, minimum_order: 250, is_open: true, is_active: true, cover_image_url: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500", promo_text: "FREE DELIVERY", estimated_delivery_time: "25-35 min", opening_time: "12:00", closing_time: "22:30", created_at: new Date().toISOString() },
  { id: "mock-9", name: "Bawarchi Restaurant", cuisine_type: "South Indian, Chinese", address: "RTC Cross Road", address_line1: "RTC Cross Roads", city: "Hyderabad", rating: 4.0, review_count: 3200, delivery_fee: 25, minimum_order: 150, is_open: true, is_active: true, cover_image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500", promo_text: "BEST SELLER", estimated_delivery_time: "30-40 min", opening_time: "11:00", closing_time: "22:00", created_at: new Date().toISOString() },
  { id: "mock-10", name: "Madhur Restaurant", cuisine_type: "Vegetarian, South Indian", address: "Koti Main Road", address_line1: "Koti", city: "Hyderabad", rating: 4.3, review_count: 1450, delivery_fee: 20, minimum_order: 100, is_open: true, is_active: true, cover_image_url: "https://images.unsplash.com/photo-1626645738196-c2a72c7ac1d2?w=500", promo_text: "PURE VEG", estimated_delivery_time: "20-30 min", opening_time: "06:00", closing_time: "22:00", created_at: new Date().toISOString() },
];

const FILTER_CHIPS = [
  { id: "veg", label: "Pure Veg", icon: null },
  { id: "rating", label: "Rating 4.0+", icon: null },
  { id: "free", label: "Free Delivery", icon: null },
  { id: "fast", label: "Fast < 30 min", icon: null },
];

const RECENT_SEARCHES_KEY = "recent_searches";

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Restaurant[]>([]);
  const [allResults, setAllResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Load recent searches
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  // Filter results based on active filters
  useEffect(() => {
    if (activeFilters.length === 0) {
      setResults(allResults);
    } else {
      let filtered = [...allResults];
      if (activeFilters.includes("veg")) filtered = filtered.filter(r => r.cuisine_type?.toLowerCase().includes("vegetarian") || r.promo_text?.toLowerCase().includes("veg"));
      if (activeFilters.includes("rating")) filtered = filtered.filter(r => (r.rating ?? 0) >= 4.0);
      if (activeFilters.includes("free")) filtered = filtered.filter(r => r.delivery_fee === 0);
      if (activeFilters.includes("fast")) filtered = filtered.filter(r => { const t = r.estimated_delivery_time?.replace(/[^0-9]/g, ""); return t && parseInt(t) < 30; });
      setResults(filtered);
    }
  }, [activeFilters, allResults]);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setHasSearched(true);
    setError(null);
    try {
      const response = await restaurantApi.list({ page: 1, limit: 20 });
      const items = response.data.items?.length > 0 ? response.data.items : MOCK_RESTAURANTS;
      // Filter by query
      const filtered = items.filter(r =>
        r.name?.toLowerCase().includes(trimmed.toLowerCase()) ||
        r.cuisine_type?.toLowerCase().includes(trimmed.toLowerCase())
      );
      setAllResults(filtered);
      setResults(filtered);
    } catch {
      const filtered = MOCK_RESTAURANTS.filter(r =>
        r.name?.toLowerCase().includes(trimmed.toLowerCase()) ||
        r.cuisine_type?.toLowerCase().includes(trimmed.toLowerCase())
      );
      setAllResults(filtered);
      setResults(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (term: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuery(term);
    setTimeout(() => handleSearchWithQuery(term), 100);
  };

  const handleSearchWithQuery = async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setLoading(true);
    setHasSearched(true);
    setError(null);
    try {
      const response = await restaurantApi.list({ page: 1, limit: 20 });
      const items = response.data.items?.length > 0 ? response.data.items : MOCK_RESTAURANTS;
      const filtered = items.filter(r =>
        r.name?.toLowerCase().includes(trimmed.toLowerCase()) ||
        r.cuisine_type?.toLowerCase().includes(trimmed.toLowerCase())
      );
      setAllResults(filtered);
      setResults(filtered);
    } catch {
      const filtered = MOCK_RESTAURANTS.filter(r =>
        r.name?.toLowerCase().includes(trimmed.toLowerCase()) ||
        r.cuisine_type?.toLowerCase().includes(trimmed.toLowerCase())
      );
      setAllResults(filtered);
      setResults(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setAllResults([]);
    setHasSearched(false);
    setError(null);
    setActiveFilters([]);
    inputRef.current?.focus();
  };

  const handleRemoveRecent = (term: string) => {
    setRecentSearches(prev => prev.filter(t => t !== term));
  };

  const toggleFilter = (filterId: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilters(prev => prev.includes(filterId) ? prev.filter(f => f !== filterId) : [...prev, filterId]);
  };

  const renderEmpty = () => {
    if (loading) return null;
    if (!hasSearched) {
      return (
        <Animated.View style={[styles.preSearchContainer, { opacity: fadeAnim }]}>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>Recent</Text>
                <TouchableOpacity onPress={() => setRecentSearches([])} activeOpacity={0.7}>
                  <Text style={styles.clearAllText}>Clear all</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.quickSearchGrid}>
                {recentSearches.map((term) => (
                  <TouchableOpacity
                    key={term}
                    style={styles.quickSearchPill}
                    onPress={() => handleQuickSearch(term)}
                    activeOpacity={0.7}
                    testID={`pill-recent-${term.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Clock size={14} color={colors.textTertiary} />
                    <Text style={styles.quickSearchText}>{term}</Text>
                    <TouchableOpacity onPress={() => handleRemoveRecent(term)} hitSlop={8}>
                      <X size={14} color={colors.textTertiary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Trending Searches */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <TrendingUp size={16} color={colors.primary} />
              <Text style={[styles.sectionLabel, { marginLeft: spacing.xs }]}>Trending</Text>
            </View>
            <View style={styles.quickSearchGrid}>
              {["Hyderabadi Dum Biryani", "Masala Dosa", "Andhra Chicken Curry", "Pesarattu", "Chicken 65", "Hyderabadi Haleem", "Chicken Fried Rice", "Paneer Butter Masala"].map((term) => (
                <TouchableOpacity
                  key={term}
                  style={styles.quickSearchPill}
                  onPress={() => handleQuickSearch(term)}
                  activeOpacity={0.7}
                  testID={`pill-trending-${term.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Flame size={14} color={colors.primary} />
                  <Text style={styles.quickSearchText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cuisine Quick Access */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Browse by Cuisine</Text>
            <View style={styles.cuisineGrid}>
              {["Biryani", "South Indian", "Chinese", "North Indian", "Mughlai", "Fast Food", "Desserts", "Beverages"].map((cuisine) => (
                <TouchableOpacity key={cuisine} style={styles.cuisineChip} onPress={() => handleQuickSearch(cuisine)} activeOpacity={0.7}>
                  <ChefHat size={16} color={colors.textSecondary} />
                  <Text style={styles.cuisineChipText}>{cuisine}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      );
    }

    return (
      <View style={styles.noResultsContainer}>
        <View style={styles.noResultsIconContainer}>
          <Search size={40} color={colors.textTertiary} />
        </View>
        <Text style={styles.noResultsTitle}>Nothing found for "{query}"</Text>
        <Text style={styles.noResultsSubtitle}>Try searching for something else</Text>
        <TouchableOpacity style={styles.noResultsButton} onPress={handleClear} activeOpacity={0.8}>
          <Text style={styles.noResultsButtonText}>Clear Search</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]} testID="screen-search">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Search</Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputWrapper, isFocused && styles.searchInputFocused]}>
            <Search size={18} color={isFocused ? colors.primary : colors.textTertiary} />
            <TextInput
              ref={inputRef}
              style={styles.searchTextInput}
              placeholder="Search restaurants or cuisines..."
              placeholderTextColor={colors.textTertiary}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              returnKeyType="search"
              testID="input-search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={handleClear} style={styles.clearButton} hitSlop={8} testID="btn-clear-search">
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {FILTER_CHIPS.map((chip) => {
              const isActive = activeFilters.includes(chip.id);
              return (
                <TouchableOpacity
                  key={chip.id}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => toggleFilter(chip.id)}
                  activeOpacity={0.7}
                  testID={`chip-filter-${chip.id}`}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{chip.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Results or Pre-search state */}
        {loading ? (
          <View style={styles.skeletonContainer}>
            {[1, 2, 3].map((i) => <ShimmerCard key={i} />)}
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleSearch}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : hasSearched ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View testID={`card-restaurant-search-${index}`}>
                <RestaurantCard restaurant={item} onPress={() => router.push(`/restaurant/${item.id}`)} />
              </View>
            )}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {renderEmpty()}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  title: { ...typography.h1, color: colors.textPrimary },
  searchContainer: { paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  searchInputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: colors.backgroundCard, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.sm },
  searchInputFocused: { borderColor: colors.primary },
  searchTextInput: { ...typography.body, color: colors.textPrimary, flex: 1, padding: 0 },
  clearButton: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  filterContainer: { marginBottom: spacing.sm },
  filterScroll: { paddingHorizontal: spacing.md, gap: spacing.sm },
  filterChip: { backgroundColor: colors.backgroundCard, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: "500" },
  filterTextActive: { color: colors.white, fontWeight: "600" },
  list: { paddingHorizontal: spacing.md, flexGrow: 1, paddingBottom: 120 },
  scrollContainer: { flexGrow: 1, paddingBottom: 120 },
  preSearchContainer: { padding: spacing.md },
  section: { marginBottom: spacing.xl },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  sectionLabel: { ...typography.small, color: colors.textTertiary, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: "600" },
  clearAllText: { ...typography.bodySmall, color: colors.primary, fontWeight: "500" },
  quickSearchGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  quickSearchPill: { flexDirection: "row", alignItems: "center", backgroundColor: colors.backgroundCard, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border, gap: spacing.xs },
  quickSearchText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: "500" },
  cuisineGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  cuisineChip: { flexDirection: "row", alignItems: "center", backgroundColor: colors.backgroundCard, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, gap: spacing.xs },
  cuisineChipText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: "500" },
  noResultsContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  noResultsIconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.backgroundCard, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", marginBottom: spacing.lg },
  noResultsTitle: { ...typography.h3, color: colors.textSecondary, marginBottom: spacing.xs, textAlign: "center" },
  noResultsSubtitle: { ...typography.body, color: colors.textTertiary, textAlign: "center", marginBottom: spacing.lg },
  noResultsButton: { backgroundColor: colors.primary, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.xl, borderRadius: borderRadius.md },
  noResultsButtonText: { ...typography.button, color: colors.white, fontWeight: "600" },
  skeletonContainer: { flex: 1, paddingHorizontal: spacing.md, gap: spacing.md },
  errorContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  errorText: { ...typography.body, color: colors.error, textAlign: "center", marginBottom: spacing.lg },
  retryButton: { backgroundColor: colors.primary, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg, borderRadius: borderRadius.md },
  retryButtonText: { ...typography.button, color: colors.white, fontWeight: "600" },
});
