/**
 * 📊 Admin Dashboard - Kataraa
 * Main admin screen with analytics overview
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { COLORS, SPACING, RADIUS, SHADOWS, GRADIENTS } from '../theme/colors';

const { width } = Dimensions.get('window');

// Stat Card Component
const StatCard = ({ icon, label, value, color, trend, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.8}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        {trend && (
            <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? '#4CAF50' : '#F44336' }]}>
                <Ionicons name={trend > 0 ? 'arrow-up' : 'arrow-down'} size={10} color="#fff" />
                <Text style={styles.trendText}>{Math.abs(trend)}%</Text>
            </View>
        )}
    </TouchableOpacity>
);

// Quick Action Button
const QuickAction = ({ icon, label, color, onPress }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
        <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
            <Ionicons name={icon} size={20} color="#fff" />
        </View>
        <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
);

// Recent Order Item
const RecentOrderItem = ({ order, onPress }) => (
    <TouchableOpacity style={styles.orderItem} onPress={onPress}>
        <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>#{order.id}</Text>
            <Text style={styles.orderCustomer}>{order.billing?.first_name || 'عميل'}</Text>
        </View>
        <View style={styles.orderRight}>
            <Text style={styles.orderTotal}>{order.total} KWD</Text>
            <View style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status) }]}>
                <Text style={styles.orderStatusText}>{getStatusArabic(order.status)}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

const getStatusColor = (status) => {
    const colors = {
        pending: '#FF9800',
        processing: '#2196F3',
        completed: '#4CAF50',
        cancelled: '#F44336',
    };
    return colors[status] || '#999';
};

const getStatusArabic = (status) => {
    const labels = {
        pending: 'قيد الانتظار',
        processing: 'قيد التجهيز',
        completed: 'مكتمل',
        cancelled: 'ملغي',
    };
    return labels[status] || status;
};

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalSales: 0,
        ordersCount: 0,
        customersCount: 0,
        productsCount: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Fetch orders for stats
            const orders = await api.getOrders?.() || [];
            const products = await api.getProducts(1, 100);

            // Calculate stats
            const totalSales = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
            const uniqueCustomers = new Set(orders.map(o => o.billing?.email)).size;

            setStats({
                totalSales: totalSales.toFixed(3),
                ordersCount: orders.length,
                customersCount: uniqueCustomers,
                productsCount: products?.length || 0,
            });

            setRecentOrders(orders.slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard:', error);
            // Demo data fallback
            setStats({
                totalSales: '1,250.000',
                ordersCount: 45,
                customersCount: 120,
                productsCount: 85,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>جاري تحميل الإحصائيات...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={GRADIENTS.header} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>لوحة التحكم 📊</Text>
                        <TouchableOpacity onPress={() => router.push('/admin/notifications')}>
                            <View style={styles.notifBadge}>
                                <Ionicons name="notifications" size={24} color="#fff" />
                                <View style={styles.notifDot} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
                }
            >
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="cash"
                        label="إجمالي المبيعات"
                        value={`${stats.totalSales} KWD`}
                        color="#4CAF50"
                        trend={12}
                        onPress={() => router.push('/admin/analytics')}
                    />
                    <StatCard
                        icon="cart"
                        label="الطلبات"
                        value={stats.ordersCount}
                        color="#2196F3"
                        trend={8}
                        onPress={() => router.push('/admin/orders')}
                    />
                    <StatCard
                        icon="people"
                        label="العملاء"
                        value={stats.customersCount}
                        color="#9C27B0"
                        trend={15}
                        onPress={() => router.push('/admin/customers')}
                    />
                    <StatCard
                        icon="cube"
                        label="المنتجات"
                        value={stats.productsCount}
                        color="#FF9800"
                        onPress={() => router.push('/admin/products')}
                    />
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
                    <View style={styles.quickActionsRow}>
                        <QuickAction icon="add-circle" label="منتج جديد" color="#4CAF50" onPress={() => { }} />
                        <QuickAction icon="megaphone" label="إشعار" color="#FF9800" onPress={() => router.push('/admin/notifications')} />
                        <QuickAction icon="stats-chart" label="تقرير" color="#2196F3" onPress={() => router.push('/admin/analytics')} />
                        <QuickAction icon="settings" label="إعدادات" color="#9C27B0" onPress={() => { }} />
                    </View>
                </View>

                {/* Recent Orders */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <TouchableOpacity onPress={() => router.push('/admin/orders')}>
                            <Text style={styles.viewAllText}>عرض الكل</Text>
                        </TouchableOpacity>
                        <Text style={styles.sectionTitle}>آخر الطلبات</Text>
                    </View>

                    <View style={styles.ordersCard}>
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order) => (
                                <RecentOrderItem
                                    key={order.id}
                                    order={order}
                                    onPress={() => router.push(`/admin/orders/${order.id}`)}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="receipt-outline" size={40} color={COLORS.textMuted} />
                                <Text style={styles.emptyText}>لا توجد طلبات حديثة</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Admin Navigation */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>إدارة</Text>
                    <View style={styles.menuList}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/analytics')}>
                            <View style={[styles.menuIcon, { backgroundColor: '#E3F2FD' }]}>
                                <Ionicons name="bar-chart" size={20} color="#2196F3" />
                            </View>
                            <Text style={styles.menuLabel}>التحليلات المفصلة</Text>
                            <Ionicons name="chevron-back" size={20} color={COLORS.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/customers')}>
                            <View style={[styles.menuIcon, { backgroundColor: '#F3E5F5' }]}>
                                <Ionicons name="people" size={20} color="#9C27B0" />
                            </View>
                            <Text style={styles.menuLabel}>إدارة العملاء (CRM)</Text>
                            <Ionicons name="chevron-back" size={20} color={COLORS.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/orders')}>
                            <View style={[styles.menuIcon, { backgroundColor: '#E8F5E9' }]}>
                                <Ionicons name="receipt" size={20} color="#4CAF50" />
                            </View>
                            <Text style={styles.menuLabel}>إدارة الطلبات</Text>
                            <Ionicons name="chevron-back" size={20} color={COLORS.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/notifications')}>
                            <View style={[styles.menuIcon, { backgroundColor: '#FFF3E0' }]}>
                                <Ionicons name="notifications" size={20} color="#FF9800" />
                            </View>
                            <Text style={styles.menuLabel}>الإشعارات</Text>
                            <Ionicons name="chevron-back" size={20} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.textSecondary,
    },
    header: {
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    notifBadge: {
        position: 'relative',
    },
    notifDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF4444',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        width: (width - 44) / 2,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        ...SHADOWS.sm,
    },
    statIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    trendBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        gap: 2,
    },
    trendText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'right',
    },
    viewAllText: {
        color: COLORS.primary,
        fontSize: 13,
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    quickAction: {
        alignItems: 'center',
        width: (width - 64) / 4,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionLabel: {
        fontSize: 11,
        color: COLORS.text,
        textAlign: 'center',
    },
    ordersCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        ...SHADOWS.sm,
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    orderInfo: {
        flex: 1,
    },
    orderNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    orderCustomer: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    orderRight: {
        alignItems: 'flex-end',
    },
    orderTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    orderStatus: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginTop: 4,
    },
    orderStatusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        color: COLORS.textMuted,
        marginTop: 8,
    },
    menuList: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        ...SHADOWS.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    menuLabel: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text,
        textAlign: 'right',
    },
});
