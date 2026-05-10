import React from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useReducedMotion } from './useReducedMotion';

interface AnimatedPressProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  disabled?: boolean;
  scaleValue?: number;
  testID?: string;
}

export function AnimatedPressable({
  children,
  onPress,
  style,
  disabled = false,
  scaleValue = 0.97,
  testID,
}: AnimatedPressProps) {
  const prefersReducedMotion = useReducedMotion();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(pressed.value ? scaleValue : 1, {
            damping: 15,
            stiffness: 300,
          }),
        },
      ],
    };
  });

  const handlePressIn = () => {
    if (prefersReducedMotion) return;
    pressed.value = 1;
    if (onPress && !disabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (prefersReducedMotion) return;
    pressed.value = 0;
  };

  const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

  return (
    <AnimatedPressableComponent
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.pressable, style, animatedStyle]}
      testID={testID}
    >
      {children}
    </AnimatedPressableComponent>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});