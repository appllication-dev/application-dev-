/**
 * Products Screen - Kataraa SOKO Style
 * Redesigned products listing with brand sections and improved layout
 */

import React, { useState, useEffect, useCallback } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Services & Context
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useCartAnimation } from '../context/CartAnimationContext';
import { useFavorites } from '../context/FavoritesContext';

// Components
import SearchHeader from '../components/SearchHeader';
import ProductCardSoko from '../components/ProductCardSoko';
import BrandSection from '../components/BrandSection';

// Theme
import { COLORS, SPACING, RADIUS, GRADIENTS } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function ProductsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { cartItems, addToCart } = useCart();
    const { triggerAddToCart } = useCartAnimation();
    const { toggleFavorite, isFavorite } = useFavorites();

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
            // Implement search
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

    // Render category chip
    const renderCategory = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.categoryChip,
                selectedCategory === item.id && styles.categoryChipActive,
            ]}
            onPress={() => handleCategorySelect(item.id)}
        >
            <Text style={[
                styles.categoryChipText,
                selectedCategory === item.id && styles.categoryChipTextActive,
            ]}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    // Render header with categories
    const ListHeader = () => (
        <View style={styles.listHeader}>
            {/* Categories Filter */}
            <FlatList
                data={[{ id: null, name: 'الكل' }, ...categories]}
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
                        <Ionicons name="grid" size={18} color={viewMode === 'grid' ? '#fff' : COLORS.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.viewModeBtn, viewMode === 'brand' && styles.viewModeBtnActive]}
                        onPress={() => setViewMode('brand')}
                    >
                        <Ionicons name="list" size={18} color={viewMode === 'brand' ? '#fff' : COLORS.textMuted} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.resultsCount}>
                    {products.length} منتج
                </Text>
            </View>
        </View>
    );

    if (loading && products.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>جاري تحميل المنتجات...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with Search */}
            <SearchHeader
                title="المنتجات"
                onSearch={handleSearch}
                onCartPress={() => router.push('/cart')}
                cartCount={cartItems.length}
            />

            {viewMode === 'grid' ? (
                // Grid View
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    ListHeaderComponent={ListHeader}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="cube-outline" size={60} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>لا توجد منتجات</Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={COLORS.primary}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        hasMore && products.length > 0 ? (
                            <ActivityIndicator style={styles.footerLoader} color={COLORS.primary} />
                        ) : null
                    }
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.row}
                />
            ) : (
                // Brand/Category View
                <FlatList
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
                            tintColor={COLORS.primary}
                        />
                    }
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingText: {
        marginTop: SPACING.md,
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    listHeader: {
        paddingTop: SPACING.md,
    },
    categoriesList: {
        paddingHorizontal: SPACING.md,
        gap: SPACING.sm,
    },
    categoryChip: {
        backgroundColor: COLORS.card,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: SPACING.sm,
    },
    categoryChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryChipText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    categoryChipTextActive: {
        color: '#fff',
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
    },
    viewModeToggle: {
        flexDirection: 'row',
        backgroundColor: COLORS.border,
        borderRadius: RADIUS.sm,
        padding: 2,
    },
    viewModeBtn: {
        padding: SPACING.sm,
        borderRadius: RADIUS.xs,
    },
    viewModeBtnActive: {
        backgroundColor: COLORS.primary,
    },
    resultsCount: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    listContent: {
        paddingBottom: SPACING.xxl,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.sm,
    },
    gridItem: {
        width: (width - 48) / 2,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxl,
    },
    emptyText: {
        marginTop: SPACING.md,
        color: COLORS.textMuted,
        fontSize: 16,
    },
    footerLoader: {
        paddingVertical: SPACING.lg,
    },
});
