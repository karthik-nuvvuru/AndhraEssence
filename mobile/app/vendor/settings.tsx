// Vendor Restaurant Settings Screen
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Save, Clock, MapPin, Phone, Mail } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { vendorApi } from "@/services/api/vendor";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface RestaurantSettings {
  name?: string;
  description?: string;
  cuisine_type?: string;
  phone?: string;
  email?: string;
  delivery_fee?: number;
  minimum_order?: number;
  is_open?: boolean;
  opening_time?: string;
  closing_time?: string;
}

export default function VendorSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<RestaurantSettings>({
    is_open: true,
  });

  React.useEffect(() => {
    // In a real app, fetch current settings from API
    setLoading(false);
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await vendorApi.updateRestaurant(settings);
      Alert.alert("Success", "Settings saved successfully");
      router.back();
    } catch (error) {
      console.error("Failed to save settings:", error);
      Alert.alert("Error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
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
        <Text style={styles.title}>Restaurant Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Info</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Restaurant Name</Text>
            <TextInput
              style={styles.input}
              value={settings.name}
              onChangeText={(text) => setSettings({ ...settings, name: text })}
              placeholder="Enter restaurant name"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={settings.description}
              onChangeText={(text) => setSettings({ ...settings, description: text })}
              placeholder="Enter description"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cuisine Type</Text>
            <TextInput
              style={styles.input}
              value={settings.cuisine_type}
              onChangeText={(text) => setSettings({ ...settings, cuisine_type: text })}
              placeholder="e.g., Indian, Chinese"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={settings.phone}
              onChangeText={(text) => setSettings({ ...settings, phone: text })}
              placeholder="+91-XXXXXXXXXX"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={settings.email}
              onChangeText={(text) => setSettings({ ...settings, email: text })}
              placeholder="email@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Business Hours</Text>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Opening Time</Text>
              <TextInput
                style={styles.input}
                value={settings.opening_time}
                onChangeText={(text) => setSettings({ ...settings, opening_time: text })}
                placeholder="09:00"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={{ width: spacing.md }} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Closing Time</Text>
              <TextInput
                style={styles.input}
                value={settings.closing_time}
                onChangeText={(text) => setSettings({ ...settings, closing_time: text })}
                placeholder="22:00"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Orders</Text>
          <View style={styles.row}>
            <Text style={styles.toggleLabel}>Accepting Orders</Text>
            <Switch
              value={settings.is_open}
              onValueChange={(value) => setSettings({ ...settings, is_open: value })}
              trackColor={{ false: colors.glass, true: colors.primary + "50" }}
              thumbColor={settings.is_open ? colors.primary : colors.textTertiary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Minimum Order (₹)</Text>
            <TextInput
              style={styles.input}
              value={settings.minimum_order?.toString()}
              onChangeText={(text) =>
                setSettings({ ...settings, minimum_order: parseFloat(text) || 0 })
              }
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery Fee (₹)</Text>
            <TextInput
              style={styles.input}
              value={settings.delivery_fee?.toString()}
              onChangeText={(text) =>
                setSettings({ ...settings, delivery_fee: parseFloat(text) || 0 })
              }
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />
          </View>
        </GlassCard>

        <Button
          title={saving ? "Saving..." : "Save Settings"}
          onPress={saveSettings}
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
  content: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  section: {
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  saveButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xxxl,
  },
});
