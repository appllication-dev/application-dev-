import { FlatList, StyleSheet, Text, TouchableOpacity, View, StatusBar, Dimensions, Alert, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CartProduct from "../components/CartProduct";
import { useContext, useState } from "react";
import { CartContext } from "../../src/context/CardContext";
import { useTheme } from "../../src/context/ThemeContext";
import { useAuth } from "../../src/context/AuthContext";
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import Animated, { FadeInDown } from 'react-native-reanimated';
import PremiumBackground from "../components/PremiumBackground";
import { BorderRadius } from "../../constants/theme";
import { rateLimiters } from "../../src/utils/security";
import { useTranslation } from "../../src/hooks/useTranslation";
import { RevolutionTheme } from "../../src/theme/RevolutionTheme"; // Import Theme

const { width } = Dimensions.get('window');

const Basket = () => {
  const { colors, theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const { carts, totalPrice, deleteItemFromCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  const shippingCost = 0;
  const tax = (totalPrice * 0.1).toFixed(2); // 10% tax
  const finalTotal = (parseFloat(totalPrice) + parseFloat(tax) + shippingCost).toFixed(2);

  // Dynamic Theme Colors
  const themeBg = isDark ? RevolutionTheme.colors.background : RevolutionTheme.colors.backgroundLight;
  const themeText = isDark ? RevolutionTheme.colors.text.primary : RevolutionTheme.colors.creamText;
  const themeTextSecondary = isDark ? RevolutionTheme.colors.text.secondary : RevolutionTheme.colors.creamTextSecondary;
  const themeCard = isDark ? RevolutionTheme.colors.card : RevolutionTheme.colors.creamCard;
  const themeBorder = isDark ? 'rgba(255,255,255,0.05)' : RevolutionTheme.colors.glassBorderLight;
  const themeIconBg = isDark ? RevolutionTheme.colors.glass : 'rgba(212, 175, 55, 0.08)';

  const handleCheckout = () => {
    // Rate limiting check
    if (!rateLimiters.api.isAllowed('checkout_attempt')) {
      Alert.alert(
        "Please Wait",
        "You're proceeding too quickly. Please wait a moment."
      );
      return;
    }

    // Check if cart has items
    if (!carts || carts.length === 0) {
      Alert.alert("Empty Cart", "Please add items to your cart first.");
      return;
    }

    // Validate cart items (check for valid prices and quantities)
    const invalidItems = carts.filter(item =>
      !item.price || item.price <= 0 ||
      (item.quantity && item.quantity <= 0)
    );

    if (invalidItems.length > 0) {
      Alert.alert("Invalid Items", "Some items in your cart have invalid data. Please remove and re-add them.");
      return;
    }

    // Check if user is logged in
    if (!user) {
      Alert.alert(
        "Sign In Required",
        "Please go to your profile and sign in to proceed with checkout",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Go to Profile",
            onPress: () => {
              // Navigate to profile tab where guest screen will show sign in option
              navigation.getParent()?.navigate('profile');
            }
          }
        ]
      );
      return;
    }

    // User is logged in and cart is valid, proceed to checkout
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('ShippingScreen');
    }, 300);
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeBg }}>
      {/* Background Gradient for Cream Mode */}
      {!isDark && (
        <LinearGradient
          colors={RevolutionTheme.colors.gradient.cream}
          style={StyleSheet.absoluteFill}
        />
      )}
      {/* Background for Dark Mode */}
      {isDark && (
        <PremiumBackground style={StyleSheet.absoluteFill} />
      )}

      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

        {/* PREMIUM HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.headerSubtitle, { color: themeTextSecondary }]}>{t('yourCart')}</Text>
              <Text style={[styles.headerTitle, { color: themeText }]}>
                {carts.length} {t('items')}
              </Text>
            </View>
            <View style={[styles.cartIconContainer, { backgroundColor: RevolutionTheme.colors.primary }]}>
              <Feather name="shopping-bag" size={22} color={isDark ? '#000' : '#FFF'} />
            </View>
          </View>
        </View>

        {carts.length === 0 ? (
          // EMPTY STATE
          <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: themeCard, borderColor: themeBorder }]}>
              <Feather name="shopping-cart" size={48} color={themeTextSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: themeText }]}>{t('cartEmpty')}</Text>
            <Text style={[styles.emptySubtitle, { color: themeTextSecondary }]}>
              {t('cartEmptyDesc')}
            </Text>
          </Animated.View>
        ) : (
          <>
            {/* CART ITEMS */}
            <FlatList
              data={carts}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={[styles.cartItemWrapper, { backgroundColor: themeCard, borderColor: themeBorder }]}>
                  <CartProduct item={item} deleteItemFromCart={deleteItemFromCart} isGlass={false} isDark={isDark} />
                </View>
              )}
            />

            {/* BOTTOM SUMMARY CARD */}
            <View style={[styles.bottomCard, { backgroundColor: themeCard, borderTopColor: themeBorder, shadowColor: isDark ? '#000' : '#D4AF37' }]}>
              {/* Order Summary */}
              <View style={styles.summarySection}>
                <Text style={[styles.summaryTitle, { color: themeText }]}>{t('reviewOrder')}</Text>

                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: themeTextSecondary }]}>{t('subtotal')}</Text>
                  <Text style={[styles.summaryValue, { color: themeText }]}>${totalPrice}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: themeTextSecondary }]}>{t('shipping')}</Text>
                  <Text style={[styles.summaryValue, { color: RevolutionTheme.colors.success }]}>{t('freeShipping')}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: themeTextSecondary }]}>Tax (10%)</Text>
                  <Text style={[styles.summaryValue, { color: themeText }]}>${tax}</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: themeBorder }]} />

                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: themeText }]}>{t('total')}</Text>
                  <Text style={[styles.totalValue, { color: RevolutionTheme.colors.primary }]}>${finalTotal}</Text>
                </View>
              </View>

              {/* CHECKOUT BUTTON */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleCheckout}
                style={[styles.checkoutButton, { backgroundColor: RevolutionTheme.colors.primary }]}
              >
                <Text style={[styles.checkoutText, { color: isDark ? '#000' : '#FFF' }]}>{t('checkout')}</Text>
                <Feather name="arrow-right" size={18} color={isDark ? '#000' : '#FFF'} />
              </TouchableOpacity>

              {/* Trust Badges */}
              <View style={[styles.trustBadges, { borderTopColor: themeBorder }]}>
                <View style={styles.trustItem}>
                  <Feather name="shield" size={14} color={RevolutionTheme.colors.success} />
                  <Text style={[styles.trustText, { color: themeTextSecondary }]}>{t('securePayment')}</Text>
                </View>
                <View style={styles.trustItem}>
                  <Feather name="truck" size={14} color={RevolutionTheme.colors.success} />
                  <Text style={[styles.trustText, { color: themeTextSecondary }]}>{t('freeShipping')}</Text>
                </View>
                <View style={styles.trustItem}>
                  <Feather name="refresh-cw" size={14} color={RevolutionTheme.colors.success} />
                  <Text style={[styles.trustText, { color: themeTextSecondary }]}>{t('easyReturns')}</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  cartIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cartItemWrapper: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  bottomCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 14,
    gap: 8,
    marginBottom: 24,
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default Basket;
