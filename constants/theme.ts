/**
 * Modern Design System - Inspired by Apple, Spotify, and Material Design 3
 * World-class color palette, gradients, shadows, spacing, and animations
 */

import { Platform } from 'react-native';

const tintColorLight = '#6366F1';
const tintColorDark = '#818CF8';

export const Colors = {
  light: {
    // ===== TEXT COLORS =====
    text: '#0F172A',           // Rich black - better contrast
    textSecondary: '#64748B',  // Slate gray
    textLight: '#94A3B8',      // Light slate
    textMuted: '#CBD5E1',      // Very light slate

    // ===== BACKGROUNDS =====
    background: '#F8FAFC',     // Off-white, less stark
    backgroundSecondary: '#F1F5F9',

    // ===== CARDS & SURFACES =====
    card: '#FFFFFF',
    cardSecondary: '#F8FAFC',
    cardHover: '#F1F5F9',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',

    // ===== PRIMARY BRAND COLORS =====
    primary: '#6366F1',        // Vibrant Indigo
    primaryDark: '#4F46E5',    // Deeper Indigo
    primaryLight: '#A5B4FC',   // Light Indigo
    primaryLighter: '#E0E7FF', // Very light Indigo

    // ===== ACCENT COLORS =====
    accent: '#EC4899',         // Hot Pink
    accentLight: '#FBCFE8',

    // ===== SEMANTIC COLORS =====
    success: '#10B981',        // Emerald
    successLight: '#D1FAE5',
    warning: '#F59E0B',        // Amber
    warningLight: '#FEF3C7',
    error: '#EF4444',          // Red
    errorLight: '#FEE2E2',
    info: '#3B82F6',           // Blue
    infoLight: '#DBEAFE',

    // ===== BORDERS & DIVIDERS =====
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    divider: '#E2E8F0',

    // ===== ICONS =====
    icon: '#64748B',
    iconActive: '#0F172A',
    iconMuted: '#94A3B8',

    // ===== INPUTS & SEARCH =====
    searchBackground: '#F8FAFC',
    searchBorder: '#E2E8F0',
    inputBackground: '#FFFFFF',
    inputBorder: '#E2E8F0',
    inputFocus: '#6366F1',
    placeholder: '#94A3B8',
    inputText: '#0F172A',

    // ===== BANNER =====
    bannerBackground: '#6366F1',
    bannerText: '#FFFFFF',
    bannerButton: '#FFFFFF',
    bannerButtonText: '#6366F1',

    // ===== PROFILE SPECIFIC =====
    profileBackground: '#FFFFFF',
    profileGradientStart: '#6366F1',
    profileGradientEnd: '#8B5CF6',
    profileCard: '#FFFFFF',
    profilePrimary: '#6366F1',
    profileIconBg: '#EEF2FF',
    profileAccent: '#EC4899',

    // ===== FAVORITES SPECIFIC =====
    favoritesGradientStart: '#A78BFA',
    favoritesGradientEnd: '#EC4899',
    favoritesEmptyBg: '#F8FAFC',

    // ===== TAB BAR =====
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#6366F1',
    tabIndicator: '#6366F1',
    tint: tintColorLight,

    // ===== SHADOWS (for reference) =====
    shadowColor: '#0F172A',

    // ===== GRADIENTS (arrays for LinearGradient) =====
    gradientPrimary: ['#6366F1', '#8B5CF6'],
    gradientAccent: ['#EC4899', '#F43F5E'],
    gradientSuccess: ['#10B981', '#14B8A6'],
    gradientPurplePink: ['#A78BFA', '#EC4899'],
    gradientBlueIndigo: ['#3B82F6', '#6366F1'],
    gradientSunset: ['#F59E0B', '#EF4444'],
  },
  dark: {
    // Backgrounds
    background: '#1A202C',
    backgroundSecondary: '#2D3748',

    // Cards & Surfaces
    card: '#2D3748',
    cardSecondary: '#374151',

    // Text
    text: '#F7FAFC',
    textSecondary: '#CBD5E0',
    textLight: '#A0AEC0',

    // Primary Colors
    primary: '#FF8E8E',
    primaryLight: '#FFB3B3',
    primaryDark: '#FF6B6B',

    // Accent Colors
    accent: '#FF8E8E',
    accentLight: '#FFB3B3',

    // Gradients
    gradientPrimary: ['#9F7AEA', '#EC4899'],
    gradientAccent: ['#FF8E8E', '#FFB3B3'],
    gradientPurplePink: ['#A78BFA', '#F472B6'],
    gradientBlue: ['#3B82F6', '#60A5FA'],

    // Product Card Colors
    productYellow: '#9F7928',
    productGreen: '#2F855A',
    productBlue: '#2C5282',
    productPink: '#97266D',

    // Semantic Colors
    success: '#48BB78',
    warning: '#ED8936',
    error: '#FC8181',
    info: '#63B3ED',

    // UI Elements
    border: '#4A5568',
    borderLight: '#374151',
    divider: '#4A5568',

    // Icons & Interactive
    icon: '#CBD5E0',
    iconActive: '#FF8E8E',

    // Input & Search
    inputBackground: '#374151',
    inputText: '#F7FAFC',
    inputBorder: '#4A5568',
    placeholder: '#9CA3AF',
    searchBackground: '#374151',

    // Banner
    bannerBackground: '#5A67D8',
    bannerText: '#FFFFFF',
    bannerButton: '#FFFFFF',
    bannerButtonText: '#5A67D8',
  },
};

// ===== SPACING SYSTEM =====
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// ===== BORDER RADIUS =====
export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

// ===== SHADOWS (React Native) =====
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xxl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
};

// ===== ANIMATION DURATIONS =====
export const AnimationDuration = {
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
};

// ===== SPRING ANIMATION CONFIG =====
export const SpringConfig = {
  light: {
    damping: 15,
    stiffness: 150,
  },
  medium: {
    damping: 20,
    stiffness: 200,
  },
  heavy: {
    damping: 25,
    stiffness: 250,
  },
  bouncy: {
    damping: 10,
    stiffness: 100,
  },
};

// ===== TYPOGRAPHY SCALE =====
export const FontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
};

export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

// ===== FONTS =====
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
