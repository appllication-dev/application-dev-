/**
 * Search Screen - Kataraa
 * Dedicated search page for finding products
 * Dark Mode Supported 🌙
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from './context/ThemeContext';
import { useCart } from './context/CartContext';
import { useCartAnimation } from './context/CartAnimationContext';
import { useFavorites } from './context/FavoritesContext';
import { useTranslation } from './hooks/useTranslation';
import { storage } from './utils/storage';
import api from './services/api';
import ProductCardSoko from './components/ProductCardSoko';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
    const router = useRouter();
    const { theme, isDark } = useTheme();
    const { t } = useTranslation();
    const { triggerAddToCart } = useCartAnimation();
    const { toggleFavorite, isFavorite } = useFavorites();
    const styles = getStyles(theme, isDark);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    // Load recent searches on mount
    useEffect(() => {
        loadRecentSearches();
    }, []);

    const loadRecentSearches = async () => {
        try {
            const saved = await storage.getItem('search_history');
            if (saved) {
                setRecentSearches(saved);
            }
        } catch (error) {
            console.error('Error loading search history:', error);
        }
    };

    const saveSearch = async (searchQuery) => {
        try {
            const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
            await storage.setItem('search_history', updated);
            setRecentSearches(updated);
        } catch (error) {
            console.error('Error saving search:', error);
        }
    };

    const clearHistory = async () => {
        try {
            await storage.removeItem('search_history');
            setRecentSearches([]);
        } catch (error) {
            console.error('Error clearing history:', error);
        }
    };

    // Debounced search
    useEffect(() => {
        if (query.length >= 2) {
            const timer = setTimeout(() => {
                performSearch(query);
            }, 300);
            return () => clearTimeout(timer);
        } else if (query.length === 0) {
            setResults([]);
            setHasSearched(false);
        }
    }, [query]);

    const performSearch = async (searchQuery) => {
        setLoading(true);
        setHasSearched(true);
        try {
            const data = await api.searchProducts(searchQuery);
            setResults(data || []);
            if (searchQuery.length > 0 && data.length > 0) {
                saveSearch(searchQuery);
            }
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRecentSearchPress = (searchQuery) => {
        setQuery(searchQuery);
    };

    const handleProductPress = (item) => {
        router.push(`/product/${item.id}`);
    };

    const handleAddToCart = (item) => {
        triggerAddToCart({
            id: item.id,
            name: item.name,
            price: item.sale_price || item.price,
            image: item.images?.[0]?.src,
            quantity: 1,
        });
    };

    const handleFavorite = (item) => {
        toggleFavorite({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.images?.[0]?.src,
        });
    };

    const renderProduct = ({ item }) => (
        <View style={styles.gridItem}>
            <ProductCardSoko
                item={item}
                onPress={() => handleProductPress(item)}
                onAddToCart={handleAddToCart}
                onFavorite={handleFavorite}
                isFavorite={isFavorite(item.id)}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
                        >
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{t('searchProducts')}</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Search Input */}
                    <View style={styles.searchInputContainer}>
                        <Ionicons name="search" size={20} color={theme.textMuted} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.text }]}
                            placeholder={t('searchHere')}
                            placeholderTextColor={theme.textMuted}
                            value={query}
                            onChangeText={setQuery}
                            autoFocus
                            returnKeyType="search"
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery('')}>
                                <Ionicons name="close-circle" size={20} color={theme.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* Content */}
            <View style={styles.content}>
                {!hasSearched && query.length === 0 ? (
                    // Before search - show recent searches
                    <View style={styles.emptyContainer}>
                        {recentSearches.length > 0 && (
                            <>
                                <View style={styles.recentHeader}>
                                    <Text style={[styles.recentTitle, { color: theme.text }]}>
                                        {t('recentSearches')}
                                    </Text>
                                    <TouchableOpacity onPress={clearHistory}>
                                        <Text style={[styles.clearBtn, { color: theme.primary }]}>
                                            {t('clearHistory')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.chipsContainer}>
                                    {recentSearches.map((item, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.chip, { backgroundColor: theme.backgroundCard }]}
                                            onPress={() => handleRecentSearchPress(item)}
                                        >
                                            <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                                            <Text style={[styles.chipText, { color: theme.text }]}>{item}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}
                        <View style={styles.startSearchContainer}>
                            <Ionicons name="search-outline" size={60} color={theme.textMuted} />
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                                {t('startSearching')}
                            </Text>
                        </View>
                    </View>
                ) : loading ? (
                    // Loading
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                            {t('searching')}
                        </Text>
                    </View>
                ) : results.length === 0 && hasSearched ? (
                    // No results
                    <View style={styles.emptyContainer}>
                        <Ionicons name="sad-outline" size={60} color={theme.textMuted} />
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>
                            {t('noResultsFound')}
                        </Text>
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                            {t('tryDifferentSearch')}
                        </Text>
                    </View>
                ) : (
                    // Results
                    <FlatList
                        data={results}
                        renderItem={renderProduct}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={2}
                        contentContainerStyle={styles.listContent}
                        columnWrapperStyle={styles.row}
                    />
                )}
            </View>
        </View>
    );
}

const getStyles = (theme, isDark) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    header: {
        paddingBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 8,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.backgroundCard,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        marginLeft: 12,
        paddingVertical: 0,
    },
    content: {
        flex: 1,
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 12,
    },
    recentTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    clearBtn: {
        fontSize: 14,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    chipText: {
        fontSize: 14,
    },
    startSearchContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    listContent: {
        paddingBottom: 20,
        paddingTop: 12,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    gridItem: {
        width: (width - 48) / 2,
    },
});
