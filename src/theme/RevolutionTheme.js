export const RevolutionTheme = {
    colors: {
        // Premium Luxury Dark
        background: '#000000',        // Pure OLED Black
        backgroundAlt: '#0A0A0A',     // Near Black

        // Luxury Cream Light (New "Dream" Palette)
        backgroundLight: '#FFFDF5',   // Premium Cream
        backgroundAltLight: '#F8F9FA', // Soft White

        // Gold Branding
        primary: '#D4AF37',           // Classic Gold (Standardized)
        primaryDark: '#B8860B',       // Deep Gold
        secondary: '#C9A227',         // Rich Gold
        accent: '#FFEAA7',            // Light Gold Glow

        // Cream Palette UI
        creamCard: '#FFF8E7',         // Warm Cream Card
        creamText: '#2C2C2C',         // Soft Black for Cream
        creamTextSecondary: '#6B5B45',// Warm Brown/Grey

        // Glassmorphism - Premium
        glass: 'rgba(15, 15, 15, 0.85)',
        glassLight: 'rgba(255, 255, 255, 0.85)', // Update for light mode
        glassBorder: 'rgba(212, 175, 55, 0.2)',  // Gold tinted border
        glassBorderLight: 'rgba(212, 175, 55, 0.15)', // Light Gold border

        // Cards
        card: '#0F0F0F',
        cardElevated: '#141414',

        text: {
            primary: '#FFFFFF',
            secondary: 'rgba(255, 255, 255, 0.75)',
            muted: 'rgba(255, 255, 255, 0.45)',
            gold: '#D4AF37',
        },

        gradient: {
            start: '#000000',
            middle: '#0A0A0A',
            end: '#141414',
            gold: ['#D4AF37', '#E5C158', '#FFEAA7'],
            cream: ['#FFFDF5', '#F5F0E1', '#E6D28F'], // New Cream Gradient
        },

        // Status
        success: '#00D68F',
        error: '#FF6B6B',
        warning: '#FFB347',
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 40,
        round: 9999,
    },
    animations: {
        spring: {
            damping: 12,
            stiffness: 180,
            mass: 0.8,
        },
        springBouncy: {
            damping: 8,
            stiffness: 300,
            mass: 0.5,
        },
        springSmooth: {
            damping: 20,
            stiffness: 120,
            mass: 1,
        }
    }
};
