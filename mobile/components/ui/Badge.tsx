import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, typography, borderRadius, spacing } from "@/theme";

type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "gray"
  | "glow";

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  style?: ViewStyle;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.primaryBg, text: colors.primary, border: colors.primary },
  secondary: { bg: colors.backgroundElevated, text: colors.textSecondary, border: colors.border },
  success: { bg: colors.successBg, text: colors.success, border: colors.success },
  warning: { bg: colors.warningBg, text: colors.warning, border: colors.warning },
  error: { bg: colors.errorBg, text: colors.error, border: colors.error },
  info: { bg: colors.infoBg, text: colors.info, border: colors.info },
  gray: { bg: colors.backgroundElevated, text: colors.textTertiary, border: colors.border },
  glow: { bg: colors.primaryGlow, text: colors.primary, border: colors.primary },
};

// Add missing color aliases that theme doesn't have
const extendedColors = {
  primaryBg: "rgba(255, 107, 53, 0.15)",
  ...colors,
};

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = "primary",
  size = "md",
  style,
}) => {
  const variantStyle = variantStyles[variant];

  return (
    <View
      style={[
        styles.badge,
        size === "sm" && styles.sm,
        {
          backgroundColor: variantStyle.bg,
          borderColor: variantStyle.border,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === "sm" && styles.smText,
          { color: variantStyle.text },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  sm: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
  },
  text: {
    ...typography.small,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  smText: {
    fontSize: 10,
  },
});
