import { useEffect, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useReducedMotion } from './useReducedMotion';

interface UseStaggeredAnimationOptions {
  itemCount: number;
  staggerDelay?: number;
  duration?: number;
}

export function useStaggeredAnimation({
  itemCount,
  staggerDelay = 50,
  duration = 300,
}: UseStaggeredAnimationOptions) {
  const prefersReducedMotion = useReducedMotion();
  const containerOpacity = useSharedValue(prefersReducedMotion ? 1 : 0);
  const itemOpacityValues = useSharedValue(0);
  const itemTranslateYValues = useSharedValue(20);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      containerOpacity.value = 1;
      itemOpacityValues.value = 1;
      itemTranslateYValues.value = 0;
      hasAnimated.current = true;
      return;
    }

    if (hasAnimated.current) return;
    hasAnimated.current = true;

    containerOpacity.value = withTiming(1, { duration: 200 });

    // Stagger each item
    for (let i = 0; i < itemCount; i++) {
      const delay = i * staggerDelay;
      setTimeout(() => {
        itemOpacityValues.value = withTiming(1, {
          duration,
          easing: Easing.out(Easing.ease),
        });
        itemTranslateYValues.value = withSpring(0, {
          damping: 15,
          stiffness: 200,
        });
      }, delay);
    }
  }, [itemCount, staggerDelay, duration, prefersReducedMotion]);

  const getItemAnimatedStyle = (index: number) => {
    return useAnimatedStyle(() => {
      return {
        opacity: withTiming(itemOpacityValues.value, { duration }),
        transform: [
          {
            translateY: withSpring(itemTranslateYValues.value, {
              damping: 15,
              stiffness: 200,
            }),
          },
        ],
      };
    });
  };

  return {
    containerStyle: useAnimatedStyle(() => ({
      opacity: containerOpacity.value,
    })),
    getItemAnimatedStyle,
  };
}

// Lightweight version for simple staggered lists
export function useSimpleStagger(items: any[], delay = 50) {
  const prefersReducedMotion = useReducedMotion();
  const opacity = useSharedValue(prefersReducedMotion ? 1 : 0);
  const translateY = useSharedValue(prefersReducedMotion ? 0 : 20);
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    if (items.length === 0) return;
    triggered.current = true;

    if (prefersReducedMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }

    opacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) });
    translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
  }, [items.length, prefersReducedMotion]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}