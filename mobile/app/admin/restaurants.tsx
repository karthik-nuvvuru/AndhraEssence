// Admin Restaurant Approvals Screen
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Restaurant, MapPin, CheckCircle, XCircle } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { extendedAdminApi } from "@/services/api/admin";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface RestaurantItem {
  id: string;
  name: string;
  city: string;
  owner_email: string;
  cuisine_type: string;
  created_at: string;
}

export default function AdminRestaurantsScreen() {
  const insets = useSafeAreaInsets();
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");

  const fetchRestaurants = async () => {
    try {
      if (activeTab === "pending") {
        const data = await extendedAdminApi.getPendingRestaurants();
        setRestaurants(data);
      }
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRestaurants();
  };

  const approveRestaurant = async (restaurantId: string) => {
    try {
      await extendedAdminApi.approveRestaurant(restaurantId);
      Alert.alert("Success", "Restaurant approved");
      fetchRestaurants();
    } catch (error) {
      console.error("Failed to approve restaurant:", error);
      Alert.alert("Error", "Failed to approve restaurant");
    }
  };

  const renderRestaurant = ({ item }: { item: RestaurantItem }) => (
    <GlassCard style={styles.restaurantCard}>
      <View style={styles.cardHeader}>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color={colors.textTertiary} />
            <Text style={styles.locationText}>{item.city}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: colors.warningBg }]}>
          <Text style={[styles.statusText, { color: colors.warning }]}>Pending</Text>
        </View>
      </View>

      <View style={styles.cardMeta}>
        <Text style={styles.metaText}>{item.cuisine_type}</Text>
        <Text style={styles.metaText}>{item.owner_email}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => {}}
        >
          <XCircle size={16} color={colors.error} />
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => approveRestaurant(item.id)}
        >
          <CheckCircle size={16} color={colors.success} />
          <Text style={styles.approveText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
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
      <View style={styles.header}>
        <Text style={styles.title}>Restaurants</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pending" && styles.tabActive]}
          onPress={() => setActiveTab("pending")}
        >
          <Text style={[styles.tabText, activeTab === "pending" && styles.tabTextActive]}>
            Pending Approval
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={renderRestaurant}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Restaurant size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No pending restaurants</Text>
          </View>
        }
      />
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
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.white,
  },
  list: {
    padding: spacing.lg,
  },
  restaurantCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.small,
    fontWeight: "600",
  },
  cardMeta: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  cardActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  rejectButton: {
    backgroundColor: colors.errorBg,
  },
  rejectText: {
    ...typography.button,
    color: colors.error,
  },
  approveButton: {
    backgroundColor: colors.successBg,
  },
  approveText: {
    ...typography.button,
    color: colors.success,
  },
  empty: {
    alignItems: "center",
    paddingTop: spacing.xxxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    marginTop: spacing.md,
  },
});
