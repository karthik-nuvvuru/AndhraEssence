import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const checkReducedMotion = async () => {
      try {
        const isEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        setReducedMotion(isEnabled);
      } catch {
        // Fallback for web or older React Native versions
        setReducedMotion(false);
      }
    };

    checkReducedMotion();

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return reducedMotion;
}

// Helper to conditionally apply animation values
export function withReducedMotion<T>(
  normalValue: T,
  reducedValue: T,
  prefersReducedMotion: boolean
): T {
  return prefersReducedMotion ? reducedValue : normalValue;
}