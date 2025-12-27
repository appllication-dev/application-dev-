/**
 * 🌙 COSMIC LUXURY HOME SCREEN - Kataraa
 * Next-Generation Beauty App - Ethereal, Floating, Cinematic
 * 
 * الهدف: تجربة فاخرة كونية تحس المستخدمة أنها داخلة لعالم نادر وراقي
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';

// Services & Context
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useCartAnimation } from '../context/CartAnimationContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

// Components
import SearchHeader from '../components/SearchHeader';
import ProductCardSwipeable from '../components/ProductCardSwipeable';
import DrawerMenu from '../components/DrawerMenu';
import VoiceSearchButton from '../components/VoiceSearchButton';

// Theme
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme/colors';

const { width, height } = Dimensions.get('window');

// ============================================
// 🌙 COSMIC HERO SECTION
// ============================================
const CosmicHero = ({ onShopNow, theme, styles, t, isDark }) => {
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(40);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1200 });
    slideAnim.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.exp) });
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  return (
    <View style={styles.heroContainer}>
      <ImageBackground
        source={require('../../assets/images/hero_premium.png')}
        style={styles.heroImage}
        resizeMode="cover"
      >
        {/* Cosmic Overlay */}
        <LinearGradient
          colors={[
            'rgba(212,184,224,0.1)',
            isDark ? 'rgba(13,10,18,0.7)' : 'rgba(254,251,255,0.6)',
            isDark ? 'rgba(13,10,18,0.95)' : 'rgba(254,251,255,0.95)',
          ]}
          style={styles.heroOverlay}
        />

        <Animated.View style={[styles.heroContent, contentStyle]}>
          {/* Ethereal Badge */}
          <View style={styles.heroBadgeContainer}>
            <View style={[styles.heroBadge, { backgroundColor: isDark ? 'rgba(26,21,32,0.7)' : 'rgba(255,255,255,0.8)' }]}>
              <Text style={[styles.heroBadgeText, { color: theme.primary }]}>
                ✦ {t('heroSubtitle')}
              </Text>
            </View>
          </View>

          {/* Main Title - Elegant Typography */}
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            {t('heroTitle')}
          </Text>

          {/* Glass CTA Button */}
          <TouchableOpacity style={styles.heroButton} onPress={onShopNow}>
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              style={styles.heroButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.heroButtonText}>{t('shopNow')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ImageBackground>
    </View>
  );
};

