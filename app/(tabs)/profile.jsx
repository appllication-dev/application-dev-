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
  Platform
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { storage } from "../../src/utils/storage"; // Updated to use storage adapter
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSpring,
  interpolate,
  Extrapolate
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import { useSettings } from "../../src/context/SettingsContext";
import { CartContext } from "../../src/context/CardContext";
import { useCheckout } from "../../src/context/CheckoutContext";
import { useFavorites } from "../../src/context/FavoritesContext";
import SavedAddresses from "../components/SavedAddresses";
import PaymentMethods from "../components/PaymentMethods";
import { sanitizeEmail } from "../../src/utils/helpers";
import PremiumBackground from "../components/PremiumBackground";
import { useTranslation } from "../../src/hooks/useTranslation";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

// Luxury Colors
const GOLD = "#D4AF37";
const GOLD_LIGHT = "#E5C158";
const GOLD_DARK = "#B8860B";
const GLASS_BG = "rgba(20, 20, 20, 0.7)";
const GLASS_BORDER = "rgba(212, 175, 55, 0.2)";

const Profile = () => {
  const router = useRouter(); // Use expo-router for tab navigation
  const navigation = useNavigation(); // Use native navigation for stack screens
  const { user, logout } = useAuth();
  const { colors, toggleTheme, theme } = useTheme();
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
    savedPaymentMethods,
    saveAddress,
    deleteAddress,
    savePaymentMethod,
    deletePaymentMethod
  } = useCheckout();

  const { t } = useTranslation();
  const isDark = theme === 'dark';

  // Luxury Colors Dynamic
  const THEME_COLORS = {
    bg: isDark ? '#000' : '#FFFDF5', // Deep Black vs Premium Cream
    text: isDark ? '#FFF' : '#2C2C2C', // Soft Black for Cream
    textSecondary: isDark ? '#AAA' : '#6B5B45', // Warm Grey/Brown for Cream
    card: isDark ? 'rgba(30,30,30,0.8)' : '#FFF8E7', // Warm Cream Card
    cardBorder: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(212, 175, 55, 0.15)', // Subtle Gold Border
    iconBg: isDark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.1)',
    modalBg: isDark ? '#111' : '#FFFDF5',
  };

  const [imageUri, setImageUri] = useState(null);
  const [imageKey, setImageKey] = useState(Date.now().toString());
  const [loadingImage, setLoadingImage] = useState(false);

  // Modal States
  const [showAddresses, setShowAddresses] = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  // Animation Values
  const scrollY = useSharedValue(0);
  const profileRotation = useSharedValue(0);

  useEffect(() => {
    // Continuous slow rotation for the "Royal Ring"
    profileRotation.value = withRepeat(
      withTiming(360, { duration: 10000, easing: Easing.linear }),
      -1
    );
  }, []);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${profileRotation.value}deg` }]
  }));

  // Handlers
  const handleAddAddress = async (newAddress) => await saveAddress(newAddress);
  const handleDeleteAddress = async (id) => await deleteAddress(id);
  const handleAddCard = async (newCard) => await savePaymentMethod(newCard);
  const handleDeleteCard = async (id) => await deletePaymentMethod(id);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const scrollViewRef = useRef(null);

  // Load Image
  useEffect(() => {
    const loadSavedImage = async () => {
      if (!user) {
        setImageUri(null);
        return;
      }
      try {
        const userImageKey = `profile_image_${sanitizeEmail(user.email)}`;
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
    // Points removed as requested
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
        const userImageKey = `profile_image_${sanitizeEmail(user.email)}`;
        await storage.setItem(userImageKey, localUri);
        setImageUri(localUri);
        setImageKey(Date.now().toString());
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
        style={[styles.quickActionGlass, { backgroundColor: THEME_COLORS.card, borderColor: THEME_COLORS.cardBorder }]}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        {isDark ? (
          <LinearGradient
            colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
            style={styles.quickActionGradient}
          >
            <View style={[styles.iconCircle, { backgroundColor: THEME_COLORS.iconBg }]}>
              <Ionicons name={item.icon} size={24} color={GOLD} />
            </View>
            {item.count !== undefined && item.count > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.count}</Text>
              </View>
            )}
            <Text style={[styles.quickActionText, { color: THEME_COLORS.textSecondary }]}>{item.label}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.quickActionGradient}>
            <View style={[styles.iconCircle, { backgroundColor: THEME_COLORS.iconBg }]}>
              <Ionicons name={item.icon} size={24} color={GOLD_DARK} />
            </View>
            {item.count !== undefined && item.count > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.count}</Text>
              </View>
            )}
            <Text style={[styles.quickActionText, { color: THEME_COLORS.text }]}>{item.label}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const StatItem = ({ label, value, icon, index }) => (
    <Animated.View
      entering={FadeIn.delay(400 + (index * 100))}
      style={styles.statItemContainer}
    >
      <BlurView intensity={Platform.OS === 'ios' ? 20 : 0} tint={isDark ? "dark" : "light"} style={[styles.statBlur, { backgroundColor: THEME_COLORS.card }]}>
        <Text style={[styles.statValue, { color: THEME_COLORS.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: THEME_COLORS.textSecondary }]}>{label}</Text>
        <View style={styles.statIconBg}>
          <Ionicons name={icon} size={14} color={GOLD} />
        </View>
      </BlurView>
    </Animated.View>
  );

  const SettingItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(600 + (index * 50)).springify()}>
      <TouchableOpacity
        style={[styles.settingRow, { borderColor: THEME_COLORS.cardBorder, backgroundColor: THEME_COLORS.card }]}
        onPress={item.type === "toggle" ? item.onToggle : item.onPress}
        disabled={item.type === "toggle"} // Let switch handle touch for toggle
      >
        <View style={styles.settingGradient}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconBox, { backgroundColor: THEME_COLORS.iconBg }]}>
              <Ionicons name={item.iconName} size={20} color={GOLD} />
            </View>
            <Text style={[styles.settingLabel, { color: THEME_COLORS.text }]}>{item.label}</Text>
          </View>

          <View style={styles.settingRight}>
            {item.type === "toggle" ? (
              <Switch
                trackColor={{ false: isDark ? "#333" : "#E5E5E5", true: GOLD_DARK }}
                thumbColor={item.value ? GOLD : "#f4f3f4"}
                onValueChange={item.onToggle}
                value={item.value}
              />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.rightText && <Text style={styles.settingRightText}>{item.rightText}</Text>}
                <Ionicons name="chevron-forward" size={18} color={THEME_COLORS.textSecondary} />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  // Setup Data
  const quickActions = [
    { id: 1, icon: 'receipt-outline', label: t('orders'), count: userStats.totalOrders, onPress: () => router.push('/(tabs)/Basket') },
    { id: 2, icon: 'heart-outline', label: t('favorites'), count: favorites.length, onPress: () => router.push('/(tabs)/Save') },
    { id: 3, icon: 'location-outline', label: t('addresses'), count: savedAddresses.length, onPress: () => setShowAddresses(true) },
    { id: 4, icon: 'create-outline', label: t('editProfile'), onPress: () => router.push('/screens/profile/EditProfileScreen') },
    { id: 5, icon: 'card-outline', label: t('paymentMethods'), count: savedPaymentMethods.length, onPress: () => setShowPayments(true) },
  ];

  // Removed Admin Mode as requested
  const settingsOptions = [
    { id: 1, type: "toggle", label: isDark ? "Dark Side" : "Light Side", iconName: isDark ? "moon-outline" : "sunny-outline", value: isDark, onToggle: toggleTheme },
    { id: 2, type: "toggle", label: t('notifications'), iconName: "notifications-outline", value: notifications, onToggle: toggleNotifications },
    { id: 3, type: "link", label: t('language'), iconName: "globe-outline", rightText: language === 'en' ? 'English' : 'العربية', onPress: () => changeLanguage(language === 'en' ? 'ar' : 'en') },
    { id: 4, type: "link", label: t('help'), iconName: "help-circle-outline", onPress: () => router.push('/screens/HelpScreen') },
    { id: 5, type: "link", label: t('privacyPolicy') || 'Privacy Policy', iconName: "shield-checkmark-outline", onPress: () => router.push('/screens/legal/PrivacyPolicyScreen') },
    { id: 6, type: "link", label: t('termsOfService') || 'Terms of Service', iconName: "document-text-outline", onPress: () => router.push('/screens/legal/TermsOfServiceScreen') },
    { id: 7, type: "link", label: t('deleteAccount') || 'Delete Account', iconName: "trash-outline", onPress: () => Alert.alert("Delete Account", "This action cannot be undone.", [{ text: "Cancel" }, { text: "Delete", style: "destructive", onPress: () => deleteAccount() }]) },
  ];


  // Guest View
  if (!user) {
    return (
      <View style={[styles.guestContainer, { backgroundColor: THEME_COLORS.bg }]}>
        {isDark ? (
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop' }}
            style={StyleSheet.absoluteFillObject}
            blurRadius={10}
          />
        ) : (
          // Elegant light background for guest
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#F8F9FA' }]} />
        )}

        {isDark && <LinearGradient colors={['rgba(0,0,0,0.3)', '#000']} style={StyleSheet.absoluteFillObject} />}

        <Animated.View entering={FadeInDown.springify()} style={[styles.guestContent, { backgroundColor: THEME_COLORS.card, borderColor: THEME_COLORS.cardBorder }]}>
          <View style={[styles.logoCircle, { borderColor: GOLD, backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
            <Ionicons name="diamond-outline" size={50} color={GOLD} />
          </View>
          <Text style={[styles.guestTitle, { color: THEME_COLORS.text }]}>{t('welcome')}</Text>
          <Text style={styles.guestSubtitle}>{t('dontHaveAccount')}</Text>

          <TouchableOpacity onPress={() => router.push('/screens/auth/LoginScreen')} style={styles.guestBtn}>
            <LinearGradient colors={[GOLD, GOLD_DARK]} style={styles.guestBtnGradient}>
              <Text style={styles.guestBtnText}>{t('login')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/screens/auth/RegisterScreen')} style={styles.guestBtnOutline}>
            <Text style={[styles.guestBtnText, { color: GOLD }]}>{t('createAccount')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: THEME_COLORS.bg }]}>
      {/* Cinematic Background - Conditional */}
      {isDark ? (
        <>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=3087&auto=format&fit=crop' }}
            style={StyleSheet.absoluteFill}
            blurRadius={50}
          />
          <LinearGradient
            colors={['#000', 'rgba(0,0,0,0.8)', '#000']}
            style={StyleSheet.absoluteFill}
          />
        </>
      ) : (
        // Light Mode Background - Luxury Cream Gradient
        <LinearGradient
          colors={['#FFFDF5', '#F5F0E1', '#E6D28F']}
          style={StyleSheet.absoluteFill}
        />
      )}

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.profileRingContainer}>
            {/* Rotating Ring */}
            <Animated.View style={[styles.rotatingRing, animatedRingStyle]}>
              <LinearGradient
                colors={[GOLD, 'transparent', GOLD, 'transparent']}
                style={styles.ringGradient}
              />
            </Animated.View>

            {/* Profile Image */}
            <TouchableOpacity onPress={pickAndCropImage} activeOpacity={0.9}>
              <Image
                source={imageUri ? { uri: imageUri } : (user?.photoURL ? { uri: user.photoURL } : { uri: "https://via.placeholder.com/150" })}
                style={[styles.avatar, { borderColor: isDark ? '#111' : '#FFF' }]}
              />
              {loadingImage && (
                <View style={styles.loaderOverlay}>
                  <ActivityIndicator color={GOLD} />
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={12} color="#000" />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={styles.userInfo}>
            <Text style={[styles.userName, { color: THEME_COLORS.text }]}>{user?.displayName || "VIP Member"}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.vipTag}>
              <Ionicons name="trophy" size={12} color={GOLD_LIGHT} />
              <Text style={styles.vipText}>PREMIUM MEMBER</Text>
            </View>
          </Animated.View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatItem label={t('ordersTitle')} value={userStats.totalOrders} icon="receipt-outline" index={0} />
            <StatItem label={t('favorites')} value={userStats.favorites} icon="heart-outline" index={1} />
            {/* Removed Points Stats as requested */}
          </View>
        </View>

        {/* Quick Actions Carousel */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Q U I C K   A C T I O N S</Text>
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
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>S E T T I N G S</Text>
          {settingsOptions.map((item, index) => (
            <SettingItem key={item.id} item={item} index={index} />
          ))}
        </View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(800)} style={styles.logoutContainer}>
          <TouchableOpacity style={[styles.logoutBtn, { borderColor: 'rgba(255,50,50,0.2)', backgroundColor: isDark ? 'transparent' : '#FFF' }]} onPress={handleLogout}>
            <View style={[styles.logoutGradient, { backgroundColor: isDark ? 'transparent' : 'rgba(255,50,50,0.05)' }]}>
              <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
              <Text style={styles.logoutText}>{t('logout')}</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.versionText}>Version 2.5.0 • Luxury Edition</Text>
        </Animated.View>

      </ScrollView>

      {/* Modals */}
      <Modal visible={showAddresses} animationType="slide" transparent={true} onRequestClose={() => setShowAddresses(false)}>
        <View style={styles.modalOverlay}>
          <BlurView intensity={30} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          <View style={[styles.modalContent, { backgroundColor: THEME_COLORS.modalBg }]}>
            <SavedAddresses onClose={() => setShowAddresses(false)} addresses={savedAddresses} onAdd={handleAddAddress} onDelete={handleDeleteAddress} />
          </View>
        </View>
      </Modal>

      <Modal visible={showPayments} animationType="slide" transparent={true} onRequestClose={() => setShowPayments(false)}>
        <View style={styles.modalOverlay}>
          <BlurView intensity={30} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          <View style={[styles.modalContent, { backgroundColor: THEME_COLORS.modalBg }]}>
            <PaymentMethods onClose={() => setShowPayments(false)} cards={savedPaymentMethods} onAdd={handleAddCard} onDelete={handleDeleteCard} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  // Header
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 20 },
  profileRingContainer: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  rotatingRing: {
    position: 'absolute', width: '100%', height: '100%', borderRadius: 70, borderWidth: 2, borderColor: 'transparent',
  },
  ringGradient: { flex: 1, borderRadius: 70, borderWidth: 2, borderColor: GOLD },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4 },
  loaderOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: GOLD, width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000' },

  // User Info
  userInfo: { alignItems: 'center', marginBottom: 25 },
  userName: { fontSize: 24, fontWeight: '800', letterSpacing: 0.5 },
  userEmail: { fontSize: 13, color: '#AAA', marginTop: 4 },
  vipTag: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: 'rgba(212, 175, 55, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
  vipText: { color: GOLD, fontSize: 10, fontWeight: '800', marginLeft: 4, letterSpacing: 1 },

  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, width: '100%', paddingHorizontal: 20 },
  statItemContainer: { width: width * 0.42, height: 90, borderRadius: 20, overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  statBlur: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 2 },
  statIconBg: { position: 'absolute', top: 8, right: 8, opacity: 0.5 },

  // Sections
  sectionContainer: { marginTop: 30 },
  sectionHeader: { fontSize: 12, color: '#888', fontWeight: '800', marginLeft: 25, marginBottom: 15, letterSpacing: 2 },
  quickList: { paddingHorizontal: 20, gap: 15 },

  // Quick Actions
  quickActionGlass: { width: 100, height: 100, borderRadius: 24, overflow: 'hidden', borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  quickActionGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  quickActionText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  badge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'red', minWidth: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

  // Settings
  settingRow: { marginHorizontal: 20, marginBottom: 10, borderRadius: 16, overflow: 'hidden', borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  settingGradient: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  settingIconBox: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  settingRight: {},
  settingRightText: { color: '#888', fontSize: 13, marginRight: 5 },

  // Logout
  logoutContainer: { marginTop: 40, paddingHorizontal: 20, paddingBottom: 30, alignItems: 'center' },
  logoutBtn: { width: '100%', borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  logoutGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, gap: 10 },
  logoutText: { color: '#FF6B6B', fontSize: 16, fontWeight: '600' },
  versionText: { color: '#888', fontSize: 10, marginTop: 15, letterSpacing: 1 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { height: '85%', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },

  // Guest
  guestContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  guestContent: { width: '85%', alignItems: 'center', padding: 30, borderRadius: 30, borderWidth: 1 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1 },
  guestTitle: { fontSize: 28, fontWeight: '800', marginBottom: 10 },
  guestSubtitle: { color: '#888', textAlign: 'center', marginBottom: 30 },
  guestBtn: { width: '100%', borderRadius: 15, overflow: 'hidden', marginBottom: 15 },
  guestBtnGradient: { padding: 16, alignItems: 'center' },
  guestBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
  guestBtnOutline: { width: '100%', padding: 15, alignItems: 'center', borderWidth: 1, borderColor: GOLD, borderRadius: 15 },

});

export default Profile;
