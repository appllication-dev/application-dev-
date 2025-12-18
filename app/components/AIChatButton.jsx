import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { RevolutionTheme } from '../../src/theme/RevolutionTheme';
import AIChatModal from './AIChatModal';

const { width, height } = Dimensions.get('window');
const BUTTON_SIZE = 60;

const AIChatButton = () => {
    const [modalVisible, setModalVisible] = useState(false);

    // Initial position (bottom right)
    const translateX = useSharedValue(width - BUTTON_SIZE - 20);
    const translateY = useSharedValue(height - BUTTON_SIZE - 100);
    const context = useSharedValue({ x: 0, y: 0 });

    const pan = Gesture.Pan()
        .onStart(() => {
            context.value = { x: translateX.value, y: translateY.value };
        })
        .onUpdate((event) => {
            translateX.value = event.translationX + context.value.x;
            translateY.value = event.translationY + context.value.y;
        })
        .onEnd(() => {
            // Snap to nearest side (Left or Right)
            if (translateX.value > width / 2) {
                translateX.value = withSpring(width - BUTTON_SIZE - 20); // Right side
            } else {
                translateX.value = withSpring(20); // Left side
            }

            // Keep within vertical bounds
            if (translateY.value < 50) translateY.value = withSpring(50);
            if (translateY.value > height - 100) translateY.value = withSpring(height - 100);
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        };
    });

    return (
        <>
            <GestureDetector gesture={pan}>
                <Animated.View style={[styles.container, animatedStyle]}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setModalVisible(true)}
                        style={styles.button}
                    >
                        {/* Glow Effect */}
                        <View style={styles.glow} />
                        <Ionicons name="sparkles" size={28} color="#FFF" />
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>

            <AIChatModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 9999, // Ensure it's always on top
    },
    button: {
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        backgroundColor: RevolutionTheme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: RevolutionTheme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    glow: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: BUTTON_SIZE / 2,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    }
});

export default AIChatButton;
