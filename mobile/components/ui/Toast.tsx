import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Platform, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Check, X, Info, AlertTriangle } from "lucide-react-native";
import { colors, typography, spacing, borderRadius } from "@/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<Toast | null>(null);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const progress = useSharedValue(1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hideToastInternal = useCallback(() => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(50, { duration: 200 });
    setTimeout(() => setToast(null), 200);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    // Reset values
    translateX.value = 0;
    translateY.value = 50;
    opacity.value = 0;
    progress.value = 1;

    setToast({ id: Date.now().toString(), message, type });

    // Entrance animation
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 200 });

    // Progress countdown
    const startTime = Date.now();
    const duration = 3000;
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      progress.value = Math.max(0, 1 - elapsed / duration);
      if (elapsed >= duration) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }
    }, 50);

    // Auto dismiss after 3 seconds
    timeoutRef.current = setTimeout(() => {
      hideToastInternal();
    }, 3000);
  }, [hideToastInternal]);

  const hideToast = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    hideToastInternal();
  }, [hideToastInternal]);

  // Swipe gesture
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.3;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 100 || Math.abs(e.translationY) > 80) {
        translateX.value = withTiming(e.translationX > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH, { duration: 200 });
        runOnJS(hideToast)();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const toastConfig: Record<ToastType, { bg: string; IconComponent: React.ComponentType<any>; iconColor: string }> = {
    success: { bg: colors.successBg, IconComponent: Check, iconColor: colors.success },
    error: { bg: colors.errorBg, IconComponent: X, iconColor: colors.error },
    info: { bg: colors.infoBg, IconComponent: Info, iconColor: colors.info },
    warning: { bg: colors.warningBg, IconComponent: AlertTriangle, iconColor: colors.warning },
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[styles.container, animatedStyle]}
            pointerEvents="box-none"
          >
            <View style={[styles.toast, { backgroundColor: toastConfig[toast.type].bg }]}>
              <View style={[styles.progressBar, { backgroundColor: toastConfig[toast.type].iconColor + "30" }]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { backgroundColor: toastConfig[toast.type].iconColor },
                    progressStyle,
                  ]}
                />
              </View>
              <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: toastConfig[toast.type].iconColor }]}>
                  {(() => {
                    const IconC = toastConfig[toast.type].IconComponent;
                    return <IconC size={14} color={colors.white} />;
                  })()}
                </View>
                <Text style={styles.message}>{toast.message}</Text>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 90 : 70,
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
  },
  toast: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...Platform.select({
      web: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  progressBar: {
    height: 3,
    width: "100%",
  },
  progressFill: {
    height: "100%",
    borderRadius: 1.5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
});
