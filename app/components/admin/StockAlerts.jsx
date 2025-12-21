import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * StockAlerts - Warning component for low stock products
 * Shows products that need restocking with animated alerts
 */
const StockAlerts = ({ products = [], isDark = true, title = 'Stock Alerts', threshold = 10 }) => {
    // Filter low stock products
    const lowStockProducts = products
        .filter(p => (p.stock || 0) <= threshold && (p.stock || 0) > 0)
        .sort((a, b) => (a.stock || 0) - (b.stock || 0))
        .slice(0, 5);

    const outOfStockProducts = products
        .filter(p => (p.stock || 0) === 0)
        .slice(0, 3);

    const getStockLevel = (stock) => {
        if (stock === 0) return { label: 'Out of Stock', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' };
        if (stock <= 5) return { label: 'Critical', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' };
        return { label: 'Low Stock', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.1)' };
    };

    const bgColor = isDark ? '#1A1A1A' : '#FFF8E7';
    const textColor = isDark ? '#FFF' : '#333';
    const mutedColor = isDark ? '#888' : '#666';
    const cardBg = isDark ? '#2A2A2A' : '#FFF';

    const allAlerts = [...outOfStockProducts, ...lowStockProducts];

    return (
        <Animated.View entering={FadeIn.delay(600)} style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Feather name="alert-triangle" size={20} color="#F59E0B" />
                    <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                </View>
                <View style={[styles.countBadge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <Text style={styles.countText}>{allAlerts.length}</Text>
                </View>
            </View>

            {allAlerts.length === 0 ? (
                <View style={styles.emptyState}>
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={styles.successIcon}
                    >
                        <Feather name="check" size={24} color="#FFF" />
                    </LinearGradient>
                    <Text style={[styles.successText, { color: textColor }]}>All products stocked!</Text>
                    <Text style={[styles.successSubtext, { color: mutedColor }]}>No items need attention</Text>
                </View>
            ) : (
                <View>
                    {allAlerts.map((product, index) => {
                        const stockLevel = getStockLevel(product.stock || 0);
                        return (
                            <Animated.View
                                key={product.id}
                                entering={FadeInUp.delay(index * 80)}
                                style={[styles.alertItem, { backgroundColor: cardBg }]}
                            >
                                {/* Product Image */}
                                <Image
                                    source={{ uri: product.image }}
                                    style={styles.productImage}
                                />

                                {/* Product Info */}
                                <View style={styles.productInfo}>
                                    <Text style={[styles.productName, { color: textColor }]} numberOfLines={1}>
                                        {product.title}
                                    </Text>
                                    <View style={styles.stockRow}>
                                        <View style={[styles.stockBadge, { backgroundColor: stockLevel.bg }]}>
                                            <Text style={[styles.stockLabel, { color: stockLevel.color }]}>
                                                {stockLevel.label}
                                            </Text>
                                        </View>
                                        <Text style={[styles.stockCount, { color: stockLevel.color }]}>
                                            {product.stock || 0} left
                                        </Text>
                                    </View>
                                </View>

                                {/* Warning Indicator */}
                                <View style={[styles.warningDot, { backgroundColor: stockLevel.color }]}>
                                    {(product.stock || 0) === 0 && (
                                        <View style={styles.pulsingDot} />
                                    )}
                                </View>
                            </Animated.View>
                        );
                    })}
                </View>
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
    countBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    countText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    successIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    successText: {
        fontSize: 16,
        fontWeight: '600',
    },
    successSubtext: {
        fontSize: 13,
        marginTop: 4,
    },
    alertItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 12,
        marginBottom: 8,
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 10,
        marginRight: 12,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
    },
    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stockBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    stockLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    stockCount: {
        fontSize: 12,
        fontWeight: '600',
    },
    warningDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    pulsingDot: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        opacity: 0.5,
    },
});

export default StockAlerts;
