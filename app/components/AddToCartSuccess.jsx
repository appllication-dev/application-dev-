/**
 * 🛒 Add to Cart Success Animation - Kataraa
 * Shows a beautiful animation when product is added to cart
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withSpring,
    withTiming,
    withDelay,
    runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AddToCartSuccess({ visible, onComplete, productName }) {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const checkScale = useSharedValue(0);
    const textOpacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            // Start animation sequence
            opacity.value = withTiming(1, { duration: 200 });

            scale.value = withSequence(
                withSpring(1.2, { damping: 8, stiffness: 200 }),
                withSpring(1, { damping: 10 })
            );

            checkScale.value = withDelay(
                200,
                withSpring(1, { damping: 6, stiffness: 150 })
            );

            textOpacity.value = withDelay(400, withTiming(1, { duration: 200 }));

            // Hide after 1.5 seconds
            setTimeout(() => {
                opacity.value = withTiming(0, { duration: 300 });
                scale.value = withTiming(0.8, { duration: 300 });
                checkScale.value = 0;
                textOpacity.value = 0;

                setTimeout(() => {
                    onComplete?.();
                }, 300);
            }, 1500);
        }
    }, [visible]);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const badgeStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const checkStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkScale.value }],
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
    }));

    if (!visible) return null;

    return (
        <Animated.View style={[styles.overlay, containerStyle]} pointerEvents="none">
            <Animated.View style={[styles.badge, badgeStyle]}>
                <Animated.View style={checkStyle}>
                    <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
                </Animated.View>
                <Animated.Text style={[styles.title, textStyle]}>
                    تمت الإضافة! ✨
                </Animated.Text>
                {productName && (
                    <Animated.Text style={[styles.productName, textStyle]} numberOfLines={1}>
                        {productName}
                    </Animated.Text>
                )}
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    badge: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
        minWidth: 200,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginTop: 12,
        textAlign: 'center',
    },
    productName: {
        fontSize: 14,
        color: COLORS.textSecondary || '#666',
        marginTop: 8,
        textAlign: 'center',
        maxWidth: 200,
    },
});
