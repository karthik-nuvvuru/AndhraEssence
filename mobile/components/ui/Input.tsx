import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { colors, typography, borderRadius, spacing } from "@/theme";

const AnimatedText = Animated.createAnimatedComponent(Text);

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  disabled?: boolean;
  style?: ViewStyle;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  onSubmitEditing?: () => void;
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  error,
  disabled = false,
  style,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  rightIcon,
  onRightIconPress,
  onSubmitEditing,
  returnKeyType,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const labelPosition = useSharedValue(value ? 1 : 0);
  const shakePosition = useSharedValue(0);

  useEffect(() => {
    labelPosition.value = withSpring(value ? 1 : 0, { damping: 15, stiffness: 200 });
  }, [value]);

  const floatingLabelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: withSpring(labelPosition.value ? -24 : 0, { damping: 15, stiffness: 200 }) },
      { scale: withSpring(labelPosition.value ? 0.85 : 1, { damping: 15, stiffness: 200 }) },
    ],
    opacity: withTiming(labelPosition.value ? 1 : 0.7, { duration: 200 }),
  }));

  const inputContainerStyle = useAnimatedStyle(() => ({
    borderColor: isFocused ? colors.primary : error ? colors.error : colors.border,
    backgroundColor: isFocused ? colors.backgroundSecondary : colors.backgroundCard,
    transform: [
      { translateX: shakePosition.value },
    ],
  }));

  const focusGlowStyle = useAnimatedStyle(() => ({
    opacity: isFocused ? 1 : 0,
  }));

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      labelPosition.value = withSpring(0, { damping: 15, stiffness: 200 });
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <AnimatedText style={[styles.floatingLabel, floatingLabelStyle]}>
          {label}
        </AnimatedText>
      )}
      <Animated.View style={[styles.inputWrapper, inputContainerStyle]}>
        <Animated.View style={[styles.focusGlow, focusGlowStyle]} />
        <TextInput
          style={[styles.input, multiline && styles.multiline]}
          placeholder={isFocused || !label ? placeholder : ""}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          selectionColor={colors.primary}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.iconButton}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  floatingLabel: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 1,
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    overflow: "hidden",
  },
  focusGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    opacity: 0,
  },
  focused: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundSecondary,
  },
  error: {
    borderColor: colors.error,
  },
  disabled: {
    backgroundColor: colors.backgroundSecondary,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: spacing.sm + 4,
    backgroundColor: "transparent",
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  iconButton: {
    padding: spacing.xs,
  },
});
