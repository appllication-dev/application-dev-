/**
 * 🔥 LEGENDARY HOME SCREEN - Kataraa
 * Cinematic, Dramatic, Epic Design
 * 
 * الهدف: العميلة تبقى بزااااف وتشوف منتجات بزااااف
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
  Animated,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';

// Services & Context
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useCartAnimation } from '../context/CartAnimationContext';
import { useFavorites } from '../context/FavoritesContext';

// Components
import SearchHeader from '../components/SearchHeader';
import ProductCardSwipeable from '../components/ProductCardSwipeable';
import DrawerMenu from '../components/DrawerMenu';

// Theme
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme/colors';

const { width, height } = Dimensions.get('window');

// ============================================
// 🎬 CINEMATIC HERO SECTION
// ============================================
const CinematicHero = ({ onShopNow }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.heroContainer}>
      <Video
        source={{ uri: 'https://kataraa.com/wp-content/uploads/2025/07/a-little-magic-for-your-skin-1-1.mp4' }}
        style={styles.heroVideo}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
        style={styles.heroOverlay}
      />
      <Animated.View
        style={[
          styles.heroContent,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <Text style={styles.heroBadge}>✨ Korean Skincare</Text>
        <Text style={styles.heroTitle}>A Little Magic{'\n'}For Your Skin</Text>
        <Text style={styles.heroSubtitle}>سحر لبشرتك</Text>
        <TouchableOpacity style={styles.heroButton} onPress={onShopNow}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.heroButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.heroButtonText}>تسوقي الآن</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// ============================================
// 💎 SKIN TYPE SELECTOR (تسوقي حسب بشرتك)
// ============================================
const SkinTypeSection = ({ onSelect }) => {
  const skinTypes = [
    { id: 'oily', name: 'البشرة الدهنية', icon: 'water', color: '#4FC3F7', emoji: '💧' },
    { id: 'dry', name: 'البشرة الجافة', icon: 'leaf', color: '#AED581', emoji: '🍃' },
    { id: 'mixed', name: 'البشرة المختلطة', icon: 'contrast', color: '#FFB74D', emoji: '⚖️' },
    { id: 'sensitive', name: 'البشرة الحساسة', icon: 'flower', color: '#F48FB1', emoji: '🌸' },
  ];

  return (
    <View style={styles.skinTypeSection}>
      <View style={styles.sectionHeader}>
        <TouchableOpacity style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>عرض الكل</Text>
          <Ionicons name="arrow-back" size={16} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>تسوقي حسب بشرتك 💎</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.skinTypeList}>
        {skinTypes.map((type, index) => (
          <TouchableOpacity
            key={type.id}
            style={[styles.skinTypeCard, { backgroundColor: type.color + '20' }]}
            onPress={() => onSelect(type)}
          >
            <View style={[styles.skinTypeIcon, { backgroundColor: type.color }]}>
              <Text style={styles.skinTypeEmoji}>{type.emoji}</Text>
            </View>
            <Text style={styles.skinTypeName}>{type.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// ============================================
// 🎯 EPIC SECTION HEADER
// ============================================
const EpicSectionHeader = ({ title, subtitle, emoji, onViewAll, color = COLORS.primary }) => (
  <View style={styles.epicHeader}>
    <TouchableOpacity style={styles.viewAllBtn} onPress={onViewAll}>
      <Text style={styles.viewAllText}>عرض الكل</Text>
      <Ionicons name="arrow-back" size={16} color={COLORS.primary} />
    </TouchableOpacity>
    <View style={styles.epicTitleContainer}>
      <Text style={styles.epicEmoji}>{emoji}</Text>
      <View>
        <Text style={[styles.epicTitle, { color }]}>{title}</Text>
        {subtitle && <Text style={styles.epicSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  </View>
);

// ============================================
// 🔥 FLASH SALE BANNER
// ============================================
const FlashSaleBanner = ({ onPress }) => (
  <TouchableOpacity style={styles.flashBanner} onPress={onPress}>
    <LinearGradient
      colors={['#FF416C', '#FF4B2B']}
      style={styles.flashGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.flashLeft}>
        <Text style={styles.flashEmoji}>🔥</Text>
        <View>
          <Text style={styles.flashTitle}>تخفيضات حصرية!</Text>
          <Text style={styles.flashSubtitle}>خصم يصل لـ 50%</Text>
        </View>
      </View>
      <View style={styles.flashTimer}>
        <Text style={styles.flashTimerText}>تسوقي الآن ←</Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

// ============================================
// 🛒 PRODUCT CAROUSEL (Horizontal)
// ============================================
const ProductCarousel = ({ products, onProductPress, onAddToCart, onFavorite, isFavorite }) => (
  <FlatList
    data={products}
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.carouselContainer}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => (
      <ProductCardSwipeable
        item={item}
        onPress={() => onProductPress(item)}
        onAddToCart={onAddToCart}
        onFavorite={onFavorite}
        isFavorite={isFavorite(item.id)}
      />
    )}
  />
);

// ============================================
// 📦 CATEGORY GRID (تسوقي حسب التصنيف)
// ============================================
const CategoryGrid = ({ categories, onSelect }) => {
  const categoryData = [
    { id: 'acne', name: 'حب الشباب', icon: '🎯', color: '#E57373' },
    { id: 'makeup', name: 'المكياج', icon: '💄', color: '#F48FB1' },
    { id: 'hair', name: 'العناية بالشعر', icon: '💇‍♀️', color: '#CE93D8' },
    { id: 'body', name: 'العناية بالجسم', icon: '✨', color: '#90CAF9' },
    { id: 'serum', name: 'السيروم', icon: '💎', color: '#80DEEA' },
    { id: 'suncare', name: 'واقي الشمس', icon: '☀️', color: '#FFE082' },
  ];

  return (
    <View style={styles.categorySection}>
      <EpicSectionHeader
        title="تسوقي حسب التصنيف"
        emoji="🛍️"
        onViewAll={() => { }}
      />
      <View style={styles.categoryGrid}>
        {categoryData.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryCard}
            onPress={() => onSelect(cat)}
          >
            <View style={[styles.categoryIcon, { backgroundColor: cat.color + '30' }]}>
              <Text style={styles.categoryEmoji}>{cat.icon}</Text>
            </View>
            <Text style={styles.categoryName}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ============================================
// 🌟 WHY SHOP WITH US
// ============================================
const WhyShopWithUs = () => {
  const features = [
    { icon: 'shield-checkmark', title: 'منتجات مضمونة', desc: '100% أصلية' },
    { icon: 'cube', title: 'تنوع واسع', desc: '+500 منتج' },
    { icon: 'star', title: 'خبرة طويلة', desc: 'منذ 2019' },
    { icon: 'car', title: 'توصيل سريع', desc: '24-48 ساعة' },
  ];

  return (
    <View style={styles.whySection}>
      <Text style={styles.whyTitle}>لماذا تتسوقين معنا؟ 💜</Text>
      <View style={styles.whyGrid}>
        {features.map((f, i) => (
          <View key={i} style={styles.whyCard}>
            <View style={styles.whyIconContainer}>
              <Ionicons name={f.icon} size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.whyCardTitle}>{f.title}</Text>
            <Text style={styles.whyCardDesc}>{f.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ============================================
// 📱 MAIN HOME SCREEN
// ============================================
export default function HomeScreen() {
  const router = useRouter();
  const { cartItems } = useCart();
  const { triggerAddToCart } = useCartAnimation();
  const { toggleFavorite, isFavorite } = useFavorites();

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
        api.getProducts(1, 50), // More products!
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  const handleProductPress = (item) => {
    router.push(`/product/${item.id}`);
  };

  const handleAddToCart = (item) => {
    triggerAddToCart({
      id: item.id,
      name: item.name,
      price: item.sale_price || item.price,
      image: item.images?.[0]?.src,
      quantity: 1,
    });
  };

  const handleFavorite = (item) => {
    toggleFavorite({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.images?.[0]?.src,
    });
  };

  // Filter functions
  const getSaleProducts = () => products.filter(p => p.on_sale).slice(0, 12);
  const getNewArrivals = () => products.slice(0, 12);
  const getFeaturedProducts = () => products.filter(p => p.featured).slice(0, 12);
  const getPopularProducts = () => [...products].sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0)).slice(0, 12);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري تحميل السحر... ✨</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Drawer Menu */}
      <DrawerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Header */}
      <SearchHeader
        title="KATARAA"
        onSearch={handleSearch}
        onCartPress={() => router.push('/cart')}
        onMenuPress={() => setMenuOpen(true)}
        cartCount={cartItems.length}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* 🎬 Cinematic Hero */}
        <CinematicHero onShopNow={() => router.push('/products')} />

        {/* 💎 Shop by Skin Type */}
        <SkinTypeSection onSelect={(type) => router.push(`/products?skin=${type.id}`)} />

        {/* 🔥 Flash Sale Banner */}
        <FlashSaleBanner onPress={() => router.push('/products?sale=true')} />

        {/* 🆕 New Arrivals */}
        <View style={styles.section}>
          <EpicSectionHeader
            title="وصل حديثاً"
            subtitle="أحدث المنتجات الكورية"
            emoji="🆕"
            onViewAll={() => router.push('/products')}
          />
          <ProductCarousel
            products={getNewArrivals()}
            onProductPress={handleProductPress}
            onAddToCart={handleAddToCart}
            onFavorite={handleFavorite}
            isFavorite={isFavorite}
          />
        </View>

        {/* 🔥 On Sale */}
        <View style={styles.section}>
          <EpicSectionHeader
            title="تخفيضات"
            subtitle="خصومات حصرية"
            emoji="🔥"
            color="#FF416C"
            onViewAll={() => router.push('/products?sale=true')}
          />
          <ProductCarousel
            products={getSaleProducts()}
            onProductPress={handleProductPress}
            onAddToCart={handleAddToCart}
            onFavorite={handleFavorite}
            isFavorite={isFavorite}
          />
        </View>

        {/* 📦 Shop by Category */}
        <CategoryGrid
          categories={categories}
          onSelect={(cat) => router.push(`/products?category=${cat.id}`)}
        />

        {/* ⭐ Popular Products */}
        <View style={styles.section}>
          <EpicSectionHeader
            title="الأكثر مبيعاً"
            subtitle="المفضلة لدى عملائنا"
            emoji="⭐"
            color="#FFB300"
            onViewAll={() => router.push('/products')}
          />
          <ProductCarousel
            products={getPopularProducts()}
            onProductPress={handleProductPress}
            onAddToCart={handleAddToCart}
            onFavorite={handleFavorite}
            isFavorite={isFavorite}
          />
        </View>

        {/* 🌟 Why Shop With Us */}
        <WhyShopWithUs />

        {/* 💜 More Products */}
        <View style={styles.section}>
          <EpicSectionHeader
            title="اكتشفي المزيد"
            subtitle="منتجات مختارة لك"
            emoji="💜"
            onViewAll={() => router.push('/products')}
          />
          <ProductCarousel
            products={products.slice(12, 24)}
            onProductPress={handleProductPress}
            onAddToCart={handleAddToCart}
            onFavorite={handleFavorite}
            isFavorite={isFavorite}
          />
        </View>

        {/* Newsletter CTA */}
        <View style={styles.newsletterSection}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.newsletterGradient}
          >
            <Text style={styles.newsletterEmoji}>💌</Text>
            <Text style={styles.newsletterTitle}>انضمي لعائلة كتارا</Text>
            <Text style={styles.newsletterSubtitle}>احصلي على خصم 10% على أول طلب!</Text>
            <TouchableOpacity style={styles.newsletterBtn}>
              <Text style={styles.newsletterBtnText}>اشتركي الآن</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Footer Space */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

