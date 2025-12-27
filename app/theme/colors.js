/**
 * Kataraa Design System - Theme & Colors
 * Based on reference design (SOKO-style Korean Beauty App)
 */

// Primary Color Palette
export const COLORS = {
    // Primary - Blush Pink & Rose Gold
    primary: '#F5B5C8',       // Blush Pink
    primaryDark: '#B76E79',   // Rose Gold
    primaryLight: '#FFD6E0',  // Light Blush

    // Accent Colors
    accent: '#B76E79',        // Rose Gold accent
    accentRose: '#9A5B64',    // Deeper Rose

    // Status Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Neutral Colors
    background: '#FFF9F5',    // Champagne/Cream
    backgroundDark: '#FDF2F0',
    card: '#ffffff',
    border: '#FFE4E9',
    borderDark: '#F5D1D8',

    // Text Colors
    text: '#3D2314',          // Deep Espresso/Charcoal
    textSecondary: '#7A5C5C',
    textMuted: '#A68E8E',
    textLight: '#ffffff',

    // Special
    overlay: 'rgba(61, 35, 20, 0.4)',
    glassBg: 'rgba(255, 255, 255, 0.9)',
    shadow: 'rgba(183, 110, 121, 0.15)',
};

// Gradient Presets
export const GRADIENTS = {
    primary: ['#667eea', '#764ba2'],
    header: ['#667eea', '#764ba2'],
    button: ['#667eea', '#764ba2'],
    card: ['#ffffff', '#fafafa'],
    banner: ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)'],
};

// Spacing Scale
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Border Radius
export const RADIUS = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 30,
    round: 999,
};

// Typography
export const FONTS = {
    sizes: {
        xs: 10,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 18,
        xxl: 22,
        title: 28,
        hero: 36,
    },
    weights: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        black: '900',
    },
};

// Shadow Presets
export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
};

// Category Icons (for CircularCategoryIcon component)
export const CATEGORY_ICONS = [
    { id: 'masks', name: 'Masks', nameAr: 'أقنعة', icon: '🎭', color: '#E1BEE7' },
    { id: 'eyecare', name: 'Eye Care', nameAr: 'العناية بالعين', icon: '👁️', color: '#B3E5FC' },
    { id: 'suncare', name: 'Suncare', nameAr: 'واقي الشمس', icon: '☀️', color: '#FFF9C4' },
    { id: 'makeup', name: 'Makeup', nameAr: 'مكياج', icon: '💄', color: '#F8BBD9' },
    { id: 'skincare', name: 'Skincare', nameAr: 'العناية بالبشرة', icon: '✨', color: '#C8E6C9' },
    { id: 'toner', name: 'Toner', nameAr: 'تونر', icon: '💧', color: '#B2DFDB' },
    { id: 'serum', name: 'Serum', nameAr: 'سيروم', icon: '💎', color: '#D1C4E9' },
    { id: 'cleanser', name: 'Cleanser', nameAr: 'منظف', icon: '🧴', color: '#FFCCBC' },
];

export default {
    COLORS,
    GRADIENTS,
    SPACING,
    RADIUS,
    FONTS,
    SHADOWS,
    CATEGORY_ICONS,
};
