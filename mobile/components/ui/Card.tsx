import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { colors, typography, borderRadius, spacing, shadows } from "@/theme";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  variant?: "default" | "elevated";
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  padding = "md",
  variant = "default",
}) => {
  const cardStyle = [
    styles.card,
    variant === "elevated" && styles.elevated,
    { padding: spacing[padding] },
    variant === "elevated" ? shadows.md : shadows.sm,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

interface CardTitleProps {
  children: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  subtitle,
  right,
}) => (
  <View style={styles.titleContainer}>
    <View style={styles.titleTextContainer}>
      <Text style={styles.title}>{children}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
    {right && <View>{right}</View>}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  elevated: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.borderLight,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
});
