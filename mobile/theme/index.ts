export const colors = {
  // Brand Colors
  primary: "#FF6B35",
  primaryLight: "#FF8F65",
  primaryDark: "#E55A25",

  // Secondary Colors
  secondary: "#2D3436",
  secondaryLight: "#636E72",
  secondaryDark: "#1E2526",

  // Accent
  accent: "#00B894",
  accentLight: "#55EFC4",
  accentDark: "#00A381",

  // Status Colors
  success: "#00B894",
  warning: "#FDCB6E",
  error: "#E74C3C",
  info: "#3498DB",

  // Neutral Colors
  white: "#FFFFFF",
  black: "#000000",
  gray50: "#F8F9FA",
  gray100: "#F1F3F5",
  gray200: "#E9ECEF",
  gray300: "#DEE2E6",
  gray400: "#CED4DA",
  gray500: "#ADB5BD",
  gray600: "#6C757D",
  gray700: "#495057",
  gray800: "#343A40",
  gray900: "#212529",

  // Background
  background: "#FFFFFF",
  backgroundSecondary: "#F8F9FA",
  surface: "#FFFFFF",

  // Text
  textPrimary: "#212529",
  textSecondary: "#6C757D",
  textLight: "#ADB5BD",
  textInverse: "#FFFFFF",

  // Order Status Colors
  orderPending: "#FDCB6E",
  orderConfirmed: "#3498DB",
  orderPreparing: "#9B59B6",
  orderReady: "#E74C3C",
  orderDelivered: "#00B894",
  orderCancelled: "#E74C3C",
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
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 40,
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
  button: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 24,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
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
