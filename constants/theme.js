/**
 * Professional & Elegant Theme Colors
 * Inspired by Apple, Airbnb, and luxury brands
 * Clean, minimalist, and sophisticated color palette
 */

export const Colors = {
    light: {
        // Core Brand Colors (Luxury Light: Navy & Gold on White)
        primary: '#0B1121',           // Deep Navy (for Text/Headings)
        primaryDark: '#000000',       // Pure Black
        primaryLight: '#1C2541',      // Lighter Navy

        // Accent
        accent: '#D4AF37',            // Gold (Brand Highlight)
        accentSecondary: '#F3E5AB',   // Champagne
        accentLight: '#E5C158',       // Bright Gold

        // Background System
        background: '#FFFFFF',        // Pure White
        backgroundSecondary: '#FAFAFA', // Off-White

        // Card System
        card: '#FFFFFF',
        cardSecondary: '#F9FAFB',
        cardElevated: '#FFFFFF',

        // Text Hierarchy
        text: '#0B1121',              // Deep Navy (High Contrast)
        textSecondary: '#4B5563',     // Dark Gray
        textLight: '#9CA3AF',         // Light Gray
        textInverse: '#FFFFFF',       // White

        // Borders & Dividers
        border: '#E5E7EB',
        borderLight: '#F3F4F6',
        borderDark: '#D1D5DB',

        // Status Colors
        success: '#10B981',
        error: '#D97706', // Changed from Red to Warning Gold/Orange
        warning: '#D97706',
        info: '#2563EB',

        // Elevation & Shadows
        shadow: '#0B1121',            // Navy Shadow for clearer depth
        shadowLight: 'rgba(11, 17, 33, 0.05)',
        shadowMedium: 'rgba(11, 17, 33, 0.1)',
        shadowHeavy: 'rgba(11, 17, 33, 0.15)',

        // Overlay
        overlay: 'rgba(11, 17, 33, 0.5)',
        overlayLight: 'rgba(11, 17, 33, 0.3)',
    },

    dark: {
        // PROFESSIONAL LUXURY (Gold on Deep Black)
        primary: '#D4AF37',           // Luxury Gold
        primaryDark: '#AA8C2C',       
        primaryLight: '#F3E5AB',      // Champagne

        // Accent
        accent: '#D4AF37',            // Gold (Consistent branding)
        accentSecondary: '#F3E5AB',   
        accentLight: '#FFE5B4',       

        // Background System
        background: '#050505',        // Almost Pure Black (OLED Friendly)
        backgroundSecondary: '#0F0F0F', 

        // Card System (Subtle & Clean)
        card: '#121212',              // Material Dark Standard
        cardSecondary: '#1A1A1A', 
        cardElevated: '#1E1E1E',

        // Text Hierarchy
        text: '#F4F4F5',              // Off-white for readability (not harsh #FFF)
        textSecondary: '#A1A1AA',     // Neutral Gray
        textLight: '#71717A',         
        textInverse: '#000000',       

        // Borders & Dividers
        border: '#27272A',            // Subtle border
        borderLight: '#18181B',
        borderDark: '#000000',

        // Status Colors
        success: '#10B981',           // Professional Emerald
        error: '#EF4444',             // Standard Red
        warning: '#F59E0B',           // Amber
        info: '#3B82F6',              // Blue

        // Elevation & Shadows
        shadow: '#000000',            
        shadowLight: 'rgba(0, 0, 0, 0.5)',
        shadowMedium: 'rgba(0, 0, 0, 0.8)',
        shadowHeavy: '#000000',

        // Overlay
        overlay: 'rgba(0, 0, 0, 0.85)',
        overlayLight: 'rgba(0, 0, 0, 0.7)',
    },
};

/**
 * Typography System (San Francisco-inspired)
 */
export const Typography = {
    // Display (Hero Text)
    displayLarge: {
        fontSize: 57,
        fontWeight: '900',
        lineHeight: 64,
        letterSpacing: -0.5,
    },
    displayMedium: {
        fontSize: 45,
        fontWeight: '800',
        lineHeight: 52,
        letterSpacing: -0.5,
    },
    displaySmall: {
        fontSize: 36,
        fontWeight: '700',
        lineHeight: 44,
    },

    // Headings
    h1: {
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 40,
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 36,
    },
    h3: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
    },
    h4: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
    },
    h5: {
        fontSize: 17,
        fontWeight: '600',
        lineHeight: 24,
    },
    h6: {
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 22,
    },

    // Body Text
    bodyLarge: {
        fontSize: 17,
        fontWeight: '400',
        lineHeight: 28,
    },
    body: {
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 24,
    },
    bodySmall: {
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 20,
    },

    // Labels
    label: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    labelSmall: {
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 16,
    },

    // Caption
    caption: {
        fontSize: 11,
        fontWeight: '400',
        lineHeight: 16,
    },
};

/**
 * Font Size shortcuts
 */
export const FontSize = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

/**
 * Spacing System (8pt grid)
 */
export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
};

/**
 * Border Radius
 */
export const BorderRadius = {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,      // Funny Shop standard
    xl: 24,      // Funny Shop large
    xxl: 32,
    round: 9999,
    full: 9999,
};

/**
 * Elevation (Shadow Presets)
 */
export const Elevation = {
    none: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    low: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    high: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
        elevation: 8,
    },
    highest: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
    },
};

/**
 * Shadows (Alias for Elevation + extra sizes)
 */
export const Shadows = {
    ...Elevation,
    sm: Elevation.low,
    md: Elevation.medium,
    lg: Elevation.high,
    xl: Elevation.highest,
};

/**
 * Spring Animation Config
 */
export const SpringConfig = {
    light: {
        damping: 15,
        stiffness: 300,
        mass: 0.5,
    },
    medium: {
        damping: 15,
        stiffness: 200,
        mass: 1,
    },
    heavy: {
        damping: 20,
        stiffness: 150,
        mass: 1.5,
    },
    bouncy: {
        damping: 10,
        stiffness: 400,
        mass: 0.5,
    },
};

