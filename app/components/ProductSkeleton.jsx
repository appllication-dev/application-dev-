import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../src/context/ThemeContext';
import { BorderRadius, Spacing } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const AnimatedView = Animated.createAnimatedComponent(View);

const SkeletonItem = ({ style }) => {
    const { theme, colors } = useTheme();
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 1000 }),
                withTiming(0.3, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const baseColor = theme === 'dark' ? colors.border : '#E5E7EB';

    return (
        <AnimatedView
            style={[
                { backgroundColor: baseColor },
                style,
                animatedStyle,
            ]}
        />
    );
};

const ProductSkeleton = () => {
    const { colors, theme } = useTheme();
    const containerBg = theme === 'dark' ? colors.card : '#FFFFFF';
    const borderColor = theme === 'dark' ? colors.border : '#F3F4F6';

    return (
        <View style={[styles.container, { backgroundColor: containerBg, borderColor, borderWidth: 1 }]}>
            {/* Image Skeleton */}
            <SkeletonItem style={styles.imagePlaceholder} />

            {/* Content Skeleton */}
            <View style={styles.content}>
                {/* Title Line 1 */}
                <SkeletonItem style={styles.titleLine} />
                {/* Title Line 2 (shorter) */}
                <SkeletonItem style={styles.titleLineShort} />

                {/* Price and Badge Row */}
                <View style={styles.row}>
                    <SkeletonItem style={styles.pricePlaceholder} />
                    <SkeletonItem style={styles.badgePlaceholder} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        marginBottom: 16,
    },
    imagePlaceholder: {
        width: '100%',
        height: 200,
        // backgroundColor: '#E5E7EB', // Handled by SkeletonItem
    },
    content: {
        padding: Spacing.md,
    },
    titleLine: {
        height: 14,
        borderRadius: 4,
        width: '90%',
        marginBottom: 8,
    },
    titleLineShort: {
        height: 14,
        borderRadius: 4,
        width: '60%',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pricePlaceholder: {
        height: 18,
        width: 60,
        borderRadius: 4,
    },
    badgePlaceholder: {
        height: 24,
        width: 24,
        borderRadius: 12,
    },
});

export default ProductSkeleton;
