import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { userApi } from "@/services/api/endpoints";
import type { Address } from "@/types/api";

export default function AddressesScreen() {
  const insets = useSafeAreaInsets();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getAddresses();
      setAddresses(response.data);
    } catch (err: any) {
      console.error("Failed to fetch addresses:", err);
      setError(err?.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleRetry = () => {
    setError(null);
    fetchAddresses();
  };

  const handleAddAddress = () => {
    Alert.alert("Coming Soon", "Address management will be available soon");
  };

  const getAddressIcon = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes("home")) return "🏠";
    if (lower.includes("work") || lower.includes("office")) return "💼";
    return "📍";
  };

  const renderAddress = ({ item }: { item: Address }) => (
    <GlassCard style={styles.addressCard} variant="default" padding="md">
      <TouchableOpacity style={styles.addressContent} activeOpacity={0.7}>
        <View style={styles.addressIconContainer}>
          <Text style={styles.addressIcon}>{getAddressIcon(item.label)}</Text>
        </View>
        <View style={styles.addressInfo}>
          <View style={styles.addressHeader}>
            <Text style={styles.addressLabel}>{item.label}</Text>
            {item.is_default && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
          <Text style={styles.addressText}>{item.address_line}</Text>
          <Text style={styles.addressSubtext}>
            {item.city}, {item.state} {item.postal_code}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    </GlassCard>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>📍</Text>
      </View>
      <Text style={styles.emptyTitle}>No saved addresses</Text>
      <Text style={styles.emptySubtext}>
        Add an address for faster checkout
      </Text>
      <Button
        title="Add Address"
        onPress={handleAddAddress}
        variant="primary"
        size="lg"
        style={styles.addButton}
      />
    </View>
  );

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading addresses..." />;
  }

  if (error && addresses.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Addresses</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Retry"
            onPress={handleRetry}
            variant="primary"
            size="md"
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity onPress={handleAddAddress} style={styles.addButtonHeader}>
          <Text style={styles.addButtonHeaderText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={renderAddress}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.list,
          addresses.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 44,
  },
  addButtonHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  addButtonHeaderText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: "600",
  },
  list: {
    padding: spacing.md,
  },
  listEmpty: {
    flex: 1,
  },
  addressCard: {
    marginBottom: spacing.md,
  },
  addressContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  addressIcon: {
    fontSize: 24,
  },
  addressInfo: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  addressLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  defaultBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  defaultBadgeText: {
    ...typography.small,
    color: colors.success,
    fontWeight: "600",
  },
  addressText: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  addressSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 24,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundCard,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIcon: {
    fontSize: 56,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  addButton: {
    minWidth: 180,
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
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  retryButton: {
    minWidth: 120,
  },
});
