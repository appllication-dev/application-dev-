/**
 * Single Page Checkout - Kataraa
 * Combining Shipping + Payment in one page (matching reference)
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCheckout } from '../context/CheckoutContext';
import { useCart } from '../context/CartContext';
import { kuwaitGovernorates, getCitiesByGovernorate, calculateShipping } from '../data/kuwaitLocations';
import { COLORS, SPACING, RADIUS, GRADIENTS, SHADOWS } from '../theme/colors';

export default function CheckoutScreen() {
    const router = useRouter();
    const { shippingInfo, setShippingInfo, setShippingFee } = useCheckout();
    const { cartItems, getCartTotal, clearCart } = useCart();

    const [step, setStep] = useState(1); // 1 = shipping, 2 = payment
    const [showGovDropdown, setShowGovDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod'); // cod, knet, card
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);

    const cartTotal = getCartTotal();
    const cities = getCitiesByGovernorate(shippingInfo.governorate);
    const shipping = calculateShipping(shippingInfo.governorate, cartTotal, shippingInfo.city);
    const finalTotal = cartTotal + (shipping?.fee || 0);

    const formatPrice = (price) => `${parseFloat(price || 0).toFixed(3)} KWD`;

    const updateField = (field, value) => {
        setShippingInfo(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const selectGovernorate = (gov) => {
        setShippingInfo(prev => ({ ...prev, governorate: gov.id, city: '' }));
        setShippingFee(0);
        setShowGovDropdown(false);
    };

    const selectCity = (city) => {
        setShippingInfo(prev => ({ ...prev, city }));
        const newShipping = calculateShipping(shippingInfo.governorate, cartTotal, city);
        setShippingFee(newShipping.fee);
        setShowCityDropdown(false);
    };

    const getGovName = () => {
        const gov = kuwaitGovernorates.find(g => g.id === shippingInfo.governorate);
        return gov ? gov.name : 'اختر المحافظة';
    };

    const validateShipping = () => {
        const e = {};
        if (!shippingInfo.fullName?.trim()) e.fullName = 'مطلوب';
        if (!shippingInfo.phone?.trim()) e.phone = 'مطلوب';
        if (!shippingInfo.governorate) e.governorate = 'مطلوب';
        if (!shippingInfo.city) e.city = 'مطلوب';
        if (!shippingInfo.block?.trim()) e.block = 'مطلوب';
        if (!shippingInfo.street?.trim()) e.street = 'مطلوب';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNextStep = () => {
        if (step === 1 && validateShipping()) {
            setStep(2);
        }
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        // Simulate order processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        clearCart();
        router.replace('/checkout/success');
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={GRADIENTS.header} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>إتمام الطلب</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Progress Steps */}
                    <View style={styles.progressRow}>
                        <View style={styles.stepItem}>
                            <View style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}>
                                <Text style={styles.stepNumber}>1</Text>
                            </View>
                            <Text style={styles.stepLabel}>الشحن</Text>
                        </View>
                        <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
                        <View style={styles.stepItem}>
                            <View style={[styles.stepCircle, step >= 2 && styles.stepCircleActive]}>
                                <Text style={styles.stepNumber}>2</Text>
                            </View>
                            <Text style={styles.stepLabel}>الدفع</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {step === 1 ? (
                        /* STEP 1: Shipping */
                        <View style={styles.formCard}>
                            <Text style={styles.formTitle}>عنوان التوصيل</Text>

                            {/* Name */}
                            <Text style={styles.label}>الاسم الكامل *</Text>
                            <TextInput
                                style={[styles.input, errors.fullName && styles.inputError]}
                                placeholder="أدخل اسمك"
                                placeholderTextColor={COLORS.textMuted}
                                value={shippingInfo.fullName}
                                onChangeText={v => updateField('fullName', v)}
                                textAlign="right"
                            />

                            {/* Phone */}
                            <Text style={styles.label}>رقم الهاتف *</Text>
                            <TextInput
                                style={[styles.input, errors.phone && styles.inputError]}
                                placeholder="99999999"
                                placeholderTextColor={COLORS.textMuted}
                                value={shippingInfo.phone}
                                onChangeText={v => updateField('phone', v)}
                                keyboardType="phone-pad"
                                textAlign="right"
                            />

                            {/* Governorate */}
                            <Text style={styles.label}>المحافظة *</Text>
                            <TouchableOpacity
                                style={[styles.select, errors.governorate && styles.inputError]}
                                onPress={() => setShowGovDropdown(!showGovDropdown)}
                            >
                                <Ionicons name="chevron-down" size={18} color={COLORS.primary} />
                                <Text style={[styles.selectText, !shippingInfo.governorate && styles.placeholder]}>
                                    {getGovName()}
                                </Text>
                            </TouchableOpacity>

                            {showGovDropdown && (
                                <View style={styles.dropdown}>
                                    {kuwaitGovernorates.map(gov => (
                                        <TouchableOpacity
                                            key={gov.id}
                                            style={styles.dropdownItem}
                                            onPress={() => selectGovernorate(gov)}
                                        >
                                            <Text style={styles.dropdownText}>{gov.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* City */}
                            <Text style={styles.label}>المنطقة *</Text>
                            <TouchableOpacity
                                style={[styles.select, !shippingInfo.governorate && styles.selectDisabled]}
                                onPress={() => shippingInfo.governorate && setShowCityDropdown(!showCityDropdown)}
                            >
                                <Ionicons name="chevron-down" size={18} color={COLORS.primary} />
                                <Text style={[styles.selectText, !shippingInfo.city && styles.placeholder]}>
                                    {shippingInfo.city || 'اختر المنطقة'}
                                </Text>
                            </TouchableOpacity>

                            {showCityDropdown && cities.length > 0 && (
                                <View style={styles.dropdown}>
                                    {cities.map((city, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            style={styles.dropdownItem}
                                            onPress={() => selectCity(city)}
                                        >
                                            <Text style={styles.dropdownText}>{city}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Block & Street */}
                            <View style={styles.row}>
                                <View style={styles.halfInput}>
                                    <Text style={styles.label}>القطعة *</Text>
                                    <TextInput
                                        style={[styles.input, errors.block && styles.inputError]}
                                        placeholder="القطعة"
                                        placeholderTextColor={COLORS.textMuted}
                                        value={shippingInfo.block}
                                        onChangeText={v => updateField('block', v)}
                                        textAlign="right"
                                    />
                                </View>
                                <View style={styles.halfInput}>
                                    <Text style={styles.label}>الشارع *</Text>
                                    <TextInput
                                        style={[styles.input, errors.street && styles.inputError]}
                                        placeholder="الشارع"
                                        placeholderTextColor={COLORS.textMuted}
                                        value={shippingInfo.street}
                                        onChangeText={v => updateField('street', v)}
                                        textAlign="right"
                                    />
                                </View>
                            </View>

                            {/* Notes */}
                            <Text style={styles.label}>ملاحظات (اختياري)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="ملاحظات للتوصيل..."
                                placeholderTextColor={COLORS.textMuted}
                                value={shippingInfo.notes}
                                onChangeText={v => updateField('notes', v)}
                                multiline
                                textAlign="right"
                            />
                        </View>
                    ) : (
                        /* STEP 2: Payment */
                        <View>
                            {/* Order Summary */}
                            <View style={styles.formCard}>
                                <Text style={styles.formTitle}>ملخص الطلب</Text>

                                {cartItems.map(item => (
                                    <View key={item.id} style={styles.orderItem}>
                                        <Image source={{ uri: item.image }} style={styles.orderItemImage} />
                                        <View style={styles.orderItemInfo}>
                                            <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
                                            <Text style={styles.orderItemQty}>x{item.quantity}</Text>
                                        </View>
                                        <Text style={styles.orderItemPrice}>{formatPrice(item.price * item.quantity)}</Text>
                                    </View>
                                ))}

                                <View style={styles.divider} />

                                <View style={styles.totalRow}>
                                    <Text style={styles.totalValue}>{formatPrice(cartTotal)}</Text>
                                    <Text style={styles.totalLabel}>المجموع الفرعي</Text>
                                </View>
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalValue}>{formatPrice(shipping?.fee || 0)}</Text>
                                    <Text style={styles.totalLabel}>الشحن</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.totalRow}>
                                    <Text style={styles.grandTotal}>{formatPrice(finalTotal)}</Text>
                                    <Text style={styles.grandTotalLabel}>الإجمالي</Text>
                                </View>
                            </View>

                            {/* Payment Methods */}
                            <View style={styles.formCard}>
                                <Text style={styles.formTitle}>طريقة الدفع</Text>

                                <TouchableOpacity
                                    style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionActive]}
                                    onPress={() => setPaymentMethod('cod')}
                                >
                                    <View style={styles.paymentRadio}>
                                        {paymentMethod === 'cod' && <View style={styles.paymentRadioInner} />}
                                    </View>
                                    <Ionicons name="cash-outline" size={24} color={COLORS.text} />
                                    <Text style={styles.paymentLabel}>الدفع عند الاستلام</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.paymentOption, paymentMethod === 'knet' && styles.paymentOptionActive]}
                                    onPress={() => setPaymentMethod('knet')}
                                >
                                    <View style={styles.paymentRadio}>
                                        {paymentMethod === 'knet' && <View style={styles.paymentRadioInner} />}
                                    </View>
                                    <Ionicons name="card-outline" size={24} color={COLORS.text} />
                                    <Text style={styles.paymentLabel}>KNET</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionActive]}
                                    onPress={() => setPaymentMethod('card')}
                                >
                                    <View style={styles.paymentRadio}>
                                        {paymentMethod === 'card' && <View style={styles.paymentRadioInner} />}
                                    </View>
                                    <Ionicons name="card" size={24} color={COLORS.text} />
                                    <Text style={styles.paymentLabel}>بطاقة ائتمان</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={{ height: 120 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Button */}
            <View style={styles.bottom}>
                {step === 1 ? (
                    <TouchableOpacity style={styles.continueBtn} onPress={handleNextStep}>
                        <LinearGradient colors={GRADIENTS.button} style={styles.continueBtnGrad}>
                            <Text style={styles.continueBtnText}>متابعة للدفع</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.continueBtn}
                        onPress={handlePlaceOrder}
                        disabled={isProcessing}
                    >
                        <LinearGradient colors={GRADIENTS.button} style={styles.continueBtnGrad}>
                            {isProcessing ? (
                                <Text style={styles.continueBtnText}>جاري المعالجة...</Text>
                            ) : (
                                <>
                                    <Text style={styles.continueBtnText}>تأكيد الطلب - {formatPrice(finalTotal)}</Text>
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingBottom: SPACING.md,
        borderBottomLeftRadius: RADIUS.xxl,
        borderBottomRightRadius: RADIUS.xxl,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.sm,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
    },
    stepItem: {
        alignItems: 'center',
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    stepCircleActive: {
        backgroundColor: '#fff',
    },
    stepNumber: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    stepLabel: {
        color: '#fff',
        fontSize: 11,
    },
    stepLine: {
        width: 60,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: SPACING.sm,
    },
    stepLineActive: {
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: SPACING.md,
    },
    formCard: {
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        ...SHADOWS.md,
    },
    formTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'right',
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: 'right',
        marginTop: SPACING.sm,
        marginBottom: 6,
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.md,
        padding: SPACING.sm,
        fontSize: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputError: {
        borderColor: COLORS.error,
        borderWidth: 2,
    },
    textArea: {
        height: 70,
        textAlignVertical: 'top',
    },
    select: {
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.md,
        padding: SPACING.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    selectDisabled: {
        opacity: 0.5,
    },
    selectText: {
        fontSize: 14,
        color: COLORS.text,
        flex: 1,
        textAlign: 'right',
    },
    placeholder: {
        color: COLORS.textMuted,
    },
    dropdown: {
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.md,
        marginTop: 4,
        maxHeight: 180,
        ...SHADOWS.sm,
    },
    dropdownItem: {
        padding: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    dropdownText: {
        fontSize: 14,
        textAlign: 'right',
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    halfInput: {
        flex: 1,
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    orderItemImage: {
        width: 50,
        height: 50,
        borderRadius: RADIUS.sm,
        marginRight: SPACING.sm,
    },
    orderItemInfo: {
        flex: 1,
    },
    orderItemName: {
        fontSize: 13,
        color: COLORS.text,
    },
    orderItemQty: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    orderItemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.sm,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    totalLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    totalValue: {
        fontSize: 13,
        color: COLORS.text,
    },
    grandTotalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    grandTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.sm,
        gap: SPACING.sm,
    },
    paymentOptionActive: {
        borderColor: COLORS.primary,
        backgroundColor: `${COLORS.primary}10`,
    },
    paymentRadio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paymentRadioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    paymentLabel: {
        fontSize: 14,
        color: COLORS.text,
        flex: 1,
        textAlign: 'right',
    },
    bottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.md,
        paddingBottom: SPACING.xl,
        backgroundColor: COLORS.card,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        ...SHADOWS.lg,
    },
    continueBtn: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    continueBtnGrad: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        gap: SPACING.sm,
    },
    continueBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
