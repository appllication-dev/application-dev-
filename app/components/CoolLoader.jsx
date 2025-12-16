import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSpring,
    Easing,
    cancelAnimation,
    withSequence,
    withDelay
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/context/ThemeContext';

const CoolLoader = () => {
    const { colors, theme } = useTheme();
    const isDark = theme === 'dark';

    // Shared Values
    const rotation = useSharedValue(0);
    const rotationReverse = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.5);

    useEffect(() => {
        // Outer pulsing ring rotation
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 2000,
                easing: Easing.linear,
            }),
            -1,
            false
        );

        // Inner ring rotation (reverse)
        rotationReverse.value = withRepeat(
            withTiming(-360, {
                duration: 1500,
                easing: Easing.linear,
            }),
            -1,
            false
        );

        // Icon pulsing
        scale.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 800, easing: Easing.ease }),
                withTiming(1, { duration: 800, easing: Easing.ease })
            ),
            -1,
            true
        );

        // Text opacity
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.4, { duration: 1000 })
            ),
            -1,
            true
        );

        return () => {
            cancelAnimation(rotation);
            cancelAnimation(rotationReverse);
            cancelAnimation(scale);
            cancelAnimation(opacity);
        };
    }, []);

    const outerRingStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const innerRingStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotationReverse.value}deg` }],
    }));

    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={styles.container}>
            <View style={styles.loaderContainer}>
                {/* Outer Gradient Ring */}
                <Animated.View style={[styles.ringContainer, outerRingStyle]}>
                    <LinearGradient
                        colors={['transparent', '#667eea', '#764ba2', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.ring}
                    />
                </Animated.View>

                {/* Inner Gradient Ring */}
                <Animated.View style={[styles.ringContainerInner, innerRingStyle]}>
                    <LinearGradient
                        colors={['transparent', '#4CAF50', '#059669', 'transparent']}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.ringInner}
                    />
                </Animated.View>

                {/* Center Icon */}
                <Animated.View style={[styles.centerIcon, iconStyle]}>
                    <Ionicons name="bag-handle" size={32} color={colors.text} />
                </Animated.View>
            </View>

            <Animated.Text style={[styles.loadingText, { color: colors.textSecondary }, textStyle]}>
                Loading Experience...
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400, // Ensure it takes space
    },
    loaderContainer: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    ringContainer: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: 'transparent',
    },
    ring: {
        flex: 1,
        borderRadius: 50,
    },
    ringContainerInner: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 3,
        borderColor: 'transparent',
    },
    ringInner: {
        flex: 1,
        borderRadius: 35,
    },
    centerIcon: {
        zIndex: 10,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
    }
});

export default CoolLoader;
