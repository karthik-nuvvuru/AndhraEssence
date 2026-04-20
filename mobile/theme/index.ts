// Premium Coral/Orange Theme - Zomato/Swiggy Quality
// World-class food delivery design system

export const colors = {
  // Background Colors (Warm Charcoal)
  background: "#18181B",
  backgroundSecondary: "#1F1F23",
  backgroundCard: "#27272A",
  backgroundElevated: "#2E2E32",
  backgroundHover: "#3A3A3F",

  // Brand Primary (Coral/Orange)
  primary: "#FF4500",
  primaryLight: "#FF6B35",
  primaryDark: "#E63D00",
  primaryGlow: "rgba(255, 69, 0, 0.2)",
  primaryGlowStrong: "rgba(255, 69, 0, 0.35)",

  // Secondary (Warm Orange)
  secondary: "#FF8C42",
  secondaryLight: "#FFA366",
  secondaryDark: "#E67332",

  // Accent (Electric Yellow)
  accent: "#FFD60A",
  accentLight: "#FFE44D",
  accentDark: "#E6BE00",
  accentGlow: "rgba(255, 214, 10, 0.2)",

  // Status Colors
  success: "#22C55E",
  successBg: "rgba(34, 197, 94, 0.12)",
  warning: "#F59E0B",
  warningBg: "rgba(245, 158, 11, 0.12)",
  error: "#EF4444",
  errorBg: "rgba(239, 68, 68, 0.12)",
  info: "#3B82F6",
  infoBg: "rgba(59, 130, 246, 0.12)",

  // Border Colors
  border: "rgba(255, 255, 255, 0.08)",
  borderLight: "rgba(255, 255, 255, 0.12)",
  borderFocus: "#FF4500",

  // Text Colors
  textPrimary: "#FFFFFF",
  textSecondary: "#A1A1AA",
  textTertiary: "#71717A",
  textMuted: "#52525B",

  // Neutral Colors
  white: "#FFFFFF",
  black: "#000000",
  gray100: "#F4F4F5",
  gray200: "#E4E4E7",
  gray300: "#D4D4D8",
  gray400: "#A1A1AA",

  // Order Status Colors
  orderPending: "#F59E0B",
  orderConfirmed: "#3B82F6",
  orderPreparing: "#FF6B35",
  orderReady: "#EF4444",
  orderInTransit: "#FF8C42",
  orderDelivered: "#22C55E",
  orderCancelled: "#EF4444",

  // Veg/Non-veg
  veg: "#22C55E",
  nonVeg: "#EF4444",

  // Glassmorphism
  glass: "rgba(255, 255, 255, 0.05)",
  glassBorder: "rgba(255, 255, 255, 0.10)",
  glassHover: "rgba(255, 255, 255, 0.08)",

  // Coral gradient presets
  gradientCoralStart: "#FF4500",
  gradientCoralEnd: "#FF6B35",
  gradientYellowStart: "#FFD60A",
  gradientYellowEnd: "#FFA500",

  // Misc
  overlay: "rgba(0, 0, 0, 0.6)",
  shimmer: "#1E1E1E",
  shimmerHighlight: "#2A2A2A",

  // Gradient overlays
  gradientStart: "rgba(0,0,0,0)",
  gradientEnd: "rgba(0,0,0,0.7)",

  // Live/Status indicators
  liveGreen: "#22C55E",
  liveGreenGlow: "rgba(34, 197, 94, 0.3)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const typography = {
  hero: {
    fontSize: 40,
    fontWeight: "800" as const,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 24,
    fontWeight: "700" as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: "600" as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
  },
  small: {
    fontSize: 11,
    fontWeight: "500" as const,
    lineHeight: 14,
  },
  button: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  coral: {
    shadowColor: "#FF4500",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  coralStrong: {
    shadowColor: "#FF4500",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  glow: {
    shadowColor: "#FF4500",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 6,
  },
  glass: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
};

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
};

export type Theme = typeof theme;
