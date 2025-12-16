import React, { useEffect, useContext, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Share,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import PremiumBackground from '../../components/PremiumBackground';
import Animated, { FadeInDown, FadeInUp, ZoomIn, BounceIn } from 'react-native-reanimated';
import { CartContext } from '../../../src/context/CardContext';
import { useCheckout } from '../../../src/context/CheckoutContext';
import { sendOrderUpdateNotification } from '../../../src/utils/notifications';
import { useTranslation } from '../../../src/hooks/useTranslation';
import { RevolutionTheme } from '../../../src/theme/RevolutionTheme';


import { useTheme } from '../../../src/context/ThemeContext';

const { width, height } = Dimensions.get('window');

const OrderSuccessScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { clearCart } = useContext(CartContext);
    const { resetCheckout } = useCheckout();
    const { t } = useTranslation();
    const { colors, theme } = useTheme();
    const isDark = theme === 'dark';

    // Dynamic Theme Colors
    const themeBg = isDark ? RevolutionTheme.colors.background : RevolutionTheme.colors.backgroundLight;
    const themeText = isDark ? RevolutionTheme.colors.text.primary : RevolutionTheme.colors.creamText;
    const themeTextSecondary = isDark ? RevolutionTheme.colors.text.secondary : RevolutionTheme.colors.creamTextSecondary;
    const themeCard = isDark ? RevolutionTheme.colors.card : RevolutionTheme.colors.creamCard;
    const themeBorder = isDark ? 'rgba(255,255,255,0.05)' : RevolutionTheme.colors.glassBorderLight;
    const themeIconBg = isDark ? RevolutionTheme.colors.glass : 'rgba(212, 175, 55, 0.08)';
    const [showConfetti, setShowConfetti] = useState(true);

    const orderNumber = params.orderNumber || 'ORD-' + Date.now().toString(36).toUpperCase();
    const total = params.total || '0.00';

    useEffect(() => {
        // Send notification (wrapped in try-catch for Expo Go)
        try {
            sendOrderUpdateNotification(orderNumber, 'confirmed');
        } catch (error) {
            console.log('Notification skipped');
        }

        // Clear cart and reset checkout
        if (clearCart) clearCart();
        if (resetCheckout) resetCheckout();

        // Stop confetti after 4 seconds
        const timer = setTimeout(() => {
            setShowConfetti(false);
        }, 4000);

        return () => clearTimeout(timer);
    }, []);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `I just ordered from Fashion Store! 🛍️\nOrder Number: ${orderNumber}\nTotal: $${total}`,
                title: 'My Fashion Store Order',
            });
        } catch (error) {
            console.log('Share error:', error);
        }
    };

    // Simple confetti effect with animated views
    const renderConfetti = () => {
        if (!showConfetti) return null;

        const confettiColors = ['#D4AF37', '#B4941F', '#0B1121', '#1C2541', '#FFFFFF', '#E5C158'];
        return (
            <View style={styles.confettiContainer} pointerEvents="none">
                {Array.from({ length: 20 }).map((_, i) => (
                    <Animated.View
                        key={i}
                        entering={BounceIn.delay(i * 50).duration(1000)}
                        style={{
                            position: 'absolute',
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 50}%`,
                        }}
                    >
                        <Animated.View
                            style={[
                                styles.confettiPiece,
                                {
                                    backgroundColor: confettiColors[i % confettiColors.length],
                                    transform: [{ rotate: `${Math.random() * 360}deg` }],
                                    // Remove position from here since it's on wrapper
                                    position: 'relative',
                                },
                            ]}
                        />
                    </Animated.View>
                ))}
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: themeBg }}>
            {/* Background Gradient for Cream Mode */}
            {!isDark && (
                <LinearGradient
                    colors={RevolutionTheme.colors.gradient.cream}
                    style={StyleSheet.absoluteFill}
                />
            )}
            {/* Background for Dark Mode */}
            {isDark && (
                <PremiumBackground style={StyleSheet.absoluteFill} />
            )}

            <SafeAreaView style={styles.container}>
                {renderConfetti()}

                <View style={styles.content}>
                    {/* Success Icon */}
                    <Animated.View
                        entering={ZoomIn.delay(200).springify()}
                        style={styles.iconContainer}
                    >
                        <LinearGradient
                            colors={RevolutionTheme.colors.gradient.gold} // Gold Gradient
                            style={styles.iconGradient}
                        >
                            <Ionicons name="checkmark" size={60} color={colors.textInverse} />
                        </LinearGradient>
                    </Animated.View>

                    {/* Success Message */}
                    <Animated.Text
                        entering={FadeInDown.delay(400).springify()}
                        style={[styles.title, { color: themeText }]}
                    >
                        {t('orderPlaced')} 🎉
                    </Animated.Text>

                    <Animated.Text
                        entering={FadeInDown.delay(500).springify()}
                        style={[styles.subtitle, { color: themeTextSecondary }]}
                    >
                        {t('orderSuccess')}
                    </Animated.Text>

                    {/* Order Details */}
                    <Animated.View
                        entering={FadeInDown.delay(600).springify()}
                        style={[styles.orderDetailsContainer, { backgroundColor: themeCard, borderColor: themeBorder }]}
                    >
                        <View style={styles.orderRow}>
                            <Text style={[styles.orderLabel, { color: themeTextSecondary }]}>{t('orderNumber')}</Text>
                            <TouchableOpacity
                                style={styles.copyButton}
                                onPress={handleShare}
                            >
                                <Text style={[styles.orderValue, { color: themeText }]}>{orderNumber}</Text>
                                <Ionicons name="share-outline" size={18} color={RevolutionTheme.colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.divider, { backgroundColor: themeBorder }]} />

                        <View style={styles.orderRow}>
                            <Text style={[styles.orderLabel, { color: themeTextSecondary }]}>{t('totalAmount')}</Text>
                            <Text style={[styles.totalValue, { color: RevolutionTheme.colors.primary }]}>${total}</Text>
                        </View>

                        <View style={[styles.divider, { backgroundColor: themeBorder }]} />

                        <View style={styles.orderRow}>
                            <Text style={[styles.orderLabel, { color: themeTextSecondary }]}>{t('estimatedDelivery')}</Text>
                            <Text style={[styles.orderValue, { color: themeText }]}>{t('businessDays')}</Text>
                        </View>
                    </Animated.View>

                    {/* Features */}
                    <Animated.View
                        entering={FadeInDown.delay(700).springify()}
                        style={styles.featuresContainer}
                    >
                        <View style={[styles.featureItem, { backgroundColor: themeCard, borderColor: themeBorder }]}>
                            <View style={[styles.featureIcon, { backgroundColor: 'rgba(102,126,234,0.1)' }]}>
                                <Ionicons name="mail" size={22} color="#667eea" />
                            </View>
                            <View style={styles.featureText}>
                                <Text style={[styles.featureTitle, { color: themeText }]}>{t('emailConfirmation')}</Text>
                                <Text style={[styles.featureDesc, { color: themeTextSecondary }]}>{t('sentToEmail')}</Text>
                            </View>
                            <Ionicons name="checkmark-circle" size={20} color={RevolutionTheme.colors.primary} />
                        </View>

                        <View style={[styles.featureItem, { backgroundColor: themeCard, borderColor: themeBorder }]}>
                            <View style={[styles.featureIcon, { backgroundColor: 'rgba(212,175,55,0.1)' }]}>
                                <Ionicons name="cube" size={22} color={RevolutionTheme.colors.primary} />
                            </View>
                            <View style={styles.featureText}>
                                <Text style={[styles.featureTitle, { color: themeText }]}>{t('freeShipping')}</Text>
                                <Text style={[styles.featureDesc, { color: themeTextSecondary }]}>{t('trackedDelivery')}</Text>
                            </View>
                            <Ionicons name="checkmark-circle" size={20} color={RevolutionTheme.colors.primary} />
                        </View>

                        <View style={[styles.featureItem, { backgroundColor: themeCard, borderColor: themeBorder }]}>
                            <View style={[styles.featureIcon, { backgroundColor: 'rgba(217,119,6,0.1)' }]}>
                                <Ionicons name="shield-checkmark" size={22} color="#D97706" />
                            </View>
                            <View style={styles.featureText}>
                                <Text style={[styles.featureTitle, { color: themeText }]}>{t('buyerProtection')}</Text>
                                <Text style={[styles.featureDesc, { color: themeTextSecondary }]}>{t('thirtyDayGuarantee')}</Text>
                            </View>
                            <Ionicons name="checkmark-circle" size={20} color={RevolutionTheme.colors.primary} />
                        </View>
                    </Animated.View>

                    {/* Action Buttons */}
                    <Animated.View
                        entering={FadeInUp.delay(800).springify()}
                        style={styles.buttonsContainer}
                    >
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => router.push({
                                pathname: '/screens/orders/OrderTrackingScreen',
                                params: { id: orderNumber }
                            })}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={RevolutionTheme.colors.gradient.gold} // Gold Gradient
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.buttonGradient}
                            >
                                <Ionicons name="location" size={20} color={isDark ? '#000' : '#FFF'} />
                                <Text style={[styles.primaryButtonText, { color: isDark ? '#000' : '#FFF' }]}>{t('trackOrder')}</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.secondaryButton, { backgroundColor: themeIconBg, borderColor: RevolutionTheme.colors.primary }]}
                            onPress={() => router.replace('/(tabs)')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.secondaryButtonText, { color: RevolutionTheme.colors.primary }]}>{t('continueShopping')}</Text>
                            <Ionicons name="arrow-forward" size={18} color={RevolutionTheme.colors.primary} />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    confettiContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
    },
    confettiPiece: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 2,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    iconContainer: {
        marginBottom: 24,
    },
    iconGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginBottom: 24,
    },
    orderDetailsContainer: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    orderLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    orderValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginRight: 8,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#D4AF37',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 4,
    },
    featuresContainer: {
        width: '100%',
        marginBottom: 24,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    featureIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 2,
    },
    featureDesc: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
    },
    buttonsContainer: {
        width: '100%',
    },
    primaryButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 10,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 2,
        borderColor: '#D4AF37',
        gap: 8,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#D4AF37',
    },
});

export default OrderSuccessScreen;
