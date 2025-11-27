import React from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../src/context/ThemeContext';

const { width, height } = Dimensions.get('window');

const PremiumBackground = ({ children, style }) => {
    const { theme } = useTheme();

    // Define gradient colors based on theme
    // Using the same vibrant colors as the Auth screens for consistency
    // but slightly adjusted for main app usability (less intense for content readability)
    const gradientColors = theme === 'dark'
        ? ['#1a1a2e', '#16213e', '#0f3460'] // Deep blue/purple for dark mode
        : ['#fdfbfb', '#ebedee']; // Subtle grey/white for light mode (cleaner for main app)

    // OR if we want to force the "Premium/Fantasy" look everywhere regardless of theme:
    const premiumColors = ['#667eea', '#764ba2', '#f093fb']; // The Auth screen colors

    // Let's use a hybrid approach:
    // Light mode: Soft premium gradient
    // Dark mode: Deep premium gradient
    const activeColors = theme === 'dark'
        ? ['#2d3436', '#000000']
        : ['#f5f7fa', '#c3cfe2']; // Clean metallic look for light mode

    // Actually, user wants "Unified" with Auth. Auth uses: ['#667eea', '#764ba2', '#f093fb']
    // Let's use a slightly lighter version of that for the main app to ensure text readability
    // or use the exact same one but with a glass overlay for content.

    // Let's try the exact Auth gradient but maybe with different start/end points to vary it slightly
    // or just use it as is for maximum impact as requested.
    const authColors = ['#667eea', '#764ba2', '#f093fb'];

    return (
        <View style={[styles.container, style]}>
            <LinearGradient
                colors={authColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Animated Background Circles - Reused from Auth screens for consistency */}
            <Animated.View
                entering={FadeInUp.delay(200).springify()}
                style={[styles.floatingCircle, styles.circle1]}
            />
            <Animated.View
                entering={FadeInUp.delay(400).springify()}
                style={[styles.floatingCircle, styles.circle2]}
            />

            {/* Content Container - Z-index ensures content is above background */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        zIndex: 1,
    },
    floatingCircle: {
        position: 'absolute',
        borderRadius: 1000,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    circle1: {
        width: width * 0.8,
        height: width * 0.8,
        top: -width * 0.2,
        right: -width * 0.2,
    },
    circle2: {
        width: width * 0.6,
        height: width * 0.6,
        bottom: -width * 0.1,
        left: -width * 0.1,
    },
});

export default PremiumBackground;
