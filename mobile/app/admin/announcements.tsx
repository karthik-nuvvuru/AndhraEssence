// Admin Announcements Screen
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Send, Users } from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "@/theme";
import { extendedAdminApi } from "@/services/api/admin";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

const ROLES = [
  { key: "customer", label: "Customers" },
  { key: "restaurant_owner", label: "Vendors" },
  { key: "rider", label: "Riders" },
  { key: "admin", label: "Admins" },
];

export default function AdminAnnouncementsScreen() {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const sendAnnouncement = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }
    if (!body.trim()) {
      Alert.alert("Error", "Message body is required");
      return;
    }
    if (selectedRoles.length === 0) {
      Alert.alert("Error", "Select at least one target group");
      return;
    }

    setSending(true);
    try {
      const result = await extendedAdminApi.createAnnouncement({
        title,
        body,
        target_roles: selectedRoles,
        is_active: true,
      });
      Alert.alert("Success", `Announcement sent to ${result.recipients} users`);
      setTitle("");
      setBody("");
      setSelectedRoles([]);
    } catch (error) {
      console.error("Failed to send announcement:", error);
      Alert.alert("Error", "Failed to send announcement");
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Announcements</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <GlassCard style={styles.card}>
          <Text style={styles.sectionTitle}>Create Announcement</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Important Update"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={body}
              onChangeText={setBody}
              placeholder="Type your announcement message..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Send To</Text>
            <View style={styles.rolesGrid}>
              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role.key}
                  style={[
                    styles.roleChip,
                    selectedRoles.includes(role.key) && styles.roleChipActive,
                  ]}
                  onPress={() => toggleRole(role.key)}
                >
                  <Users size={14} color={selectedRoles.includes(role.key) ? colors.white : colors.textSecondary} />
                  <Text
                    style={[
                      styles.roleChipText,
                      selectedRoles.includes(role.key) && styles.roleChipTextActive,
                    ]}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title={sending ? "Sending..." : "Send Announcement"}
            onPress={sendAnnouncement}
            disabled={sending}
            style={styles.sendButton}
          />
        </GlassCard>
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
    marginBottom: spacing.sm,
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
    height: 100,
    textAlignVertical: "top",
  },
  rolesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glass,
    gap: spacing.xs,
  },
  roleChipActive: {
    backgroundColor: colors.primary,
  },
  roleChipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  roleChipTextActive: {
    color: colors.white,
  },
  sendButton: {
    marginTop: spacing.lg,
  },
});
