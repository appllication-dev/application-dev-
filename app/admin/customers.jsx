/**
 * 👥 Customers CRM - Kataraa Admin
 * Customer management with details
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOWS, GRADIENTS } from '../theme/colors';

// Customer Card
const CustomerCard = ({ customer, onPress }) => (
  <TouchableOpacity style={styles.customerCard} onPress={onPress}>
    <View style={styles.avatarContainer}>
      <View style={[styles.avatar, { backgroundColor: customer.color }]}>
        <Text style={styles.avatarText}>{customer.initials}</Text>
      </View>
      {customer.isVIP && (
        <View style={styles.vipBadge}>
          <Ionicons name="star" size={10} color="#FFD700" />
        </View>
      )}
    </View>
    <View style={styles.customerInfo}>
      <Text style={styles.customerName}>{customer.name}</Text>
      <Text style={styles.customerEmail}>{customer.email}</Text>
      <View style={styles.customerStats}>
        <Text style={styles.statText}>{customer.ordersCount} طلب</Text>
        <Text style={styles.statDivider}>•</Text>
        <Text style={styles.statText}>{customer.totalSpent} KWD</Text>
      </View>
    </View>
    <Ionicons name="chevron-back" size={20} color={COLORS.textMuted} />
  </TouchableOpacity>
);

export default function CustomersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, vip, new

  // Demo customers data
  const customers = [
    { id: 1, name: 'فاطمة الكويتي', email: 'fatima@email.com', initials: 'ف', color: '#E91E63', ordersCount: 12, totalSpent: '450', isVIP: true, lastOrder: '2024-12-20' },
    { id: 2, name: 'سارة العلي', email: 'sara@email.com', initials: 'س', color: '#9C27B0', ordersCount: 8, totalSpent: '320', isVIP: true, lastOrder: '2024-12-22' },
    { id: 3, name: 'نورة محمد', email: 'noura@email.com', initials: 'ن', color: '#2196F3', ordersCount: 5, totalSpent: '180', isVIP: false, lastOrder: '2024-12-24' },
    { id: 4, name: 'هدى الصالح', email: 'huda@email.com', initials: 'ه', color: '#4CAF50', ordersCount: 3, totalSpent: '95', isVIP: false, lastOrder: '2024-12-25' },
    { id: 5, name: 'ريم عبدالله', email: 'reem@email.com', initials: 'ر', color: '#FF9800', ordersCount: 1, totalSpent: '45', isVIP: false, lastOrder: '2024-12-26' },
  ];

  const filteredCustomers = customers.filter(c => {
    if (filter === 'vip' && !c.isVIP) return false;
    if (filter === 'new' && c.ordersCount > 1) return false;
    if (searchQuery && !c.name.includes(searchQuery) && !c.email.includes(searchQuery)) return false;
    return true;
  });

  const stats = {
    total: customers.length,
    vip: customers.filter(c => c.isVIP).length,
    newThisMonth: customers.filter(c => c.ordersCount === 1).length,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={GRADIENTS.header} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>العملاء 👥</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.miniStat}>
          <Text style={styles.miniStatValue}>{stats.total}</Text>
          <Text style={styles.miniStatLabel}>الكل</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatValue, { color: '#FFD700' }]}>{stats.vip}</Text>
          <Text style={styles.miniStatLabel}>VIP ⭐</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatValue, { color: '#4CAF50' }]}>{stats.newThisMonth}</Text>
          <Text style={styles.miniStatLabel}>جديد</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن عميل..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          textAlign="right"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['all', 'vip', 'new'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'الكل' : f === 'vip' ? 'VIP' : 'جدد'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Customer List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <CustomerCard customer={item} onPress={() => {}} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>لا يوجد عملاء</Text>
          </View>
        }
      />
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.md,
  },
  miniStat: {
    alignItems: 'center',
  },
  miniStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  miniStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    ...SHADOWS.sm,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    color: COLORS.text,
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginLeft: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  vipBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
    ...SHADOWS.sm,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'right',
  },
  customerEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 2,
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
    gap: 6,
  },
  statText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
  },
  statDivider: {
    color: COLORS.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: COLORS.textMuted,
    marginTop: 12,
  },
});
