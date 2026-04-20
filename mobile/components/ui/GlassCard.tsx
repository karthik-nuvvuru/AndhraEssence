import React from "react";
import { View, StyleSheet, ViewStyle, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { colors, borderRadius, spacing } from "@/theme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "elevated" | "bordered";
  padding?: keyof typeof spacing;
  blurAmount?: number;
  testID?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = "default",
  padding = "md",
  blurAmount = 20,
  testID,
}) => {
  if (Platform.OS === "web" || variant !== "default") {
    // Web and non-default variants: use static styles
    return (
      <View
        testID={testID}
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
  }

  return (
    <View testID={testID}>
      <BlurView
        intensity={blurAmount}
        tint="dark"
        style={[
          styles.card,
          { padding: spacing[padding] },
          style,
        ]}
      >
        <View style={styles.borderOverlay} />
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: "hidden",
  },
  borderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
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