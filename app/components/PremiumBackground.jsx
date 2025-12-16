import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import Svg, { Line } from 'react-native-svg';

/**
 * Premium Background with Decorative Golden Lines
 * Luxury design with subtle diagonal gold stripes
 */
const PremiumBackground = ({ children, style }) => {
    const { colors, theme } = useTheme();
    const isDark = theme === 'dark';

    // Premium Black Background for Dark Mode
    const backgroundColor = isDark ? '#000000' : colors.background;

    // Luxury Gold Lines
    const lineColor = isDark ? '#E5C158' : '#C4A030';
    // Increased opacity for visibility on black
    const lineOpacity = isDark ? 0.35 : 0.15;
    const strokeWidth = isDark ? 1.5 : 1;

    return (
        <View style={[
            styles.container,
            { backgroundColor },
            style
        ]}>
            {/* Decorative Golden Lines (Both modes) */}
            <View style={styles.linesContainer} pointerEvents="none">
                <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                    {/* Primary Diagonal Flow (Top Right) */}
                    <Line x1="40%" y1="-10%" x2="110%" y2="60%" stroke={lineColor} strokeWidth={strokeWidth} opacity={lineOpacity} />
                    <Line x1="55%" y1="-10%" x2="110%" y2="45%" stroke={lineColor} strokeWidth={strokeWidth * 0.8} opacity={lineOpacity * 0.8} />
                    <Line x1="70%" y1="-10%" x2="110%" y2="30%" stroke={lineColor} strokeWidth={strokeWidth * 0.6} opacity={lineOpacity * 0.6} />

                    {/* Secondary Accent Lines (Bottom) */}
                    <Line x1="-10%" y1="80%" x2="60%" y2="110%" stroke={lineColor} strokeWidth={strokeWidth} opacity={lineOpacity * 0.5} />
                    <Line x1="5%" y1="80%" x2="45%" y2="110%" stroke={lineColor} strokeWidth={strokeWidth * 0.8} opacity={lineOpacity * 0.4} />

                    {/* Subtle Cross-Hatch details for texture (Very faint) */}
                    <Line x1="90%" y1="0%" x2="100%" y2="10%" stroke={lineColor} strokeWidth={0.5} opacity={lineOpacity * 0.3} />
                </Svg>
            </View>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    linesContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
});

export default PremiumBackground;
