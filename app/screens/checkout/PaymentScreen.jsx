import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useCheckout } from '../../../src/context/CheckoutContext';
import PremiumBackground from '../../components/PremiumBackground';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import PromoCodeInput from '../../components/PromoCodeInput';
import { useRouter } from 'expo-router';
import { validateCardNumber, validateCVV, validateExpiry, validateName } from '../../../src/utils/validation';
import { cleanInput, rateLimiters } from '../../../src/utils/security';
import { handleError } from '../../../src/utils/errorHandler';
import { getCardType, maskCardNumber, formatCardNumber } from '../../../src/services/paymentService';
import { useTranslation } from '../../../src/hooks/useTranslation';
import { RevolutionTheme } from '../../../src/theme/RevolutionTheme';
import { LinearGradient } from 'expo-linear-gradient';

const PaymentScreen = () => {
    const router = useRouter();
    const { colors, theme } = useTheme();
    const { setCurrentPaymentMethod, currentShippingAddress, savePaymentMethod, savedPaymentMethods, deletePaymentMethod } = useCheckout();
    const { t } = useTranslation();
    const isDark = theme === 'dark';

    // Dynamic Theme Colors
    const themeBg = isDark ? RevolutionTheme.colors.background : RevolutionTheme.colors.backgroundLight;
    const themeText = isDark ? RevolutionTheme.colors.text.primary : RevolutionTheme.colors.creamText;
    const themeTextSecondary = isDark ? RevolutionTheme.colors.text.secondary : RevolutionTheme.colors.creamTextSecondary;
    const themeCard = isDark ? RevolutionTheme.colors.card : RevolutionTheme.colors.creamCard;
    const themeBorder = isDark ? 'rgba(255,255,255,0.05)' : RevolutionTheme.colors.glassBorderLight;
    const themeIconBg = isDark ? RevolutionTheme.colors.glass : 'rgba(212, 175, 55, 0.08)';

    const [selectedMethod, setSelectedMethod] = useState('cod');
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvc: '',
        name: '',
    });
    const [cardType, setCardType] = useState('unknown');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [saveCard, setSaveCard] = useState(false);
    const [selectedSavedCard, setSelectedSavedCard] = useState(null);

    // Detect card type as user types
    useEffect(() => {
        if (cardDetails.number.length >= 4) {
            const type = getCardType(cardDetails.number);
            setCardType(type);
        } else {
            setCardType('unknown');
        }
    }, [cardDetails.number]);

    // Format card number with spaces
    const handleCardNumberChange = (text) => {
        // Remove non-digits
        const cleaned = text.replace(/\D/g, '');
        // Format with spaces every 4 digits
        const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
        setCardDetails({ ...cardDetails, number: formatted.slice(0, 19) });
        if (errors.number) setErrors(prev => ({ ...prev, number: null }));
    };

    // Format expiry date
    const handleExpiryChange = (text) => {
        // Remove non-digits
        const cleaned = text.replace(/\D/g, '');
        // Format as MM/YY
        let formatted = cleaned;
        if (cleaned.length >= 2) {
            formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
        }
        setCardDetails({ ...cardDetails, expiry: formatted.slice(0, 5) });
        if (errors.expiry) setErrors(prev => ({ ...prev, expiry: null }));
    };

    const validateCard = () => {
        let valid = true;
        let newErrors = {};

        if (selectedMethod === 'card') {
            // Validate card number using Luhn algorithm
            const cardValidation = validateCardNumber(cardDetails.number.replace(/\s/g, ''));
            if (!cardValidation.isValid) {
                newErrors.number = cardValidation.error;
                valid = false;
            }

            // Validate expiry date
            if (!cardDetails.expiry) {
                newErrors.expiry = t('expiryRequired');
                valid = false;
            } else {
                const [month, year] = cardDetails.expiry.split('/');
                const expiryValidation = validateExpiry(month, year);
                if (!expiryValidation.isValid) {
                    newErrors.expiry = t('invalidExpiry');
                    valid = false;
                }
            }

            // Validate CVV
            const cvvValidation = validateCVV(cardDetails.cvc, cardType);
            if (!cvvValidation.isValid) {
                newErrors.cvc = t('invalidCvv');
                valid = false;
            }

            // Validate holder name
            const nameValidation = validateName(cardDetails.name);
            if (!nameValidation.isValid) {
                newErrors.name = t('invalidName');
                valid = false;
            }
        }

        setErrors(newErrors);
        return valid;
    };

    const handleContinue = async () => {
        // Rate limiting check
        if (!rateLimiters.payment.isAllowed('payment_attempt')) {
            const waitTime = Math.ceil(rateLimiters.payment.getTimeUntilReset('payment_attempt') / 1000);
            Alert.alert(
                t('tooManyAttempts'),
                t('pleaseWait').replace('{seconds}', waitTime)
            );
            return;
        }

        if (selectedMethod === 'card' && !selectedSavedCard && !validateCard()) {
            return;
        }

        setLoading(true);
        try {
            let paymentData;

            if (selectedMethod === 'card' && selectedSavedCard) {
                // Use saved card data
                paymentData = selectedSavedCard;
            } else {
                // Sanitize and save payment method
                paymentData = {
                    type: selectedMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card',
                    cardType: selectedMethod === 'card' ? cardType : null,
                    lastFour: selectedMethod === 'card' ? cardDetails.number.replace(/\s/g, '').slice(-4) : null,
                    holderName: selectedMethod === 'card' ? cleanInput(cardDetails.name) : null,
                    saveCard,
                };
            }

            // Save card if requested
            if (selectedMethod === 'card' && saveCard) {
                await savePaymentMethod({
                    number: `**** **** **** ${cardDetails.number.replace(/\s/g, '').slice(-4)}`,
                    expiry: cardDetails.expiry,
                    holder: cardDetails.name,
                    type: cardType,
                    lastFour: cardDetails.number.replace(/\s/g, '').slice(-4),
                });
            }

            setCurrentPaymentMethod(paymentData);

            // Small delay for UX
            await new Promise(resolve => setTimeout(resolve, 500));

            router.push('/screens/checkout/ReviewOrderScreen');
        } catch (error) {
            handleError(error, {
                context: 'PaymentScreen',
                onError: () => {
                    Alert.alert(t('error'), t('failedToProcess'));
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const getCardIcon = () => {
        switch (cardType) {
            case 'visa':
                return <FontAwesome name="cc-visa" size={28} color={colors.text} />;
            case 'mastercard':
                return <FontAwesome name="cc-mastercard" size={28} color={colors.error} />;
            case 'amex':
                return <FontAwesome name="cc-amex" size={28} color={colors.info} />;
            case 'discover':
                return <FontAwesome name="cc-discover" size={28} color={colors.warning} />;
            default:
                return <FontAwesome name="credit-card" size={24} color="#fff" />;
        }
    };

    const renderPaymentOption = (id, icon, label, subLabel, IconComponent = FontAwesome) => (
        <TouchableOpacity
            style={[
                styles.paymentOption,
                { backgroundColor: themeCard, borderColor: themeBorder },
                selectedMethod === id && { borderColor: RevolutionTheme.colors.primary, borderWidth: 1.5, shadowColor: RevolutionTheme.colors.primary, shadowOpacity: 0.2 },
            ]}
            onPress={() => {
                setSelectedMethod(id);
                setSelectedSavedCard(null); // Deselect saved card if manual option picked
            }}
            activeOpacity={0.7}
        >
            <View style={styles.paymentOptionHeader}>
                <View style={[
                    styles.paymentIconContainer,
                    { backgroundColor: themeIconBg },
                    selectedMethod === id && { backgroundColor: RevolutionTheme.colors.primary }
                ]}>
                    <IconComponent name={icon} size={24} color={selectedMethod === id ? (isDark ? '#000' : '#FFF') : themeText} />
                </View>
                <View style={styles.paymentTextContainer}>
                    <Text style={[styles.paymentLabel, { color: themeText }]}>{label}</Text>
                    <Text style={[styles.paymentSubLabel, { color: themeTextSecondary }]}>{subLabel}</Text>
                </View>
                <View style={[styles.radioButton, { borderColor: isDark ? colors.border : '#E5E7EB' }, selectedMethod === id && styles.activeRadioButton]}>
                    {selectedMethod === id && <View style={[styles.radioInner, { backgroundColor: RevolutionTheme.colors.primary }]} />}
                </View>
            </View>
        </TouchableOpacity>
    );

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
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: themeIconBg }]}>
                        <Ionicons name="arrow-back" size={24} color={themeText} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: themeText }]}>{t('paymentMethod')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressItem}>
                        <View style={[styles.progressCircle, { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                            <Ionicons name="checkmark" size={18} color={colors.textInverse} />
                        </View>
                        <Text style={[styles.progressLabel, styles.completedLabel, { color: colors.accent }]}>{t('shipping')}</Text>
                    </View>
                    <View style={[styles.progressLine, styles.completedLine]} />
                    <View style={styles.progressItem}>
                        <View style={[styles.progressCircle, styles.activeProgress, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                            <Text style={[styles.progressText, { color: colors.textInverse }]}>2</Text>
                        </View>
                        <Text style={[styles.progressLabel, styles.activeLabel, { color: colors.primary }]}>{t('paymentMethod')}</Text>
                    </View>
                    <View style={[styles.progressLine, { backgroundColor: isDark ? colors.border : '#E5E7EB' }]} />
                    <View style={styles.progressItem}>
                        <View style={[styles.progressCircle, { backgroundColor: isDark ? colors.card : '#F5F5F5', borderColor: colors.border }]}>
                            <Text style={[styles.progressText, { color: colors.textSecondary }]}>3</Text>
                        </View>
                        <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>{t('reviewOrder')}</Text>
                    </View>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                        <Animated.View entering={FadeInDown.duration(500)}>

                            {/* Saved Cards Section */}
                            {savedPaymentMethods.length > 0 && (
                                <View style={styles.savedCardsSection}>
                                    <Text style={[styles.sectionTitle, { color: themeText }]}>{t('savedCards')}</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {savedPaymentMethods.map((card, index) => (
                                            <View key={index} style={{ position: 'relative' }}>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.savedCardItem,
                                                        { backgroundColor: themeCard, borderColor: selectedSavedCard?.id === card.id ? RevolutionTheme.colors.primary : themeBorder },
                                                        selectedSavedCard?.id === card.id && { borderWidth: 2 }
                                                    ]}
                                                    onPress={() => {
                                                        setSelectedMethod('card');
                                                        setSelectedSavedCard(card);
                                                    }}
                                                >
                                                    <View style={styles.savedCardHeader}>
                                                        <FontAwesome
                                                            name={card.type === 'Visa' ? 'cc-visa' : card.type === 'Mastercard' ? 'cc-mastercard' : 'credit-card'}
                                                            size={24}
                                                            color={themeText}
                                                        />
                                                        {selectedSavedCard?.id === card.id && (
                                                            <Ionicons name="checkmark-circle" size={20} color={RevolutionTheme.colors.primary} />
                                                        )}
                                                    </View>
                                                    <Text style={[styles.savedCardNumber, { color: themeText }]}>{card.number}</Text>
                                                    <Text style={[styles.savedCardHolder, { color: themeTextSecondary }]}>{card.holder}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.deleteCardBtn}
                                                    onPress={() => {
                                                        Alert.alert(
                                                            t('deleteCard'),
                                                            t('deleteCardConfirm'),
                                                            [
                                                                { text: t('cancel'), style: 'cancel' },
                                                                {
                                                                    text: t('delete'),
                                                                    style: 'destructive',
                                                                    onPress: () => {
                                                                        if (selectedSavedCard?.id === card.id) setSelectedSavedCard(null);
                                                                        deletePaymentMethod(card.id);
                                                                    }
                                                                }
                                                            ]
                                                        );
                                                    }}
                                                >
                                                    <Ionicons name="trash-outline" size={16} color="#FF4444" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            <Text style={[styles.sectionTitle, { color: themeText }]}>{t('selectPaymentMethod')}</Text>

                            {renderPaymentOption('cod', 'money', t('cashOnDelivery'), t('payOnDelivery'))}
                            {renderPaymentOption('card', 'credit-card', t('creditCard'), t('paySecurely'))}

                            {/* Apple Pay / Google Pay option */}
                            {Platform.OS === 'ios' && renderPaymentOption(
                                'applepay',
                                'apple',
                                t('applePay'),
                                t('fastSecureCheckout'),
                                MaterialCommunityIcons
                            )}
                            {Platform.OS === 'android' && renderPaymentOption(
                                'googlepay',
                                'google',
                                t('googlePay'),
                                t('fastSecureCheckout'),
                                MaterialCommunityIcons
                            )}

                            {/* Promo Code Input */}
                            <PromoCodeInput />

                            {selectedMethod === 'card' && !selectedSavedCard && (
                                <Animated.View entering={FadeInUp.duration(400)} style={[styles.cardForm, { backgroundColor: themeCard, borderColor: themeBorder }]}>
                                    {/* Card Preview */}
                                    <View style={styles.cardPreview}>
                                        <View style={styles.cardPreviewHeader}>
                                            {getCardIcon()}
                                            <Text style={styles.cardPreviewType}>
                                                {cardType !== 'unknown' ? cardType.toUpperCase() : t('creditCardLabel')}
                                            </Text>
                                        </View>
                                        <Text style={styles.cardPreviewNumber}>
                                            {cardDetails.number || '•••• •••• •••• ••••'}
                                        </Text>
                                        <View style={styles.cardPreviewFooter}>
                                            <View>
                                                <Text style={styles.cardPreviewLabel}>{t('cardHolderLabel')}</Text>
                                                <Text style={styles.cardPreviewValue}>
                                                    {cardDetails.name.toUpperCase() || t('yourName').toUpperCase()}
                                                </Text>
                                            </View>
                                            <View>
                                                <Text style={styles.cardPreviewLabel}>{t('expiresLabel')}</Text>
                                                <Text style={styles.cardPreviewValue}>
                                                    {cardDetails.expiry || 'MM/YY'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Text style={[styles.inputLabel, { color: themeText }]}>{t('cardNumber')}</Text>
                                        <View style={[styles.inputWrapper, { backgroundColor: themeBg, borderColor: themeBorder }, errors.number && styles.inputError]}>
                                            <TextInput
                                                style={[styles.input, { color: themeText }]}
                                                placeholder="0000 0000 0000 0000"
                                                placeholderTextColor={themeTextSecondary}
                                                value={cardDetails.number}
                                                onChangeText={handleCardNumberChange}
                                                keyboardType="numeric"
                                                maxLength={19}
                                            />
                                            <View style={styles.cardTypeIcon}>
                                                {getCardIcon()}
                                            </View>
                                        </View>
                                        {errors.number && <Text style={styles.errorText}>{errors.number}</Text>}
                                    </View>

                                    <View style={styles.row}>
                                        <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                                            <Text style={[styles.inputLabel, { color: themeText }]}>{t('expiryDate')}</Text>
                                            <TextInput
                                                style={[styles.inputSmall, { backgroundColor: themeBg, borderColor: themeBorder, color: themeText }, errors.expiry && styles.inputError]}
                                                placeholder="MM/YY"
                                                placeholderTextColor={themeTextSecondary}
                                                value={cardDetails.expiry}
                                                onChangeText={handleExpiryChange}
                                                keyboardType="numeric"
                                                maxLength={5}
                                            />
                                            {errors.expiry && <Text style={styles.errorText}>{errors.expiry}</Text>}
                                        </View>

                                        <View style={[styles.inputContainer, { flex: 1 }]}>
                                            <Text style={[styles.inputLabel, { color: themeText }]}>{t('cvv')}</Text>
                                            <View style={[styles.inputWrapper, { backgroundColor: themeBg, borderColor: themeBorder, paddingRight: 10 }, errors.cvc && styles.inputError]}>
                                                <TextInput
                                                    style={[styles.input, { color: themeText }]}
                                                    placeholder={cardType === 'amex' ? '1234' : '123'}
                                                    placeholderTextColor={themeTextSecondary}
                                                    value={cardDetails.cvc}
                                                    onChangeText={(text) => {
                                                        setCardDetails({ ...cardDetails, cvc: text.replace(/\D/g, '') });
                                                        if (errors.cvc) setErrors(prev => ({ ...prev, cvc: null }));
                                                    }}
                                                    keyboardType="numeric"
                                                    maxLength={cardType === 'amex' ? 4 : 3}
                                                    secureTextEntry
                                                />
                                                <Ionicons name="help-circle-outline" size={20} color={themeTextSecondary} />
                                            </View>
                                            {errors.cvc && <Text style={styles.errorText}>{errors.cvc}</Text>}
                                        </View>
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Text style={[styles.inputLabel, { color: themeText }]}>{t('cardHolder')}</Text>
                                        <TextInput
                                            style={[styles.inputSmall, { backgroundColor: themeBg, borderColor: themeBorder, color: themeText }, errors.name && styles.inputError]}
                                            placeholder="John Doe"
                                            placeholderTextColor={themeTextSecondary}
                                            value={cardDetails.name}
                                            onChangeText={(text) => {
                                                setCardDetails({ ...cardDetails, name: text });
                                                if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                                            }}
                                            autoCapitalize="words"
                                        />
                                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                                    </View>

                                    {/* Save Card Option */}
                                    <TouchableOpacity
                                        style={styles.saveCardOption}
                                        onPress={() => setSaveCard(!saveCard)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.checkbox, { borderColor: themeBorder }, saveCard && styles.checkboxActive]}>
                                            {saveCard && <Ionicons name="checkmark" size={16} color="#FFF" />}
                                        </View>
                                        <Text style={[styles.saveCardText, { color: themeTextSecondary }]}>{t('saveCard')}</Text>
                                    </TouchableOpacity>

                                    {/* Security Badge */}
                                    <View style={[styles.securityBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                                        <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                                        <Text style={[styles.securityText, { color: themeTextSecondary }]}>
                                            {t('paymentSecure')}
                                        </Text>
                                    </View>
                                </Animated.View>
                            )}
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>

                <View style={[styles.footer, { backgroundColor: themeCard, borderTopColor: themeBorder, borderTopWidth: 1 }]}>
                    <TouchableOpacity
                        style={[styles.payButton, loading && styles.payButtonDisabled]}
                        onPress={handleContinue}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.payButtonText}>{t('continueToReview')}</Text>
                                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 40,
    },
    progressItem: {
        alignItems: 'center',
    },
    progressCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    activeProgress: {
        // Handled inline
    },
    completedProgress: {
        // Handled inline
    },
    progressText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    progressLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    activeLabel: {
        color: '#1A1A1A',
        fontWeight: '600',
    },
    completedLabel: {
        color: '#1A1A1A',
        fontWeight: '600',
    },
    progressLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 10,
        marginBottom: 15,
    },
    completedLine: {
        backgroundColor: '#D4AF37',
    },
    content: {
        padding: 20,
        paddingBottom: 120,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 15,
    },
    paymentOption: {
        marginBottom: 12,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    activePaymentOption: {
        backgroundColor: '#F5F5F5',
        borderColor: '#1A1A1A',
    },
    paymentOptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    paymentIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    activeIconContainer: {
        // Handled inline
    },
    paymentTextContainer: {
        flex: 1,
    },
    paymentLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    paymentSubLabel: {
        fontSize: 13,
        color: '#6B7280',
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeRadioButton: {
        borderColor: '#1A1A1A',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#1A1A1A',
    },
    cardForm: {
        marginTop: 20,
        padding: 20,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardPreview: {
        padding: 20,
        borderRadius: 16,
        backgroundColor: '#1C2541', // Card color
        marginBottom: 20,
    },
    cardPreviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    cardPreviewType: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    cardPreviewNumber: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: 2,
        marginBottom: 20,
    },
    cardPreviewFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardPreviewLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
        letterSpacing: 1,
        marginBottom: 4,
    },
    cardPreviewValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: '#1A1A1A',
        marginBottom: 8,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        color: '#1A1A1A',
        fontSize: 16,
    },
    inputSmall: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 14,
        color: '#1A1A1A',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputError: {
        borderColor: '#D97706', // Luxury Orange/Gold
    },
    errorText: {
        color: '#D97706', // Luxury Orange/Gold
        fontSize: 12,
        marginTop: 6,
    },
    cardTypeIcon: {
        marginLeft: 10,
    },
    row: {
        flexDirection: 'row',
    },
    saveCardOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 15,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: '#059669',
        borderColor: '#059669',
    },
    saveCardText: {
        color: '#1A1A1A',
        fontSize: 14,
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        padding: 12,
        borderRadius: 10,
        marginTop: 10,
    },
    securityText: {
        color: '#10B981',
        fontSize: 13,
        marginLeft: 10,
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    payButton: {
        backgroundColor: '#D4AF37', // Gold
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    payButtonDisabled: {
        opacity: 0.7,
    },
    placeOrderText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    savedCardsSection: {
        marginBottom: 25,
    },
    savedCardItem: {
        width: 160,
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        marginRight: 15,
        height: 100,
        justifyContent: 'space-between'
    },
    savedCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    savedCardNumber: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1,
    },
    savedCardHolder: {
        fontSize: 12,
    },
    deleteCardBtn: {
        position: 'absolute',
        top: 10,
        right: 25,
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        padding: 6,
        borderRadius: 20,
    },
    payButtonText: {
        color: '#0B1121', // Navy text on Gold button
        fontSize: 17,
        fontWeight: '700',
    },
});

export default PaymentScreen;
