import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, typography, spacing, borderRadius } from "@/theme";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

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
  const [displayValue, setDisplayValue] = useState(value);
  const decreasePressed = useSharedValue(0);
  const increasePressed = useSharedValue(0);
  const numberScale = useSharedValue(1);

  const sizes = {
    sm: { button: 28, icon: 14, text: 14 },
    md: { button: 36, icon: 16, text: 16 },
    lg: { button: 44, icon: 18, text: 18 },
  };

  const s = sizes[size];
  const canDecrease = value > min;
  const canIncrease = value < max;

  const decreaseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(decreasePressed.value ? 0.9 : 1, { damping: 15, stiffness: 300 }) }],
  }));

  const increaseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(increasePressed.value ? 0.9 : 1, { damping: 15, stiffness: 300 }) }],
  }));

  const numberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberScale.value }],
  }));

  const handleDecrease = () => {
    if (!canDecrease) return;
    decreasePressed.value = withSequence(withTiming(1, { duration: 50 }), withTiming(0, { duration: 100 }));
    numberScale.value = withSequence(withTiming(0.8, { duration: 50 }), withTiming(1, { duration: 100 }));
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDisplayValue(value - 1);
    onDecrease();
  };

  const handleIncrease = () => {
    if (!canIncrease) return;
    increasePressed.value = withSequence(withTiming(1, { duration: 50 }), withTiming(0, { duration: 100 }));
    numberScale.value = withSequence(withTiming(1.2, { duration: 100 }), withTiming(1, { duration: 100 }));
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDisplayValue(value + 1);
    onIncrease();
  };

  return (
    <View style={[styles.container, { height: s.button }]}>
      <AnimatedTouchable
        onPress={handleDecrease}
        onPressIn={() => decreasePressed.value = 1}
        onPressOut={() => decreasePressed.value = 0}
        disabled={!canDecrease}
        style={[
          styles.button,
          styles.leftButton,
          decreaseStyle,
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
      </AnimatedTouchable>

      <View style={[styles.valueContainer, { minWidth: s.button }]}>
        <Animated.Text style={[styles.value, { fontSize: s.text }, numberStyle]}>
          {displayValue}
        </Animated.Text>
      </View>

      <AnimatedTouchable
        onPress={handleIncrease}
        onPressIn={() => increasePressed.value = 1}
        onPressOut={() => increasePressed.value = 0}
        disabled={!canIncrease}
        style={[
          styles.button,
          styles.rightButton,
          increaseStyle,
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
      </AnimatedTouchable>
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
