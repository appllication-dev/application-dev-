/**
 * Home Screen - Kataraa SOKO Style (REVISED)
 * Less cluttered, horizontal carousel layout matching reference
 */

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Services & Context
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useCartAnimation } from '../context/CartAnimationContext';
import { useFavorites } from '../context/FavoritesContext';

// Components
import SearchHeader from '../components/SearchHeader';
import CircularCategorySection from '../components/CircularCategorySection';
import PromoBanner from '../components/PromoBanner';
import ProductCardSwipeable from '../components/ProductCardSwipeable';
import DrawerMenu from '../components/DrawerMenu';

// Theme
import { COLORS, SPACING } from '../theme/colors';

const { width } = Dimensions.get('window');

// Section Header Component
const SectionHeader = ({ title, titleAr, onViewAll }) => (
  <View style={styles.sectionHeader}>
    <TouchableOpacity
      style={styles.viewAllBtn}
      onPress={onViewAll}
    >
      <Text style={styles.viewAllText}>View All</Text>
      <Ionicons name="arrow-forward-circle" size={18} color={COLORS.primary} />
    </TouchableOpacity>
    <Text style={styles.sectionTitle}>{titleAr || title}</Text>
  </View>
);

// Horizontal Product Carousel
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
        api.getProducts(1, 30),
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

  const handleCategoryPress = (category) => {
    router.push(`/products?category=${category.id}`);
  };

  // Get products by sale
  const getSaleProducts = () => products.filter(p => p.on_sale).slice(0, 10);

  // Get new arrivals
  const getNewArrivals = () => products.slice(0, 10);

  // Get by brand/category
  const getProductsByCategory = (catName) => {
    return products.filter(p =>
      p.categories?.some(c => c.name?.toLowerCase().includes(catName.toLowerCase()))
    ).slice(0, 10);
  };

  // Category icons
  const getCategoryIcons = () => {
    const iconMap = {
      'masks': { icon: 'color-palette', color: '#E1BEE7' },
      'eye': { icon: 'eye', color: '#B3E5FC' },
      'sun': { icon: 'sunny', color: '#FFF9C4' },
      'makeup': { icon: 'sparkles', color: '#F8BBD9' },
      'skin': { icon: 'flower', color: '#C8E6C9' },
      'serum': { icon: 'water', color: '#D1C4E9' },
    };

    return categories.slice(0, 6).map(cat => {
      const key = Object.keys(iconMap).find(k => cat.name?.toLowerCase().includes(k));
      return {
        id: cat.id,
        name: cat.name,
        nameAr: cat.name,
        icon: iconMap[key]?.icon || 'grid',
        color: iconMap[key]?.color || '#E1BEE7',
        image: cat.image?.src,
      };
    });
  };

  const PROMO_IMAGE = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Drawer Menu */}
      <DrawerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />

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
        {/* Category Icons */}
        <CircularCategorySection
          categories={getCategoryIcons()}
          onCategoryPress={handleCategoryPress}
          titleAr="Featured Collections"
        />

        {/* Promo Banner with Video */}
        <PromoBanner
          title="سحر لبشرتك"
          subtitle="A little magic for your skin"
          buttonText="تسوق الآن"
          videoUrl="https://kataraa.com/wp-content/uploads/2025/07/a-little-magic-for-your-skin-1-1.mp4"
          badge="✨ جديد"
          onPress={() => router.push('/products')}
        />

        {/* End of Year Sale */}
        <View style={styles.section}>
          <SectionHeader
            titleAr="End of Year Sale"
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

        {/* Brand Sections - Each category gets its own horizontal scroll */}
        {categories.slice(0, 4).map(cat => {
          const catProducts = products.filter(p =>
            p.categories?.some(c => c.id === cat.id)
          ).slice(0, 8);

          if (catProducts.length === 0) return null;

          return (
            <View key={cat.id} style={styles.section}>
              <SectionHeader
                titleAr={cat.name}
                onViewAll={() => router.push(`/products?category=${cat.id}`)}
              />
              <ProductCarousel
                products={catProducts}
                onProductPress={handleProductPress}
                onAddToCart={handleAddToCart}
                onFavorite={handleFavorite}
                isFavorite={isFavorite}
              />
            </View>
          );
        })}

        {/* New Arrivals Video Banner */}
        <PromoBanner
          title="New Arrivals"
          subtitle="Discover the latest products"
          buttonText="Shop Now"
          imageUrl="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800"
          onPress={() => router.push('/products')}
        />

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
  },
  section: {
    marginVertical: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  carouselContainer: {
    paddingHorizontal: SPACING.md,
  },
});
