import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle, DimensionValue } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { colors, borderRadius } from "@/theme";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ShimmerProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  width = "100%",
  height = 20,
  borderRadius: br = borderRadius.sm,
  style,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
      progress.value = 1;
      return;
    }
    progress.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, [progress, prefersReducedMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [-200, 400]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        styles.shimmer,
        {
          width,
          height,
          borderRadius: br,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.sweep, animatedStyle]} />
    </View>
  );
};

export const ShimmerCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.card, style]}>
    <Shimmer height={120} borderRadius={borderRadius.md} style={styles.image} />
    <View style={styles.content}>
      <Shimmer width="70%" height={16} style={styles.title} />
      <Shimmer width="50%" height={12} style={styles.subtitle} />
      <View style={styles.row}>
        <Shimmer width={60} height={12} />
        <Shimmer width={60} height={12} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  shimmer: {
    backgroundColor: colors.shimmer,
    overflow: "hidden",
  },
  sweep: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.3)",
    transform: [{ skewX: "-20deg" }],
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    marginBottom: 16,
  },
  image: {
    width: "100%",
  },
  content: {
    padding: 12,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
