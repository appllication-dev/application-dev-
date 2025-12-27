
import React, { useState, useEffect, useRef } from "react";
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
  Platform,
  I18nManager
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { storage } from "../utils/storage";
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
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import { useFavorites } from "../context/FavoritesContext";
import { useCheckout } from "../context/CheckoutContext";
import SavedAddresses from "../components/SavedAddresses";
import PaymentMethods from "../components/PaymentMethods";
import { useTranslation } from "../hooks/useTranslation";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

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

  const [imageUri, setImageUri] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);

  // Modal States
  const [showAddresses, setShowAddresses] = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  // Animation Values
  const ring1Rotation = useSharedValue(0);
  const ring2Rotation = useSharedValue(0);
  const ring3Rotation = useSharedValue(0);

  useEffect(() => {
    ring1Rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1
    );
    ring2Rotation.value = withRepeat(
      withTiming(-360, { duration: 12000, easing: Easing.linear }),
      -1
    );
    ring3Rotation.value = withRepeat(
      withTiming(360, { duration: 15000, easing: Easing.linear }),
      -1
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ring1Rotation.value}deg` }]
  }));
  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ring2Rotation.value}deg` }]
  }));
  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ring3Rotation.value}deg` }]
  }));

  // Handlers
  const handleAddAddress = async (newAddress) => await saveAddress(newAddress);
  const handleDeleteAddress = async (id) => await deleteAddress(id);
  const handleAddCard = async (newCard) => await savePaymentMethod(newCard);
  const handleDeleteCard = async (id) => await deletePaymentMethod(id);

  // Load Image
  useEffect(() => {
    const loadSavedImage = async () => {
      if (!user) {
        setImageUri(null);
        return;
      }
      try {
        const userImageKey = `profile_image_${user.id}`;
        const savedUri = await storage.getItem(userImageKey);
        if (savedUri) setImageUri(savedUri);
      } catch (error) {
        console.error("Error loading saved image:", error);
      }
    };
    loadSavedImage();
  }, [user]);

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
        const localUri = result.assets[0].uri;
        const userImageKey = `profile_image_${user.id}`;
        await storage.setItem(userImageKey, localUri);
        setImageUri(localUri);

        updateUser({ photoURL: localUri });
        setLoadingImage(false);
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

  // --- Render Components ---

  const QuickActionItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <TouchableOpacity
        style={[styles.quickActionCard, { backgroundColor: theme.backgroundCard, shadowColor: theme.shadow }]}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15' }]}>
          <Ionicons name={item.icon} size={24} color={theme.primary} />
        </View>
        {item.count !== undefined && item.count > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <Text style={styles.badgeText}>{item.count}</Text>
          </View>
        )}
        <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>{item.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const StatItem = ({ label, value, icon, index }) => (
    <Animated.View
      entering={FadeInDown.delay(400 + (index * 100)).springify()}
      style={styles.statContainer}
    >
      <BlurView intensity={isDark ? 20 : 40} tint={isDark ? "dark" : "light"} style={styles.statCard}>
        <View style={[styles.statIconBg, { backgroundColor: theme.primary + '20' }]}>
          <Ionicons name={icon} size={20} color={theme.primary} />
        </View>
        <View style={styles.statContent}>
          <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
        </View>
      </BlurView>
    </Animated.View>
  );

  const SettingItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(600 + (index * 50)).springify()}>
      <TouchableOpacity
        style={[styles.settingRow, { borderBottomColor: theme.border, backgroundColor: theme.backgroundCard }]}
        onPress={item.type === "toggle" ? item.onToggle : item.onPress}
        disabled={item.type === "toggle"}
      >
        <View style={styles.settingContent}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconBox, { backgroundColor: theme.backgroundSecondary }]}>
              <Ionicons name={item.iconName} size={20} color={theme.text} />
            </View>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{item.label}</Text>
          </View>

          <View style={styles.settingRight}>
            {item.type === "toggle" ? (
              <Switch
                trackColor={{ false: theme.border, true: theme.primaryLight }}
                thumbColor={item.value ? theme.primary : "#f4f3f4"}
                onValueChange={item.onToggle}
                value={item.value}
              />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.rightText && <Text style={[styles.settingRightText, { color: theme.textMuted }]}>{item.rightText}</Text>}
                <Ionicons name={I18nManager.isRTL ? "chevron-back" : "chevron-forward"} size={18} color={theme.textMuted} />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  // Setup Data
  const quickActions = [
    { id: 1, icon: 'receipt-outline', label: t('orders'), count: userStats.totalOrders, onPress: () => router.push('/orders') },
    { id: 2, icon: 'heart-outline', label: t('favorites'), count: favorites.length, onPress: () => router.push('/favorites') },
    { id: 3, icon: 'location-outline', label: t('addresses'), count: savedAddresses.length, onPress: () => setShowAddresses(true) },
    { id: 4, icon: 'create-outline', label: t('editProfile'), onPress: () => Alert.alert("Coming Soon") },
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.guestContent, { backgroundColor: theme.backgroundCard, shadowColor: theme.shadow }]}>
          <View style={[styles.logoCircle, { backgroundColor: theme.primary + '15' }]}>
            <Ionicons name="person" size={50} color={theme.primary} />
          </View>
          <Text style={[styles.guestTitle, { color: theme.text }]}>{t('welcome')}</Text>
          <Text style={[styles.guestSubtitle, { color: theme.textSecondary }]}>{t('dontHaveAccount')}</Text>

          <TouchableOpacity onPress={() => router.push('/auth')} style={styles.guestBtn}>
            <LinearGradient colors={[theme.primary, theme.primaryDark]} style={styles.guestBtnGradient}>
              <Text style={styles.guestBtnText}>{t('login')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth')} style={[styles.guestBtnOutline, { borderColor: theme.primary }]}>
            <Text style={[styles.guestBtnText, { color: theme.primary }]}>{t('createAccount')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0F0F1A' : '#FAFAFF' }]}>
      {/* Background Glows */}
      <View style={[styles.bgGlow, { top: -100, right: -100, backgroundColor: theme.primary + '15' }]} />
      <View style={[styles.bgGlow, { bottom: -50, left: -50, backgroundColor: theme.accent + '10' }]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <LinearGradient
            colors={[theme.primary, theme.primaryDark]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.headerGlass} />

          <Animated.View entering={FadeInDown.delay(200)} style={styles.profileCore}>
            {/* Multi-layered Neural Rings */}
            <Animated.View style={[styles.ring, styles.ring1, animatedStyle1]} />
            <Animated.View style={[styles.ring, styles.ring2, animatedStyle2]} />
            <Animated.View style={[styles.ring, styles.ring3, animatedStyle3]} />

            {/* Profile Image */}
            <TouchableOpacity onPress={pickAndCropImage} activeOpacity={0.9} style={styles.avatarContainer}>
              <Image
                source={imageUri ? { uri: imageUri } : (user?.photoURL ? { uri: user.photoURL } : { uri: "https://via.placeholder.com/150" })}
                style={styles.avatar}
              />
              {loadingImage && (
                <View style={styles.loaderOverlay}>
                  <ActivityIndicator color={theme.primary} />
                </View>
              )}
              <BlurView intensity={60} tint="light" style={styles.editBadge}>
                <Ionicons name="camera" size={14} color={theme.primary} />
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={styles.userInfo}>
            <Text style={styles.userName}>{user?.displayName || t('welcomeMember')}</Text>
            <View style={styles.emailBadge}>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </Animated.View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatItem label={t('ordersTitle')} value={userStats.totalOrders} icon="receipt" index={0} />
            <StatItem label={t('favorites')} value={userStats.favorites} icon="heart" index={1} />
          </View>
        </View>

        {/* Quick Actions Carousel */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>{t('quickActions')}</Text>
          <FlatList
            data={quickActions}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickList}
            renderItem={QuickActionItem}
            keyExtractor={item => item.id.toString()}
          />
        </View>

        {/* Settings List */}
        <View style={[styles.settingsContainer, { backgroundColor: theme.backgroundCard, shadowColor: theme.shadow }]}>
          {settingsOptions.map((item, index) => (
            <SettingItem key={item.id} item={item} index={index} />
          ))}
        </View>

        {/* Info & Legal Section */}
        <View style={[styles.settingsContainer, { backgroundColor: theme.backgroundCard, shadowColor: theme.shadow }]}>
          <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>{t('moreInfo')}</Text>
          {infoOptions.map((item, index) => (
            <SettingItem key={item.id} item={item} index={index} />
          ))}
        </View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(800)} style={styles.logoutContainer}>
          <TouchableOpacity style={[styles.logoutBtn, { borderColor: theme.error + '50' }]} onPress={handleLogout}>
            <Text style={[styles.logoutText, { color: theme.error }]}>{t('logout')}</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>

      {/* Modals */}
      <Modal visible={showAddresses} animationType="slide" transparent={true} onRequestClose={() => setShowAddresses(false)}>
        <View style={styles.modalOverlay}>
          <BlurView intensity={30} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundCard }]}>
            <SavedAddresses onClose={() => setShowAddresses(false)} addresses={savedAddresses} onAdd={handleAddAddress} onDelete={handleDeleteAddress} />
          </View>
        </View>
      </Modal>

      <Modal visible={showPayments} animationType="slide" transparent={true} onRequestClose={() => setShowPayments(false)}>
        <View style={styles.modalOverlay}>
          <BlurView intensity={30} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundCard }]}>
            <PaymentMethods onClose={() => setShowPayments(false)} cards={savedPaymentMethods} onAdd={handleAddCard} onDelete={handleDeleteCard} />
          </View>
        </View>
      </Modal>


    </View>
  );
};


// Need to import I18nManager for RTL check in component
const styles = StyleSheet.create({
  container: { flex: 1 },
  bgGlow: { position: 'absolute', width: 300, height: 300, borderRadius: 150, zIndex: -1 },
  scrollContent: { paddingBottom: 100 },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  headerGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  profileCore: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  ring: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  ring1: { width: 150, height: 150, borderStyle: 'dashed' },
  ring2: { width: 135, height: 135, borderColor: 'rgba(255,255,255,0.15)' },
  ring3: { width: 120, height: 120, borderStyle: 'dotted' },

  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  avatar: { width: '100%', height: '100%', borderRadius: 50 },
  loaderOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: -5, right: -5, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },

  // User Info
  userInfo: { alignItems: 'center', marginBottom: 25 },
  userName: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 6, letterSpacing: -0.5 },
  emailBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  userEmail: { fontSize: 13, color: '#fff' },

  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, width: '100%', paddingHorizontal: 25 },
  statContainer: { flex: 1, height: 80, borderRadius: 24, overflow: 'hidden' },
  statCard: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 12 },
  statContent: { flex: 1 },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '600', opacity: 0.7 },
  statIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  // Sections
  sectionContainer: { marginTop: 10 },
  sectionHeader: { fontSize: 12, fontWeight: '800', marginLeft: 30, marginBottom: 15, letterSpacing: 2, textTransform: 'uppercase' },
  quickList: { paddingHorizontal: 20, gap: 15 },

  // Quick Actions
  quickActionCard: {
    width: 110,
    height: 120,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconCircle: { width: 48, height: 48, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  quickActionText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  badge: { position: 'absolute', top: 12, right: 12, minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },

  // Settings
  settingsContainer: {
    marginHorizontal: 20,
    marginTop: 25,
    borderRadius: 30,
    overflow: 'hidden',
    paddingVertical: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  settingRow: { paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1 },
  settingContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  settingIconBox: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  settingRight: {},
  settingRightText: { fontSize: 13, marginRight: 5, fontWeight: '600' },

  // Logout
  logoutContainer: { marginTop: 40, paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },
  logoutBtn: { width: '100%', borderRadius: 24, padding: 18, alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed' },
  logoutText: { fontSize: 16, fontWeight: '800' },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { height: '80%', borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden', paddingTop: 20 },

  // Guest
  guestContent: { width: '85%', alignItems: 'center', padding: 35, borderRadius: 40, alignSelf: 'center', marginTop: '35%', elevation: 10 },
  logoCircle: { width: 90, height: 90, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  guestTitle: { fontSize: 26, fontWeight: '900', marginBottom: 12 },
  guestSubtitle: { textAlign: 'center', marginBottom: 35, lineHeight: 22 },
  guestBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 15 },
  guestBtnGradient: { padding: 18, alignItems: 'center' },
  guestBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  guestBtnOutline: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 18
  },
});

export default Profile;
