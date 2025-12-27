/**
 * Product Card SOKO Style - Kataraa
 * Matches reference design: Add to Cart button, sale badge, heart icon
 * Dark Mode Supported 🌙
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function ProductCardSoko({
    item,
    onPress,
    onAddToCart,
    onFavorite,
    isFavorite = false,
    showBrand = false,
}) {
    const { theme, isDark } = useTheme();
    const { t } = useTranslation();
    const styles = getStyles(theme, isDark, t);

    const imageUrl = item?.images?.[0]?.src || 'https://via.placeholder.com/200';
    const isOnSale = item?.on_sale && item?.regular_price && item?.sale_price;
    const isOutOfStock = item?.stock_status === 'outofstock';

    const formatPrice = (price) => {
        return `${parseFloat(price || 0).toFixed(3)}`;
    };

    const getDiscountPercent = () => {
        if (!isOnSale) return 0;
        return Math.round((1 - parseFloat(item.sale_price) / parseFloat(item.regular_price)) * 100);
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {/* Image Container */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* Favorite Button */}
                <TouchableOpacity
                    style={styles.favoriteBtn}
                    onPress={() => onFavorite?.(item)}
                >
                    <Ionicons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={18}
                        color={isFavorite ? '#EF4444' : theme.textMuted}
                    />
                </TouchableOpacity>

                {/* Sale Badge */}
                {isOnSale && (
                    <View style={styles.saleBadge}>
                        <Text style={styles.saleText}>-{getDiscountPercent()}%</Text>
                    </View>
                )}

                {/* Sold Out Overlay */}
                {isOutOfStock && (
                    <View style={styles.soldOutOverlay}>
                        <View style={styles.soldOutBadge}>
                            <Text style={styles.soldOutText}>{t('outOfStock')}</Text>
                        </View>
                    </View>
                )}

                {/* Add to Cart Button */}
                {!isOutOfStock && (
                    <TouchableOpacity
                        style={styles.addToCartBtn}
                        onPress={() => onAddToCart?.(item)}
                    >
                        <LinearGradient
                            colors={[theme.primary, theme.primaryDark]}
                            style={styles.addToCartGradient}
                        >
                            <Ionicons name="add" size={16} color="#fff" />
                            <Text style={styles.addToCartText}>{t('addToCart')}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>

            {/* Product Info */}
            <View style={styles.infoContainer}>
                {/* Product Name */}
                <Text style={styles.productName} numberOfLines={2}>
                    {item?.name}
                </Text>

                {/* Price Row */}
                <View style={styles.priceRow}>
                    {isOnSale ? (
                        <>
                            <Text style={styles.salePrice}>
                                {formatPrice(item.sale_price)} {t('currency')}
                            </Text>
                            <Text style={styles.originalPrice}>
                                {formatPrice(item.regular_price)} {t('currency')}
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.price}>
                            {formatPrice(item.price)} {t('currency')}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const getStyles = (theme, isDark, t) => StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: theme.backgroundCard,
        borderRadius: 16,
        marginHorizontal: 4,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        aspectRatio: 1,
        backgroundColor: isDark ? '#2A2A40' : '#f5f5f5',
    },
    image: {
        width: '100%',
        height: '100%',
        backgroundColor: isDark ? '#2A2A40' : '#f0f0f0',
    },
    favoriteBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: isDark ? 'rgba(30,30,50,0.9)' : 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    saleBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: theme.error,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    saleText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    soldOutOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    soldOutBadge: {
        backgroundColor: theme.textMuted,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    soldOutText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    addToCartBtn: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        right: 8,
        borderRadius: 12,
        overflow: 'hidden',
    },
    addToCartGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 4,
    },
    addToCartText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    infoContainer: {
        padding: 8,
    },
    productName: {
        fontSize: 12,
        color: theme.text,
        lineHeight: 16,
        height: 32,
        textAlign: t('locale') === 'ar' ? 'right' : 'left',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.primary,
    },
    salePrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.accent, // Using theme accent (pink/red)
    },
    originalPrice: {
        fontSize: 12,
        color: theme.textMuted,
        textDecorationLine: 'line-through',
    },
});
