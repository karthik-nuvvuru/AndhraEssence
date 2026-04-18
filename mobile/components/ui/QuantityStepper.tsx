import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, typography, spacing, borderRadius } from "@/theme";

interface QuantityStepperProps {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onIncrease,
  onDecrease,
  min = 0,
  max = 99,
  size = "md",
}) => {
  const sizes = {
    sm: { button: 28, icon: 14, text: 14 },
    md: { button: 36, icon: 16, text: 16 },
    lg: { button: 44, icon: 18, text: 18 },
  };

  const s = sizes[size];
  const canDecrease = value > min;
  const canIncrease = value < max;

  return (
    <View style={[styles.container, { height: s.button }]}>
      <TouchableOpacity
        onPress={onDecrease}
        disabled={!canDecrease}
        style={[
          styles.button,
          styles.leftButton,
          { width: s.button, height: s.button, borderRadius: s.button / 2 },
          !canDecrease && styles.buttonDisabled,
        ]}
      >
        <Text
          style={[
            styles.icon,
            { fontSize: s.icon },
            !canDecrease && styles.iconDisabled,
          ]}
        >
          −
        </Text>
      </TouchableOpacity>

      <View style={[styles.valueContainer, { minWidth: s.button }]}>
        <Text style={[styles.value, { fontSize: s.text }]}>{value}</Text>
      </View>

      <TouchableOpacity
        onPress={onIncrease}
        disabled={!canIncrease}
        style={[
          styles.button,
          styles.rightButton,
          { width: s.button, height: s.button, borderRadius: s.button / 2 },
          !canIncrease && styles.buttonDisabled,
        ]}
      >
        <Text
          style={[
            styles.icon,
            { fontSize: s.icon },
            !canIncrease && styles.iconDisabled,
          ]}
        >
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundElevated,
  },
  leftButton: {
    borderTopLeftRadius: borderRadius.full,
    borderBottomLeftRadius: borderRadius.full,
  },
  rightButton: {
    borderTopRightRadius: borderRadius.full,
    borderBottomRightRadius: borderRadius.full,
  },
  buttonDisabled: {
    backgroundColor: colors.backgroundSecondary,
    opacity: 0.5,
  },
  icon: {
    color: colors.primary,
    fontWeight: "600",
  },
  iconDisabled: {
    color: colors.textTertiary,
  },
  valueContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  value: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
});
