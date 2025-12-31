/**
 * Profile Screen - Cosmic Luxury Edition
 * 🌙 Orbital rings, floating glass cards, ethereal animations
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  Switch,
  ScrollView,
  Modal,
  StyleSheet,
  ActivityIndicator,
  I18nManager
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { storage } from "../../src/utils/storage";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import { useSettings } from "../../src/context/SettingsContext";
import { useFavorites } from "../../src/context/FavoritesContext";
import { useCheckout } from "../../src/context/CheckoutContext";

import SavedAddresses from "../../src/components/SavedAddresses";
import PaymentMethods from "../../src/components/PaymentMethods";
import { useTranslation } from "../../src/hooks/useTranslation";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import EditProfileModal from "../../src/components/EditProfileModal";

const { width } = Dimensions.get("window");

const Profile = () => {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  const { toggleTheme, theme, isDark } = useTheme();
  const { favorites } = useFavorites();
  const { orders } = useCheckout();


  const {
    notifications,
    toggleNotifications,
    language,
    changeLanguage,
  } = useSettings();

  const {
    savedAddresses,
    saveAddress,
    deleteAddress,
    savedPaymentMethods,
    savePaymentMethod,
    deletePaymentMethod
  } = useCheckout();

  const { t } = useTranslation();

  const [loadingImage, setLoadingImage] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Handlers
  const handleAddAddress = async (newAddress) => await saveAddress(newAddress);
  const handleDeleteAddress = async (id) => await deleteAddress(id);
  const handleAddCard = async (newCard) => await savePaymentMethod(newCard);
  const handleDeleteCard = async (id) => await deletePaymentMethod(id);

  // Load Image logic removed, using user.photoURL directly
  useEffect(() => {
    // Sync logic if needed
  }, [user?.photoURL]);

  const userStats = {
    totalOrders: orders.length,
    favorites: favorites.length,
  };

  const pickAndCropImage = async () => {
    if (!user) {
      Alert.alert("Authentication", "Please sign in to update your profile.");
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission", "We need access to your gallery.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setLoadingImage(true);
        try {
          const uri = result.assets[0].uri;
          await updateUser({ photoURL: uri });
        } catch (error) {
          console.error("Error updating image:", error);
          Alert.alert(t('error'), t('updateFailed'));
        } finally {
          setLoadingImage(false);
        }
      }
    } catch (error) {
      setLoadingImage(false);
      Alert.alert("Error", "Failed to update image.");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirm'),
      [
        { text: t('cancel'), style: "cancel" },
        {
          text: t('logout'),
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace('/');
            } catch (error) {
              console.error("Logout failed:", error);
            }
          }
        }
      ]
    );
  };

  const styles = getStyles(theme, isDark);

  // Components
  const QuickActionItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <TouchableOpacity
        style={styles.quickActionCard}
        onPress={item.onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.quickActionBlur, { backgroundColor: isDark ? 'rgba(26,21,32,0.7)' : 'rgba(255,255,255,0.8)' }]}>
          <View style={styles.iconCircle}>
            <Ionicons name={item.icon} size={22} color={theme.primary} />
          </View>
          {item.count !== undefined && item.count > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.count}</Text>
            </View>
          )}
          <Text style={styles.quickActionText}>{item.label}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const StatItem = ({ label, value, icon, index, onPress }) => (
    <Animated.View
      entering={FadeInDown.delay(400 + (index * 100)).springify()}
      style={styles.statContainer}
    >
      <TouchableOpacity
        style={[styles.statCard, { backgroundColor: isDark ? 'rgba(26,21,32,0.7)' : 'rgba(255,255,255,0.8)' }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.statIconBg}>
          <Ionicons name={icon} size={18} color={theme.primary} />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const SettingItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(600 + (index * 50)).springify()}>
      <TouchableOpacity
        style={styles.settingRow}
        onPress={item.type === "toggle" ? item.onToggle : item.onPress}
        disabled={item.type === "toggle"}
      >
        <View style={styles.settingContent}>
          <View style={styles.settingLeft}>
            <View style={styles.settingIconBox}>
              <Ionicons name={item.iconName} size={18} color={theme.text} />
            </View>
            <Text style={styles.settingLabel}>{item.label}</Text>
          </View>

          <View style={styles.settingRight}>
            {item.type === "toggle" ? (
              <Switch
                trackColor={{ false: theme.border, true: theme.primary + '50' }}
                thumbColor={item.value ? theme.primary : "#f4f3f4"}
                onValueChange={item.onToggle}
                value={item.value}
              />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.rightText && <Text style={styles.settingRightText}>{item.rightText}</Text>}
                <Ionicons name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"} size={16} color={theme.textMuted} />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  // Data
  const quickActions = [
    { id: 1, icon: 'receipt-outline', label: t('orders'), count: userStats.totalOrders, onPress: () => router.push('/orders') },
    { id: 2, icon: 'heart-outline', label: t('favorites'), count: favorites.length, onPress: () => router.push('/favorites') },
    { id: 3, icon: 'location-outline', label: t('addresses'), count: savedAddresses.length, onPress: () => setShowAddresses(true) },
    { id: 4, icon: 'create-outline', label: t('editProfile'), onPress: () => setShowEditProfile(true) },
    { id: 5, icon: 'card-outline', label: t('paymentMethods'), count: savedPaymentMethods.length, onPress: () => setShowPayments(true) },
  ];

  const settingsOptions = [
    { id: 1, type: "toggle", label: isDark ? t('darkMode') : t('lightMode'), iconName: isDark ? "moon" : "sunny", value: isDark, onToggle: toggleTheme },
    { id: 2, type: "toggle", label: t('notifications'), iconName: "notifications-outline", value: notifications, onToggle: toggleNotifications },
    { id: 3, type: "link", label: t('language'), iconName: "globe-outline", rightText: language === 'en' ? 'English' : 'العربية', onPress: () => changeLanguage(language === 'en' ? 'ar' : 'en') },
  ];

  const infoOptions = [
    { id: 1, type: "link", label: t('aboutApp'), iconName: "information-circle-outline", onPress: () => router.push('/about') },
    { id: 2, type: "link", label: t('termsPrivacy'), iconName: "document-text-outline", onPress: () => router.push('/terms') },
  ];

  // Guest View
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.bgOrb1} />
        <View style={styles.bgOrb2} />
        <View style={styles.guestContent}>
          <BlurView intensity={isDark ? 30 : 50} tint={isDark ? "dark" : "light"} style={styles.guestBlur}>
            <View style={styles.logoCircle}>
              <Ionicons name="person" size={44} color={theme.primary} />
            </View>
            <Text style={styles.guestTitle}>{t('welcome')}</Text>
            <Text style={styles.guestSubtitle}>{t('dontHaveAccount')}</Text>

            <TouchableOpacity onPress={() => router.push('/auth')} style={styles.guestBtn}>
              <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.guestBtnGradient}>
                <Text style={styles.guestBtnText}>{t('login')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth')} style={styles.guestBtnOutline}>
              <Text style={[styles.guestBtnOutlineText, { color: theme.primary }]}>{t('createAccount')}</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cosmic Background Orbs */}
      {/* Cosmic Background Orbs */}
      <View style={styles.bgOrb1} />
      <View style={styles.bgOrb2} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Orbital Avatar */}

        {/* Header Section - Minimized & Clean */}
        <View style={styles.header}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.profileCore}>
            {/* Soft Glow behind avatar */}
            <View style={styles.avatarGlow} />

            {/* Profile Image */}
            <TouchableOpacity onPress={pickAndCropImage} activeOpacity={0.9} style={styles.avatarContainer}>
              <View style={[styles.avatarBorder, { borderColor: theme.primary + "40" }]}>
                {user?.photoURL ? (
                  <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary + '10' }]}>
                    <Ionicons name="person" size={44} color={theme.primary} />
                  </View>
                )}
              </View>
              {loadingImage && (
                <View style={[styles.loaderOverlay, { backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 60 }]}>
                  <ActivityIndicator color={theme.primary} size="large" />
                </View>
              )}
              <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
                <Ionicons name="camera" size={14} color="#FFF" />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.text }]}>{user?.displayName || t('welcomeMember')}</Text>
            <View style={[styles.emailBadge, { backgroundColor: theme.primary + '15' }]}>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email}</Text>
            </View>
          </Animated.View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatItem
              label={t('ordersTitle')}
              value={userStats.totalOrders}
              icon="receipt"
              index={0}
              onPress={() => router.push('/orders')}
            />
            <StatItem
              label={t('favorites')}
              value={userStats.favorites}
              icon="heart"
              index={1}
              onPress={() => router.push('/favorites')}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>{t('quickActions')}</Text>
          <FlatList
            data={quickActions}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickList}
            renderItem={QuickActionItem}
            keyExtractor={item => item.id.toString()}
          />
        </View>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          {settingsOptions.map((item, index) => (
            <SettingItem key={item.id} item={item} index={index} />
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionHeaderSmall}>{t('moreInfo')}</Text>
          {infoOptions.map((item, index) => (
            <SettingItem key={item.id} item={item} index={index} />
          ))}
        </View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(800)} style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Modals */}
      <Modal visible={showAddresses} animationType="slide" transparent={true} onRequestClose={() => setShowAddresses(false)}>
        <View style={styles.modalOverlay}>
          <BlurView intensity={30} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          <View style={styles.modalContent}>
            <SavedAddresses onClose={() => setShowAddresses(false)} addresses={savedAddresses} onAdd={handleAddAddress} onDelete={handleDeleteAddress} />
          </View>
        </View>
      </Modal>

      <Modal visible={showPayments} animationType="slide" transparent={true} onRequestClose={() => setShowPayments(false)}>
        <View style={styles.modalOverlay}>
          <BlurView intensity={30} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          <View style={styles.modalContent}>
            <PaymentMethods onClose={() => setShowPayments(false)} cards={savedPaymentMethods} onAdd={handleAddCard} onDelete={handleDeleteCard} />
          </View>
        </View>
      </Modal>

      <EditProfileModal visible={showEditProfile} onClose={() => setShowEditProfile(false)} />
    </View>
  );
};

