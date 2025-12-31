/**
 * Search Header Component - Kataraa
 * Purple gradient header with logo, search bar, and cart icon
 * Dark Mode Supported 🌙
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { useRouter } from 'expo-router';
import { useNotifications } from '../context/NotificationContext';
import { useTranslation } from '../hooks/useTranslation';

const { width } = Dimensions.get('window');

export default function SearchHeader({
    onSearch,
    onCartPress,
    onMenuPress,
    onNotificationPress,
    cartCount = 0,
    notificationCount = 2,
    showSearch = false,
    title = 'KATARAA',
    placeholder = null, // Will use default if null
}) {
    const { theme, isDark } = useTheme();
    const { user } = useAuth();
    const { unreadCount } = useNotifications();
    const { t } = useTranslation();
    const router = useRouter();
    const styles = getStyles(theme, isDark);
    const [searchQuery, setSearchQuery] = useState('');
    const [profileImage, setProfileImage] = useState(null);

    const activePlaceholder = placeholder || t('searchPlaceholder');

    // Load user profile image
    useEffect(() => {
        const loadProfileImage = async () => {
            if (!user) {
                setProfileImage(null);
                return;
            }
            try {
                const userImageKey = `profile_image_${user.id}`;
                const savedUri = await storage.getItem(userImageKey);
                if (savedUri) {
                    setProfileImage(savedUri);
                } else if (user?.photoURL) {
                    setProfileImage(user.photoURL);
                }
            } catch (error) {
                console.error('Error loading profile image:', error);
            }
        };
        loadProfileImage();
    }, [user]);

    const handleSearch = () => {
        onSearch?.(searchQuery);
    };

    const handleClear = () => {
        setSearchQuery('');
        onSearch?.('');
    };

    return (
        <LinearGradient
            colors={['#ffffff', '#ffffff']}
            style={styles.container}
        >
            <SafeAreaView edges={['top']}>
                {/* Top Bar */}
                <View style={styles.topBar}>
                    {/* Left Icons */}
                    <View style={styles.leftIcons}>
                        {/* Search Button */}
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => router.push('/search')}
                        >
                            <Ionicons name="search" size={24} color={theme.primaryDark} />
                        </TouchableOpacity>

                        {/* Voice Search Button */}
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => router.push('/voice-search')}
                        >
                            <Ionicons name="mic" size={24} color={theme.primaryDark} />
                        </TouchableOpacity>
                    </View>

                    {/* Logo/Title */}
                    <Image
                        source={require('../../assets/images/logo_premium.jpg')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />

                    {/* Right Side Actions */}
                    <View style={styles.rightActions}>
                        {/* Notification Button */}
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={onNotificationPress}
                        >
                            <Ionicons name="notifications-outline" size={24} color={theme.primaryDark} />
                            {unreadCount > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.badgeText}>{unreadCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Profile Avatar */}
                        <TouchableOpacity
                            style={styles.profileBtn}
                            onPress={onMenuPress}
                        >
                            {profileImage ? (
                                <Image
                                    source={{ uri: profileImage }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarText}>
                                        {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                {showSearch && (
                    <View style={styles.searchContainer}>
                        <Feather name="search" size={18} color={theme.textMuted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={activePlaceholder}
                            placeholderTextColor={theme.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={handleClear}>
                                <Ionicons name="close-circle" size={18} color={theme.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}

const getStyles = (theme, isDark) => StyleSheet.create({
    container: {
        paddingBottom: 16,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    leftIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoImage: {
        width: 120,
        height: 60,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    profileBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 18,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.primaryLight || '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: theme.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    notificationBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#FFB300',
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.backgroundCard,
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 44,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: theme.text,
        marginLeft: 8,
        paddingVertical: 0,
    },
});
