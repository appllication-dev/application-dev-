/**
 * Product Card with Swipeable Images - Kataraa
 * Dark Mode Supported 🌙
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

const CARD_WIDTH = 150;
const IMAGE_HEIGHT = 140;

export default function ProductCardSwipeable({
    item,
    onPress,
    onAddToCart,
    onFavorite,
    isFavorite = false,
    cardWidth = CARD_WIDTH,
}) {
    const { theme, isDark } = useTheme();
    const { t } = useTranslation();
    const styles = getStyles(theme, isDark);

    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef(null);

    // Get images
    const productImages = item?.images || [];
    const image1 = productImages[0]?.src || 'https://via.placeholder.com/200';
    const image2 = productImages[1]?.src || productImages[0]?.src || 'https://via.placeholder.com/200';

    const images = [image1, image2];

    const isOnSale = item?.on_sale && item?.regular_price && item?.sale_price;
    const isOutOfStock = item?.stock_status === 'outofstock';

    const formatPrice = (price) => `${parseFloat(price || 0).toFixed(3)} ${t('currency')}`;

    // Handle scroll
    const handleScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / cardWidth);
        if (index !== activeIndex && index >= 0 && index < 2) {
            setActiveIndex(index);
        }
    };

    const handleDotPress = (index) => {
        scrollRef.current?.scrollTo({ x: index * cardWidth, animated: true });
        setActiveIndex(index);
    };

    return (
        <View style={[styles.card, { width: cardWidth }]}>
            {/* Image Slider */}
            <TouchableOpacity activeOpacity={0.95} onPress={onPress}>
                <View style={styles.imageContainer}>
                    <ScrollView
                        ref={scrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        style={{ width: cardWidth }}
                        contentContainerStyle={{ width: cardWidth * 2 }}
                    >
                        {images.map((imgUrl, index) => (
                            <Image
                                key={index}
                                source={{ uri: imgUrl }}
                                style={[styles.image, { width: cardWidth, height: IMAGE_HEIGHT }]}
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>

                    {/* TWO DOTS */}
                    <View style={styles.dotsContainer}>
                        <TouchableOpacity onPress={() => handleDotPress(0)}>
                            <View style={[styles.dot, activeIndex === 0 && styles.dotActive]} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDotPress(1)}>
                            <View style={[styles.dot, activeIndex === 1 && styles.dotActive]} />
                        </TouchableOpacity>
                    </View>

                    {/* Sold Out Overlay */}
                    {isOutOfStock && (
                        <View style={styles.soldOutOverlay}>
                            <View style={styles.soldOutBadge}>
                                <Text style={styles.soldOutText}>{t('outOfStock')}</Text>
                            </View>
                        </View>
                    )}

                    {/* Favorite Heart */}
                    <TouchableOpacity
                        style={styles.heartBtn}
                        onPress={() => onFavorite?.(item)}
                    >
                        <Ionicons
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={16}
                            color={isFavorite ? theme.error : '#999'}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>

            {/* Add to Cart Button */}
            {!isOutOfStock ? (
                <TouchableOpacity
                    style={styles.addToCartBtn}
                    onPress={() => onAddToCart?.(item)}
                >
                    <Ionicons name="add" size={14} color="#fff" />
                    <Text style={styles.addToCartText}>{t('addToCart')}</Text>
                </TouchableOpacity>
            ) : (
                <View style={[styles.addToCartBtn, styles.soldOutCartBtn]}>
                    <Ionicons name="close-circle" size={14} color="#fff" />
                    <Text style={styles.addToCartText}>{t('outOfStock')}</Text>
                </View>
            )}

            {/* Product Info */}
            <TouchableOpacity style={styles.infoContainer} onPress={onPress}>
                <Text style={styles.productName} numberOfLines={2}>
                    {item?.name}
                </Text>

                <View style={styles.priceRow}>
                    <Text style={isOnSale ? styles.salePrice : styles.price}>
                        {formatPrice(isOnSale ? item.sale_price : item.price)}
                    </Text>
                    {isOnSale && (
                        <Text style={styles.originalPrice}>
                            {formatPrice(item.regular_price)}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
}

const getStyles = (theme, isDark) => StyleSheet.create({
    card: {
        backgroundColor: theme.backgroundCard,
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 8,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.3 : 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    imageContainer: {
        position: 'relative',
        backgroundColor: isDark ? '#2A2A40' : '#f5f5f5',
        overflow: 'hidden',
    },
    image: {
        backgroundColor: isDark ? '#2A2A40' : '#f0f0f0',
    },
    dotsContainer: {
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    dotActive: {
        backgroundColor: theme.primary,
        borderColor: '#fff',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    soldOutOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    soldOutBadge: {
        backgroundColor: '#999',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    soldOutText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    heartBtn: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: isDark ? 'rgba(30,30,50,0.9)' : 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addToCartBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.primary,
        paddingVertical: 8,
        gap: 4,
    },
    soldOutCartBtn: {
        backgroundColor: '#999',
    },
    addToCartText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    infoContainer: {
        padding: 8,
        paddingTop: 4,
    },
    productName: {
        fontSize: 11,
        color: theme.text,
        lineHeight: 14,
        minHeight: 28,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    price: {
        fontSize: 13,
        fontWeight: 'bold',
        color: theme.text,
    },
    salePrice: {
        fontSize: 13,
        fontWeight: 'bold',
        color: theme.accent,
    },
    originalPrice: {
        fontSize: 11,
        color: theme.textMuted,
        textDecorationLine: 'line-through',
    },
});
