/**
 * Products Screen - Kataraa SOKO Style
 * Redesigned products listing with brand sections and improved layout
 * Dark Mode Supported 🌙
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Services & Context
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useCartAnimation } from '../context/CartAnimationContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';

// Components
import SearchHeader from '../components/SearchHeader';
import ProductCardSoko from '../components/ProductCardSoko';
import BrandSection from '../components/BrandSection';

import { useTranslation } from '../hooks/useTranslation';

const { width } = Dimensions.get('window');

export default function ProductsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { cartItems } = useCart();
    const { triggerAddToCart } = useCartAnimation();
    const { toggleFavorite, isFavorite } = useFavorites();
    const { theme, isDark } = useTheme();
    const { t } = useTranslation();
    const styles = getStyles(theme, isDark);

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(params.category || null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'brand'

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        await Promise.all([fetchProducts(), fetchCategories()]);
        setLoading(false);
    };

    const fetchProducts = async (pageNum = 1, category = null) => {
        try {
            const data = await api.getProducts(pageNum, 20, category);
            if (pageNum === 1) {
                setProducts(data || []);
            } else {
                setProducts(prev => [...prev, ...(data || [])]);
            }
            setHasMore((data?.length || 0) === 20);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await api.getCategories();
            setCategories(data?.filter(cat => cat.count > 0) || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setPage(1);
        await fetchProducts(1, selectedCategory);
        setRefreshing(false);
    };

    const handleLoadMore = () => {
        if (hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchProducts(nextPage, selectedCategory);
        }
    };

    const handleCategorySelect = async (categoryId) => {
        const newCategory = categoryId === selectedCategory ? null : categoryId;
        setSelectedCategory(newCategory);
        setPage(1);
        setLoading(true);
        await fetchProducts(1, newCategory);
        setLoading(false);
    };

    const handleSearch = (query) => {
        if (query.trim()) {
            api.searchProducts(query).then(results => {
                setProducts(results || []);
            });
        } else {
            handleRefresh();
        }
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

    // Group products by category for brand view
    const getProductsByCategory = () => {
        const grouped = {};
        categories.slice(0, 5).forEach(cat => {
            grouped[cat.id] = {
                name: cat.name,
                products: products.filter(p =>
                    p.categories?.some(c => c.id === cat.id)
                ).slice(0, 6)
            };
        });
        return grouped;
    };

    // Render product for grid view
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

    // Category Mapping Helper - Enhanced with more icons and better labels
    const getCategoryDetails = (catName) => {
        const lowerName = catName?.toLowerCase() || '';

        // Comprehensive Mapping for Skincare/Beauty Categories
        if (lowerName.includes('acne')) return { label: t('acne'), icon: 'bandage-outline' };
        if (lowerName.includes('makeup')) return { label: t('makeup'), icon: 'brush-outline' };
        if (lowerName.includes('hair')) return { label: t('hair'), icon: 'cut-outline' };
        if (lowerName.includes('body')) return { label: t('body'), icon: 'body-outline' };
        if (lowerName.includes('serum')) return { label: t('serum'), icon: 'water-outline' };
        if (lowerName.includes('sun')) return { label: t('suncare'), icon: 'sunny-outline' };
        if (lowerName.includes('set')) return { label: t('sets'), icon: 'gift-outline' };
        if (lowerName.includes('anti-aging') || lowerName.includes('aging')) return { label: t('antiAging'), icon: 'hourglass-outline' };
        if (lowerName.includes('uncategorized')) return { label: t('uncategorized'), icon: 'help-circle-outline' };

        // Dynamic additions for common beauty keywords
        if (lowerName.includes('cleanser')) return { label: t('cleansers'), icon: 'sparkles-outline' };
        if (lowerName.includes('mask')) return { label: t('masks'), icon: 'happy-outline' };
        if (lowerName.includes('cream') || lowerName.includes('moist')) return { label: t('moisturizers'), icon: 'flask-outline' };
        if (lowerName.includes('eye')) return { label: t('eyeCare'), icon: 'eye-outline' };
        if (lowerName.includes('lip')) return { label: t('lipCare'), icon: 'heart-outline' };
        if (lowerName.includes('toner')) return { label: t('toners'), icon: 'color-filter-outline' };
        if (lowerName.includes('exfoliat')) return { label: t('exfoliators'), icon: 'infinite-outline' };

        return { label: catName, icon: 'grid-outline' };
    };

    // Render category chip
    const renderCategory = ({ item }) => {
        const isAll = item.id === null;
        const details = isAll ? { label: t('all'), icon: 'apps-outline' } : getCategoryDetails(item.name);

        return (
            <TouchableOpacity
                style={[
                    styles.categoryChip,
                    selectedCategory === item.id && styles.categoryChipActive,
                ]}
                onPress={() => handleCategorySelect(item.id)}
            >
                <Ionicons
                    name={details.icon}
                    size={16}
                    color={selectedCategory === item.id ? '#fff' : theme.textSecondary}
                    style={{ marginRight: 6 }}
                />
                <Text style={[
                    styles.categoryChipText,
                    selectedCategory === item.id && styles.categoryChipTextActive,
                ]}>
                    {details.label}
                </Text>
            </TouchableOpacity>
        );
    };

    // Render header with categories
    const ListHeader = () => (
        <View style={styles.listHeader}>
            {/* Categories Filter */}
            <FlatList
                data={[{ id: null, name: t('all') }, ...categories]}
                renderItem={renderCategory}
                keyExtractor={(item) => (item.id || 'all').toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
            />

            {/* View Mode Toggle & Results Count */}
            <View style={styles.filterRow}>
                <View style={styles.viewModeToggle}>
                    <TouchableOpacity
                        style={[styles.viewModeBtn, viewMode === 'grid' && styles.viewModeBtnActive]}
                        onPress={() => setViewMode('grid')}
                    >
                        <Ionicons name="grid" size={18} color={viewMode === 'grid' ? '#fff' : theme.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.viewModeBtn, viewMode === 'brand' && styles.viewModeBtnActive]}
                        onPress={() => setViewMode('brand')}
                    >
                        <Ionicons name="list" size={18} color={viewMode === 'brand' ? '#fff' : theme.textMuted} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.resultsCount}>
                    {t('itemCount', { count: products.length })}
                </Text>
            </View>
        </View>
    );

    if (loading && products.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.loadingText}>{t('loadingProducts')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with Search */}
            <SearchHeader
                title={t('productsTitle')}
                onSearch={handleSearch}
                onCartPress={() => router.push('/cart')}
                onNotificationPress={() => router.push('/notifications')}
                onMenuPress={() => router.push('/profile')}
                cartCount={cartItems.length}
            />

            {viewMode === 'grid' ? (
                // Grid View
                <FlatList
                    key="grid-view"
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    ListHeaderComponent={ListHeader}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="cube-outline" size={60} color={theme.textMuted} />
                            <Text style={styles.emptyText}>{t('noProducts')}</Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.primary}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        hasMore && products.length > 0 ? (
                            <ActivityIndicator style={styles.footerLoader} color={theme.primary} />
                        ) : null
                    }
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.row}
                />
            ) : (
                // Brand/Category View
                <FlatList
                    key="brand-view"
                    data={Object.entries(getProductsByCategory())}
                    renderItem={({ item: [catId, data] }) => (
                        <BrandSection
                            key={catId}
                            title={data.name}
                            titleAr={data.name}
                            products={data.products}
                            onViewAll={() => handleCategorySelect(parseInt(catId))}
                            onProductPress={handleProductPress}
                            onAddToCart={handleAddToCart}
                            onFavorite={handleFavorite}
                            isFavorite={isFavorite}
                        />
                    )}
                    keyExtractor={([id]) => id}
                    ListHeaderComponent={ListHeader}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.primary}
                        />
                    }
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const getStyles = (theme, isDark) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background,
    },
    loadingText: {
        marginTop: 16,
        color: theme.textSecondary,
        fontSize: 14,
    },
    listHeader: {
        paddingTop: 16,
    },
    categoriesList: {
        paddingHorizontal: 16,
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.backgroundCard,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.border,
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: theme.primary,
        borderColor: theme.primary,
    },
    categoryChipText: {
        fontSize: 13,
        color: theme.textSecondary,
        fontWeight: '500',
    },
    categoryChipTextActive: {
        color: '#fff',
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    viewModeToggle: {
        flexDirection: 'row',
        backgroundColor: theme.backgroundCard,
        borderRadius: 8,
        padding: 2,
        borderWidth: 1,
        borderColor: theme.border,
    },
    viewModeBtn: {
        padding: 8,
        borderRadius: 6,
    },
    viewModeBtnActive: {
        backgroundColor: theme.primary,
    },
    resultsCount: {
        fontSize: 14,
        color: theme.textSecondary,
    },
    listContent: {
        paddingBottom: 48,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    gridItem: {
        width: (width - 48) / 2,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        marginTop: 16,
        color: theme.textMuted,
        fontSize: 16,
    },
    footerLoader: {
        paddingVertical: 24,
    },
});
