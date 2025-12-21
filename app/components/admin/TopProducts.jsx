import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * TopProducts - Best selling products showcase
 * Shows top products with rank badges and sales data
 */
const TopProducts = ({ products = [], orders = [], isDark = true, title = 'Top Selling' }) => {
    // Calculate sales per product from orders
    const productSales = {};
    orders.forEach(order => {
        (order.items || []).forEach(item => {
            const id = item.id || item.productId;
            if (!productSales[id]) {
                productSales[id] = { count: 0, revenue: 0 };
            }
            productSales[id].count += item.quantity || 1;
            productSales[id].revenue += (item.price || 0) * (item.quantity || 1);
        });
    });

    // Merge with product data and sort by sales
    const topProducts = products
        .map(product => ({
            ...product,
            salesCount: productSales[product.id]?.count || 0,
            revenue: productSales[product.id]?.revenue || 0,
        }))
        .filter(p => p.salesCount > 0)
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, 5);

    const getRankBadge = (rank) => {
        switch (rank) {
            case 1: return { colors: ['#FFD700', '#FFA500'], icon: '🥇' };
            case 2: return { colors: ['#C0C0C0', '#A0A0A0'], icon: '🥈' };
            case 3: return { colors: ['#CD7F32', '#8B4513'], icon: '🥉' };
            default: return { colors: ['#6366F1', '#4F46E5'], icon: `#${rank}` };
        }
    };

    const bgColor = isDark ? '#1A1A1A' : '#FFF8E7';
    const textColor = isDark ? '#FFF' : '#333';
    const mutedColor = isDark ? '#888' : '#666';
    const cardBg = isDark ? '#2A2A2A' : '#FFF';

    return (
        <Animated.View entering={FadeIn.delay(700)} style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Feather name="trending-up" size={20} color="#10B981" />
                    <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                </View>
            </View>

            {topProducts.length === 0 ? (
                <View style={styles.emptyState}>
                    <Feather name="package" size={40} color={mutedColor} />
                    <Text style={[styles.emptyText, { color: mutedColor }]}>No sales data yet</Text>
                </View>
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {topProducts.map((product, index) => {
                        const rank = index + 1;
                        const badge = getRankBadge(rank);
                        return (
                            <Animated.View
                                key={product.id}
                                entering={FadeInRight.delay(index * 100)}
                                style={[styles.productCard, { backgroundColor: cardBg }]}
                            >
                                {/* Rank Badge */}
                                <LinearGradient
                                    colors={badge.colors}
                                    style={styles.rankBadge}
                                >
                                    <Text style={styles.rankText}>{badge.icon}</Text>
                                </LinearGradient>

                                {/* Product Image */}
                                <Image
                                    source={{ uri: product.image }}
                                    style={styles.productImage}
                                />

                                {/* Product Info */}
                                <View style={styles.productInfo}>
                                    <Text style={[styles.productName, { color: textColor }]} numberOfLines={2}>
                                        {product.title}
                                    </Text>
                                    <View style={styles.statsRow}>
                                        <View style={styles.stat}>
                                            <Feather name="shopping-bag" size={12} color={mutedColor} />
                                            <Text style={[styles.statText, { color: mutedColor }]}>
                                                {product.salesCount} sold
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.revenue, { color: '#10B981' }]}>
                                        ${product.revenue.toFixed(2)}
                                    </Text>
                                </View>
                            </Animated.View>
                        );
                    })}
                </ScrollView>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 14,
    },
    productCard: {
        width: 150,
        borderRadius: 16,
        marginRight: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    rankBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    rankText: {
        fontSize: 14,
    },
    productImage: {
        width: '100%',
        height: 120,
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        lineHeight: 18,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 11,
    },
    revenue: {
        fontSize: 16,
        fontWeight: '800',
    },
});

export default TopProducts;
