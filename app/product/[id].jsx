/**
 * Product Details - Cosmic Museum Gallery
 * 🌙 Premium beauty product page with floating glass panels
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import AddToCartSuccess from '../components/AddToCartSuccess';
import ReviewSection from '../components/ReviewSection';
import socialService from '../services/socialService';
import { useTranslation } from '../hooks/useTranslation';

const { width, height } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart, cartItems } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [publicLikes, setPublicLikes] = useState(0);

  // Animation values
  const heartScale = useSharedValue(1);

  useEffect(() => {
    fetchProduct();

    fetchProduct();

    // Subscribe to public likes
    const unsubscribeLikes = socialService.subscribeToProductStats(id, (count) => {
      setPublicLikes(count);
    });

    return () => unsubscribeLikes();
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
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart();
    router.push('/checkout/shipping');
  };

  const handleHeartPress = async () => {
    heartScale.value = withSequence(
      withSpring(1.4, { damping: 6 }),
      withSpring(1, { damping: 10 })
    );

    const wasFavorite = isFavorite(product.id);

    toggleFavorite({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.src,
    });

    if (user) {
      try {
        await socialService.togglePublicLike(product.id, user.uid, !wasFavorite);
      } catch (error) {
        console.error('Error toggling public like:', error);
      }
    }
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

  const styles = getStyles(theme, isDark);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingGlow} />
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={60} color={theme.primary} />
        <Text style={styles.loadingText}>{t('productNotFound')}</Text>
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
    <View style={styles.container}>
      {/* Cosmic Background Orbs */}
      <View style={styles.bgOrb1} />
      <View style={styles.bgOrb2} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Actions */}
        <SafeAreaView style={styles.headerRow}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
            <BlurView intensity={isDark ? 40 : 60} tint={isDark ? "dark" : "light"} style={styles.btnBlur}>
              <Ionicons name="arrow-back" size={22} color={theme.text} />
            </BlurView>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleHeartPress}>
            <BlurView intensity={isDark ? 40 : 60} tint={isDark ? "dark" : "light"} style={styles.btnBlur}>
              <Animated.View style={heartStyle}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isLiked ? '#D4A5A5' : theme.text}
                />
              </Animated.View>
              {publicLikes > 0 && (
                <View style={styles.likeBadge}>
                  <Text style={styles.likeBadgeText}>{publicLikes}</Text>
                </View>
              )}
            </BlurView>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Hero Image - Museum Gallery Style */}
        <Animated.View entering={FadeInDown.duration(800)} style={styles.heroSection}>
          <View style={styles.imageFrame}>
            <BlurView intensity={isDark ? 20 : 40} tint={isDark ? "dark" : "light"} style={styles.imageFrameBlur}>
              <Image
                source={{ uri: images[selectedImage]?.src || 'https://via.placeholder.com/400' }}
                style={styles.mainImage}
                resizeMode="contain"
              />
            </BlurView>
            {onSale && (
              <View style={styles.saleBadge}>
                <BlurView intensity={50} tint="dark" style={styles.saleBadgeBlur}>
                  <Text style={styles.saleText}>✦ {t('discountOff', { percent: discount })}</Text>
                </BlurView>
              </View>
            )}
          </View>

          {/* Thumbnails - Floating Pills */}
          {images.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbList}>
              {images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.thumb, selectedImage === index && styles.thumbActive]}
                  onPress={() => setSelectedImage(index)}
                >
                  <BlurView intensity={isDark ? 25 : 45} tint={isDark ? "dark" : "light"} style={styles.thumbBlur}>
                    <Image source={{ uri: img.src }} style={styles.thumbImage} />
                  </BlurView>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Animated.View>

        {/* Content Section - Glass Panels */}
        <View style={styles.contentSection}>
          {/* Title Panel */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View style={styles.titleTop}>
              <View style={[styles.stockIndicator, { backgroundColor: isInStock ? '#7BB4A3' : '#D4A5A5' }]} />
              <Text style={[styles.stockLabel, { color: isInStock ? '#7BB4A3' : '#D4A5A5' }]}>
                {isInStock ? t('inStock') : t('outOfStock')}
              </Text>
            </View>
            <Text style={styles.productName}>{product.name}</Text>
          </Animated.View>

          {/* Price Panel - Glass Card */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.pricePanel}>
            <BlurView intensity={isDark ? 30 : 50} tint={isDark ? "dark" : "light"} style={styles.glassPanel}>
              <View style={styles.priceRow}>
                {onSale ? (
                  <View style={styles.salePriceContainer}>
                    <Text style={styles.salePriceVal}>{formatPrice(product.sale_price)}</Text>
                    <Text style={styles.oldPriceVal}>{formatPrice(product.regular_price)}</Text>
                  </View>
                ) : (
                  <Text style={[styles.priceVal, { color: theme.primary }]}>{formatPrice(product.price)}</Text>
                )}
                <View style={styles.quantityWidget}>
                  <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qBtn}>
                    <Ionicons name="remove" size={18} color={theme.primary} />
                  </TouchableOpacity>
                  <Text style={styles.qText}>{quantity}</Text>
                  <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qBtn}>
                    <Ionicons name="add" size={18} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          {/* Description Panel */}
          {product.short_description && (
            <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.descPanel}>
              <Text style={styles.descTitle}>{t('description')}</Text>
              <BlurView intensity={isDark ? 20 : 40} tint={isDark ? "dark" : "light"} style={styles.glassPanelDesc}>
                <Text style={styles.descText}>
                  {product.short_description.replace(/<[^>]*>/g, '')}
                </Text>
              </BlurView>
            </Animated.View>
          )}

          {/* Reviews Section */}
          <ReviewSection
            productId={id}
            user={user}
            theme={theme}
            isDark={isDark}
            t={t}
          />

          <View style={styles.extraSpacing} />
        </View>
      </ScrollView>

      {/* Floating Bottom Bar - Glass */}
      <View style={styles.floatingBottomBar}>
        <BlurView intensity={isDark ? 50 : 70} tint={isDark ? "dark" : "light"} style={styles.bottomBarBlur}>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cartBtn}
              onPress={handleAddToCart}
              disabled={!isInStock}
            >
              <Ionicons name="cart-outline" size={22} color={theme.primary} />
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
                <Ionicons name="flash" size={18} color="#FFF" />
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

      {/* Success Modal */}
      <AddToCartSuccess
        visible={showAddedMessage}
        onClose={() => setShowAddedMessage(false)}
      />
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
    backgroundColor: theme.primary + '15',
    zIndex: -1,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: 150,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.accent + '10',
    zIndex: -1,
  },
  scrollContent: { paddingBottom: 240 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.textMuted,
    letterSpacing: 0.5,
  },
  backBtnError: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: theme.primary + '20',
    borderRadius: 20,
  },
  backBtnText: {
    color: theme.primary,
    fontWeight: '600',
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 10,
  },
  headerBtn: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  btnBlur: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(184,159,204,0.15)' : 'rgba(212,184,224,0.3)',
    borderRadius: 24,
  },
  likeBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  likeBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },
  imageFrame: {
    width: width * 0.88,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  imageFrameBlur: {
    padding: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(184,159,204,0.15)' : 'rgba(212,184,224,0.3)',
    borderRadius: 32,
  },
  mainImage: {
    width: '100%',
    height: width * 0.85,
  },
  saleBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saleBadgeBlur: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  saleText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  thumbList: {
    paddingHorizontal: 24,
    marginTop: 20,
    gap: 12,
  },
  thumb: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: {
    borderColor: theme.primary,
  },
  thumbBlur: {
    padding: 4,
    borderRadius: 16,
  },
  thumbImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
  },

  // Content
  contentSection: {
    paddingHorizontal: 24,
    gap: 20,
  },
  titleTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  productName: {
    fontSize: 28,
    fontWeight: '300',
    color: theme.text,
    lineHeight: 38,
    letterSpacing: -0.3,
  },
  pricePanel: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  glassPanel: {
    padding: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(184,159,204,0.15)' : 'rgba(212,184,224,0.25)',
    borderRadius: 28,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  salePriceVal: {
    fontSize: 26,
    fontWeight: '700',
    color: '#7BB4A3',
  },
  oldPriceVal: {
    fontSize: 16,
    color: theme.textMuted,
    textDecorationLine: 'line-through',
  },
  priceVal: {
    fontSize: 28,
    fontWeight: '600',
  },
  quantityWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary + '15',
    padding: 6,
    borderRadius: 20,
    gap: 14,
  },
  qBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    minWidth: 24,
    textAlign: 'center',
  },
  descPanel: {
    gap: 12,
  },
  descTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: theme.textMuted,
    marginLeft: 4,
  },
  glassPanelDesc: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(184,159,204,0.1)' : 'rgba(212,184,224,0.2)',
  },
  descText: {
    fontSize: 15,
    lineHeight: 24,
    color: theme.textSecondary,
  },
  extraSpacing: {
    height: 40,
  },

  // Floating Bottom Bar
  floatingBottomBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 15,
  },
  bottomBarBlur: {
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(184,159,204,0.15)' : 'rgba(212,184,224,0.3)',
    borderRadius: 32,
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
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: theme.primary + '15',
    gap: 8,
  },
  cartBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buyBtn: {
    flex: 0.6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  buyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  buyBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  whatsappFloat: {
    borderRadius: 18,
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
});
