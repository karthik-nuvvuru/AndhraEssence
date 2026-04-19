import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { colors, typography, borderRadius, spacing, shadows } from "@/theme";
import * as Haptics from "expo-haptics";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  leftIcon,
}) => {
  const isGradient = variant === "gradient";
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(pressed.value ? 0.96 : 1, { damping: 15, stiffness: 300 }) },
    ],
  }));

  const handlePressIn = () => {
    pressed.value = 1;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    pressed.value = 0;
  };

  const buttonStyles = [
    styles.base,
    !isGradient && styles[variant],
    isGradient && styles.gradient,
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text` as keyof typeof styles],
    styles[`${size}Text` as keyof typeof styles],
    disabled && styles.disabledText,
    textStyle,
  ];

  // On web, use onClick in addition to onPress for React Native Web compatibility
  const handlePress = Platform.OS === 'web' ? (e: any) => {
    e?.persist?.();
    onPress();
  } : onPress;

  return (
    <AnimatedTouchable
      style={[buttonStyles, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      {isGradient ? (
        <View style={styles.gradientInner}>
          <View style={styles.gradientOverlay} />
          <View style={styles.gradientContent}>
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                {leftIcon && <Text style={styles.icon}>{leftIcon}</Text>}
                <Text style={[textStyles, styles.gradientText]}>{title}</Text>
              </>
            )}
          </View>
        </View>
      ) : loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.white : colors.primary}
          size="small"
        />
      ) : (
        <>
          {leftIcon && <Text style={styles.icon}>{leftIcon}</Text>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.md,
  },
  primary: {
    backgroundColor: colors.primary,
    ...shadows.glow,
  },
  secondary: {
    backgroundColor: colors.backgroundElevated,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  gradient: {
    backgroundColor: colors.primary,
    overflow: "hidden",
    ...shadows.glow,
  },
  sm: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    minHeight: 36,
  },
  md: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    minHeight: 46,
  },
  lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 54,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    ...typography.button,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  outlineText: {
    color: colors.primary,
  },
  ghostText: {
    color: colors.primary,
  },
  smText: {
    fontSize: 14,
  },
  mdText: {
    fontSize: 15,
  },
  lgText: {
    fontSize: 18,
  },
  disabledText: {
    opacity: 0.6,
  },
  icon: {
    marginRight: spacing.xs,
    fontSize: 16,
  },
  gradientInner: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: borderRadius.md,
  },
  gradientContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    paddingHorizontal: spacing.lg,
  },
  gradientText: {
    color: colors.white,
    fontWeight: "700",
  },
});
