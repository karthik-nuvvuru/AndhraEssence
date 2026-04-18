// Premium Purple Theme - Glassmorphism Dark
// Zomato/Uber Eats quality with fintech/AI aesthetic

export const colors = {
  // Background Colors (Deep Dark)
  background: "#0B0B0F",
  backgroundSecondary: "#141419",
  backgroundCard: "#1C1C22",
  backgroundElevated: "#222228",
  backgroundHover: "#2A2A32",

  // Brand Primary (Purple)
  primary: "#7C3AED",
  primaryLight: "#8B5CF6",
  primaryDark: "#6D28D9",
  primaryGlow: "rgba(124, 58, 237, 0.25)",

  // Secondary (Cyan)
  secondary: "#06B6D4",
  secondaryLight: "#22D3EE",
  secondaryDark: "#0891B2",

  // Accent (Gold/Amber)
  accent: "#F59E0B",
  accentLight: "#FBBF24",
  accentDark: "#D97706",

  // Status Colors
  success: "#10B981",
  successBg: "rgba(16, 185, 129, 0.12)",
  warning: "#F59E0B",
  warningBg: "rgba(245, 158, 11, 0.12)",
  error: "#EF4444",
  errorBg: "rgba(239, 68, 68, 0.12)",
  info: "#3B82F6",
  infoBg: "rgba(59, 130, 246, 0.12)",

  // Border Colors
  border: "rgba(255, 255, 255, 0.08)",
  borderLight: "rgba(255, 255, 255, 0.12)",
  borderFocus: "#7C3AED",

  // Text Colors
  textPrimary: "#FFFFFF",
  textSecondary: "#A1A1AA",
  textTertiary: "#71717A",
  textMuted: "#52525B",

  // Neutral Colors
  white: "#FFFFFF",
  black: "#000000",

  // Order Status Colors
  orderPending: "#F59E0B",
  orderConfirmed: "#3B82F6",
  orderPreparing: "#8B5CF6",
  orderReady: "#EF4444",
  orderDelivered: "#10B981",
  orderCancelled: "#EF4444",

  // Veg/Non-veg
  veg: "#10B981",
  nonVeg: "#EF4444",

  // Glassmorphism
  glass: "rgba(255, 255, 255, 0.05)",
  glassBorder: "rgba(255, 255, 255, 0.10)",
  glassHover: "rgba(255, 255, 255, 0.08)",

  // Misc
  overlay: "rgba(0, 0, 0, 0.6)",
  shimmer: "#1C1C22",
  shimmerHighlight: "#2A2A32",

  // Gradient overlays
  gradientStart: "rgba(0,0,0,0)",
  gradientEnd: "rgba(0,0,0,0.7)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  display: {
    fontSize: 36,
    fontWeight: "700" as const,
    lineHeight: 44,
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
    fontWeight: "600" as const,
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
  glow: {
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
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