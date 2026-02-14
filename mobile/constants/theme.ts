/**
 * Karajo Companion Design System
 * Based on Stitch design specifications
 */

export const Colors = {
  light: {
    primary: '#00979D',
    primaryLight: '#2FBFC4',
    primaryDark: '#007F84',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    appBackground: '#EBEEF2',
    foreground: '#1A1A1A',
    secondaryText: '#6B7280',
    tertiaryText: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F1F5F9',
    destructive: '#B91C1C',
    destructiveLight: '#FEE2E2',
    success: '#1E7F4E',
    successLight: '#D1FAE5',
    warning: '#B45309',
    warningLight: '#FEF3C7',
    info: '#005FCC',
    infoLight: '#DBEAFE',
    ring: '#FFBF47',
    card: '#FFFFFF',
    muted: '#F1F5F9',
    tabInactive: '#6B7280',
    tabActive: '#00979D',
    badge: '#B91C1C',
    badgeText: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
    skeleton: '#E5E7EB',
  },
  dark: {
    primary: '#2FBFC4',
    primaryLight: '#00979D',
    primaryDark: '#007F84',
    background: '#121212',
    surface: '#1E1E1E',
    appBackground: '#0F172A',
    foreground: '#EDEDED',
    secondaryText: '#9CA3AF',
    tertiaryText: '#6B7280',
    border: '#374151',
    borderLight: '#1F2937',
    destructive: '#F87171',
    destructiveLight: '#7F1D1D',
    success: '#34D399',
    successLight: '#064E3B',
    warning: '#FBBF24',
    warningLight: '#78350F',
    info: '#60A5FA',
    infoLight: '#1E3A5F',
    ring: '#FFBF47',
    card: '#1E1E1E',
    muted: '#1F2937',
    tabInactive: '#6B7280',
    tabActive: '#2FBFC4',
    badge: '#B91C1C',
    badgeText: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.7)',
    skeleton: '#374151',
  },
} as const;

export const Typography = {
  h1: {
    fontSize: 24,
    fontFamily: 'NotoSans_700Bold',
    lineHeight: 32,
  },
  h2: {
    fontSize: 20,
    fontFamily: 'NotoSans_600SemiBold',
    lineHeight: 28,
  },
  h3: {
    fontSize: 16,
    fontFamily: 'NotoSans_600SemiBold',
    lineHeight: 24,
  },
  body: {
    fontSize: 14,
    fontFamily: 'NotoSans_400Regular',
    lineHeight: 20,
  },
  bodyMedium: {
    fontSize: 14,
    fontFamily: 'NotoSans_500Medium',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontFamily: 'NotoSans_400Regular',
    lineHeight: 16,
  },
  overline: {
    fontSize: 11,
    fontFamily: 'NotoSans_500Medium',
    lineHeight: 16,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  mono: {
    fontSize: 14,
    fontFamily: 'JetBrainsMono_500Medium',
    lineHeight: 20,
  },
  monoLarge: {
    fontSize: 20,
    fontFamily: 'JetBrainsMono_700Bold',
    lineHeight: 28,
  },
  monoClock: {
    fontSize: 32,
    fontFamily: 'JetBrainsMono_700Bold',
    lineHeight: 40,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const Shadows = {
  card: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  cardHover: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  bottomNav: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  button: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;

export const IconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
} as const;

export const API_BASE_URL = 'https://api.karajo.id';

export const ApprovalColors: Record<string, string> = {
  procurement: '#00979D',
  finance: '#B45309',
  hr: '#005FCC',
  inventory: '#1E7F4E',
  production: '#7C3AED',
};
