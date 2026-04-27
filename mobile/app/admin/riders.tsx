// Admin Riders Screen
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bike, CheckCircle } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { extendedAdminApi } from "@/services/api/admin";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface RiderItem {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  is_verified: boolean;
  created_at: string;
}

export default function AdminRidersScreen() {
  const insets = useSafeAreaInsets();
  const [riders, setRiders] = useState<RiderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRiders = async () => {
    try {
      const data = await extendedAdminApi.getPendingRiders();
      setRiders(data);
    } catch (error) {
      console.error("Failed to fetch riders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRiders();
  };

  const approveRider = async (userId: string) => {
    try {
      await extendedAdminApi.approveRider(userId);
      Alert.alert("Success", "Rider approved");
      fetchRiders();
    } catch (error) {
      console.error("Failed to approve rider:", error);
      Alert.alert("Error", "Failed to approve rider");
    }
  };

  const renderRider = ({ item }: { item: RiderItem }) => (
    <GlassCard style={styles.riderCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.riderIcon, { backgroundColor: colors.successBg }]}>
          <Bike size={20} color={colors.success} />
        </View>
        <View style={styles.riderInfo}>
          <Text style={styles.riderName}>{item.full_name}</Text>
          <Text style={styles.riderEmail}>{item.email}</Text>
          <Text style={styles.riderPhone}>{item.phone}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.approveButton}
        onPress={() => approveRider(item.id)}
      >
        <CheckCircle size={16} color={colors.success} />
        <Text style={styles.approveText}>Approve Rider</Text>
      </TouchableOpacity>
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
        <Text style={styles.title}>Rider Approvals</Text>
      </View>

      <FlatList
        data={riders}
        keyExtractor={(item) => item.id}
        renderItem={renderRider}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Bike size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No pending riders</Text>
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
  list: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  riderCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  riderIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  riderEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  riderPhone: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  approveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
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
