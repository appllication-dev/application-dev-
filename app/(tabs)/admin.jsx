import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, TextInput, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import { useCheckout } from '../../src/context/CheckoutContext';
import { getProducts, clearAllLocalReviews } from '../../src/services/firestoreProducts';
import { getAllOrders } from '../../src/services/firestoreOrders';
import { Feather } from '@expo/vector-icons';
import { FontSize, Spacing, BorderRadius } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '../../src/hooks/useTranslation';
import ArabSalesMap from '../components/ArabSalesMap';
import { BlurView } from 'expo-blur';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { RevolutionTheme } from "../../src/theme/RevolutionTheme";
import PremiumBackground from "../components/PremiumBackground";

// Premium Admin Components
import AnimatedCounter from '../components/admin/AnimatedCounter';
import RevenueChart from '../components/admin/RevenueChart';
import CategoryPieChart from '../components/admin/CategoryPieChart';
import ActivityFeed from '../components/admin/ActivityFeed';
import StockAlerts from '../components/admin/StockAlerts';
import TopProducts from '../components/admin/TopProducts';

const { width } = Dimensions.get('window');

const AdminDashboard = () => {
    const { colors, theme } = useTheme();
    const router = useRouter();
    const { t } = useTranslation();
    const isDark = theme === 'dark';
    const { orders } = useCheckout(); // Fallback context if needed

    // Dynamic Theme Colors
    const themeBg = isDark ? RevolutionTheme.colors.background : RevolutionTheme.colors.backgroundLight;
    const themeText = isDark ? RevolutionTheme.colors.text.primary : RevolutionTheme.colors.creamText;
    const themeTextSecondary = isDark ? RevolutionTheme.colors.text.secondary : RevolutionTheme.colors.creamTextSecondary;
    const themeCard = isDark ? RevolutionTheme.colors.card : RevolutionTheme.colors.creamCard;
    const themeBorder = isDark ? 'rgba(255,255,255,0.05)' : RevolutionTheme.colors.glassBorderLight;
    const themeIconBg = isDark ? RevolutionTheme.colors.glass : 'rgba(212, 175, 55, 0.08)';

    const [products, setProducts] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'products', 'orders'

    const loadProducts = async () => {
        // Only show full loading on first load, not on refresh
        if (!refreshing) setLoading(true);
        try {
            const result = await getProducts();
            if (result.success) {
                setProducts(result.products);
            }

            // Load Orders
            const ordersResult = await getAllOrders();
            if (ordersResult.success) {
                setAllOrders(ordersResult.orders);
            }
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadProducts();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadProducts();
    }, []);

    // Statistics Calculation
    const totalRevenue = allOrders.reduce((sum, order) => sum + (parseFloat(order.pricing?.total || order.total) || 0), 0).toFixed(2);
    const totalOrders = allOrders.length;
    const totalProducts = products.length;

    // Sales by Country Logic
    const salesByCountry = allOrders.reduce((acc, order) => {
        // Fallback to random country if missing for demo purposes, or use order data
        // In real app: const country = order.shippingAddress?.country || 'Unknown';
        const countries = ['Morocco', 'USA', 'France', 'Japan', 'Germany'];
        const country = order.shippingAddress?.country || countries[order.id.charCodeAt(0) % countries.length];

        if (!acc[country]) {
            acc[country] = { name: country, sales: 0, revenue: 0 };
        }
        acc[country].sales += 1;
        acc[country].revenue += parseFloat(order.pricing?.total || order.total || 0);
        return acc;
    }, {});

    // Convert to array and sort
    const countryStats = Object.values(salesByCountry)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5); // Top 5

    // Map Data Transformation
    const mapData = {};
    Object.values(salesByCountry).forEach(item => {
        mapData[item.name] = item.revenue; // Use revenue or sales count for heatmap? Prompt says "values higher = stronger color", tooltip needs sales count.
        // Actually ArabSalesMap expects: data[CountryName] = value to determine color.
        // And inside it accesses data[CountryName] for sales count.
        // Let's pass the raw sales count for coloring, and maybe pass a separate object for details if needed.
        // Wait, my ArabSalesMap implementation: const sales = data[...name] || 0. So it expects a NUMBER.
        // Let's pass the Sales Count (number of orders) as the primary metric for coloring.
        mapData[item.name] = item.sales;
    });

    const maxRevenue = Math.max(...countryStats.map(c => c.revenue), 1);

    // Filter Logic
    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handlers removed for external management
    // const handleDelete, handleEdit, handleAddNew, handleSync...

    // --- Components ---

    // --- Premium Components ---

    const MiniChart = ({ color }) => (
        <Svg height="40" width="100%" viewBox="0 0 100 40" style={{ marginTop: 10 }}>
            <Path
                d="M0,40 L0,30 Q20,10 40,25 T80,15 L100,5 L100,40 Z"
                fill={color}
                opacity="0.3"
            />
            <Path
                d="M0,30 Q20,10 40,25 T80,15 L100,5"
                fill="none"
                stroke={color}
                strokeWidth="2"
            />
        </Svg>
    );

    const StatCard = ({ title, value, icon, color, gradient, fullWidth = false, showChart = false }) => (
        <Animated.View
            entering={FadeInUp.delay(200).springify()}
            style={[styles.statCardContainer, fullWidth && { width: '100%' }]}
        >
            <LinearGradient
                colors={isDark ? ['#1A1A1A', '#000000'] : gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.statCardGradient, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent', borderWidth: isDark ? 1 : 0 }]}
            >
                <View style={styles.statHeader}>
                    <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(229, 193, 88, 0.1)' : 'rgba(255,255,255,0.2)' }]}>
                        <Feather name={icon} size={20} color={isDark ? '#E5C158' : '#fff'} />
                    </View>
                    {showChart && <View style={[styles.trendBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}><Text style={[styles.trendText, { color: isDark ? '#fff' : '#000' }]}>+12.5%</Text></View>}
                </View>

                <View style={{ marginTop: 15 }}>
                    <Text style={[styles.statValue, { color: '#FFF' }]}>{value}</Text>
                    <Text style={[styles.statTitle, { color: 'rgba(255,255,255,0.8)' }]}>{title}</Text>
                </View>

                {showChart && <MiniChart color={isDark ? '#E5C158' : '#FFF'} />}

                {/* Decorative background glow for dark mode */}
                {isDark && (
                    <View style={{
                        position: 'absolute',
                        right: -20,
                        bottom: -20,
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: color || '#E5C158',
                        opacity: 0.05,
                        zIndex: -1
                    }} />
                )}
            </LinearGradient>
        </Animated.View>
    );

    const renderDashboard = () => {
        // Calculate category data for pie chart from actual products
        const categoryCount = products.reduce((acc, product) => {
            const cat = product.category || 'Other';
            if (!acc[cat]) acc[cat] = 0;
            acc[cat]++;
            return acc;
        }, {});

        const categoryChartData = Object.entries(categoryCount).map(([name, value], index) => {
            const colors = ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#3B82F6'];
            return { name, value, color: colors[index % colors.length] };
        });

        // Calculate revenue data for chart (last 7 days simulation based on orders)
        const revenueChartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
            // Distribute actual revenue across days for demo
            const dailyRevenue = allOrders.length > 0
                ? parseFloat(totalRevenue) / 7 * (0.5 + Math.random())
                : 0;
            return { day, value: Math.round(dailyRevenue) };
        });

        return (
            <ScrollView contentContainerStyle={styles.dashboardContent} showsVerticalScrollIndicator={false}>
                {/* Stats Grid - Bento Style */}
                <Text style={[styles.sectionTitle, { color: themeText }]}>{t('overview')}</Text>
                <View style={styles.statsGrid}>
                    {/* Main Large Card with Animated Counter */}
                    <StatCard
                        title={t('totalRevenue')}
                        value={`$${totalRevenue}`}
                        icon="dollar-sign"
                        gradient={['#10B981', '#059669']}
                        fullWidth={true}
                        showChart={true}
                    />

                    {/* Smaller Cards */}
                    <View style={styles.rowGrid}>
                        <StatCard
                            title={t('ordersTitle')}
                            value={totalOrders}
                            icon="shopping-bag"
                            gradient={['#6366F1', '#4F46E5']}
                        />
                        <StatCard
                            title={t('products')}
                            value={totalProducts}
                            icon="box"
                            gradient={['#F59E0B', '#D97706']}
                        />
                    </View>
                </View>

                {/* Revenue Trend Chart */}
                <RevenueChart
                    data={revenueChartData}
                    isDark={isDark}
                    title="Revenue Trend (7 Days)"
                />

                {/* Sales by Category Donut Chart */}
                <CategoryPieChart
                    data={categoryChartData}
                    isDark={isDark}
                    title="Sales by Category"
                />

                {/* Top Selling Products */}
                <TopProducts
                    products={products}
                    orders={allOrders}
                    isDark={isDark}
                    title="Top Selling Products"
                />

                {/* Stock Alerts */}
                <StockAlerts
                    products={products}
                    isDark={isDark}
                    title="Stock Alerts"
                    threshold={10}
                />

                {/* Activity Feed - Recent Orders */}
                <ActivityFeed
                    orders={allOrders}
                    isDark={isDark}
                    title="Recent Activity"
                    maxItems={5}
                />

                {/* Arab World Sales Map */}
                <View style={styles.globeSection}>
                    <ArabSalesMap data={mapData} isDark={isDark} />

                    {/* Sales Mapping List */}
                    <View style={[styles.mappingContainer, { backgroundColor: themeCard, borderColor: themeBorder }]}>
                        <Text style={[styles.mappingTitle, { color: themeText }]}>{t('salesByCountry')}</Text>
                        {countryStats.map((stat, index) => (
                            <View key={index} style={styles.countryRow}>
                                {/* Flag Placeholder or Icon */}
                                <View style={[styles.flagCircle, { backgroundColor: `hsl(${index * 60}, 70%, 50%)` }]}>
                                    <Text style={styles.flagText}>{stat.name.substring(0, 2).toUpperCase()}</Text>
                                </View>

                                <View style={styles.countryInfo}>
                                    <View style={styles.countryHeader}>
                                        <Text style={[styles.countryName, { color: themeText }]}>{stat.name}</Text>
                                        <Text style={[styles.countryValue, { color: themeText }]}>${stat.revenue.toFixed(0)}</Text>
                                    </View>
                                    {/* Progress Bar */}
                                    <View style={styles.progressBarBg}>
                                        <View
                                            style={[
                                                styles.progressBarFill,
                                                {
                                                    width: `${(stat.revenue / maxRevenue) * 100}%`,
                                                    backgroundColor: index === 0 ? '#10B981' : index === 1 ? '#F59E0B' : index === 2 ? '#3B82F6' : '#6366F1'
                                                }
                                            ]}
                                        />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={[styles.sectionTitle, { color: themeText }]}>{t('quickActions')}</Text>
                <View style={styles.quickActionsGrid}>
                    {/* Read Only - Orders View */}
                    <TouchableOpacity style={[styles.quickActionBtn, { backgroundColor: themeCard }]} onPress={() => setActiveTab('orders')}>
                        <LinearGradient
                            colors={['#14B8A6', '#0D9488']}
                            style={styles.actionIconBg}
                        >
                            <Feather name="list" size={24} color="#fff" />
                        </LinearGradient>
                        <Text style={[styles.quickActionText, { color: themeText }]}>{t('viewOrders')}</Text>
                    </TouchableOpacity>


                </View>
            </ScrollView>
        );
    };

    // --- Render Items ---
    const renderProductItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: themeCard, borderColor: themeBorder }]}>
            <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: themeText }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.cardPrice, { color: RevolutionTheme.colors.primary }]}>${item.price}</Text>
                <View style={[styles.stockBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6' }]}>
                    <Text style={[styles.stockText, { color: themeTextSecondary }]}>{t('stock')}: {item.stock}</Text>
                </View>
            </View>
            <View style={styles.actions}>
                {/* Read-Only View */}
            </View>
        </View>
    );

    const renderOrderItem = ({ item }) => (
        <View style={[styles.orderCard, { backgroundColor: themeCard, borderColor: themeBorder }]}>
            <View style={styles.orderHeader}>
                <View>
                    <Text style={[styles.orderNumber, { color: themeText }]}>{item.orderNumber}</Text>
                    <Text style={[styles.orderDate, { color: themeTextSecondary }]}>
                        {new Date(item.date).toLocaleDateString()}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'delivered' ? '#d1fae5' : '#fef3c7' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'delivered' ? '#059669' : '#d97706' }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: themeBorder }]} />

            <View style={styles.orderDetails}>
                <View style={styles.customerInfo}>
                    <Feather name="map-pin" size={14} color={themeTextSecondary} style={{ marginTop: 2 }} />
                    <Text style={[styles.customerName, { color: themeText }]} numberOfLines={1}>
                        {item.shippingAddress?.city || 'Unknown City'}
                    </Text>
                </View>
                <Text style={[styles.orderTotal, { color: RevolutionTheme.colors.primary }]}>
                    ${item.total}
                </Text>
            </View>
        </View>
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

            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: themeText }]}>{t('adminDashboard')}</Text>
                </View>

                {/* Custom Tab Bar */}
                <View style={[styles.tabContainer, { backgroundColor: themeCard }]}>
                    {['dashboard', 'orders'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tabButton,
                                activeTab === tab && styles.activeTabButton,
                                activeTab === tab && { backgroundColor: RevolutionTheme.colors.primary }
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[
                                styles.tabText,
                                activeTab === tab ? { color: '#ffffff' } : { color: themeTextSecondary }
                            ]}>
                                {t(tab === 'orders' ? 'ordersTitle' : tab).toUpperCase() || tab.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>



                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={RevolutionTheme.colors.primary} />
                    </View>
                ) : (
                    <View style={styles.contentContainer}>
                        {activeTab === 'dashboard' && (
                            <ScrollView
                                contentContainerStyle={styles.dashboardContent}
                                showsVerticalScrollIndicator={false}
                                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={RevolutionTheme.colors.primary} />}
                            >
                                {renderDashboard()}
                            </ScrollView>
                        )}



                        {activeTab === 'orders' && (
                            <FlatList
                                key={`orders-list-${activeTab}`}
                                data={allOrders}
                                renderItem={renderOrderItem}
                                keyExtractor={item => item.orderNumber}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                numColumns={2}
                                columnWrapperStyle={{ gap: 15 }}
                                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={RevolutionTheme.colors.primary} />}
                                ListEmptyComponent={
                                    <View style={styles.emptyState}>
                                        <Feather name="shopping-bag" size={48} color={themeTextSecondary} />
                                        <Text style={[styles.emptyText, { color: themeTextSecondary }]}>{t('noOrdersYet')}</Text>
                                    </View>
                                }
                            />
                        )}
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 15,
        paddingTop: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    dashboardContent: {
        padding: 20,
        paddingBottom: 50,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15,
        letterSpacing: 0.5,
    },
    // Globe & Stats
    globeSection: {
        marginBottom: 10,
    },
    statsGrid: {
        marginBottom: 25,
    },
    rowGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    trendBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    trendText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    statCardContainer: {
        width: '48%',
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 15,
    },
    statCardGradient: {
        padding: 20,
        borderRadius: 24,
        height: 160,
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconCircle: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    statTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    // Quick Actions
    quickActionsGrid: {
        flexDirection: 'row',
        gap: 15,
    },
    quickActionBtn: {
        flex: 1,
        borderRadius: 16,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    actionIconBg: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    quickActionText: {
        fontWeight: '600',
        fontSize: 12,
    },
    // Tab Styles
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 50,
        padding: 4,
        height: 45,
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 40,
    },
    activeTabButton: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontWeight: '700',
        fontSize: 12,
    },
    // Search
    searchWrapper: {
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    // List Content
    contentContainer: {
        flex: 1,
    },
    listContent: {
        padding: 20,
        gap: 15,
    },
    // Product Card
    card: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 10,
        borderWidth: 1,
        alignItems: 'center',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    cardContent: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardPrice: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    stockBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    stockText: {
        fontSize: 10,
        fontWeight: '600',
    },
    actions: {
        gap: 8,
    },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Order Card (Now grid friendly)
    orderCard: {
        flex: 1,
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        elevation: 2,
        marginBottom: 0,
        minHeight: 120,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    orderNumber: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    orderDate: {
        fontSize: 10,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 8,
        opacity: 0.5,
    },
    orderDetails: {
        marginTop: 'auto',
    },
    customerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    customerName: {
        fontSize: 12,
        fontWeight: '500',
    },
    orderTotal: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        gap: 10,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Sales Mapping
    mappingContainer: {
        marginTop: 15,
        borderRadius: 16,
        padding: 15,
        borderWidth: 1,
    },
    mappingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    countryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    flagCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    flagText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
    countryInfo: {
        flex: 1,
    },
    countryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    countryName: {
        fontSize: 14,
        fontWeight: '600',
    },
    countryValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#f3f4f6',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    }
});

export default AdminDashboard;
