/**
 * Cart Screen - Kataraa SOKO Style
 * Redesigned with new design system
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';
import { COLORS, SPACING, RADIUS, SHADOWS, GRADIENTS } from '../theme/colors';

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();

  const formatPrice = (price) => {
    return `${parseFloat(price || 0).toFixed(3)} KWD`;
  };

  const cartTotal = getCartTotal();
  const shippingFee = cartTotal >= 25 ? 0 : 2;
  const finalTotal = cartTotal + shippingFee;

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />

      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>

        {/* Quantity Controls */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Feather name="minus" size={16} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Feather name="plus" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => removeFromCart(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={GRADIENTS.header} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>سلة التسوق</Text>
            {cartItems.length > 0 && (
              <TouchableOpacity onPress={clearCart}>
                <Text style={styles.clearBtn}>مسح الكل</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="cart-outline" size={60} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>سلتك فارغة</Text>
          <Text style={styles.emptySubtitle}>ابدأ بإضافة منتجات رائعة</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/')}
          >
            <LinearGradient colors={GRADIENTS.button} style={styles.browseBtnGrad}>
              <Ionicons name="storefront-outline" size={20} color="#fff" />
              <Text style={styles.browseBtnText}>تسوق الآن</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
          />

          {/* Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryValue}>{formatPrice(cartTotal)}</Text>
              <Text style={styles.summaryLabel}>المجموع الفرعي</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryValue, styles.shippingNote]}>
                يُحدد عند الدفع
              </Text>
              <Text style={styles.summaryLabel}>الشحن</Text>
            </View>

            {cartTotal >= 25 ? (
              <View style={styles.freeShippingBanner}>
                <Ionicons name="gift" size={18} color={COLORS.success} />
                <Text style={styles.freeShippingText}>مؤهل للشحن المجاني! 🎉</Text>
              </View>
            ) : (
              <View style={styles.shippingHintBanner}>
                <Ionicons name="car" size={18} color={COLORS.warning} />
                <Text style={styles.shippingHintText}>
                  أضف {formatPrice(25 - cartTotal)} للشحن المجاني
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalValue}>{formatPrice(cartTotal)}</Text>
              <Text style={styles.totalLabel}>الإجمالي</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => router.push('/checkout')}
            >
              <LinearGradient colors={GRADIENTS.button} style={styles.checkoutGradient}>
                <Text style={styles.checkoutBtnText}>إتمام الطلب</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearBtn: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 220,
  },
  cartItem: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.border,
  },
  itemInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  itemName: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'right',
    marginBottom: SPACING.xs,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'right',
    marginBottom: SPACING.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING.md,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 30,
    textAlign: 'center',
  },
  removeBtn: {
    padding: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  browseBtn: {
    marginTop: SPACING.xl,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  browseBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    ...SHADOWS.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  shippingNote: {
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  freeShippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.success}15`,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  freeShippingText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '600',
  },
  shippingHintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.warning}15`,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  shippingHintText: {
    color: COLORS.warning,
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  checkoutBtn: {
    marginTop: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  checkoutBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
