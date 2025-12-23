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
} from 'react-native-reanimated';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

const { width, height } = Dimensions.get('window');

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
    return `${parseFloat(price || 0).toFixed(3)} د.ك`;
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Add to cart
    addToCart({
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.images?.[0]?.src,
      quantity,
    });

    // Animate success
    successOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(1, { duration: 1500 }),
      withTiming(0, { duration: 300 })
    );

    cartBounce.value = withSequence(
      withSpring(1.3, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );

    // Show toast on Android
    if (Platform.OS === 'android') {
      ToastAndroid.show('✅ تمت الإضافة للسلة!', ToastAndroid.SHORT);
    }

    // Show visual feedback
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.images?.[0]?.src,
      quantity,
    });
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
    // Check if cart has items
    if (cartItems.length === 0 && !product) return;

    let message = 'مرحباً! أرغب بطلب المنتجات التالية:\n\n';
    let grandTotal = 0;

    // If cart has items, send entire cart
    if (cartItems.length > 0) {
      cartItems.forEach((item, index) => {
        const itemPrice = parseFloat(item.price || 0);
        const itemTotal = itemPrice * (item.quantity || 1);
        grandTotal += itemTotal;

        message += `${index + 1}. 📦 *${item.name}*\n`;
        message += `   💰 السعر: ${itemPrice.toFixed(3)} د.ك\n`;
        message += `   🔢 الكمية: ${item.quantity || 1}\n`;
        message += `   💵 المجموع: ${itemTotal.toFixed(3)} د.ك\n\n`;
      });

      message += `━━━━━━━━━━━━━\n`;
      message += `🛒 *المجموع الكلي: ${grandTotal.toFixed(3)} د.ك*\n\n`;
      message += `شكراً لكم! 💜`;
    } else {
      // Fallback to current product if cart is empty
      const price = product.sale_price || product.price;
      const totalPrice = (parseFloat(price) * quantity).toFixed(3);

      message = `مرحباً! أرغب بطلب هذا المنتج:\n\n`;
      message += `📦 *${product.name}*\n`;
      message += `💰 السعر: ${totalPrice} د.ك\n`;
      message += `🔢 الكمية: ${quantity}\n\n`;
      message += `شكراً لكم! 💜`;
    }

    const whatsappUrl = `https://wa.me/9659910326?text=${encodeURIComponent(message)}`;
    Linking.openURL(whatsappUrl);
  };

  // Animated styles
  const successBadgeStyle = useAnimatedStyle(() => ({
    opacity: successOpacity.value,
    transform: [{ scale: successOpacity.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={60} color={COLORS.secondary} />
        <Text style={styles.errorText}>المنتج غير موجود</Text>
        <TouchableOpacity style={styles.backBtnError} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>العودة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = product.images || [];
  const isLiked = isFavorite(product.id);
  const onSale = product.on_sale && product.regular_price;
  const discount = onSale
    ? Math.round((1 - product.sale_price / product.regular_price) * 100)
    : 0;
  const isInStock = product.stock_status === 'instock' || product.in_stock === true;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Section - New Blush Pink Design */}
        <View style={styles.imageSection}>
          <LinearGradient
            colors={[COLORS.primary, '#FFD6E0', COLORS.background]}
            style={styles.imageGradient}
          >
            <SafeAreaView style={styles.headerRow}>
              <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerBtn} onPress={handleHeartPress}>
                <Animated.View style={heartStyle}>
                  <Ionicons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isLiked ? '#EF4444' : COLORS.textPrimary}
                  />
                </Animated.View>
              </TouchableOpacity>
            </SafeAreaView>

            <View style={styles.imageContainer}>
              <Image
                source={{ uri: images[selectedImage]?.src || 'https://via.placeholder.com/400' }}
                style={styles.mainImage}
                resizeMode="contain"
              />
            </View>

            {onSale && (
              <View style={styles.saleBadge}>
                <Text style={styles.saleText}>خصم {discount}%</Text>
              </View>
            )}
          </LinearGradient>

          {/* Thumbnails */}
          {images.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnails}>
              {images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.thumb, selectedImage === index && styles.thumbActive]}
                  onPress={() => setSelectedImage(index)}
                >
                  <Image source={{ uri: img.src }} style={styles.thumbImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Product Info Section */}
        <View style={styles.infoSection}>
          {/* Stock Badge */}
          <View style={[styles.stockBadge, !isInStock && styles.outOfStock]}>
            <Ionicons
              name={isInStock ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={isInStock ? COLORS.success : '#EF4444'}
            />
            <Text style={[styles.stockText, !isInStock && styles.outOfStockText]}>
              {isInStock ? 'متوفر' : 'غير متوفر'}
            </Text>
          </View>

          {/* Product Name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Price Section */}
          <View style={styles.priceSection}>
            {onSale ? (
              <>
                <Text style={styles.salePrice}>{formatPrice(product.sale_price)}</Text>
                <Text style={styles.oldPrice}>{formatPrice(product.regular_price)}</Text>
              </>
            ) : (
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
            )}
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>الكمية</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          {product.short_description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionTitle}>الوصف</Text>
              <Text style={styles.descriptionText}>
                {product.short_description.replace(/<[^>]*>/g, '')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {/* Add to Cart Button */}
        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={handleAddToCart}
          disabled={!isInStock}
        >
          <Ionicons name="cart-outline" size={22} color={COLORS.accent} />
          <Text style={styles.addToCartText}>أضف للسلة</Text>
        </TouchableOpacity>

        {/* Buy Now Button */}
        <TouchableOpacity
          style={[styles.buyNowBtn, !isInStock && styles.btnDisabled]}
          onPress={handleBuyNow}
          disabled={!isInStock}
        >
          <LinearGradient
            colors={isInStock ? [COLORS.primary, COLORS.accent] : ['#ccc', '#999']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buyNowGradient}
          >
            <Ionicons name="flash" size={20} color="#fff" />
            <Text style={styles.buyNowText}>اشتري الآن</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* WhatsApp Button */}
      <TouchableOpacity style={styles.whatsappBtn} onPress={handleWhatsAppOrder}>
        <Ionicons name="logo-whatsapp" size={20} color="#fff" />
        <Text style={styles.whatsappText}>
          {(parseFloat(product.sale_price || product.price) * quantity).toFixed(3)} د.ك - اطلب عبر واتساب
        </Text>
      </TouchableOpacity>

      {/* Success Message Overlay */}
      <Animated.View style={[styles.successOverlay, successBadgeStyle]} pointerEvents="none">
        <View style={styles.successBadge}>
          <Ionicons name="checkmark-circle" size={50} color={COLORS.success} />
          <Text style={styles.successText}>تمت الإضافة! ✨</Text>
        </View>
      </Animated.View>
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
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  backBtnError: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 25,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Image Section
  imageSection: {
    backgroundColor: COLORS.background,
  },
  imageGradient: {
    paddingBottom: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  mainImage: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
  },
  saleBadge: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 15,
  },
  saleText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  thumbnails: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbActive: {
    borderColor: COLORS.accent,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },

  // Info Section
  infoSection: {
    padding: 20,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    marginBottom: 12,
  },
  outOfStock: {
    backgroundColor: '#FEE2E2',
  },
  stockText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '600',
  },
  outOfStockText: {
    color: '#EF4444',
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'right',
    marginBottom: 12,
    lineHeight: 32,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  salePrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  oldPrice: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  quantityLabel: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    minWidth: 30,
    textAlign: 'center',
  },
  descriptionSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 120,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'right',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'right',
    lineHeight: 22,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 70,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  addToCartText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  buyNowBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buyNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  buyNowText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  whatsappBtn: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
  },
  whatsappText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Success Overlay
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 249, 245, 0.9)',
  },
  successBadge: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 30,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  successText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.success,
    marginTop: 10,
  },
});
