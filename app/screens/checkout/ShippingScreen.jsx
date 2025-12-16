import React, { useState, useRef } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useCheckout } from '../../../src/context/CheckoutContext';
import PremiumBackground from '../../components/PremiumBackground';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { validateName, validatePhone, validateAddress } from '../../../src/utils/validation';
import { cleanInput, isInputSafe } from '../../../src/utils/security';

import { useTranslation } from '../../../src/hooks/useTranslation';
import { getLocalizedLocations } from '../../../src/data/locations'; // Updated Import
import { Modal, FlatList } from 'react-native'; // Ensure Modal/FlatList imports
import { RevolutionTheme } from '../../../src/theme/RevolutionTheme';
import { LinearGradient } from 'expo-linear-gradient';

const ShippingScreen = () => {
    const navigation = useNavigation();
    const { colors, theme } = useTheme();
    const { currentShippingAddress, setCurrentShippingAddress, savedAddresses, saveAddress, deleteAddress } = useCheckout();
    const { t, language } = useTranslation(); // Get language
    const isDark = theme === 'dark';

    // Dynamic Theme Colors
    const themeBg = isDark ? RevolutionTheme.colors.background : RevolutionTheme.colors.backgroundLight;
    const themeText = isDark ? RevolutionTheme.colors.text.primary : RevolutionTheme.colors.creamText;
    const themeTextSecondary = isDark ? RevolutionTheme.colors.text.secondary : RevolutionTheme.colors.creamTextSecondary;
    const themeCard = isDark ? RevolutionTheme.colors.card : RevolutionTheme.colors.creamCard;
    const themeBorder = isDark ? 'rgba(255,255,255,0.05)' : RevolutionTheme.colors.glassBorderLight;
    const themeIconBg = isDark ? RevolutionTheme.colors.glass : 'rgba(212, 175, 55, 0.08)';

    const [form, setForm] = useState(currentShippingAddress || {
        fullName: '',
        phoneNumber: '',
        address: '',
        city: '',
        zipCode: '',
        country: '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Selection Modals State
    const [showCountryModal, setShowCountryModal] = useState(false);
    const [showCityModal, setShowCityModal] = useState(false);


    // Derived Data
    const localizedLocations = getLocalizedLocations(language);
    const countries = localizedLocations ? Object.keys(localizedLocations) : [];
    const cities = form.country && localizedLocations ? (localizedLocations[form.country] || []) : [];

    // Refs for input navigation
    const phoneRef = useRef(null);
    const addressRef = useRef(null);
    const cityRef = useRef(null);
    const zipRef = useRef(null);
    const countryRef = useRef(null);

    const validate = () => {
        let valid = true;
        let newErrors = {};

        // Validate full name
        const nameResult = validateName(form.fullName);
        if (!nameResult.isValid) {
            newErrors.fullName = nameResult.error;
            valid = false;
        }

        // Validate phone
        const phoneResult = validatePhone(form.phoneNumber);
        if (!phoneResult.isValid) {
            newErrors.phoneNumber = phoneResult.error;
            valid = false;
        }

        // Validate address
        if (!form.address || form.address.trim().length < 5) {
            newErrors.address = t('inputErrorAddress');
            valid = false;
        }

        // Validate city
        if (!form.city || form.city.trim().length < 2) {
            newErrors.city = t('inputErrorCity');
            valid = false;
        }

        // Validate zip code
        if (!form.zipCode || !/^[\w\s\-]{3,10}$/.test(form.zipCode.trim())) {
            newErrors.zipCode = t('inputErrorZip');
            valid = false;
        }

        // Check for injection attempts
        const fieldsToCheck = [form.fullName, form.address, form.city, form.country];
        for (const field of fieldsToCheck) {
            if (field && !isInputSafe(field)) {
                Alert.alert(t('securityWarning'), t('invalidInput'));
                return false;
            }
        }

        setErrors(newErrors);
        return valid;
    };

    const [saveAddressChecked, setSaveAddressChecked] = useState(false);

    const handleNext = async () => {
        if (validate()) {
            setLoading(true);
            // Sanitize all inputs before saving
            const sanitizedForm = {
                fullName: cleanInput(form.fullName),
                phoneNumber: cleanInput(form.phoneNumber),
                address: cleanInput(form.address),
                city: cleanInput(form.city),
                zipCode: cleanInput(form.zipCode),
                country: cleanInput(form.country),
            };

            // Save address if checkbox is checked
            if (saveAddressChecked) {
                await saveAddress({
                    ...sanitizedForm,
                    label: 'Home' // Default label for quick saved addresses
                });
            }

            setCurrentShippingAddress(sanitizedForm);
            setLoading(false);
            navigation.navigate('PaymentScreen');
        }
    };

    const handleUseSavedAddress = (address) => {
        setForm(address);
        setErrors({});
    };

    const handleInputChange = (field, text) => {
        setForm({ ...form, [field]: text });
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleCountrySelect = (country) => {
        setForm({ ...form, country: country, city: '' }); // Reset city
        setShowCountryModal(false);
        if (errors.country) setErrors(prev => ({ ...prev, country: null }));
    };

    const handleCitySelect = (city) => {
        setForm({ ...form, city: city });
        setShowCityModal(false);
        if (errors.city) setErrors(prev => ({ ...prev, city: null }));
    };

    const renderInput = (label, field, placeholder, keyboardType = 'default') => (
        <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: themeText }]}>{label}</Text>
            <TextInput
                style={[styles.input, { backgroundColor: themeBg, borderColor: themeBorder, color: themeText }, errors[field] && styles.inputError]}
                placeholder={placeholder}
                placeholderTextColor={themeTextSecondary}
                value={form[field]}
                onChangeText={(text) => setForm({ ...form, [field]: text })}
                keyboardType={keyboardType}
            />
            {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
        </View>
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
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: themeIconBg }]}>
                        <Ionicons name="arrow-back" size={24} color={themeText} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: themeText }]}>{t('shippingAddress')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressItem}>
                        <View style={[styles.progressCircle, styles.activeProgress, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                            <Text style={[styles.progressText, { color: colors.textInverse }]}>1</Text>
                        </View>
                        <Text style={[styles.progressLabel, styles.activeLabel, { color: colors.primary }]}>{t('shipping')}</Text>
                    </View>
                    <View style={[styles.progressLine, { backgroundColor: isDark ? colors.border : '#E5E7EB' }]} />
                    <View style={styles.progressItem}>
                        <View style={[styles.progressCircle, { backgroundColor: isDark ? colors.card : '#F5F5F5', borderColor: colors.border }]}>
                            <Text style={[styles.progressText, { color: colors.textSecondary }]}>2</Text>
                        </View>
                        <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>{t('paymentMethod')}</Text>
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

                        {savedAddresses.length > 0 && (
                            <View style={styles.savedAddressesSection}>
                                <Text style={[styles.sectionTitle, { color: themeText }]}>{t('savedAddressesTitle')}</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {savedAddresses.map((addr, index) => (
                                        <View key={index} style={{ position: 'relative' }}>
                                            <TouchableOpacity
                                                style={[styles.savedAddressCard, { backgroundColor: themeCard, borderColor: themeBorder }]}
                                                onPress={() => handleUseSavedAddress(addr)}
                                            >
                                                <Text style={[styles.savedAddressName, { color: themeText }]}>{addr.fullName}</Text>
                                                <Text style={[styles.savedAddressText, { color: themeTextSecondary }]} numberOfLines={2}>
                                                    {addr.address}, {addr.city}
                                                </Text>
                                                <Text style={[styles.savedAddressText, { color: themeTextSecondary, fontSize: 10, marginTop: 4 }]}>
                                                    {addr.label || 'Saved'}
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.deleteAddressBtn}
                                                onPress={() => {
                                                    Alert.alert(
                                                        t('deleteAddress'),
                                                        t('deleteAddressConfirm'),
                                                        [
                                                            { text: t('cancel'), style: 'cancel' },
                                                            { text: t('delete'), style: 'destructive', onPress: () => deleteAddress(addr.id) }
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

                        <Animated.View entering={FadeInDown.duration(500)} style={[styles.formCard, { backgroundColor: themeCard, borderColor: themeBorder }]}>
                            <Text style={[styles.sectionTitle, { color: themeText }]}>{t('enterNewAddress')}</Text>

                            {renderInput(t('fullNameLabel'), 'fullName', 'John Doe')}
                            {renderInput(t('phoneNumberLabel'), 'phoneNumber', '+1 234 567 890', 'phone-pad')}
                            {renderInput(t('address'), 'address', '123 Main St')}

                            <View style={styles.row}>
                                <TouchableOpacity
                                    style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}
                                    onPress={() => {
                                        if (!form.country) {
                                            Alert.alert(t('error'), t('selectCountryFirst'));
                                            return;
                                        }
                                        setShowCityModal(true);
                                    }}
                                >
                                    <Text style={[styles.inputLabel, { color: themeText }]}>{t('city')}</Text>
                                    <View style={[styles.input, { backgroundColor: themeBg, borderColor: themeBorder, justifyContent: 'center' }, errors.city && styles.inputError]}>
                                        <Text style={{ color: form.city ? themeText : themeTextSecondary }}>
                                            {form.city || t('selectCity')}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-down" size={16} color={themeTextSecondary} style={{ position: 'absolute', right: 15, bottom: 15 }} />
                                    {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
                                </TouchableOpacity>

                                <View style={[styles.inputContainer, { flex: 1 }]}>
                                    <Text style={[styles.inputLabel, { color: themeText }]}>{t('zipCode')}</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: themeBg, borderColor: themeBorder, color: themeText }, errors.zipCode && styles.inputError]}
                                        placeholder="10001"
                                        placeholderTextColor={themeTextSecondary}
                                        value={form.zipCode}
                                        onChangeText={(text) => setForm({ ...form, zipCode: text })}
                                        keyboardType="numeric"
                                    />
                                    {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.inputContainer]}
                                onPress={() => setShowCountryModal(true)}
                            >
                                <Text style={[styles.inputLabel, { color: themeText }]}>{t('country')}</Text>
                                <View style={[styles.input, { backgroundColor: themeBg, borderColor: themeBorder, justifyContent: 'center' }, errors.country && styles.inputError]}>
                                    <Text style={{ color: form.country ? themeText : themeTextSecondary }}>
                                        {form.country || t('selectCountry')}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-down" size={20} color={themeTextSecondary} style={{ position: 'absolute', right: 15, bottom: 15 }} />
                                {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
                            </TouchableOpacity>

                            {/* Save Address Option */}
                            <TouchableOpacity
                                style={styles.saveOption}
                                onPress={() => setSaveAddressChecked(!saveAddressChecked)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.checkbox, { borderColor: colors.border }, saveAddressChecked && styles.checkboxActive]}>
                                    {saveAddressChecked && <Ionicons name="checkmark" size={16} color="#059669" />}
                                </View>
                                <Text style={[styles.saveText, { color: colors.textSecondary }]}>{t('saveAddress')}</Text>
                            </TouchableOpacity>

                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>

                <View style={[styles.footer, { backgroundColor: themeCard, borderTopColor: themeBorder }]}>
                    <TouchableOpacity style={[styles.nextButton, { backgroundColor: colors.primary }]} onPress={handleNext}>
                        <Text style={[styles.nextButtonText, { color: colors.textInverse }]}>{t('continuePayment')}</Text>
                        <Ionicons name="arrow-forward" size={20} color={colors.textInverse} />
                    </TouchableOpacity>
                </View>

                {/* Country Selection Modal */}
                <Modal
                    visible={showCountryModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowCountryModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: themeCard }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: themeText }]}>{t('selectCountry')}</Text>
                                <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                                    <Ionicons name="close" size={24} color={themeText} />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={countries}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.modalItem, { borderBottomColor: themeBorder }]}
                                        onPress={() => handleCountrySelect(item)}
                                    >
                                        <Text style={[styles.modalItemText, { color: themeText }]}>{item}</Text>
                                        {form.country === item && <Ionicons name="checkmark" size={20} color={RevolutionTheme.colors.primary} />}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </Modal>

                {/* City Selection Modal */}
                <Modal
                    visible={showCityModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowCityModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: themeCard }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: themeText }]}>{t('selectCity')}</Text>
                                <TouchableOpacity onPress={() => setShowCityModal(false)}>
                                    <Ionicons name="close" size={24} color={themeText} />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={cities}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.modalItem, { borderBottomColor: themeBorder }]}
                                        onPress={() => handleCitySelect(item)}
                                    >
                                        <Text style={[styles.modalItemText, { color: themeText }]}>{item}</Text>
                                        {form.city === item && <Ionicons name="checkmark" size={20} color={RevolutionTheme.colors.primary} />}
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <View style={styles.emptyList}>
                                        <Text style={{ color: themeTextSecondary }}>No cities found for this country</Text>
                                    </View>
                                }
                            />
                        </View>
                    </View>
                </Modal>
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
    progressLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 10,
        marginBottom: 15,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 15,
    },
    savedAddressesSection: {
        marginBottom: 25,
    },
    savedAddressCard: {
        width: 200,
        padding: 15,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginRight: 15,
    },
    savedAddressName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 5,
    },
    savedAddressText: {
        fontSize: 14,
        color: '#6B7280',
    },
    formCard: {
        padding: 20,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputContainer: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        color: '#1A1A1A',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        color: '#1A1A1A',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputError: {
        borderColor: '#D97706',
    },
    errorText: {
        color: '#D97706',
        fontSize: 12,
        marginTop: 5,
    },
    row: {
        flexDirection: 'row',
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
    nextButton: {
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 30,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        height: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    modalItemText: {
        fontSize: 16,
    },
    emptyList: {
        padding: 20,
        alignItems: 'center',
    },
    saveOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 5,
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
    saveText: {
        fontSize: 14,
    },
    deleteAddressBtn: {
        position: 'absolute',
        top: 10,
        right: 25,
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        padding: 6,
        borderRadius: 20,
    },
});

export default ShippingScreen;
