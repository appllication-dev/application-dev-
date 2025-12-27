/**
 * Order Success Screen - Kataraa
 * Premium animated success page after order placement
 */
import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNotifications } from '../context/NotificationContext';
import { useTranslation } from '../hooks/useTranslation';

const { width, height } = Dimensions.get('window');

// Confetti Particle Component
const ConfettiParticle = ({ delay, startX }) => {
    const translateY = useRef(new Animated.Value(-50)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const rotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const randomDuration = 2000 + Math.random() * 1000;
        const randomX = (Math.random() - 0.5) * 100;

        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: height + 50,
                    duration: randomDuration,
                    useNativeDriver: true,
                }),
                Animated.timing(translateX, {
                    toValue: randomX,
                    duration: randomDuration,
                    useNativeDriver: true,
                }),
                Animated.timing(rotate, {
                    toValue: 360 * (Math.random() > 0.5 ? 1 : -1),
                    duration: randomDuration,
                    useNativeDriver: true,
                }),
                Animated.sequence([
                    Animated.delay(randomDuration * 0.7),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: randomDuration * 0.3,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ]).start();
    }, []);

    const colors = ['#667eea', '#764ba2', '#4CAF50', '#FF9800', '#E91E63', '#00BCD4'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 8 + Math.random() * 8;

    return (
        <Animated.View
            style={[
                styles.confetti,
                {
                    left: startX,
                    width: size,
                    height: size,
                    backgroundColor: color,
                    borderRadius: Math.random() > 0.5 ? size / 2 : 2,
                    opacity,
                    transform: [
                        { translateY },
                        { translateX },
                        {
                            rotate: rotate.interpolate({
                                inputRange: [0, 360],
                                outputRange: ['0deg', '360deg'],
                            })
                        },
                    ],
                },
            ]}
        />
    );
};

export default function OrderSuccessScreen() {
    const router = useRouter();
    const { orderId } = useLocalSearchParams();
    const { addNotification } = useNotifications();
    const { t } = useTranslation();

    // Animations
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const checkmarkScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Entrance animations
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
            Animated.spring(checkmarkScale, {
                toValue: 1,
                tension: 100,
                friction: 5,
                useNativeDriver: true,
            }),
        ]).start();

        // Add success notification
        addNotification(
            'notifOrderTitle',
            'notifOrderMsg',
            'success',
            { orderId: orderId || '' }
        );
    }, []);

    // Generate confetti particles
    const confettiParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        delay: Math.random() * 500,
        startX: Math.random() * width,
    }));

    return (
        <View style={styles.container}>
            {/* Confetti */}
            {confettiParticles.map((particle) => (
                <ConfettiParticle
                    key={particle.id}
                    delay={particle.delay}
                    startX={particle.startX}
                />
            ))}

            <SafeAreaView style={styles.content}>
                {/* Success Circle */}
                <Animated.View
                    style={[
                        styles.successCircle,
                        { transform: [{ scale: scaleAnim }] }
                    ]}
                >
                    <LinearGradient
                        colors={['#4CAF50', '#8BC34A']}
                        style={styles.circleGradient}
                    >
                        <Animated.View style={{ transform: [{ scale: checkmarkScale }] }}>
                            <Ionicons name="checkmark" size={80} color="#fff" />
                        </Animated.View>
                    </LinearGradient>
                </Animated.View>

                {/* Title */}
                <Animated.Text
                    style={[
                        styles.title,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    🎉 تم استلام طلبك!
                </Animated.Text>

                {/* Order Number */}
                <Animated.View
                    style={[
                        styles.orderCard,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.orderLabel}>رقم الطلب</Text>
                    <Text style={styles.orderNumber}>#{orderId || '---'}</Text>
                </Animated.View>

                {/* Info Card */}
                <Animated.View
                    style={[
                        styles.infoCard,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.infoRow}>
                        <Ionicons name="call" size={24} color="#667eea" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoTitle}>سنتواصل معك قريباً</Text>
                            <Text style={styles.infoDesc}>
                                فريقنا سيرسل لك رابط الدفع عبر الواتساب
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Ionicons name="time" size={24} color="#FF9800" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoTitle}>وقت التوصيل المتوقع</Text>
                            <Text style={styles.infoDesc}>1-3 أيام عمل</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoTitle}>ضمان الجودة</Text>
                            <Text style={styles.infoDesc}>جميع منتجاتنا أصلية 100%</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Thank You Message */}
                <Animated.Text
                    style={[
                        styles.thankYou,
                        { opacity: fadeAnim }
                    ]}
                >
                    شكراً لتسوقك معنا! 💜
                </Animated.Text>

                {/* Return Home Button */}
                <Animated.View
                    style={[
                        styles.buttonContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.replace('/')}
                    >
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>العودة للتسوق</Text>
                            <Ionicons name="home" size={22} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    confetti: {
        position: 'absolute',
        top: 0,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    successCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        overflow: 'hidden',
        marginBottom: 30,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    circleGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a2e',
        marginBottom: 20,
        textAlign: 'center',
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    orderLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    orderNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#667eea',
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a2e',
        textAlign: 'right',
    },
    infoDesc: {
        fontSize: 13,
        color: '#666',
        textAlign: 'right',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 15,
    },
    thankYou: {
        fontSize: 18,
        color: '#667eea',
        fontWeight: '600',
        marginBottom: 30,
    },
    buttonContainer: {
        width: '100%',
    },
    button: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
