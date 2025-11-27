import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Premium Button with Apple-style press animations
 * Features:
 * - Scale animation on press
 * - Haptic feedback
 * - Shadow animation
 * - Smooth spring physics
 */
const PremiumButton = ({
    children,
    onPress,
    style,
    disabled = false,
    hapticEnabled = true,
    scaleValue = 0.96,
    ...props
}) => {
    const scale = useSharedValue(1);
    const shadowOpacity = useSharedValue(0.2);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        shadowOpacity: shadowOpacity.value,
    }));

    const handlePressIn = () => {
        if (disabled) return;

        scale.value = withSpring(scaleValue, {
            damping: 15,
            stiffness: 150,
            mass: 0.3,
        });

        shadowOpacity.value = withTiming(0.1, { duration: 150 });

        if (hapticEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handlePressOut = () => {
        if (disabled) return;

        scale.value = withSpring(1, {
            damping: 12,
            stiffness: 100,
            mass: 0.8,
        });

        shadowOpacity.value = withTiming(0.2, { duration: 150 });
    };

    const handlePress = () => {
        if (disabled) return;

        if (hapticEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        onPress?.();
    };

    return (
        <AnimatedTouchable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            disabled={disabled}
            activeOpacity={0.9}
            style={[styles.button, animatedStyle, style, disabled && styles.disabled]}
            {...props}
        >
            {children}
        </AnimatedTouchable>
    );
};

const styles = StyleSheet.create({
    button: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    disabled: {
        opacity: 0.5,
    },
});

export default PremiumButton;
