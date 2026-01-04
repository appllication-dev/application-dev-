/**
 * 🔍 Enhanced Search Header - Kataraa
 * Real-time search with suggestions dropdown
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Dimensions,
    FlatList,
    Image,
    Keyboard,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency, AVAILABLE_CURRENCIES } from '../context/CurrencyContext';
import { COLORS, SPACING, RADIUS, GRADIENTS, SHADOWS } from '../theme/colors';

const { width } = Dimensions.get('window');

// Debounce hook for real-time search
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
};

export default function SearchHeader({
    onSearch,
    onCartPress,
    onMenuPress,
    cartCount = 0,
    showSearch = true,
    title = 'KATARAA',
    placeholder = 'ابحثي عن منتج...',
}) {
    const router = useRouter();
    const { language, toggleLanguage, isArabic } = useLanguage();
    const { currency, currencyInfo, changeCurrency } = useCurrency();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);

    // Debounced search query
    const debouncedQuery = useDebounce(searchQuery, 300);

    // Fetch suggestions when query changes
    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            fetchSuggestions(debouncedQuery);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [debouncedQuery]);

    const fetchSuggestions = async (query) => {
        setIsSearching(true);
        try {
            const results = await api.searchProducts(query);
            setSuggestions(results.slice(0, 6)); // Max 6 suggestions
            setShowSuggestions(results.length > 0);
        } catch (error) {
            console.error('Search error:', error);
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            Keyboard.dismiss();
            setShowSuggestions(false);
            onSearch?.(searchQuery);
            router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleSuggestionPress = (product) => {
        Keyboard.dismiss();
        setShowSuggestions(false);
        setSearchQuery('');
        router.push(`/product/${product.id}`);
    };

    const handleClear = () => {
        setSearchQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
        onSearch?.('');
    };

    const formatPrice = (price) => `${parseFloat(price || 0).toFixed(3)} ${currencyInfo.symbol}`;

    // Suggestion Item
    const SuggestionItem = ({ item }) => (
        <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => handleSuggestionPress(item)}
        >
            <Image
                source={{ uri: item.images?.[0]?.src || 'https://via.placeholder.com/50' }}
                style={styles.suggestionImage}
            />
            <View style={styles.suggestionInfo}>
                <Text style={styles.suggestionName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.suggestionPrice}>
                    {item.on_sale ? (
                        <>
                            <Text style={styles.salePrice}>{formatPrice(item.sale_price)}</Text>
                            {' '}
                            <Text style={styles.originalPrice}>{formatPrice(item.regular_price)}</Text>
                        </>
                    ) : (
                        formatPrice(item.price)
                    )}
                </Text>
            </View>
            <Ionicons name="chevron-back" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.wrapper}>
            <LinearGradient colors={GRADIENTS.header} style={styles.container}>
                <SafeAreaView edges={['top']}>
                    {/* Top Bar */}
                    <View style={styles.topBar}>
                        <TouchableOpacity style={styles.iconBtn} onPress={onMenuPress}>
                            <Ionicons name="menu" size={24} color="#fff" />
                        </TouchableOpacity>

                        <Text style={styles.logo}>{title}</Text>

                        {/* Quick Toggle Buttons */}
                        <View style={styles.quickToggles}>
                            {/* Language Toggle */}
                            <TouchableOpacity style={styles.toggleBtn} onPress={toggleLanguage}>
                                <Text style={styles.toggleText}>{language === 'ar' ? 'EN' : 'عربي'}</Text>
                            </TouchableOpacity>

                            {/* Currency Toggle */}
                            <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowCurrencyModal(true)}>
                                <Text style={styles.toggleText}>{currencyInfo.code}</Text>
                            </TouchableOpacity>

                            {/* Cart */}
                            <TouchableOpacity style={styles.iconBtn} onPress={onCartPress}>
                                <Ionicons name="cart-outline" size={24} color="#fff" />
                                {cartCount > 0 && (
                                    <View style={styles.cartBadge}>
                                        <Text style={styles.cartBadgeText}>
                                            {cartCount > 9 ? '9+' : cartCount}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search Bar */}
                    {showSearch && (
                        <View style={styles.searchContainer}>
                            <Feather name="search" size={18} color={COLORS.textMuted} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={placeholder}
                                placeholderTextColor={COLORS.textMuted}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                onSubmitEditing={handleSearch}
                                returnKeyType="search"
                                textAlign="right"
                            />
                            {isSearching && (
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            )}
                            {searchQuery.length > 0 && !isSearching && (
                                <TouchableOpacity onPress={handleClear}>
                                    <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </SafeAreaView>
            </LinearGradient>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
                <View style={styles.suggestionsContainer}>
                    <View style={styles.suggestionsHeader}>
                        <TouchableOpacity onPress={handleSearch}>
                            <Text style={styles.viewAllText}>{isArabic ? 'عرض الكل' : 'View All'} ({suggestions.length}+)</Text>
                        </TouchableOpacity>
                        <Text style={styles.suggestionsTitle}>{isArabic ? 'نتائج البحث' : 'Search Results'}</Text>
                    </View>
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => <SuggestionItem item={item} />}
                        keyboardShouldPersistTaps="handled"
                    />
                </View>
            )}

            {/* Currency Selection Modal */}
            <Modal
                visible={showCurrencyModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCurrencyModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCurrencyModal(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>{isArabic ? 'اختر العملة' : 'Select Currency'}</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {Object.values(AVAILABLE_CURRENCIES).map((curr) => (
                            <TouchableOpacity
                                key={curr.code}
                                style={[
                                    styles.currencyOption,
                                    currency === curr.code && styles.currencyOptionActive
                                ]}
                                onPress={() => {
                                    changeCurrency(curr.code);
                                    setShowCurrencyModal(false);
                                }}
                            >
                                <Text style={styles.currencyFlag}>{curr.flag}</Text>
                                <View style={styles.currencyInfo}>
                                    <Text style={styles.currencyCode}>{curr.code}</Text>
                                    <Text style={styles.currencyName}>{isArabic ? curr.name : curr.nameEn}</Text>
                                </View>
                                {currency === curr.code && (
                                    <Ionicons name="checkmark-circle" size={24} color="#667eea" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        zIndex: 100,
    },
    container: {
        paddingBottom: SPACING.md,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 2,
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: COLORS.error,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    cartBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: SPACING.md,
        marginTop: SPACING.sm,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        height: 44,
        ...SHADOWS.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text,
        marginHorizontal: SPACING.sm,
        paddingVertical: 0,
    },
    suggestionsContainer: {
        position: 'absolute',
        top: '100%',
        left: SPACING.md,
        right: SPACING.md,
        backgroundColor: '#fff',
        borderRadius: RADIUS.lg,
        maxHeight: 300,
        ...SHADOWS.lg,
        zIndex: 1000,
    },
    suggestionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    suggestionsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    viewAllText: {
        fontSize: 12,
        color: COLORS.primary,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    suggestionImage: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        marginLeft: SPACING.sm,
    },
    suggestionInfo: {
        flex: 1,
        marginRight: SPACING.sm,
    },
    suggestionName: {
        fontSize: 13,
        color: COLORS.text,
        textAlign: 'right',
    },
    suggestionPrice: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
        textAlign: 'right',
        marginTop: 2,
    },
    salePrice: {
        color: '#E91E63',
    },
    originalPrice: {
        color: COLORS.textMuted,
        textDecorationLine: 'line-through',
        fontSize: 10,
    },
    // Toggle Buttons
    quickToggles: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    toggleBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    toggleText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    currencyOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#f8f9fa',
    },
    currencyOptionActive: {
        backgroundColor: '#EEF2FF',
        borderWidth: 1,
        borderColor: '#667eea',
    },
    currencyFlag: {
        fontSize: 28,
        marginRight: 12,
    },
    currencyInfo: {
        flex: 1,
    },
    currencyCode: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    currencyName: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
});
