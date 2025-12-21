import { Text, View, FlatList, TouchableOpacity, StyleSheet, Modal, Dimensions, Platform, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from '@expo/vector-icons';
import Category from "../components/category";
import ProductCard from "../components/productCard";
import NoResults from "../components/NoResults";
import { useState, useMemo, useEffect, useCallback } from "react";
import data from "../data/data";
import { useTheme } from "../../src/context/ThemeContext";
import { useFavorites } from "../../src/context/FavoritesContext";
import { useAuth } from "../../src/context/AuthContext";
import { storage } from "../../src/utils/storage";
import { sanitizeEmail } from "../../src/utils/helpers";

import { BorderRadius, Spacing, FontSize } from "../../constants/theme";
import PremiumBackground from "../components/PremiumBackground";
import { LinearGradient } from 'expo-linear-gradient';
import ProductSkeleton from "../components/ProductSkeleton";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { getProducts as fetchProducts } from "../../src/services/firestoreProducts";
import SearchBar from "../components/SearchBar";
import SearchFilterModal from "../components/SearchFilterModal";
import { useTranslation } from "../../src/hooks/useTranslation";
import CoolLoader from "../components/CoolLoader";
import { useQuery } from '@tanstack/react-query';
import { RevolutionTheme } from "../../src/theme/RevolutionTheme";
// VoiceSearchModal removed

const { width } = Dimensions.get('window');

const MyScreen = () => {
    const { colors, theme } = useTheme();
    const { toggleFavorite } = useFavorites();
    const { user } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();
    const isDark = theme === 'dark';

    const categories = [
        { id: 'all', label: t('all'), icon: 'border-all' },
        { id: 'Discount', label: t('discount'), icon: 'percentage' },
        { id: 'T-shirt', label: t('tshirt'), icon: 'tshirt' },
        { id: 'Hoodie', label: t('hoodie'), icon: 'user-astronaut' },
        { id: 'Hat', label: t('hat'), icon: 'hard-hat' }
    ];
    const popularSearches = [t('tshirt'), "أحذية", t('hoodie'), "ساعات", "حقائب", "جاكيت"];

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterParams, setFilterParams] = useState({});
    // const [showVoiceModal, setShowVoiceModal] = useState(false); // Removed
    const [profileImage, setProfileImage] = useState(null);

    // Dynamic Theme Colors
    const themeBg = isDark ? RevolutionTheme.colors.background : RevolutionTheme.colors.backgroundLight;
    const themeText = isDark ? RevolutionTheme.colors.text.primary : RevolutionTheme.colors.creamText;
    const themeTextSecondary = isDark ? RevolutionTheme.colors.text.secondary : RevolutionTheme.colors.creamTextSecondary;
    const themeCard = isDark ? RevolutionTheme.colors.card : RevolutionTheme.colors.creamCard;
    const themeBorder = isDark ? 'rgba(255,255,255,0.05)' : RevolutionTheme.colors.glassBorderLight;
    const themeIconBg = isDark ? RevolutionTheme.colors.glass : 'rgba(212, 175, 55, 0.08)';

    // Load Profile Image
    useFocusEffect(
        useCallback(() => {
            const loadProfileImage = async () => {
                if (user) {
                    try {
                        const userImageKey = `profile_image_${sanitizeEmail(user.email)}`;
                        const savedUri = await storage.getItem(userImageKey);
                        if (savedUri) {
                            setProfileImage(savedUri);
                        } else {
                            setProfileImage(user.photoURL);
                        }
                    } catch (e) {
                        console.log("Error loading header image", e);
                    }
                } else {
                    setProfileImage(null);
                }
            };
            loadProfileImage();
        }, [user])
    );

    useFocusEffect(
        useCallback(() => {
            // ... existing code ...
        }, [user])
    );

    // Handle Voice Search Params
    const { search } = useLocalSearchParams();

    useEffect(() => {
        if (search) {
            setSearchQuery(search);
            // Optionally open search modal if that's how search works, 
            // but setting query might be enough if filtered list is shown inline
            // Based on code, let's also ensure Category is All to search effectively
            setSelectedCategory('all');
        }
    }, [search]);

    // Local data disabled - using Firestore for products added by user
    // const products = data.products;
    // const isLoading = false;
    // const refetch = () => { };

    // Firestore fetch enabled - to get products added by user
    const { data: products = [], isLoading, refetch } = useQuery({
        queryKey: ['products', filterParams],
        queryFn: async () => {
            const result = await fetchProducts({ ...filterParams, limitCount: 50 });
            if (result.success) {
                return result.products;
            }
            throw new Error("Failed to fetch products");
        },
        staleTime: Infinity,
        cacheTime: 1000 * 60 * 60 * 24,
    });

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [])
    );

    const handleLike = (productId) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            toggleFavorite(product);
        }
    };

    const displayedProducts = useMemo(() => {
        let filtered = [...products]; // Create a copy to avoid mutating original

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.title.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // Filter from modal
        if (filterParams.category) {
            filtered = filtered.filter(product => product.category === filterParams.category);
        }

        // Price range filter
        if (filterParams.minPrice) {
            filtered = filtered.filter(product => product.price >= filterParams.minPrice);
        }
        if (filterParams.maxPrice) {
            filtered = filtered.filter(product => product.price <= filterParams.maxPrice);
        }

        // In stock filter
        if (filterParams.onlyInStock) {
            filtered = filtered.filter(product => product.stock > 0);
        }

        // Sorting
        if (filterParams.sortBy === 'price_low') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (filterParams.sortBy === 'price_high') {
            filtered.sort((a, b) => b.price - a.price);
        }
        // 'newest' is default order from data, no sorting needed

        return filtered;
    }, [products, selectedCategory, searchQuery, filterParams]);

    const handleSeeAll = () => {
        setSearchQuery('');
        setSelectedCategory('all');
    };

    // Sticky Header Component
    const StickyHeader = () => (
        <View style={[styles.headerContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255, 253, 245, 0.9)', borderBottomColor: themeBorder, borderBottomWidth: 1 }]}>
            <View style={styles.headerRow}>
                <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: themeIconBg, borderColor: themeBorder }]}
                    onPress={() => setShowSearchModal(true)}
                >
                    <Feather name="search" size={20} color={RevolutionTheme.colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: themeIconBg, borderColor: themeBorder, marginLeft: 8 }]}
                    onPress={() => setShowFilterModal(true)}
                >
                    <Feather name="sliders" size={20} color={RevolutionTheme.colors.primary} />
                </TouchableOpacity>

                {/* Mic Button Removed */}

                <View>
                    <Text style={[styles.headerTitle, { color: RevolutionTheme.colors.primaryDark }]}>{t('shopName')}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: themeIconBg, borderColor: themeBorder }]}
                        onPress={() => router.push("/screens/NotificationsScreen")}
                    >
                        <Feather name="bell" size={20} color={RevolutionTheme.colors.primary} />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>

                    {user && (
                        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                            <Image
                                source={profileImage ? { uri: profileImage } : { uri: "https://via.placeholder.com/150" }}
                                style={styles.headerAvatar}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );

    const ListHeader = () => (
        <>
            {/* Luxury Banner */}
            <View style={[styles.bannerWrapper, { backgroundColor: themeCard, borderColor: themeBorder, borderWidth: 1, marginTop: 10 }]}>
                <LinearGradient
                    colors={isDark ? ['#1A1A1A', '#000'] : ['#FFF8E7', '#FFFDF5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.bannerContainer}>
                    <View style={styles.bannerLeft}>
                        <View style={[styles.bannerBadge, { backgroundColor: RevolutionTheme.colors.primaryDark }]}>
                            <Text style={styles.bannerBadgeText}>{t('onAnyAmount')}</Text>
                        </View>
                        <Text style={[styles.bannerDiscount, { color: RevolutionTheme.colors.primary }]}>50 %</Text>
                        <Text style={[styles.bannerOffText, { color: themeTextSecondary }]}>{t('off')}</Text>
                    </View>
                    <View style={styles.bannerRight}>
                        <Text style={styles.bannerEmoji}>🧥</Text>
                    </View>
                </View>
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
                <FlatList
                    data={categories}
                    renderItem={({ item }) => (
                        <Category
                            item={item}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: themeText }]}>{t('newArrival')}</Text>
                <TouchableOpacity onPress={handleSeeAll}>
                    <Text style={[styles.viewAll, { color: RevolutionTheme.colors.primary }]}>{t('seeAll')}</Text>
                </TouchableOpacity>
            </View>
        </>
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

            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <StickyHeader />

                {/* VoiceSearchModal Removed */}

                {/* Search Modal */}
                <Modal
                    visible={showSearchModal}
                    animationType="fade"
                    transparent={true}
                    onRequestClose={() => setShowSearchModal(false)}
                >
                    <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255, 253, 245, 0.98)' }]}>
                        <SafeAreaView style={{ flex: 1 }}>
                            {/* Modal Header */}
                            <View style={[styles.searchHeader, { borderBottomColor: themeBorder }]}>
                                <View style={{ flex: 1 }}>
                                    <SearchBar
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        placeholder={t('searchProducts')}
                                        autoFocus={true}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setShowSearchModal(false)}
                                >
                                    <Text style={[styles.closeButtonText, { color: themeText }]}>{t('cancel')}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Search Content */}
                            {searchQuery.trim() === '' ? (
                                <View style={styles.popularSearchContainer}>
                                    <Text style={[styles.popularTitle, { color: RevolutionTheme.colors.primary }]}>{t('popularSearches')}</Text>
                                    <View style={styles.tagsContainer}>
                                        {popularSearches.map((tag, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={[styles.tag, { backgroundColor: themeCard, borderColor: themeBorder }]}
                                                onPress={() => setSearchQuery(tag)}
                                            >
                                                <Text style={[styles.tagText, { color: themeText }]}>{tag}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            ) : (
                                <>
                                    <View style={[styles.resultsHeader, { borderBottomColor: themeBorder }]}>
                                        <Text style={[styles.resultsCount, { color: themeTextSecondary }]}>
                                            {t('foundResults', { count: displayedProducts.length })}
                                        </Text>
                                    </View>
                                    <FlatList
                                        data={displayedProducts}
                                        numColumns={2}
                                        keyExtractor={(item) => item.id.toString()}
                                        contentContainerStyle={styles.searchResults}
                                        columnWrapperStyle={displayedProducts.length > 0 ? styles.columnWrapper : null}
                                        renderItem={({ item }) => (
                                            <View style={{ width: '48%' }}>
                                                <ProductCard
                                                    item={item}
                                                    isLiked={item.isLiked}
                                                    onLike={handleLike}
                                                />
                                            </View>
                                        )}
                                        ListEmptyComponent={<NoResults searchQuery={searchQuery} />}
                                    />
                                </>
                            )}
                        </SafeAreaView>
                    </View>
                </Modal>

                <SearchFilterModal
                    visible={showFilterModal}
                    onClose={() => setShowFilterModal(false)}
                    onApply={setFilterParams}
                    initialFilters={filterParams}
                />

                {isLoading ? (
                    <View style={{ paddingHorizontal: 16, paddingTop: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <ProductSkeleton key={i} />
                        ))}
                    </View>
                ) : (
                    <FlatList
                        data={displayedProducts}
                        numColumns={2}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        columnWrapperStyle={displayedProducts.length > 0 ? styles.columnWrapper : null}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={<ListHeader />}
                        renderItem={({ item, index }) => (
                            <Animated.View
                                entering={FadeInDown.delay(index * 100).springify()}
                                style={{ width: '48%' }} // Slightly less than 50% for gap
                            >
                                <ProductCard
                                    item={item}
                                    isLiked={item.isLiked}
                                    onLike={handleLike}
                                    index={index}
                                />
                            </Animated.View>
                        )}
                        ListEmptyComponent={<NoResults searchQuery={searchQuery} />}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
        paddingTop: 10,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        gap: 12, // Gap between columns
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingBottom: 15,
        paddingTop: 10,
        zIndex: 100,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    iconButton: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 21,
        borderWidth: 1,
    },
    headerAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 2,
        borderColor: '#D4AF37',
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 10,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#D4AF37',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    bannerWrapper: {
        marginBottom: 24,
        borderRadius: 24,
        overflow: 'hidden',
    },
    bannerContainer: {
        flexDirection: 'row',
        padding: 24,
        alignItems: 'center',
    },
    bannerLeft: {
        flex: 1,
    },
    bannerBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    bannerBadgeText: {
        color: '#000',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    bannerDiscount: {
        fontSize: 56,
        fontWeight: '900',
        lineHeight: 56,
    },
    bannerOffText: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 16,
        letterSpacing: 3,
        textTransform: 'uppercase',
    },
    bannerRight: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerEmoji: {
        fontSize: 80,
    },
    categoriesContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    viewAll: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
    },
    modalOverlay: {
        flex: 1,
    },
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderBottomWidth: 1,
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    popularSearchContainer: {
        padding: 24,
    },
    popularTitle: {
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    tag: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 1,
    },
    tagText: {
        fontSize: 14,
        fontWeight: '600',
    },
    resultsHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    resultsCount: {
        fontSize: 14,
        fontWeight: '500',
    },
    searchResults: {
        padding: 16,
    },
});

export default MyScreen;