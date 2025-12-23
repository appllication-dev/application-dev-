/**
 * Product Card SOKO Style - Kataraa
 * Matches reference design: Add to Cart button, sale badge, heart icon
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
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme/colors';

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
                        color={isFavorite ? '#EF4444' : COLORS.textMuted}
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
                            <Text style={styles.soldOutText}>Sold Out</Text>
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
                            colors={COLORS.primary ? [COLORS.primary, COLORS.primaryDark] : ['#667eea', '#764ba2']}
                            style={styles.addToCartGradient}
                        >
                            <Ionicons name="add" size={16} color="#fff" />
                            <Text style={styles.addToCartText}>Add to Cart</Text>
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
                                BHD {formatPrice(item.sale_price)}
                            </Text>
                            <Text style={styles.originalPrice}>
                                BHD {formatPrice(item.regular_price)}
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.price}>
                            BHD {formatPrice(item.price)}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.lg,
        marginHorizontal: SPACING.xs,
        marginBottom: SPACING.md,
        overflow: 'hidden',
        ...SHADOWS.md,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#f5f5f5',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    favoriteBtn: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.sm,
    },
    saleBadge: {
        position: 'absolute',
        top: SPACING.sm,
        left: SPACING.sm,
        backgroundColor: COLORS.error,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
    },
    saleText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    soldOutOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    soldOutBadge: {
        backgroundColor: COLORS.textMuted,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.xl,
    },
    soldOutText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    addToCartBtn: {
        position: 'absolute',
        bottom: SPACING.sm,
        left: SPACING.sm,
        right: SPACING.sm,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
    },
    addToCartGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.sm,
        gap: 4,
    },
    addToCartText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    infoContainer: {
        padding: SPACING.sm,
    },
    productName: {
        fontSize: 12,
        color: COLORS.text,
        lineHeight: 16,
        height: 32,
        textAlign: 'left',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginTop: SPACING.xs,
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    salePrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.error,
    },
    originalPrice: {
        fontSize: 12,
        color: COLORS.textMuted,
        textDecorationLine: 'line-through',
    },
});
