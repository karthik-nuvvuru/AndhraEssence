// Premium Search Screen - Liquid Glass Design
import React, { useState, useCallback } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, X, TrendingUp, Clock, MapPin } from "lucide-react-native";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { ShimmerCard } from "@/components/ui/Shimmer";
import { colors, typography, spacing, borderRadius } from "@/theme";
import { restaurantApi } from "@/services/api/endpoints";
import type { Restaurant } from "@/types/api";

const FILTER_CHIPS = ["Sort", "Fast Delivery", "Rating 4.0+", "Near Me", "Price"];

const RECENT_SEARCHES = ["Biryani", "South Indian", "Andhra", "Vegetable Curry", "Chicken"];
const POPULAR_SEARCHES = ["Hyderabadi Dum Biryani", "Masala Dosa", "Andhra Chicken Curry", "Pesarattu"];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setError(null);
    try {
      const response = await restaurantApi.list({
        cuisine: query.trim(),
        page: 1,
        limit: 20,
      });
      setResults(response.data.items);
    } catch (err: any) {
      console.error("Search failed:", err);
      setError(err?.message || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleSearch();
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setError(null);
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    setTimeout(() => {
      setLoading(true);
      setHasSearched(true);
      setError(null);
      restaurantApi.list({ cuisine: term, page: 1, limit: 20 })
        .then((response) => setResults(response.data.items))
        .catch((err) => setError(err?.message || "Search failed."))
        .finally(() => setLoading(false));
    }, 100);
  };

  const toggleFilter = (chip: string) => {
    setActiveFilter(activeFilter === chip ? null : chip);
  };

  const renderEmpty = () => {
    if (!hasSearched) {
      return (
        <View style={styles.preSearchContainer}>
          {/* Recent Searches */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Recent</Text>
            <View style={styles.quickSearchGrid}>
              {RECENT_SEARCHES.map((term) => (
                <TouchableOpacity
                  key={term}
                  style={styles.quickSearchPill}
                  onPress={() => handleQuickSearch(term)}
                  activeOpacity={0.7}
                >
                  <Clock size={14} color={colors.textTertiary} />
                  <Text style={styles.quickSearchText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Popular Searches */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Popular</Text>
            <View style={styles.quickSearchGrid}>
              {POPULAR_SEARCHES.map((term) => (
                <TouchableOpacity
                  key={term}
                  style={styles.quickSearchPill}
                  onPress={() => handleQuickSearch(term)}
                  activeOpacity={0.7}
                >
                  <TrendingUp size={14} color={colors.primary} />
                  <Text style={styles.quickSearchText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Search Tips */}
          <View style={styles.tipsCard}>
            <View style={styles.tipRow}>
              <MapPin size={16} color={colors.textTertiary} />
              <Text style={styles.tipText}>Try searching by restaurant name or cuisine type</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Search size={36} color={colors.textTertiary} />
        </View>
        <Text style={styles.emptyTitle}>No results found</Text>
        <Text style={styles.emptySubtitle}>
          Try a different search term or browse categories
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Search</Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <View style={styles.searchInput}>
              <Search size={18} color={colors.textTertiary} />
              <TextInput
                style={styles.searchTextInput}
                placeholder="Search restaurants or cuisines..."
                placeholderTextColor={colors.textTertiary}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {FILTER_CHIPS.map((chip) => (
              <TouchableOpacity
                key={chip}
                style={[
                  styles.filterChip,
                  activeFilter === chip && styles.filterChipActive,
                ]}
                onPress={() => toggleFilter(chip)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === chip && styles.filterTextActive,
                  ]}
                >
                  {chip}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results */}
        {loading ? (
          <View style={styles.skeletonContainer}>
            {[1, 2, 3].map((i) => (
              <ShimmerCard key={i} />
            ))}
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <Search size={36} color={colors.error} />
            </View>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RestaurantCard
                restaurant={item}
                onPress={() => router.push(`/restaurant/${item.id}`)}
              />
            )}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.list}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInputWrapper: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  searchTextInput: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    padding: 0,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  filterContainer: {
    marginBottom: spacing.md,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: spacing.md,
    flexGrow: 1,
  },
  preSearchContainer: {
    padding: spacing.md,
  },
  section: {
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
  quickSearchGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  quickSearchPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  quickSearchText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  tipsCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundCard,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
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
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
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
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
});