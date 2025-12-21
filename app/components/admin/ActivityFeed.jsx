import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * ActivityFeed - Live activity timeline showing recent orders
 * Displays order activity with animations and status indicators
 */
const ActivityFeed = ({ orders = [], isDark = true, title = 'Recent Activity', maxItems = 5 }) => {
    // Get recent orders sorted by date
    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt?.toDate?.() || b.createdAt) - new Date(a.createdAt?.toDate?.() || a.createdAt))
        .slice(0, maxItems);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return '#10B981';
            case 'shipped': return '#3B82F6';
            case 'processing': return '#F59E0B';
            case 'pending': return '#6366F1';
            case 'cancelled': return '#EF4444';
            default: return '#6366F1';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return 'check-circle';
            case 'shipped': return 'truck';
            case 'processing': return 'clock';
            case 'pending': return 'shopping-bag';
            case 'cancelled': return 'x-circle';
            default: return 'shopping-bag';
        }
    };

    const formatTime = (date) => {
        if (!date) return 'Just now';
        const d = date.toDate ? date.toDate() : new Date(date);
        const now = new Date();
        const diff = now - d;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const bgColor = isDark ? '#1A1A1A' : '#FFF8E7';
    const textColor = isDark ? '#FFF' : '#333';
    const mutedColor = isDark ? '#888' : '#666';
    const cardBg = isDark ? '#2A2A2A' : '#FFF';

    return (
        <Animated.View entering={FadeIn.delay(500)} style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                <View style={[styles.liveBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Live</Text>
                </View>
            </View>

            {recentOrders.length === 0 ? (
                <View style={styles.emptyState}>
                    <Feather name="inbox" size={40} color={mutedColor} />
                    <Text style={[styles.emptyText, { color: mutedColor }]}>No recent activity</Text>
                </View>
            ) : (
                <View>
                    {recentOrders.map((order, index) => (
                        <Animated.View
                            key={order.id}
                            entering={FadeInRight.delay(index * 100)}
                            style={[styles.activityItem, { backgroundColor: cardBg }]}
                        >
                            {/* Status Icon */}
                            <LinearGradient
                                colors={[getStatusColor(order.status), `${getStatusColor(order.status)}AA`]}
                                style={styles.iconCircle}
                            >
                                <Feather name={getStatusIcon(order.status)} size={18} color="#FFF" />
                            </LinearGradient>

                            {/* Order Info */}
                            <View style={styles.orderInfo}>
                                <View style={styles.orderHeader}>
                                    <Text style={[styles.orderId, { color: textColor }]}>
                                        Order #{order.id?.substring(0, 8) || order.orderNumber}
                                    </Text>
                                    <Text style={[styles.orderTime, { color: mutedColor }]}>
                                        {formatTime(order.createdAt)}
                                    </Text>
                                </View>
                                <View style={styles.orderDetails}>
                                    <Text style={[styles.orderStatus, { color: getStatusColor(order.status) }]}>
                                        {order.status || 'Pending'}
                                    </Text>
                                    <Text style={[styles.orderTotal, { color: textColor }]}>
                                        ${parseFloat(order.pricing?.total || order.total || 0).toFixed(2)}
                                    </Text>
                                </View>
                            </View>

                            {/* Timeline Connector */}
                            {index < recentOrders.length - 1 && (
                                <View style={[styles.timelineConnector, { backgroundColor: isDark ? '#333' : '#E5E5E5' }]} />
                            )}
                        </Animated.View>
                    ))}
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
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
        marginRight: 6,
    },
    liveText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 14,
    },
    activityItem: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        position: 'relative',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    orderInfo: {
        flex: 1,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    orderId: {
        fontSize: 14,
        fontWeight: '600',
    },
    orderTime: {
        fontSize: 12,
    },
    orderDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    orderStatus: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    orderTotal: {
        fontSize: 14,
        fontWeight: '700',
    },
    timelineConnector: {
        position: 'absolute',
        left: 27,
        bottom: -15,
        width: 2,
        height: 20,
    },
});

export default ActivityFeed;
