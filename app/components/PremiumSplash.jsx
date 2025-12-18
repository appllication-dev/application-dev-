import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    withRepeat,
    Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { RevolutionTheme } from '../../src/theme/RevolutionTheme';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const PremiumSplash = () => {
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);

    useEffect(() => {
        // Logo Animation: Scale Up + Fade In
        scale.value = withSpring(1, { damping: 12 });
        opacity.value = withTiming(1, { duration: 800 });

        // Text Animation: Delayed Fade In
        textOpacity.value = withTiming(1, { duration: 1000, delay: 500 });

        // Pulse effect
        scale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const animatedLogoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const animatedTextStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: withTiming(textOpacity.value === 1 ? 0 : 20) }]
    }));

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#000000', '#121212', '#1C1C1E']} // Luxury Dark
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Decorative Gold Glow */}
            <View style={styles.glowContainer}>
                <LinearGradient
                    colors={['rgba(212, 175, 55, 0.15)', 'transparent']}
                    style={styles.glow}
                />
            </View>

            <View style={styles.content}>
                <Animated.View style={[styles.iconContainer, animatedLogoStyle]}>
                    <Image
                        source={require('../../assets/images/logo_new.jpg')}
                        style={styles.icon}
                        resizeMode="cover"
                    />
                </Animated.View>

                <Animated.View style={animatedTextStyle}>
                    <Text style={styles.title}>FUNNY SHOP</Text>
                    <Text style={styles.subtitle}>Luxury & Style</Text>
                </Animated.View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.version}>v1.0.0</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    glowContainer: {
        position: 'absolute',
        top: '30%',
        width: width * 1.5,
        height: width * 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glow: {
        width: '100%',
        height: '100%',
        borderRadius: width,
    },
    content: {
        alignItems: 'center',
        zIndex: 10,
    },
    iconContainer: {
        width: 150,
        height: 150,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    icon: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#D4AF37', // Gold
        letterSpacing: 4,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
        letterSpacing: 3,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    footer: {
        position: 'absolute',
        bottom: 50,
    },
    version: {
        color: '#444',
        fontSize: 12,
    }
});

export default PremiumSplash;
