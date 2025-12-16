import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PremiumBackground from '../components/PremiumBackground';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from '../../src/hooks/useTranslation';
import { useTheme } from '../../src/context/ThemeContext';

const { width } = Dimensions.get('window');

const NotificationsScreen = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors, theme } = useTheme();
    const isDark = theme === 'dark';

    const notifications = [
        {
            id: '1',
            title: t('orderShippedTitle'),
            message: t('orderShippedMsg'),
            time: t('hoursAgo', { count: 2 }),
            type: 'order',
            read: false,
        },
        {
            id: '2',
            title: t('newArrivalTitle'),
            message: t('newArrivalMsg'),
            time: t('hoursAgo', { count: 5 }),
            type: 'promo',
            read: true,
        },
        {
            id: '3',
            title: t('flashSaleTitle'),
            message: t('flashSaleMsg'),
            time: t('dayAgo', { count: 1 }),
            type: 'sale',
            read: true,
        },
        {
            id: '4',
            title: t('accountSecurityTitle'),
            message: t('accountSecurityMsg'),
            time: t('daysAgo', { count: 2 }), // Borrowing daysAgo from Products translation
            type: 'security',
            read: true,
        },
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'order': return 'cube-outline';
            case 'promo': return 'star-outline';
            case 'sale': return 'flash-outline';
            case 'security': return 'shield-checkmark-outline';
            default: return 'notifications-outline';
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'order': return colors.info;
            case 'promo': return colors.primary; // Gold for promo
            case 'sale': return colors.error; // Deep Red for sale or Gold
            case 'security': return colors.success;
            default: return colors.text;
        }
    };

    const renderNotification = ({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
            <TouchableOpacity
                style={[
                    styles.notificationCard,
                    {
                        backgroundColor: !item.read
                            ? (isDark ? 'rgba(255,255,255,0.1)' : colors.card) // Unread: Prominent
                            : (isDark ? 'transparent' : colors.backgroundSecondary), // Read: Muted
                        borderColor: !item.read ? colors.border : 'transparent',
                        elevation: !item.read ? 2 : 0, // Add shadow for unread
                        shadowColor: colors.shadow,
                        shadowOpacity: !item.read ? 0.05 : 0,
                        shadowRadius: 4,
                        shadowOffset: { width: 0, height: 2 }
                    }
                ]}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${getColor(item.type)}20` }]}>
                    <Ionicons name={getIcon(item.type)} size={24} color={getColor(item.type)} />
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                        <Text style={[styles.time, { color: colors.textSecondary }]}>{item.time}</Text>
                    </View>
                    <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>{item.message}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <PremiumBackground>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('notifications')}</Text>
                <TouchableOpacity style={styles.clearButton}>
                    <Text style={[styles.clearText, { color: colors.textSecondary }]}>{t('clearAll')}</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                extraData={theme} // Force re-render when theme changes
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={60} color={colors.textLight} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noNotifications')}</Text>
                    </View>
                }
            />
        </PremiumBackground>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    clearButton: {
        padding: 8,
    },
    clearText: {
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        padding: 20,
        backgroundColor: 'transparent',
    },
    notificationCard: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    time: {
        fontSize: 12,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D4AF37', // Gold
        marginLeft: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
    },
});

export default NotificationsScreen;
