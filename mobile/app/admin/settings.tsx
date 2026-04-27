// Admin Settings Screen
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Mail, Phone, Percent, MapPin } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { extendedAdminApi } from "@/services/api/admin";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function AdminSettingsScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    platform_name: "",
    support_email: "",
    support_phone: "",
    commission_rate: "",
    min_order_amount: "",
    delivery_radius_km: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await extendedAdminApi.getSettings();
        setSettings({
          platform_name: data.platform_name || "",
          support_email: data.support_email || "",
          support_phone: data.support_phone || "",
          commission_rate: data.commission_rate?.toString() || "",
          min_order_amount: data.min_order_amount?.toString() || "",
          delivery_radius_km: data.delivery_radius_km?.toString() || "",
        });
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await extendedAdminApi.updateSettings({
        platform_name: settings.platform_name || undefined,
        support_email: settings.support_email || undefined,
        support_phone: settings.support_phone || undefined,
        commission_rate: settings.commission_rate ? parseFloat(settings.commission_rate) : undefined,
        min_order_amount: settings.min_order_amount ? parseFloat(settings.min_order_amount) : undefined,
        delivery_radius_km: settings.delivery_radius_km ? parseFloat(settings.delivery_radius_km) : undefined,
      });
      Alert.alert("Success", "Settings saved successfully");
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
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Info</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Platform Name</Text>
            <TextInput
              style={styles.input}
              value={settings.platform_name}
              onChangeText={(text) => setSettings({ ...settings, platform_name: text })}
              placeholder="AndhraEssence"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Support Contact</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={settings.support_email}
              onChangeText={(text) => setSettings({ ...settings, support_email: text })}
              placeholder="support@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={settings.support_phone}
              onChangeText={(text) => setSettings({ ...settings, support_phone: text })}
              placeholder="+91-XXXXXXXXXX"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />
          </View>
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Business Settings</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Commission Rate (%)</Text>
            <TextInput
              style={styles.input}
              value={settings.commission_rate}
              onChangeText={(text) => setSettings({ ...settings, commission_rate: text })}
              placeholder="15"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Minimum Order Amount (₹)</Text>
            <TextInput
              style={styles.input}
              value={settings.min_order_amount}
              onChangeText={(text) => setSettings({ ...settings, min_order_amount: text })}
              placeholder="50"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery Radius (km)</Text>
            <TextInput
              style={styles.input}
              value={settings.delivery_radius_km}
              onChangeText={(text) => setSettings({ ...settings, delivery_radius_km: text })}
              placeholder="10"
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
  saveButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xxxl,
  },
});