const getStyles = (theme, isDark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  bgOrb1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.primary,
    zIndex: -1
  },
  bgOrb2: {
    position: 'absolute',
    bottom: 50,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.accent + '10',
    zIndex: -1
  },
  scrollContent: { paddingBottom: 100 },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    marginBottom: 10,
  },
  profileCore: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.primary,
    opacity: 0.15,
    transform: [{ scale: 1.2 }],
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    padding: 3,
    backgroundColor: theme.backgroundCard,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },


  avatar: { width: '100%', height: '100%', borderRadius: 45 },
  avatarPlaceholder: { width: '100%', height: '100%', borderRadius: 45, justifyContent: 'center', alignItems: 'center' },
  loaderOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 45, justifyContent: 'center', alignItems: 'center' },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.background,
  },

  // User Info
  userInfo: { alignItems: 'center', marginBottom: 32 },
  userName: { fontSize: 28, fontWeight: '300', marginBottom: 8, letterSpacing: 0.5 },
  emailBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  userEmail: { fontSize: 13 },

  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, width: '100%', paddingHorizontal: 28 },
  statContainer: { flex: 1, height: 76, borderRadius: 22, overflow: 'hidden' },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
    borderWidth: 1,
    backgroundColor: isDark ? 'rgba(30,30,40,0.6)' : 'rgba(255,255,255,0.6)',
    borderColor: isDark ? 'rgba(184,159,204,0.1)' : 'rgba(212,184,224,0.2)',
    borderRadius: 22,
  },
  statContent: { flex: 1 },
  statValue: { fontSize: 20, fontWeight: '700', color: theme.text },
  statLabel: { fontSize: 11, fontWeight: '500', color: theme.textSecondary },
  statIconBg: { width: 36, height: 36, borderRadius: 12, backgroundColor: theme.primary + '15', justifyContent: 'center', alignItems: 'center' },

  // Sections
  sectionContainer: { marginTop: 8 },
  sectionHeader: { fontSize: 11, fontWeight: '700', marginLeft: 28, marginBottom: 16, letterSpacing: 2, textTransform: 'uppercase', color: theme.textMuted },
  sectionHeaderSmall: { fontSize: 11, fontWeight: '700', marginLeft: 20, marginBottom: 12, letterSpacing: 2, textTransform: 'uppercase', color: theme.textMuted },
  quickList: { paddingHorizontal: 20, gap: 14 },

  // Quick Actions
  quickActionCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 10,
  },
  quickActionBlur: {
    width: 105,
    height: 115,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: isDark ? 'rgba(30,30,40,0.6)' : 'rgba(255,255,255,0.6)',
    borderColor: isDark ? 'rgba(184,159,204,0.15)' : 'rgba(212,184,224,0.25)',
    borderRadius: 24,
  },
  iconCircle: { width: 44, height: 44, borderRadius: 16, backgroundColor: theme.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  quickActionText: { fontSize: 11, fontWeight: '600', color: theme.textSecondary, textAlign: 'center' },
  badge: { position: 'absolute', top: 10, right: 10, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },

  // Settings
  settingsContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 28,
    overflow: 'hidden',
    paddingVertical: 8,
    backgroundColor: theme.backgroundCard,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(184,159,204,0.1)' : 'rgba(212,184,224,0.2)',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  settingRow: { paddingHorizontal: 18, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  settingContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  settingIconBox: { width: 38, height: 38, borderRadius: 14, backgroundColor: theme.backgroundSecondary, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '500', color: theme.text },
  settingRight: {},
  settingRightText: { fontSize: 13, marginRight: 6, fontWeight: '500', color: theme.textMuted },

  // Logout
  logoutContainer: { marginTop: 36, paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },
  logoutBtn: {
    width: '100%',
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D4A5A5' + '50',
    backgroundColor: '#D4A5A5' + '10',
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#D4A5A5' },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { height: '80%', borderTopLeftRadius: 36, borderTopRightRadius: 36, overflow: 'hidden', paddingTop: 20, backgroundColor: theme.backgroundCard },

  // Guest
  guestContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  guestBlur: {
    width: '100%',
    alignItems: 'center',
    padding: 36,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(184,159,204,0.15)' : 'rgba(212,184,224,0.25)',
  },
  logoCircle: { width: 88, height: 88, borderRadius: 28, backgroundColor: theme.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  guestTitle: { fontSize: 26, fontWeight: '300', color: theme.text, marginBottom: 10, letterSpacing: 0.3 },
  guestSubtitle: { textAlign: 'center', marginBottom: 32, lineHeight: 22, color: theme.textSecondary },
  guestBtn: { width: '100%', borderRadius: 20, overflow: 'hidden', marginBottom: 14 },
  guestBtnGradient: { padding: 16, alignItems: 'center' },
  guestBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  guestBtnOutline: {
    width: '100%',
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.primary,
    borderRadius: 20
  },
  guestBtnOutlineText: { fontWeight: '600', fontSize: 16 },
});

export default Profile;
