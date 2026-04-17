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
  | "gray";

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: colors.primary + "20", text: colors.primary },
  secondary: { bg: colors.secondary + "20", text: colors.secondary },
  success: { bg: colors.success + "20", text: colors.success },
  warning: { bg: colors.warning + "20", text: colors.warning },
  error: { bg: colors.error + "20", text: colors.error },
  info: { bg: colors.info + "20", text: colors.info },
  gray: { bg: colors.gray200, text: colors.gray600 },
};

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = "primary",
  size = "md",
  style,
}) => {
  const { bg, text: textColor } = variantColors[variant];

  return (
    <View
      style={[
        styles.badge,
        size === "sm" && styles.sm,
        { backgroundColor: bg },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === "sm" && styles.smText,
          { color: textColor },
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
    alignSelf: "flex-start",
  },
  sm: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
  },
  text: {
    ...typography.caption,
    fontWeight: "600",
  },
  smText: {
    fontSize: 10,
  },
});
