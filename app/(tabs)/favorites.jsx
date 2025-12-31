/**
 * Favorites Screen - Cosmic Luxury Edition
 * 🌙 Floating glass cards with ethereal animations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  // Image, 
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFavorites } from '../../src/context/FavoritesContext';
import { useCart } from '../../src/context/CartContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from '../../src/hooks/useTranslation';
import { useSettings } from '../../src/context/SettingsContext';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { language } = useSettings();
  const [, setTick] = useState(0);

  useEffect(() => {
    setTick(t => t + 1);
  }, [language]);

  const styles = getStyles(theme, isDark);

  const formatPrice = (price) => {
    return `${parseFloat(price || 0).toFixed(3)} ${t('currency')}`;
  };

  const handleItemPress = React.useCallback((id) => {
    router.push(`/product/${id}`);
  }, [router]);

  const handleAddToCart = React.useCallback((item) => {
    addToCart({ ...item, quantity: 1 });
  }, [addToCart]);

  const handleToggleFavorite = React.useCallback((item) => {
    toggleFavorite(item);
  }, [toggleFavorite]);

  const renderItem = React.useCallback(({ item, index }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.cardContainer}
    >
      <BlurView intensity={isDark ? 25 : 50} tint={isDark ? "dark" : "light"} style={styles.card}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => handleItemPress(item.id)}
        >
          <View style={styles.imageContainer}>
            <Image
              source={item.image}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
            <LinearGradient
              colors={['transparent', isDark ? 'rgba(26,21,32,0.5)' : 'rgba(254,251,255,0.5)']}
              style={styles.imageOverlay}
            />
          </View>

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            <View style={styles.priceBadge}>
              <Text style={styles.price}>{formatPrice(item.price)}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleAddToCart(item)}
          >
            <LinearGradient
              colors={[theme.primary + '30', theme.primary + '20']}
              style={styles.actionBtnGradient}
            >
              <Ionicons name="cart" size={20} color={theme.primary} />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleToggleFavorite(item)}
          >
            <LinearGradient
              colors={['#D4A5A5' + '30', '#D4A5A5' + '20']}
              style={styles.actionBtnGradient}
            >
              <Ionicons name="heart-dislike" size={20} color="#D4A5A5" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  ), [isDark, styles, theme, handleItemPress, handleAddToCart, handleToggleFavorite, formatPrice]);

  return (
    <View style={styles.container}>
      {/* Cosmic Background Orbs */}
      <View style={styles.bgOrb1} />
      <View style={styles.bgOrb2} />

      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[theme.primary, theme.primaryDark]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerTitle}>{t('favoritesTitle')}</Text>
                <Text style={styles.headerSubtitle}>{t('productCount', { count: favorites.length })}</Text>
              </View>
              <Animated.View entering={FadeInRight.delay(500)}>
                <View style={styles.headerIconCircle}>
                  <Ionicons name="heart" size={28} color="#fff" />
                </View>
              </Animated.View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      {favorites.length === 0 ? (
        <Animated.View
          entering={FadeInDown}
          style={styles.emptyContainer}
        >
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-outline" size={56} color={theme.primary} />
          </View>
          <Text style={styles.emptyTitle}>{t('noFavorites')}</Text>
          <Text style={styles.emptySubtitle}>{t('addFavoritesHint')}</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/')}
          >
            <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.browseBtnGradient}>
              <Text style={styles.browseBtnText}>{t('browseProducts')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const getStyles = (theme, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  bgOrb1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.primary,
    zIndex: -1,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: 50,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: theme.accent + '08',
    zIndex: -1,
  },
  headerContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    paddingBottom: 32,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '400',
  },
  headerIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingTop: 28,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: 18,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  card: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(184,159,204,0.15)' : 'rgba(212,184,224,0.25)',
    borderRadius: 24,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 88,
    height: 88,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: isDark ? '#1A1520' : '#FEFBFF',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  info: {
    flex: 1,
    marginLeft: 16,
    paddingRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
    textAlign: 'right',
    marginBottom: 10,
    lineHeight: 21,
  },
  priceBadge: {
    alignSelf: 'flex-end',
    backgroundColor: theme.primary + '15',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.primary,
  },
  actions: {
    marginLeft: 12,
    gap: 10,
  },
  actionBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionBtnGradient: {
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 44,
    marginTop: -40,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: theme.primary + '20',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: theme.text,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  emptySubtitle: {
    fontSize: 15,
    color: theme.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  browseBtn: {
    marginTop: 40,
    width: '85%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  browseBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
