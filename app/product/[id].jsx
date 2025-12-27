/**
 * Product Details Screen - Kataraa Cinematic 🎬✨
 * Premium beauty product page with Blush Pink theme
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Linking,
  ToastAndroid,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeInDown,
  FadeInUp,
  FadeIn,
  ZoomIn
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import AddToCartSuccess from '../components/AddToCartSuccess';

const { width, height } = Dimensions.get('window');

import { useTranslation } from '../hooks/useTranslation';

// Kataraa Blush Pink Theme
const COLORS = {
  primary: '#F5B5C8',
  secondary: '#FFDAB9',
  accent: '#B76E79',
  background: '#FFF9F5',
  textPrimary: '#3D2314',
  textSecondary: '#A67B7B',
  success: '#10B981',
  white: '#FFFFFF',
};

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart, cartItems } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  // Animation values
  const cartBounce = useSharedValue(1);
  const successOpacity = useSharedValue(0);
  const heartScale = useSharedValue(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await api.getProduct(id);
      setProduct(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `${parseFloat(price || 0).toFixed(3)} ${t('currency')}`;
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.images?.[0]?.src,
      quantity,
    });
    setShowAddedMessage(true);
    // Timeout handled by component animation
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart();
    router.push('/checkout/shipping');
  };

  const handleHeartPress = () => {
    heartScale.value = withSequence(
      withSpring(1.4, { damping: 6 }),
      withSpring(1, { damping: 10 })
    );
    toggleFavorite({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.src,
    });
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;
    const price = product.sale_price || product.price;
    const totalPrice = (parseFloat(price) * quantity).toFixed(3);
    const message = `👋 ${t('whatsappMessage')}\n📦 *${product.name}*\n💰 ${t('price')}: ${totalPrice} ${t('currency')}\n🔢 ${t('quantity')}: ${quantity}\n\n${t('thankYou')} 💜`;
    const whatsappUrl = `https://wa.me/9659910326?text=${encodeURIComponent(message)}`;
    Linking.openURL(whatsappUrl);
  };

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#0F0F1A' : '#FFF9F5' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>{t('loading')}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#0F0F1A' : '#FFF9F5' }]}>
        <Ionicons name="alert-circle" size={60} color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>{t('productNotFound')}</Text>
        <TouchableOpacity style={styles.backBtnError} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
          <Text style={styles.backBtnText}>{t('back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = product.images || [];
  const isLiked = isFavorite(product.id);
  const onSale = product.on_sale && product.regular_price;
  const discount = onSale ? Math.round((1 - product.sale_price / product.regular_price) * 100) : 0;
  const isInStock = product.stock_status === 'instock' || product.in_stock === true;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0F0F1A' : '#FAFAFF' }]}>
      {/* Background Glows */}
      <View style={[styles.bgCircle1, { backgroundColor: theme.primary + '15' }]} />
      <View style={[styles.bgCircle2, { backgroundColor: theme.accent + '10' }]} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Actions */}
        <SafeAreaView style={styles.headerRow}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
            <BlurView intensity={isDark ? 30 : 50} tint={isDark ? "dark" : "light"} style={styles.btnBlur}>
              <Ionicons name="arrow-back" size={24} color={isDark ? "#FFF" : theme.text} />
            </BlurView>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleHeartPress}>
            <BlurView intensity={isDark ? 30 : 50} tint={isDark ? "dark" : "light"} style={styles.btnBlur}>
              <Animated.View style={heartStyle}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isLiked ? '#EF4444' : (isDark ? "#FFF" : theme.text)}
                />
              </Animated.View>
            </BlurView>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Hero Image Section */}
        <Animated.View entering={FadeInDown.duration(800)} style={styles.heroSection}>
          <View style={styles.imageFrame}>
            <Image
              source={{ uri: images[selectedImage]?.src || 'https://via.placeholder.com/400' }}
              style={styles.mainImage}
              resizeMode="contain"
            />
            {onSale && (
              <BlurView intensity={40} tint="dark" style={styles.saleBadge}>
                <Text style={styles.saleText}>{t('discountOff', { percent: discount })}</Text>
              </BlurView>
            )}
          </View>

          {/* Thumbnails */}
          {images.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbList}>
              {images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.thumb, selectedImage === index ? { borderColor: theme.primary } : { borderColor: 'transparent' }]}
                  onPress={() => setSelectedImage(index)}
                >
                  <BlurView intensity={isDark ? 20 : 40} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                  <Image source={{ uri: img.src }} style={styles.thumbImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Animated.View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.titlePanel}>
            <View style={styles.titleTop}>
              <View style={[styles.stockIndicator, { backgroundColor: isInStock ? '#10B981' : '#EF4444' }]} />
              <Text style={[styles.stockLabel, { color: isInStock ? '#10B981' : '#EF4444' }]}>
                {isInStock ? t('inStock') : t('outOfStock')}
              </Text>
            </View>
            <Text style={[styles.productName, { color: theme.text }]}>{product.name}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.pricePanel}>
            <BlurView intensity={isDark ? 20 : 40} tint={isDark ? "dark" : "light"} style={styles.glassPanel}>
              <View style={styles.priceRow}>
                {onSale ? (
                  <View style={styles.salePriceContainer}>
                    <Text style={styles.salePriceVal}>{formatPrice(product.sale_price)}</Text>
                    <Text style={[styles.oldPriceVal, { color: theme.textMuted }]}>{formatPrice(product.regular_price)}</Text>
                  </View>
                ) : (
                  <Text style={[styles.priceVal, { color: theme.primary }]}>{formatPrice(product.price)}</Text>
                )}
                <View style={styles.quantityWidget}>
                  <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qBtn}>
                    <Ionicons name="remove" size={18} color={theme.primary} />
                  </TouchableOpacity>
                  <Text style={[styles.qText, { color: theme.text }]}>{quantity}</Text>
                  <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qBtn}>
                    <Ionicons name="add" size={18} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          {product.short_description && (
            <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.descPanel}>
              <Text style={[styles.descTitle, { color: theme.textMuted }]}>{t('description')}</Text>
              <BlurView intensity={isDark ? 10 : 30} tint={isDark ? "dark" : "light"} style={styles.glassPanelDesc}>
                <Text style={[styles.descText, { color: theme.text }]}>
                  {product.short_description.replace(/<[^>]*>/g, '')}
                </Text>
              </BlurView>
            </Animated.View>
          )}

          <View style={styles.extraSpacing} />
        </View>
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View style={styles.floatingBottomBar}>
        <BlurView intensity={isDark ? 40 : 60} tint={isDark ? "dark" : "light"} style={styles.bottomBarBlur}>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.cartBtn, { backgroundColor: theme.primary + '20' }]}
              onPress={handleAddToCart}
              disabled={!isInStock}
            >
              <Ionicons name="cart-outline" size={24} color={theme.primary} />
              <Text style={[styles.cartBtnText, { color: theme.primary }]}>{t('addToCart')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buyBtn}
              onPress={handleBuyNow}
              disabled={!isInStock}
            >
              <LinearGradient
                colors={[theme.primary, theme.primaryDark]}
                style={styles.buyGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.buyBtnText}>{t('buyNow')}</Text>
                <Ionicons name="flash" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.whatsappFloat} onPress={handleWhatsAppOrder}>
            <LinearGradient colors={['#25D366', '#128C7E']} style={styles.waGradient}>
              <Ionicons name="logo-whatsapp" size={18} color="#FFF" />
              <Text style={styles.waText}>
                {t('orderViaWhatsapp', { price: (parseFloat(product.sale_price || product.price) * quantity).toFixed(3) + ' ' + t('currency') })}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </View>

      {/* Success Modal Animation */}
      <AddToCartSuccess
        visible={showAddedMessage}
        onClose={() => setShowAddedMessage(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgCircle1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, zIndex: -1 },
  bgCircle2: { position: 'absolute', bottom: -50, left: -50, width: 250, height: 250, borderRadius: 125, zIndex: -1 },
  scrollContent: { paddingBottom: 220 },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
    marginTop: 10,
  },
  headerBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  btnBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  imageFrame: {
    width: width * 0.85,
    height: width * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  mainImage: {
    width: '80%',
    height: '80%',
  },
  saleBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    overflow: 'hidden',
  },
  saleText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  thumbList: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },

  // Content
  contentSection: {
    paddingHorizontal: 20,
    gap: 20,
  },
  titlePanel: {
    gap: 5,
  },
  titleTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  productName: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'left',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  pricePanel: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  glassPanel: {
    padding: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  salePriceVal: {
    fontSize: 26,
    fontWeight: '900',
    color: '#10B981',
  },
  oldPriceVal: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  priceVal: {
    fontSize: 28,
    fontWeight: '900',
  },
  quantityWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 15,
  },
  qBtn: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qText: {
    fontSize: 18,
    fontWeight: '800',
    minWidth: 25,
    textAlign: 'center',
  },
  descPanel: {
    gap: 12,
  },
  descTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginLeft: 5,
  },
  glassPanelDesc: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  descText: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'left',
    opacity: 0.8,
  },
  extraSpacing: {
    height: 100,
  },

  // Floating Bottom Bar
  floatingBottomBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 35,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  bottomBarBlur: {
    padding: 15,
    gap: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cartBtn: {
    flex: 0.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 22,
    gap: 8,
  },
  cartBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  buyBtn: {
    flex: 0.6,
    borderRadius: 22,
    overflow: 'hidden',
  },
  buyGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 10,
  },
  buyBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  whatsappFloat: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  waGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  waText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Success Modal (Removed - Moved to Component)
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
});
