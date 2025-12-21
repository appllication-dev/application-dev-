import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    runOnJS,
    useDerivedValue,
} from 'react-native-reanimated';

/**
 * AnimatedCounter - A premium animated number counter
 * Numbers count up from 0 to target value with optional formatting
 */
const AnimatedCounter = ({
    value,
    duration = 1500,
    prefix = '',
    suffix = '',
    decimals = 0,
    style = {},
    textStyle = {},
    formatNumber = true,
}) => {
    const animatedValue = useSharedValue(0);
    const [displayValue, setDisplayValue] = React.useState('0');

    // Format number with commas and decimals
    const formatDisplayValue = (num) => {
        if (formatNumber) {
            return num.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            });
        }
        return decimals > 0 ? num.toFixed(decimals) : Math.floor(num).toString();
    };

    // Update display value when animated value changes
    useDerivedValue(() => {
        runOnJS(setDisplayValue)(formatDisplayValue(animatedValue.value));
    });

    useEffect(() => {
        // Reset and animate to new value
        animatedValue.value = 0;
        animatedValue.value = withTiming(value, {
            duration,
            easing: Easing.out(Easing.cubic),
        });
    }, [value, duration]);

    // Scale animation for emphasis
    const scaleValue = useSharedValue(1);

    useEffect(() => {
        scaleValue.value = 1.05;
        scaleValue.value = withTiming(1, { duration: 300 });
    }, [value]);

    const animatedScale = useAnimatedStyle(() => ({
        transform: [{ scale: scaleValue.value }],
    }));

    return (
        <View style={[styles.container, style]}>
            <Animated.View style={animatedScale}>
                <Text style={[styles.text, textStyle]}>
                    {prefix}{displayValue}{suffix}
                </Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: -0.5,
    },
});

export default AnimatedCounter;
