/**
 * Search Header Component - Kataraa
 * Purple gradient header with logo, search bar, and cart icon
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, GRADIENTS } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function SearchHeader({
    onSearch,
    onCartPress,
    onMenuPress,
    cartCount = 0,
    showSearch = true,
    title = 'KATARAA',
    placeholder = 'Search for...',
}) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        onSearch?.(searchQuery);
    };

    const handleClear = () => {
        setSearchQuery('');
        onSearch?.('');
    };

    return (
        <LinearGradient
            colors={GRADIENTS.header}
            style={styles.container}
        >
            <SafeAreaView edges={['top']}>
                {/* Top Bar */}
                <View style={styles.topBar}>
                    {/* Menu Button */}
                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={onMenuPress}
                    >
                        <Ionicons name="menu" size={24} color="#fff" />
                    </TouchableOpacity>

                    {/* Logo/Title */}
                    <Text style={styles.logo}>{title}</Text>

                    {/* Cart Button */}
                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={onCartPress}
                    >
                        <Ionicons name="cart-outline" size={24} color="#fff" />
                        {cartCount > 0 && (
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>
                                    {cartCount > 9 ? '9+' : cartCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                {showSearch && (
                    <View style={styles.searchContainer}>
                        <Feather name="search" size={18} color={COLORS.textMuted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={placeholder}
                            placeholderTextColor={COLORS.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={handleClear}>
                                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: SPACING.md,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 2,
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: COLORS.error,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    cartBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: SPACING.md,
        marginTop: SPACING.sm,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        height: 44,
        ...{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: COLORS.text,
        marginLeft: SPACING.sm,
        paddingVertical: 0,
    },
});
