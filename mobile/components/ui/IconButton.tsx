import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, spacing, shadows } from "@/theme";

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "ghost";
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = "md",
  variant = "default",
  style,
}) => {
  const sizes = {
    sm: { button: 32, icon: 16 },
    md: { button: 44, icon: 20 },
    lg: { button: 56, icon: 24 },
  };

  const s = sizes[size];

  const getBackgroundColor = () => {
    switch (variant) {
      case "primary":
        return colors.primary;
      case "ghost":
        return "transparent";
      default:
        return colors.backgroundElevated;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "primary":
        return colors.white;
      case "ghost":
        return colors.textSecondary;
      default:
        return colors.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          width: s.button,
          height: s.button,
          borderRadius: s.button / 2,
          backgroundColor: getBackgroundColor(),
        },
        variant === "default" && shadows.sm,
        style,
      ]}
    >
      <Text style={[styles.icon, { fontSize: s.icon, color: getIconColor() }]}>
        {icon}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontWeight: "600",
  },
});