// ============================================
// 🎨 STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.primary,
    fontSize: 16,
  },

  // Hero
  heroContainer: {
    height: height * 0.45,
    position: 'relative',
  },
  heroVideo: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    color: '#fff',
    fontSize: 12,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  heroButton: {
    marginTop: 20,
    borderRadius: 30,
    overflow: 'hidden',
  },
  heroButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    gap: 8,
  },
  heroButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Skin Type
  skinTypeSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  skinTypeList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  skinTypeCard: {
    width: 100,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
  },
  skinTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  skinTypeEmoji: {
    fontSize: 24,
  },
  skinTypeName: {
    fontSize: 11,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    color: COLORS.primary,
  },

  // Epic Header
  epicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  epicTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  epicEmoji: {
    fontSize: 24,
  },
  epicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  epicSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Flash Sale
  flashBanner: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  flashGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  flashLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flashEmoji: {
    fontSize: 32,
  },
  flashTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flashSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  flashTimer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  flashTimerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Section
  section: {
    marginVertical: 8,
  },
  carouselContainer: {
    paddingHorizontal: 16,
  },

  // Category Grid
  categorySection: {
    marginVertical: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 48) / 3,
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Why Shop
  whySection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 20,
    borderRadius: 20,
    ...SHADOWS.md,
  },
  whyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  whyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  whyCard: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
  },
  whyIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  whyCardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  whyCardDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  // Newsletter
  newsletterSection: {
    marginHorizontal: 16,
    marginVertical: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  newsletterGradient: {
    padding: 32,
    alignItems: 'center',
  },
  newsletterEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  newsletterTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  newsletterSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
  },
  newsletterBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 30,
  },
  newsletterBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