// ============================================
// 💎 FLOATING SKIN TYPE SELECTOR
// ============================================
const SkinTypeSection = ({ onSelect, theme, styles, t, isDark }) => {
  const skinTypes = [
    { id: 'oily', name: t('oily'), icon: '💧', color: '#A8D8EA' },
    { id: 'dry', name: t('dry'), icon: '🍃', color: '#C9E4CA' },
    { id: 'mixed', name: t('mixed'), icon: '⚖️', color: '#E8DCC8' },
    { id: 'sensitive', name: t('sensitive'), icon: '🌸', color: '#F0D8E6' },
  ];

  return (
    <View style={styles.skinTypeSection}>
      <View style={styles.sectionHeader}>
        <TouchableOpacity style={styles.viewAllBtn}>
          <Text style={[styles.viewAllText, { color: theme.primary }]}>{t('viewAll')}</Text>
          <Ionicons name="arrow-back" size={14} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t('shopBySkin')} ✨
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.skinTypeList}
      >
        {skinTypes.map((type, index) => (
          <Animated.View
            key={type.id}
            entering={FadeInDown.delay(index * 100).springify()}
          >
            <TouchableOpacity
              style={styles.skinTypeCard}
              onPress={() => onSelect(type)}
            >
              <BlurView
                intensity={isDark ? 30 : 50}
                tint={isDark ? "dark" : "light"}
                style={styles.skinTypeBlur}
              >
                <View style={[styles.skinTypeIcon, { backgroundColor: type.color + '40' }]}>
                  <Text style={styles.skinTypeEmoji}>{type.icon}</Text>
                </View>
                <Text style={[styles.skinTypeName, { color: theme.text }]}>{type.name}</Text>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

// ============================================
// 🎯 ELEGANT SECTION HEADER
// ============================================
const ElegantSectionHeader = ({ title, subtitle, onViewAll, theme, styles, t }) => (
  <View style={styles.elegantHeader}>
    <TouchableOpacity style={styles.viewAllBtn} onPress={onViewAll}>
      <Text style={[styles.viewAllText, { color: theme.primary }]}>{t('viewAll')}</Text>
      <Ionicons name="arrow-back" size={14} color={theme.primary} />
    </TouchableOpacity>
    <View style={styles.elegantTitleContainer}>
      <Text style={[styles.elegantTitle, { color: theme.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.elegantSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>}
    </View>
  </View>
);

// ============================================
// ✨ COSMIC PROMO BANNER
// ============================================
const CosmicPromoBanner = ({ onPress, styles, theme, t, isDark }) => (
  <TouchableOpacity style={styles.promoBanner} onPress={onPress}>
    <BlurView intensity={isDark ? 40 : 60} tint={isDark ? "dark" : "light"} style={styles.promoBlur}>
      <LinearGradient
        colors={[theme.primary + '20', theme.primaryDark + '30']}
        style={styles.promoGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.promoLeft}>
          <Text style={styles.promoEmoji}>✨</Text>
          <View>
            <Text style={[styles.promoTitle, { color: theme.text }]}>{t('flashSale')}</Text>
            <Text style={[styles.promoSubtitle, { color: theme.textSecondary }]}>
              {t('flashSaleSubtitle')}
            </Text>
          </View>
        </View>
        <View style={[styles.promoBtn, { backgroundColor: theme.primary + '30' }]}>
          <Text style={[styles.promoBtnText, { color: theme.primary }]}>
            {t('shopNow')} ←
          </Text>
        </View>
      </LinearGradient>
    </BlurView>
  </TouchableOpacity>
);

// ============================================
// 🛒 PRODUCT CAROUSEL (Horizontal)
// ============================================
const ProductCarousel = React.memo(({ products, onProductPress, onAddToCart, onFavorite, isFavorite, styles }) => (
  <FlatList
    data={products}
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.carouselContainer}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => (
      <ProductCardSwipeable
        item={item}
        onPress={onProductPress}
        onAddToCart={onAddToCart}
        onFavorite={onFavorite}
        isFavorite={isFavorite(item.id)}
      />
    )}
  />
));

// ============================================
// 📦 FLOATING CATEGORY GRID
// ============================================
const CategoryGrid = ({ categories, onSelect, styles, theme, t, isDark }) => {
  const categoryData = [
    { id: 'acne', name: t('acne'), icon: '🎯', color: '#D4B8E0' },
    { id: 'makeup', name: t('makeup'), icon: '💄', color: '#F0D8E6' },
    { id: 'hair', name: t('hair'), icon: '💇‍♀️', color: '#E0D8F0' },
    { id: 'body', name: t('body'), icon: '✨', color: '#D8E6F0' },
    { id: 'serum', name: t('serum'), icon: '💎', color: '#E6D8F0' },
    { id: 'suncare', name: t('suncare'), icon: '☀️', color: '#F0ECD8' },
    { id: 'aging', name: t('antiAging'), icon: '⏳', color: '#E8E4EC' },
    { id: 'sets', name: t('sets'), icon: '🎁', color: '#E8DCC8' },
  ];

  return (
    <View style={styles.categorySection}>
      <ElegantSectionHeader
        title={t('shopByCategory')}
        onViewAll={() => { }}
        styles={styles}
        theme={theme}
        t={t}
      />
      <View style={styles.categoryGrid}>
        {categoryData.map((cat, index) => (
          <Animated.View
            key={cat.id}
            entering={FadeInDown.delay(index * 50).springify()}
          >
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => onSelect(cat)}
            >
              <BlurView
                intensity={isDark ? 25 : 45}
                tint={isDark ? "dark" : "light"}
                style={styles.categoryBlur}
              >
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '50' }]}>
                  <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                </View>
                <Text style={[styles.categoryName, { color: theme.text }]}>{cat.name}</Text>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

// ============================================
// 🌟 WHY SHOP WITH US - Glass Cards
// ============================================
const WhyShopWithUs = ({ theme, styles, t, isDark }) => {
  const features = [
    { icon: 'shield-checkmark', title: t('guaranteed'), desc: t('guaranteedDesc') },
    { icon: 'cube', title: t('variety'), desc: t('varietyDesc') },
    { icon: 'star', title: t('experience'), desc: t('experienceDesc') },
    { icon: 'car', title: t('delivery'), desc: t('deliveryDesc') },
  ];

  return (
    <View style={styles.whySection}>
      <Text style={[styles.whyTitle, { color: theme.text }]}>{t('whyShop')} ✨</Text>
      <View style={styles.whyGrid}>
        {features.map((f, i) => (
          <Animated.View
            key={i}
            style={styles.whyCardContainer}
            entering={FadeInDown.delay(i * 100).springify()}
          >
            <BlurView intensity={isDark ? 25 : 45} tint={isDark ? "dark" : "light"} style={styles.whyCard}>
              <View style={[styles.whyIconContainer, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name={f.icon} size={22} color={theme.primary} />
              </View>
              <Text style={[styles.whyCardTitle, { color: theme.text }]}>{f.title}</Text>
              <Text style={[styles.whyCardDesc, { color: theme.textMuted }]}>{f.desc}</Text>
            </BlurView>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

// ============================================
// 📱 MAIN HOME SCREEN
// ============================================
import { useTranslation } from '../hooks/useTranslation';

export default function HomeScreen() {
  const router = useRouter();
  const { cartItems } = useCart();
  const { triggerAddToCart } = useCartAnimation();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { addNotification, notifications } = useNotifications();

  const styles = getStyles(theme, isDark);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.getProducts(1, 50),
        api.getCategories(),
      ]);
      setProducts(productsData || []);
      setCategories(categoriesData?.filter(cat => cat.count > 0) || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && products.length > 0) {
      const lastArrivalCheck = notifications.find(n => n.type === 'arrival');
      if (!lastArrivalCheck) {
        addNotification(
          'notifArrivalTitle',
          'notifArrivalMsg',
          'arrival'
        );
      }
    }
  }, [loading, products]);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleSearch = React.useCallback((query) => {
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
    }
  }, [router]);

  const handleProductPress = React.useCallback((item) => {
    router.push(`/product/${item.id}`);
  }, [router]);

  const handleAddToCart = React.useCallback((item) => {
    triggerAddToCart({
      id: item.id,
      name: item.name,
      price: item.sale_price || item.price,
      image: item.images?.[0]?.src,
      quantity: 1,
    });
  }, [triggerAddToCart]);

  const handleFavorite = React.useCallback((item) => {
    toggleFavorite({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.images?.[0]?.src,
      quantity: 1,
    });
  }, [toggleFavorite]);

  // Filter functions
  const getSaleProducts = () => products.filter(p => p.on_sale).slice(0, 12);
  const getNewArrivals = () => products.slice(0, 12);
  const getFeaturedProducts = () => products.filter(p => p.featured).slice(0, 12);
  const getPopularProducts = () => [...products].sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0)).slice(0, 12);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingGlow} />
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>{t('loadingMagic')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Cosmic Background Orbs */}
      <View style={[styles.bgOrb1, { backgroundColor: theme.primary + '10' }]} />
      <View style={[styles.bgOrb2, { backgroundColor: theme.accent + '08' }]} />

      {/* Drawer Menu */}
      <DrawerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Header */}
      <SearchHeader
        title="KATARAA"
        onSearch={handleSearch}
        onCartPress={() => router.push('/cart')}
        onNotificationPress={() => router.push('/notifications')}
        onMenuPress={() => router.push('/profile')}
        cartCount={cartItems.length}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
        }
      >
        {/* 🌙 Cosmic Hero */}
        <CosmicHero onShopNow={() => router.push('/products')} theme={theme} styles={styles} t={t} isDark={isDark} />

        {/* 💎 Shop by Skin Type */}
        <SkinTypeSection onSelect={(type) => router.push(`/products?skin=${type.id}`)} theme={theme} styles={styles} t={t} isDark={isDark} />

        {/* ✨ Promo Banner */}
        <CosmicPromoBanner onPress={() => router.push('/products?sale=true')} styles={styles} theme={theme} t={t} isDark={isDark} />

        {/* 🆕 New Arrivals */}
        <View style={styles.section}>
          <ElegantSectionHeader
            title={t('newArrivals')}
            subtitle={t('newArrivalsSub')}
            onViewAll={() => router.push('/products')}
            theme={theme}
            styles={styles}
            t={t}
          />
          <ProductCarousel
            products={getNewArrivals()}
            onProductPress={handleProductPress}
            onAddToCart={handleAddToCart}
            onFavorite={handleFavorite}
            isFavorite={isFavorite}
            styles={styles}
          />
        </View>

        {/* 🔥 On Sale */}
        <View style={styles.section}>
          <ElegantSectionHeader
            title={t('onSale')}
            subtitle={t('onSaleSub')}
            onViewAll={() => router.push('/products?sale=true')}
            theme={theme}
            styles={styles}
            t={t}
          />
          <ProductCarousel
            products={getSaleProducts()}
            onProductPress={handleProductPress}
            onAddToCart={handleAddToCart}
            onFavorite={handleFavorite}
            isFavorite={isFavorite}
            styles={styles}
          />
        </View>

        {/* 📦 Shop by Category */}
        <CategoryGrid
          categories={categories}
          onSelect={(cat) => router.push(`/products?category=${cat.id}`)}
          styles={styles}
          theme={theme}
          t={t}
          isDark={isDark}
        />

        {/* ⭐ Popular Products */}
        <View style={styles.section}>
          <ElegantSectionHeader
            title={t('bestSellers')}
            subtitle={t('bestSellersSub')}
            onViewAll={() => router.push('/products')}
            theme={theme}
            styles={styles}
            t={t}
          />
          <ProductCarousel
            products={getPopularProducts()}
            onProductPress={handleProductPress}
            onAddToCart={handleAddToCart}
            onFavorite={handleFavorite}
            isFavorite={isFavorite}
            styles={styles}
          />
        </View>

        {/* 🌟 Why Shop With Us */}
        <WhyShopWithUs theme={theme} styles={styles} t={t} isDark={isDark} />

        {/* 💜 More Products */}
        <View style={styles.section}>
          <ElegantSectionHeader
            title={t('discoverMore')}
            subtitle={t('discoverMoreSub')}
            onViewAll={() => router.push('/products')}
            theme={theme}
            styles={styles}
            t={t}
          />
          <ProductCarousel
            products={products.slice(12, 24)}
            onProductPress={handleProductPress}
            onAddToCart={handleAddToCart}
            onFavorite={handleFavorite}
            isFavorite={isFavorite}
            styles={styles}
          />
        </View>

        {/* Newsletter CTA - Glass Style */}
        <View style={styles.newsletterSection}>
          <BlurView intensity={isDark ? 40 : 60} tint={isDark ? "dark" : "light"} style={styles.newsletterBlur}>
            <LinearGradient
              colors={[theme.primary + '20', theme.primaryDark + '30']}
              style={styles.newsletterGradient}
            >
              <Text style={styles.newsletterEmoji}>💌</Text>
              <Text style={[styles.newsletterTitle, { color: theme.text }]}>{t('joinFamily')}</Text>
              <Text style={[styles.newsletterSubtitle, { color: theme.textSecondary }]}>{t('joinFamilySub')}</Text>
              <TouchableOpacity style={styles.newsletterBtn}>
                <LinearGradient
                  colors={[theme.primary, theme.primaryDark]}
                  style={styles.newsletterBtnGradient}
                >
                  <Text style={styles.newsletterBtnText}>{t('subscribe')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </BlurView>
        </View>

        {/* Footer Space */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

// ============================================
// 🎨 COSMIC LUXURY STYLES
// ============================================
const getStyles = (theme, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  bgOrb1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    zIndex: -1,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: 200,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    zIndex: -1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.primary + '20',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    letterSpacing: 1,
  },

  // Hero
  heroContainer: {
    height: height * 0.48,
    position: 'relative',
  },
  heroImage: {
    flex: 1,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  glowOrb: {
    position: 'absolute',
    top: 60,
    right: 40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.primary,
  },
  heroContent: {
    position: 'absolute',
    bottom: 50,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  heroBadgeContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  heroBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  heroButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingVertical: 16,
    gap: 10,
  },
  heroButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Skin Type Section
  skinTypeSection: {
    marginTop: 28,
    marginBottom: 20,
  },
  skinTypeList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  skinTypeCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 12,
  },
  skinTypeBlur: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(184,159,204,0.15)' : 'rgba(212,184,224,0.3)',
    borderRadius: 24,
  },
  skinTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  skinTypeEmoji: {
    fontSize: 26,
  },
  skinTypeName: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Elegant Header
  elegantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  elegantTitleContainer: {
    alignItems: 'flex-end',
  },
  elegantTitle: {
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  elegantSubtitle: {
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.3,
  },

  // Promo Banner
  promoBanner: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  promoBlur: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(184,159,204,0.15)' : 'rgba(212,184,224,0.3)',
  },
  promoGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  promoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  promoEmoji: {
    fontSize: 32,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  promoSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  promoBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  promoBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Section
  section: {
    marginVertical: 12,
  },
  carouselContainer: {
    paddingHorizontal: 20,
  },

  // Category Grid
  categorySection: {
    marginVertical: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 48) / 4,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryBlur: {
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(184,159,204,0.1)' : 'rgba(212,184,224,0.2)',
    borderRadius: 20,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // Why Shop Section
  whySection: {
    marginHorizontal: 20,
    marginVertical: 24,
  },
  whyTitle: {
    fontSize: 22,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  whyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  whyCardContainer: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  whyCard: {
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(184,159,204,0.1)' : 'rgba(212,184,224,0.2)',
    borderRadius: 24,
  },
  whyIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  whyCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  whyCardDesc: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Newsletter
  newsletterSection: {
    marginHorizontal: 20,
    marginVertical: 28,
    borderRadius: 28,
    overflow: 'hidden',
  },
  newsletterBlur: {
    borderWidth: 1,
    borderColor: isDark ? 'rgba(184,159,204,0.15)' : 'rgba(212,184,224,0.3)',
    borderRadius: 28,
  },
  newsletterGradient: {
    padding: 36,
    alignItems: 'center',
  },
  newsletterEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  newsletterTitle: {
    fontSize: 24,
    fontWeight: '300',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  newsletterSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  newsletterBtn: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  newsletterBtnGradient: {
    paddingHorizontal: 36,
    paddingVertical: 14,
  },
  newsletterBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
