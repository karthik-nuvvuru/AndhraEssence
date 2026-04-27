// Long Orders Screen - Homemade food, pickles, and traditional items
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock, Star, ShoppingCart, Filter, Leaf } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { longOrdersApi, type LongOrderCategory, type LongOrderItem } from "@/services/api/longOrders";
import { useLongOrderCartStore } from "@/store";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { TextInput } from "react-native-gesture-handler";

export default function LongOrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [categories, setCategories] = useState<LongOrderCategory[]>([]);
  const [items, setItems] = useState<LongOrderItem[]>([]);
  const [bestsellers, setBestsellers] = useState<LongOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const cartItemCount = useLongOrderCartStore((state) => state.getItemCount());

  const fetchData = async () => {
    try {
      const [cats, itemsData, bestsellersData] = await Promise.all([
        longOrdersApi.getCategories(),
        longOrdersApi.getItems({ limit: 50 }),
        longOrdersApi.getItems({ is_bestseller: true, limit: 10 }),
      ]);
      setCategories(cats);
      setItems(itemsData);
      setBestsellers(bestsellersData);
    } catch (error) {
      console.error("Failed to fetch long orders data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = !selectedCategory || item.category_id === selectedCategory;
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: LongOrderItem) => {
    const cartStore = useLongOrderCartStore.getState();
    cartStore.addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      preparation_days: item.preparation_days,
      unit: item.unit,
    });
  };

  const renderItem = ({ item }: { item: LongOrderItem }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => router.push(`/long-order/${item.id}`)}
      activeOpacity={0.8}
    >
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.itemImage} />
      )}
      {!item.image_url && (
        <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
          <Leaf size={32} color={colors.textTertiary} />
        </View>
      )}

      {item.is_bestseller && (
        <View style={styles.bestsellerBadge}>
          <Star size={10} color={colors.accent} fill={colors.accent} />
          <Text style={styles.bestsellerText}>Bestseller</Text>
        </View>
      )}

      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <View style={[styles.vegBadge, { borderColor: item.is_veg ? colors.veg : colors.nonVeg }]}>
            <View style={[styles.vegDot, { backgroundColor: item.is_veg ? colors.veg : colors.nonVeg }]} />
          </View>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        </View>

        <View style={styles.itemMeta}>
          <View style={styles.prepTime}>
            <Clock size={12} color={colors.textTertiary} />
            <Text style={styles.prepTimeText}>{item.preparation_days} days</Text>
          </View>
          <Text style={styles.itemUnit}>per {item.unit}</Text>
        </View>

        <View style={styles.itemFooter}>
          <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
          <View style={styles.stockIndicator}>
            {item.stock_quantity < 10 ? (
              <Text style={styles.lowStockText}>Only {item.stock_quantity} left</Text>
            ) : (
              <Text style={styles.inStockText}>In Stock</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addButton, item.stock_quantity === 0 && styles.addButtonDisabled]}
          onPress={() => addToCart(item)}
          disabled={item.stock_quantity === 0}
        >
          <Text style={styles.addButtonText}>
            {item.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: LongOrderCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.categoryChipActive,
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
    >
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === item.id && styles.categoryChipTextActive,
        ]}
      >
        {item.name}
      </Text>
      <View style={[styles.categoryBadge, selectedCategory === item.id && styles.categoryBadgeActive]}>
        <Text style={[styles.categoryBadgeText, selectedCategory === item.id && styles.categoryBadgeTextActive]}>
          {item.items_count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Long Orders</Text>
            <Text style={styles.subtitle}>Homemade & Traditional</Text>
          </View>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push("/long-order/cart")}
          >
            <ShoppingCart size={24} color={colors.textPrimary} />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search pickles, homemade..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={renderCategory}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Bestsellers */}
        {!selectedCategory && bestsellers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Star size={20} color={colors.accent} fill={colors.accent} />
              <Text style={styles.sectionTitle}>Bestsellers</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.bestsellersList}>
                {bestsellers.slice(0, 5).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.bestsellerCard}
                    onPress={() => router.push(`/long-order/${item.id}`)}
                  >
                    {item.image_url ? (
                      <Image source={{ uri: item.image_url }} style={styles.bestsellerImage} />
                    ) : (
                      <View style={[styles.bestsellerImage, styles.bestsellerImagePlaceholder]}>
                        <Leaf size={24} color={colors.textTertiary} />
                      </View>
                    )}
                    <Text style={styles.bestsellerName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.bestsellerPrice}>₹{item.price}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* All Items Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.name || "Items"
              : "All Items"}
          </Text>
          <View style={styles.itemsGrid}>
            {filteredItems.map((item) => (
              <View key={item.id} style={styles.itemWrapper}>
                {renderItem({ item })}
              </View>
            ))}
          </View>
          {filteredItems.length === 0 && (
            <View style={styles.emptyState}>
              <Leaf size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No items found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.glass,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  searchContainer: {
    marginTop: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.glass,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  categoriesSection: {
    marginBottom: spacing.lg,
  },
  categoriesList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass,
    gap: spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  categoryBadge: {
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  categoryBadgeActive: {
    backgroundColor: colors.white + "30",
  },
  categoryBadgeText: {
    ...typography.small,
    color: colors.textTertiary,
  },
  categoryBadgeTextActive: {
    color: colors.white,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  bestsellersList: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  bestsellerCard: {
    width: 120,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  bestsellerImage: {
    width: "100%",
    height: 80,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  bestsellerImagePlaceholder: {
    backgroundColor: colors.glass,
    justifyContent: "center",
    alignItems: "center",
  },
  bestsellerName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  bestsellerPrice: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  itemWrapper: {
    width: "47%",
  },
  itemCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: 100,
  },
  itemImagePlaceholder: {
    backgroundColor: colors.glass,
    justifyContent: "center",
    alignItems: "center",
  },
  bestsellerBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.black + "80",
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  bestsellerText: {
    ...typography.small,
    color: colors.accent,
    fontWeight: "600",
  },
  itemContent: {
    padding: spacing.sm,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  vegBadge: {
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  itemName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  prepTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  prepTimeText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  itemUnit: {
    ...typography.caption,
    color: colors.textMuted,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  itemPrice: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  stockIndicator: {},
  inStockText: {
    ...typography.caption,
    color: colors.success,
  },
  lowStockText: {
    ...typography.caption,
    color: colors.warning,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: colors.glass,
  },
  addButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 13,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    marginTop: spacing.md,
  },
});
