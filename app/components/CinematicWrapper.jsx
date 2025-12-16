import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { RevolutionTheme } from '../../src/theme/RevolutionTheme';

const { width, height } = Dimensions.get('window');

const CinematicWrapper = ({ children, style }) => {
    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Deep Background Base */}
            <View style={styles.backgroundBase} />

            {/* Atmospheric Glow 1 (Top Left - Cyan) */}
            <LinearGradient
                colors={[RevolutionTheme.colors.primary, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.glow, styles.glow1]}
            />

            {/* Atmospheric Glow 2 (Bottom Right - Purple) */}
            <LinearGradient
                colors={[RevolutionTheme.colors.secondary, 'transparent']}
                start={{ x: 1, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={[styles.glow, styles.glow2]}
            />

            {/* Content Container */}
            <View style={[styles.content, style]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: RevolutionTheme.colors.background,
    },
    backgroundBase: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: RevolutionTheme.colors.background,
    },
    glow: {
        position: 'absolute',
        width: width * 1.5,
        height: height * 0.8,
        opacity: 0.15, // Subtle but visible
    },
    glow1: {
        top: -height * 0.2,
        left: -width * 0.5,
        transform: [{ rotate: '45deg' }],
    },
    glow2: {
        bottom: -height * 0.2,
        right: -width * 0.5,
        transform: [{ rotate: '45deg' }],
    },
    content: {
        flex: 1,
        zIndex: 1,
    },
});

export default CinematicWrapper;
