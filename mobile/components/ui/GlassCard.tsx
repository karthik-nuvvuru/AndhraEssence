import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors, borderRadius, shadows, spacing } from "@/theme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "elevated" | "bordered";
  padding?: keyof typeof spacing;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = "default",
  padding = "md",
}) => {
  return (
    <View
      style={[
        styles.card,
        variant === "elevated" && styles.elevated,
        variant === "bordered" && styles.bordered,
        { padding: spacing[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.glass,
  },
  elevated: {
    backgroundColor: colors.backgroundCard,
    borderColor: colors.border,
  },
  bordered: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
});