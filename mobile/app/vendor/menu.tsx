// Vendor Menu Management Screen
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, RefreshControl, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus, Edit2, Trash2, Eye, EyeOff, ChevronRight } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { vendorApi } from "@/services/api/vendor";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  is_veg: boolean;
  is_available: boolean;
  is_featured: boolean;
  image_url: string;
  preparation_time_minutes: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  items: MenuItem[];
}

export default function VendorMenuScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMenu = async () => {
    try {
      const data = await vendorApi.getMenu();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch menu:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMenu();
  };

  const toggleAvailability = async (itemId: string, currentValue: boolean) => {
    try {
      await vendorApi.toggleItemAvailability(itemId, !currentValue);
      fetchMenu();
    } catch (error) {
      console.error("Failed to toggle availability:", error);
    }
  };

  const deleteItem = async (itemId: string, itemName: string) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${itemName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await vendorApi.deleteMenuItem(itemId);
              fetchMenu();
            } catch (error) {
              console.error("Failed to delete item:", error);
            }
          },
        },
      ]
    );
  };

  const deleteCategory = async (categoryId: string, categoryName: string) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${categoryName}" and all its items?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await vendorApi.deleteCategory(categoryId);
              fetchMenu();
            } catch (error) {
              console.error("Failed to delete category:", error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/vendor/menu/category/new")}
        >
          <Plus size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Category</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {categories.map((category) => (
          <GlassCard key={category.id} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <View>
                <Text style={styles.categoryName}>{category.name}</Text>
                {category.description && (
                  <Text style={styles.categoryDesc}>{category.description}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => router.push(`/vendor/menu/category/${category.id}`)}
              >
                <ChevronRight size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {category.items.map((item) => (
              <View key={item.id} style={styles.menuItem}>
                <View style={styles.itemInfo}>
                  <View style={styles.itemHeader}>
                    <View
                      style={[
                        styles.vegBadge,
                        { borderColor: item.is_veg ? colors.veg : colors.nonVeg },
                      ]}
                    >
                      <View
                        style={[
                          styles.vegDot,
                          { backgroundColor: item.is_veg ? colors.veg : colors.nonVeg },
                        ]}
                      />
                    </View>
                    <Text style={styles.itemName}>{item.name}</Text>
                  </View>
                  <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
                </View>

                <View style={styles.itemActions}>
                  <Switch
                    value={item.is_available}
                    onValueChange={() => toggleAvailability(item.id, item.is_available)}
                    trackColor={{ false: colors.glass, true: colors.primary + "50" }}
                    thumbColor={item.is_available ? colors.primary : colors.textTertiary}
                  />
                  <TouchableOpacity
                    onPress={() => router.push(`/vendor/menu/item/${item.id}`)}
                  >
                    <Edit2 size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteItem(item.id, item.name)}>
                    <Trash2 size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addItemButton}
              onPress={() => router.push(`/vendor/menu/item/new?categoryId=${category.id}`)}
            >
              <Plus size={14} color={colors.primary} />
              <Text style={styles.addItemText}>Add Item</Text>
            </TouchableOpacity>
          </GlassCard>
        ))}

        {categories.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No menu categories yet</Text>
            <Button
              title="Add First Category"
              onPress={() => router.push("/vendor/menu/category/new")}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  addButtonText: {
    ...typography.button,
    color: colors.white,
  },
  content: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  categoryCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  categoryDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  vegBadge: {
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  itemName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  itemPrice: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  addItemText: {
    ...typography.button,
    color: colors.primary,
  },
  empty: {
    alignItems: "center",
    paddingTop: spacing.xxxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
  },
});
