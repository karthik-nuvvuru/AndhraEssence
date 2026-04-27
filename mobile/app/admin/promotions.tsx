// Admin Promotions Management Screen
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tag, Plus, Trash2, Edit2 } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { extendedAdminApi } from "@/services/api/admin";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface Promotion {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  maximum_uses: number;
  current_uses: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

export default function AdminPromotionsScreen() {
  const insets = useSafeAreaInsets();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "0",
    max_uses: "100",
    valid_from: "",
    valid_until: "",
  });

  const fetchPromotions = async () => {
    try {
      const data = await extendedAdminApi.getPromotions();
      setPromotions(data);
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPromotions();
  };

  const createPromotion = async () => {
    if (!formData.code || !formData.discount_value) {
      Alert.alert("Error", "Code and discount value are required");
      return;
    }

    try {
      await extendedAdminApi.createPromotion({
        code: formData.code,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_order_amount: parseFloat(formData.min_order_amount) || 0,
        max_uses: parseInt(formData.max_uses) || 100,
        valid_from: formData.valid_from || new Date().toISOString(),
        valid_until: formData.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
      });
      Alert.alert("Success", "Promotion created");
      setShowForm(false);
      setFormData({ code: "", discount_type: "percentage", discount_value: "", min_order_amount: "0", max_uses: "100", valid_from: "", valid_until: "" });
      fetchPromotions();
    } catch (error) {
      console.error("Failed to create promotion:", error);
      Alert.alert("Error", "Failed to create promotion");
    }
  };

  const deletePromotion = async (promotionId: string) => {
    Alert.alert("Delete Promotion", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await extendedAdminApi.deletePromotion(promotionId);
            fetchPromotions();
          } catch (error) {
            console.error("Failed to delete promotion:", error);
          }
        },
      },
    ]);
  };

  const renderPromotion = ({ item }: { item: Promotion }) => (
    <GlassCard style={styles.promotionCard}>
      <View style={styles.cardHeader}>
        <View style={styles.promotionInfo}>
          <Text style={styles.promotionCode}>{item.code}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.is_active ? colors.successBg : colors.errorBg }]}>
            <Text style={[styles.statusText, { color: item.is_active ? colors.success : colors.error }]}>
              {item.is_active ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => deletePromotion(item.id)}>
            <Trash2 size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.promotionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Discount</Text>
          <Text style={styles.detailValue}>
            {item.discount_type === "percentage" ? `${item.discount_value}%` : `₹${item.discount_value}`}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Min Order</Text>
          <Text style={styles.detailValue}>₹{item.min_order_amount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Uses</Text>
          <Text style={styles.detailValue}>{item.current_uses}/{item.maximum_uses}</Text>
        </View>
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
        <Text style={styles.title}>Promotions</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(!showForm)}>
          <Plus size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <GlassCard style={styles.formCard}>
          <Text style={styles.formTitle}>Create Promotion</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Code</Text>
            <TextInput
              style={styles.input}
              value={formData.code}
              onChangeText={(text) => setFormData({ ...formData, code: text.toUpperCase() })}
              placeholder="SAVE20"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Discount Value</Text>
            <TextInput
              style={styles.input}
              value={formData.discount_value}
              onChangeText={(text) => setFormData({ ...formData, discount_value: text })}
              placeholder="20"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Uses</Text>
            <TextInput
              style={styles.input}
              value={formData.max_uses}
              onChangeText={(text) => setFormData({ ...formData, max_uses: text })}
              placeholder="100"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
            />
          </View>
          <Button title="Create Promotion" onPress={createPromotion} style={styles.submitButton} />
        </GlassCard>
      )}

      <FlatList
        data={promotions}
        keyExtractor={(item) => item.id}
        renderItem={renderPromotion}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Tag size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No promotions yet</Text>
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
  formCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  formTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.glass,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  list: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  promotionCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  promotionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  promotionCode: {
    ...typography.h4,
    color: colors.textPrimary,
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
  cardActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  promotionDetails: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  detailValue: {
    ...typography.body,
    color: colors.textPrimary,
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
