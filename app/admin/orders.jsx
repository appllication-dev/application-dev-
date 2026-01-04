/**
 * 📦 Orders Management - Kataraa Admin
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { COLORS, SHADOWS, GRADIENTS } from '../theme/colors';

const statusConfig = {
    pending: { label: 'قيد الانتظار', color: '#FF9800', icon: 'time' },
    processing: { label: 'قيد التجهيز', color: '#2196F3', icon: 'cube' },
    completed: { label: 'مكتمل', color: '#4CAF50', icon: 'checkmark-circle' },
    cancelled: { label: 'ملغي', color: '#F44336', icon: 'close-circle' },
};

const OrderCard = ({ order }) => {
    const status = statusConfig[order.status] || statusConfig.pending;
    return (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                    <Ionicons name={status.icon} size={12} color="#fff" />
                    <Text style={styles.statusText}>{status.label}</Text>
                </View>
                <Text style={styles.orderId}>#{order.id}</Text>
            </View>
            <View style={styles.orderBody}>
                <Text style={styles.orderCustomer}>{order.billing?.first_name || 'عميل'}</Text>
                <Text style={styles.orderDate}>{new Date(order.date_created).toLocaleDateString('ar-KW')}</Text>
            </View>
            <View style={styles.orderFooter}>
                <Text style={styles.itemsText}>{order.line_items?.length || 0} منتج</Text>
                <Text style={styles.orderTotal}>{order.total} KWD</Text>
            </View>
        </View>
    );
};

export default function OrdersScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => { loadOrders(); }, []);

    const loadOrders = async () => {
        try {
            const data = await api.getOrders?.() || [];
            setOrders(data.length ? data : [
                { id: 1001, status: 'pending', total: '45.500', date_created: new Date(), billing: { first_name: 'فاطمة' }, line_items: [1, 2] },
                { id: 1002, status: 'processing', total: '78.000', date_created: new Date(), billing: { first_name: 'سارة' }, line_items: [1, 2, 3] },
                { id: 1003, status: 'completed', total: '32.000', date_created: new Date(), billing: { first_name: 'نورة' }, line_items: [1] },
            ]);
        } catch (e) { console.error(e); }
    };

    const handleRefresh = async () => { setRefreshing(true); await loadOrders(); setRefreshing(false); };

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    return (
        <View style={styles.container}>
            <LinearGradient colors={GRADIENTS.header} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>الطلبات 📦</Text>
                        <View style={{ width: 24 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.filterRow}>
                {['all', 'pending', 'processing', 'completed'].map((f) => (
                    <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]} onPress={() => setFilter(f)}>
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                            {f === 'all' ? 'الكل' : statusConfig[f]?.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
                renderItem={({ item }) => <OrderCard order={item} />}
                ListEmptyComponent={<View style={styles.empty}><Ionicons name="receipt-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyText}>لا توجد طلبات</Text></View>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { paddingBottom: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#fff', ...SHADOWS.sm },
    filterBtnActive: { backgroundColor: COLORS.primary },
    filterText: { fontSize: 12, color: COLORS.text },
    filterTextActive: { color: '#fff', fontWeight: '600' },
    listContainer: { padding: 16 },
    orderCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, ...SHADOWS.sm },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    orderId: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
    statusText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    orderBody: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
    orderCustomer: { fontSize: 14, color: COLORS.text, textAlign: 'right' },
    orderDate: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right', marginTop: 4 },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    itemsText: { fontSize: 12, color: COLORS.primary },
    orderTotal: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
    empty: { alignItems: 'center', paddingVertical: 48 },
    emptyText: { color: COLORS.textMuted, marginTop: 12 },
});
