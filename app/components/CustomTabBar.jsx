
/**
 * Custom Floating Tab Bar - Kataraa  
 * Pill Design Inspired by User Request
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming,
    FadeInLeft,
    FadeOutRight,
    Layout,
    LinearTransition
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function CustomTabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const { t } = useTranslation();
    const { cartItems } = useCart();

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const tabs = [
        { name: 'index', icon: isDark ? 'home' : 'home-outline', label: t('home') },
        { name: 'favorites', icon: isDark ? 'heart' : 'heart-outline', label: t('favorites') },
        { name: 'cart', icon: isDark ? 'cart' : 'cart-outline', label: t('cart') },
        { name: 'products', icon: isDark ? 'grid' : 'grid-outline', label: t('shop') },
        { name: 'profile', icon: isDark ? 'person' : 'person-outline', label: t('profile') },
    ];

    const styles = getStyles(theme, isDark);

    const TabIcon = ({ name, label, isFocused, onPress, routeName }) => {

        const animatedContainerStyle = useAnimatedStyle(() => {
            return {
                backgroundColor: isFocused ? theme.primary : 'transparent',
                paddingHorizontal: isFocused ? 20 : 0,
                flexGrow: isFocused ? 0 : 1, // inactive items take flex space to distribute
                width: isFocused ? 'auto' : 50, // Auto width for active, fixed for inactive
            };
        });

        return (
            <AnimatedTouchable
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onPress();
                }}
                style={[styles.tabButton, animatedContainerStyle]}
                layout={LinearTransition.springify().damping(15)}
                activeOpacity={0.8}
            >
                <View>
                    <Ionicons
                        name={name}
                        size={24}
                        color={isFocused ? '#FFF' : theme.textSecondary}
                    />
                    {routeName === 'cart' && cartCount > 0 && (
                        <View style={[styles.badge, { borderColor: isFocused ? theme.primary : theme.backgroundCard }]}>
                            <Text style={styles.badgeText}>
                                {cartCount > 99 ? '99+' : cartCount}
                            </Text>
                        </View>
                    )}
                </View>

                {isFocused && (
                    <Animated.Text
                        entering={FadeInLeft.duration(200).delay(100)}
                        exiting={FadeOutRight.duration(100)}
                        style={styles.label}
                        numberOfLines={1}
                    >
                        {label}
                    </Animated.Text>
                )}
            </AnimatedTouchable>
        );
    };

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 10 }]}>
            <BlurView intensity={Platform.OS === 'ios' ? 80 : 0} tint={isDark ? 'dark' : 'light'} style={styles.blurContainer}>
                <View style={[styles.tabBarInner, { backgroundColor: isDark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.95)' }]}>
                    {state.routes.map((route, index) => {
                        const isFocused = state.index === index;
                        // Map route name to tab config, safely fallback if route name changes
                        const tab = tabs.find(t => t.name === route.name) || tabs[0];

                        // If specific tab logic needed (like keeping cart in middle logic from before), 
                        // we can adjust here, but for this design a linear list is best.

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        return (
                            <TabIcon
                                key={route.key}
                                name={tab.icon}
                                label={tab.label}
                                isFocused={isFocused}
                                onPress={onPress}
                                routeName={route.name}
                            />
                        );
                    })}
                </View>
            </BlurView>
        </View>
    );
}

const getStyles = (theme, isDark) => StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    blurContainer: {
        width: '100%',
        maxWidth: 400, // Dont get too wide on tablets
        borderRadius: 35,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: isDark ? 0.5 : 0.1,
        shadowRadius: 10,
        elevation: 10,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    },
    tabBarInner: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Distribute items space-between if using fixed width items, or just padding
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        height: 70, // Fixed height for consistency
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        borderRadius: 25,
        gap: 8,
        // Default style for inactive
    },
    label: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    badge: {
        position: 'absolute',
        top: -8,
        right: -12,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FF3B30', // Forced red for visibility
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
        paddingHorizontal: 4,
        zIndex: 999,
        elevation: 10,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: -1,
    }
});
