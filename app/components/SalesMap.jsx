import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withRepeat,
    withTiming,
    withDelay,
    Easing
} from 'react-native-reanimated';
import { useTheme } from '../../src/context/ThemeContext';

const { width } = Dimensions.get('window');

// Animated Component for SVG Circle
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PulsingBeacon = ({ x, y, color, delay = 0 }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        scale.value = withDelay(delay, withRepeat(
            withTiming(4, { duration: 2000, easing: Easing.out(Easing.ease) }),
            -1,
            false
        ));
        opacity.value = withDelay(delay, withRepeat(
            withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
            -1,
            false
        ));
    }, []);

    const animatedProps = useAnimatedProps(() => ({
        r: 4 * scale.value,
        opacity: opacity.value,
    }));

    return (
        <React.Fragment>
            <Circle cx={x} cy={y} r="4" fill={color} />
            <AnimatedCircle cx={x} cy={y} fill={color} animatedProps={animatedProps} />
        </React.Fragment>
    );
};

const SalesMap = () => {
    const { colors, theme } = useTheme();
    const isDark = theme === 'dark';

    // Detailed World Map Path (Simplified for performance but detailed enough for UI)
    const landPath = `
        M 50,70 Q 70,50 110,60 T 150,55 T 190,40 T 220,50 T 260,35 T 320,50 T 360,40 
        L 370,60 Q 380,80 340,90 T 290,130 T 240,110 T 200,140 T 160,110 
        Q 140,130 150,160 T 130,190 T 100,170 T 80,140 
        Q 60,120 40,90 T 50,70 Z
        M 280,150 Q 300,160 320,150 T 340,180 T 300,190 T 280,150 Z
    `;

    // Map Color
    const mapColor = isDark ? "#1F2937" : "#E5E7EB";
    const mapStroke = isDark ? "#374151" : "#D1D5DB";

    return (
        <View style={[styles.container, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB' }]}>
            <Svg height="100%" width="100%" viewBox="0 0 400 220">
                <Defs>
                    <RadialGradient id="grad" cx="200" cy="110" rx="200" ry="110" fx="200" fy="110" gradientUnits="userSpaceOnUse">
                        <Stop offset="0" stopColor={isDark ? "#111827" : "#FFFFFF"} stopOpacity="1" />
                        <Stop offset="1" stopColor={isDark ? "#000000" : "#F3F4F6"} stopOpacity="1" />
                    </RadialGradient>
                </Defs>

                <Path d="M0,55 H400 M0,110 H400 M0,165 H400" stroke={mapStroke} strokeWidth="0.5" opacity="0.2" />
                <Path d="M100,0 V220 M200,0 V220 M300,0 V220" stroke={mapStroke} strokeWidth="0.5" opacity="0.2" />

                {/* World Map Silhouette */}
                <Path
                    d={landPath}
                    fill={mapColor}
                    stroke={mapStroke}
                    strokeWidth="1"
                    opacity={0.8}
                />

                <PulsingBeacon x="90" y="80" color="#F59E0B" delay={0} />
                <PulsingBeacon x="120" y="150" color="#10B981" delay={500} />
                <PulsingBeacon x="210" y="70" color="#D4AF37" delay={1000} />
                <PulsingBeacon x="220" y="140" color="#EF4444" delay={1500} />
                <PulsingBeacon x="310" y="80" color="#3B82F6" delay={200} />
                <PulsingBeacon x="320" y="170" color="#8B5CF6" delay={700} />

            </Svg>

            {/* Overlay Info */}
            <View style={styles.overlayInfo}>
                <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Animated.Text style={[styles.liveText, { color: isDark ? '#E5C158' : '#000' }]}>
                        LIVE SALES
                    </Animated.Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 240,
        borderRadius: 24,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    overlayInfo: {
        position: 'absolute',
        top: 16,
        left: 16,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(229, 193, 88, 0.3)',
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#E5C158',
        marginRight: 6,
    },
    liveText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});

export default SalesMap;
