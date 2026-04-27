// Add/Edit Menu Item Screen
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Switch, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { vendorApi } from "@/services/api/vendor";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

export default function VendorItemScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const isNew = params.id === "new";
  const categoryId = params.categoryId as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [preparationTime, setPreparationTime] = useState("30");
  const [saving, setSaving] = useState(false);

  const saveItem = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Item name is required");
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      Alert.alert("Error", "Valid price is required");
      return;
    }

    setSaving(true);
    try {
      const data: any = {
        category_id: categoryId,
        name,
        price: parseFloat(price),
        description,
        image_url: imageUrl || undefined,
        is_veg: isVeg,
        is_available: isAvailable,
        is_featured: isFeatured,
        preparation_time_minutes: parseInt(preparationTime) || 30,
      };

      if (isNew) {
        await vendorApi.createMenuItem(data);
      } else {
        await vendorApi.updateMenuItem(params.id as string, data);
      }
      router.back();
    } catch (error) {
      console.error("Failed to save item:", error);
      Alert.alert("Error", "Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{isNew ? "New Item" : "Edit Item"}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <GlassCard style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Chicken Biryani"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the dish..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Price (₹) *</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ width: spacing.md }} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Prep Time (min)</Text>
              <TextInput
                style={styles.input}
                value={preparationTime}
                onChangeText={setPreparationTime}
                placeholder="30"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL</Text>
            <TextInput
              style={styles.input}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://..."
              placeholderTextColor={colors.textMuted}
              keyboardType="url"
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Options</Text>
          <View style={styles.switchRow}>
            <View style={styles.vegSelector}>
              <View
                style={[
                  styles.vegBadge,
                  { borderColor: isVeg ? colors.veg : colors.nonVeg },
                ]}
              >
                <View
                  style={[
                    styles.vegDot,
                    { backgroundColor: isVeg ? colors.veg : colors.nonVeg },
                  ]}
                />
              </View>
              <Text style={styles.switchLabel}>{isVeg ? "Vegetarian" : "Non-Vegetarian"}</Text>
            </View>
            <Switch
              value={isVeg}
              onValueChange={setIsVeg}
              trackColor={{ false: colors.glass, true: colors.primary + "50" }}
              thumbColor={isVeg ? colors.primary : colors.textTertiary}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Available</Text>
            <Switch
              value={isAvailable}
              onValueChange={setIsAvailable}
              trackColor={{ false: colors.glass, true: colors.primary + "50" }}
              thumbColor={isAvailable ? colors.primary : colors.textTertiary}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Featured</Text>
            <Switch
              value={isFeatured}
              onValueChange={setIsFeatured}
              trackColor={{ false: colors.glass, true: colors.primary + "50" }}
              thumbColor={isFeatured ? colors.primary : colors.textTertiary}
            />
          </View>
        </GlassCard>

        <Button
          title={saving ? "Saving..." : "Save Item"}
          onPress={saveItem}
          disabled={saving}
          style={styles.saveButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
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
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  vegSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  vegBadge: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  switchLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
});
