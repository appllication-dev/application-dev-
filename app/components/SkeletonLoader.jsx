/**
 * 💀 Skeleton Loader - Kataraa
 * Animated loading placeholders
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { RADIUS, SHADOWS } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Shimmer Effect Component
const ShimmerEffect = ({ style }) => {
    const shimmer = useSharedValue(0);

    useEffect(() => {
        shimmer.value = withRepeat(
            withTiming(1, { duration: 1200 }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: interpolate(
                    shimmer.value,
                    [0, 1],
                    [-CARD_WIDTH, CARD_WIDTH]
                ),
            },
        ],
    }));

    return (
        <View style={[styles.shimmerContainer, style]}>
            <Animated.View style={[styles.shimmer, animatedStyle]}>
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.shimmerGradient}
                />
            </Animated.View>
        </View>
    );
};

// Product Card Skeleton
export const ProductCardSkeleton = () => (
    <View style={styles.card}>
        <View style={styles.imageSkeleton}>
            <ShimmerEffect />
        </View>
        <View style={styles.infoContainer}>
            <View style={styles.titleSkeleton}>
                <ShimmerEffect />
            </View>
            <View style={styles.titleSkeleton2}>
                <ShimmerEffect />
            </View>
            <View style={styles.priceSkeleton}>
                <ShimmerEffect />
            </View>
        </View>
    </View>
);

// Products Grid Skeleton (shows 4 skeleton cards)
export const ProductsGridSkeleton = () => (
    <View style={styles.grid}>
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
    </View>
);

// Category Pills Skeleton
export const CategoryPillsSkeleton = () => (
    <View style={styles.pillsContainer}>
        {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.pillSkeleton}>
                <ShimmerEffect />
            </View>
        ))}
    </View>
);

// Hero Banner Skeleton
export const HeroBannerSkeleton = () => (
    <View style={styles.heroBanner}>
        <ShimmerEffect />
    </View>
);

const styles = StyleSheet.create({
    shimmerContainer: {
        overflow: 'hidden',
        backgroundColor: '#E8E8E8',
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    shimmerGradient: {
        flex: 1,
        width: CARD_WIDTH * 2,
    },

    // Product Card Skeleton
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: RADIUS.lg,
        marginHorizontal: 6,
        marginBottom: 16,
        overflow: 'hidden',
        ...SHADOWS.sm,
    },
    imageSkeleton: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#E8E8E8',
        borderRadius: RADIUS.lg,
    },
    infoContainer: {
        padding: 12,
    },
    titleSkeleton: {
        height: 12,
        backgroundColor: '#E8E8E8',
        borderRadius: 6,
        marginBottom: 8,
        width: '80%',
    },
    titleSkeleton2: {
        height: 12,
        backgroundColor: '#E8E8E8',
        borderRadius: 6,
        marginBottom: 8,
        width: '60%',
    },
    priceSkeleton: {
        height: 16,
        backgroundColor: '#E8E8E8',
        borderRadius: 8,
        width: '40%',
    },

    // Grid
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        justifyContent: 'space-between',
    },

    // Category Pills
    pillsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },
    pillSkeleton: {
        width: 80,
        height: 36,
        backgroundColor: '#E8E8E8',
        borderRadius: 18,
    },

    // Hero Banner
    heroBanner: {
        height: 200,
        marginHorizontal: 16,
        backgroundColor: '#E8E8E8',
        borderRadius: RADIUS.xl,
        marginBottom: 20,
    },
});

export default {
    ProductCardSkeleton,
    ProductsGridSkeleton,
    CategoryPillsSkeleton,
    HeroBannerSkeleton,
};
