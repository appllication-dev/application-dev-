/**
 * Favorites Screen - Kataraa
 * Dark Mode Supported 🌙
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { useSettings } from '../context/SettingsContext';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInDown,
  FadeInRight,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { theme, isDark } = useTheme();

  const { t } = useTranslation();
  const { language } = useSettings();
  const [, setTick] = useState(0); // Force update state

  useEffect(() => {
    // Force re-render when language changes
    setTick(t => t + 1);
  }, [language]);

  const styles = getStyles(theme, isDark);

  const formatPrice = (price) => {
    return `${parseFloat(price || 0).toFixed(3)} ${t('currency')}`;
  };

  const renderItem = ({ item, index }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.cardContainer}
    >
      <BlurView intensity={isDark ? 20 : 40} tint={isDark ? "dark" : "light"} style={styles.card}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => router.push(`/product/${item.id}`)}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)']}
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
            style={[styles.actionBtn, { backgroundColor: theme.primary + '20' }]}
            onPress={() => addToCart({ ...item, quantity: 1 })}
          >
            <Ionicons name="cart" size={20} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.error + '20' }]}
            onPress={() => toggleFavorite(item)}
          >
            <Ionicons name="heart-dislike" size={20} color={theme.error} />
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Dynamic Background Shapes */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

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
                <Ionicons name="heart" size={40} color="#fff" style={styles.headerIcon} />
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
            <Ionicons name="heart-outline" size={60} color={theme.primary} />
          </View>
          <Text style={styles.emptyTitle}>{t('noFavorites')}</Text>
          <Text style={styles.emptySubtitle}>{t('addFavoritesHint')}</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/')}
          >
            <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.browseBtnGradient}>
              <Text style={styles.browseBtnText}>{t('browseProducts')}</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
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
    backgroundColor: isDark ? '#0F0F1A' : '#FAFAFF',
  },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.primary + '10',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.primary + '05',
  },
  headerContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    paddingBottom: 35,
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'left',
  },
  headerIcon: {
    opacity: 0.6,
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  listContent: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    // Shadow for the glass effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  card: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    backgroundColor: isDark ? 'rgba(30,30,40,0.4)' : 'rgba(255,255,255,0.75)', // White tint for light mode
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: isDark ? '#1A1A2E' : '#FFF',
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
    marginLeft: 15,
    paddingRight: 5,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'right',
    marginBottom: 10,
    lineHeight: 20,
  },
  priceBadge: {
    alignSelf: 'flex-end',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.primary,
  },
  actions: {
    marginLeft: 10,
    gap: 10,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -50,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: theme.primary + '20',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    color: theme.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  browseBtn: {
    marginTop: 40,
    width: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  browseBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
