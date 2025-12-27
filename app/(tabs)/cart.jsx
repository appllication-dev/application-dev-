/**
 * Cart Screen - Kataraa SOKO Style
 * Redesigned with new design system
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
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

import { useTranslation } from '../hooks/useTranslation';

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = getStyles(theme, isDark);

  const formatPrice = (price) => {
    return `${parseFloat(price || 0).toFixed(3)} ${t('currency')}`;
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
            <Feather name="minus" size={16} color={theme.primary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Feather name="plus" size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => removeFromCart(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color={theme.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('cartTitle')}</Text>
            {cartItems.length > 0 && (
              <TouchableOpacity onPress={clearCart}>
                <Text style={styles.clearBtn}>{t('clearAll')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="cart-outline" size={60} color={theme.primary} />
          </View>
          <Text style={styles.emptyTitle}>{t('emptyCartTitle')}</Text>
          <Text style={styles.emptySubtitle}>{t('emptyCartSubtitle')}</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/')}
          >
            <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.browseBtnGrad}>
              <Ionicons name="storefront-outline" size={20} color="#fff" />
              <Text style={styles.browseBtnText}>{t('shopNow')}</Text>
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
              <Text style={styles.summaryLabel}>{t('subtotal')}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryValue, styles.shippingNote]}>
                {t('shippingCalculated')}
              </Text>
              <Text style={styles.summaryLabel}>{t('shipping')}</Text>
            </View>

            {cartTotal >= 25 ? (
              <View style={styles.freeShippingBanner}>
                <Ionicons name="gift" size={18} color={theme.success} />
                <Text style={styles.freeShippingText}>{t('freeShippingEligible')}</Text>
              </View>
            ) : (
              <View style={styles.shippingHintBanner}>
                <Ionicons name="car" size={18} color={theme.warning} />
                <Text style={styles.shippingHintText}>
                  {t('addForFreeShipping', { amount: formatPrice(25 - cartTotal) })}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalValue}>{formatPrice(cartTotal)}</Text>
              <Text style={styles.totalLabel}>{t('total')}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => router.push('/checkout')}
            >
              <LinearGradient colors={[theme.primary, theme.primaryDark]}
                style={styles.checkoutGradient}>
                <Text style={styles.checkoutBtnText}>{t('checkout')}</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const getStyles = (theme, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingBottom: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
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
    padding: 16,
    paddingBottom: 220,
  },
  cartItem: {
    backgroundColor: theme.backgroundCard,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: isDark ? '#2A2A40' : '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    color: theme.text,
    textAlign: 'right',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.primary,
    textAlign: 'right',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    minWidth: 30,
    textAlign: 'center',
  },
  removeBtn: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 8,
  },
  browseBtn: {
    marginTop: 32,
    borderRadius: 24,
    overflow: 'hidden',
  },
  browseBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    gap: 8,
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
    backgroundColor: theme.backgroundCard,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 24,
    paddingBottom: 95, // Increased padding to raise the button above nav bar
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '500',
  },
  shippingNote: {
    color: theme.primary,
    fontStyle: 'italic',
  },
  freeShippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.success + '15',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginVertical: 12,
  },
  freeShippingText: {
    color: theme.success,
    fontSize: 13,
    fontWeight: '600',
  },
  shippingHintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.warning + '15',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginVertical: 12,
  },
  shippingHintText: {
    color: theme.warning,
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.primary,
  },
  checkoutBtn: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  checkoutBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
