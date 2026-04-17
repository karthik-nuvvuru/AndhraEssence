import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { colors, typography, spacing } from "@/theme";
import { restaurantApi } from "@/services/api/endpoints";
import type { Restaurant } from "@/types/api";

export default function HomeScreen() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchRestaurants = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

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
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleRefresh = () => {
    fetchRestaurants(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && !refreshing) {
      fetchRestaurants(page + 1);
    }
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    router.push(`/restaurant/${restaurant.id}`);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Hello! 👋</Text>
        <Text style={styles.title}>Find your favorite food</Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No restaurants available</Text>
      <Text style={styles.emptySubtext}>Check back later for updates</Text>
    </View>
  );

  if (loading && page === 1) {
    return <LoadingSpinner fullScreen text="Loading restaurants..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => handleRestaurantPress(item)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  list: {
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.h4,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textLight,
  },
});
