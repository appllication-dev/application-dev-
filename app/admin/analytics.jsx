/**
 * 📈 Analytics Screen - Kataraa Admin
 * Detailed analytics with charts
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOWS, GRADIENTS } from '../theme/colors';

const { width } = Dimensions.get('window');

// Simple Bar Chart Component
const BarChart = ({ data, maxValue }) => (
    <View style={styles.chartContainer}>
        {data.map((item, index) => (
            <View key={index} style={styles.barWrapper}>
                <View style={styles.barContainer}>
                    <View
                        style={[
                            styles.bar,
                            { height: `${(item.value / maxValue) * 100}%`, backgroundColor: item.color || COLORS.primary }
                        ]}
                    />
                </View>
                <Text style={styles.barLabel}>{item.label}</Text>
            </View>
        ))}
    </View>
);

// Metric Row
const MetricRow = ({ icon, label, value, change, color }) => (
    <View style={styles.metricRow}>
        <View style={styles.metricLeft}>
            <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={18} color={color} />
            </View>
            <Text style={styles.metricLabel}>{label}</Text>
        </View>
        <View style={styles.metricRight}>
            <Text style={styles.metricValue}>{value}</Text>
            {change && (
                <View style={[styles.changeBadge, { backgroundColor: change > 0 ? '#E8F5E9' : '#FFEBEE' }]}>
                    <Ionicons name={change > 0 ? 'arrow-up' : 'arrow-down'} size={10} color={change > 0 ? '#4CAF50' : '#F44336'} />
                    <Text style={[styles.changeText, { color: change > 0 ? '#4CAF50' : '#F44336' }]}>
                        {Math.abs(change)}%
                    </Text>
                </View>
            )}
        </View>
    </View>
);

export default function AnalyticsScreen() {
    const router = useRouter();
    const [period, setPeriod] = useState('week'); // week, month, year
    const [loading, setLoading] = useState(false);

    // Demo data
    const salesData = [
        { label: 'سبت', value: 120, color: '#667eea' },
        { label: 'أحد', value: 180, color: '#667eea' },
        { label: 'إثن', value: 150, color: '#667eea' },
        { label: 'ثلا', value: 220, color: '#764ba2' },
        { label: 'أرب', value: 190, color: '#667eea' },
        { label: 'خمي', value: 280, color: '#764ba2' },
        { label: 'جمع', value: 240, color: '#667eea' },
    ];

    const topProducts = [
        { name: 'سيروم فيتامين C', sales: 45, revenue: '225 KWD' },
        { name: 'كريم مرطب هيالو', sales: 38, revenue: '190 KWD' },
        { name: 'مقشر الوجه', sales: 32, revenue: '128 KWD' },
        { name: 'واقي الشمس SPF50', sales: 28, revenue: '140 KWD' },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={GRADIENTS.header} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>التحليلات 📈</Text>
                        <View style={{ width: 24 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Period Selector */}
                <View style={styles.periodSelector}>
                    {['week', 'month', 'year'].map((p) => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
                            onPress={() => setPeriod(p)}
                        >
                            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                                {p === 'week' ? 'أسبوع' : p === 'month' ? 'شهر' : 'سنة'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Overview Cards */}
                <View style={styles.overviewRow}>
                    <View style={styles.overviewCard}>
                        <Text style={styles.overviewValue}>1,580 KWD</Text>
                        <Text style={styles.overviewLabel}>المبيعات</Text>
                        <View style={styles.overviewTrend}>
                            <Ionicons name="arrow-up" size={12} color="#4CAF50" />
                            <Text style={styles.trendUp}>+12%</Text>
                        </View>
                    </View>
                    <View style={styles.overviewCard}>
                        <Text style={styles.overviewValue}>48</Text>
                        <Text style={styles.overviewLabel}>الطلبات</Text>
                        <View style={styles.overviewTrend}>
                            <Ionicons name="arrow-up" size={12} color="#4CAF50" />
                            <Text style={styles.trendUp}>+8%</Text>
                        </View>
                    </View>
                </View>

                {/* Sales Chart */}
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>المبيعات اليومية</Text>
                    <BarChart data={salesData} maxValue={300} />
                </View>

                {/* Key Metrics */}
                <View style={styles.metricsCard}>
                    <Text style={styles.chartTitle}>مؤشرات الأداء</Text>
                    <MetricRow icon="cart" label="متوسط قيمة الطلب" value="33 KWD" change={5} color="#2196F3" />
                    <MetricRow icon="repeat" label="معدل التحويل" value="3.2%" change={-2} color="#9C27B0" />
                    <MetricRow icon="person-add" label="عملاء جدد" value="24" change={18} color="#4CAF50" />
                    <MetricRow icon="eye" label="مشاهدات المنتجات" value="1,240" change={22} color="#FF9800" />
                </View>

                {/* Top Products */}
                <View style={styles.topProductsCard}>
                    <Text style={styles.chartTitle}>المنتجات الأكثر مبيعاً</Text>
                    {topProducts.map((product, index) => (
                        <View key={index} style={styles.topProductRow}>
                            <View style={styles.productRank}>
                                <Text style={styles.rankText}>{index + 1}</Text>
                            </View>
                            <View style={styles.productInfo}>
                                <Text style={styles.productName}>{product.name}</Text>
                                <Text style={styles.productSales}>{product.sales} مبيعات</Text>
                            </View>
                            <Text style={styles.productRevenue}>{product.revenue}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingBottom: 16,
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
        ...SHADOWS.sm,
    },
    periodBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    periodBtnActive: {
        backgroundColor: COLORS.primary,
    },
    periodText: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    periodTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    overviewRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    overviewCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        ...SHADOWS.sm,
    },
    overviewValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    overviewLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    overviewTrend: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 4,
    },
    trendUp: {
        color: '#4CAF50',
        fontSize: 12,
        fontWeight: '600',
    },
    chartCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.sm,
    },
    chartTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 16,
        textAlign: 'right',
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
    },
    barWrapper: {
        alignItems: 'center',
        flex: 1,
    },
    barContainer: {
        height: 100,
        width: 24,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    bar: {
        width: '100%',
        borderRadius: 6,
    },
    barLabel: {
        fontSize: 10,
        color: COLORS.textSecondary,
        marginTop: 6,
    },
    metricsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        ...SHADOWS.sm,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    metricLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    metricIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 13,
        color: COLORS.text,
    },
    metricRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metricValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 2,
    },
    changeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    topProductsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        ...SHADOWS.sm,
    },
    topProductRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    productRank: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    rankText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 13,
        color: COLORS.text,
        textAlign: 'right',
    },
    productSales: {
        fontSize: 11,
        color: COLORS.textSecondary,
        textAlign: 'right',
        marginTop: 2,
    },
    productRevenue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
});
