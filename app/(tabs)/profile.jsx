import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  Switch,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import { useSettings } from "../../src/context/SettingsContext";
import SettingsScreen from "./Settings";
import { useNavigation } from "@react-navigation/native";
import { sanitizeEmail } from "../../src/utils/helpers";
import PremiumBackground from "../components/PremiumBackground";

const { width } = Dimensions.get("window");

const Profile = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { colors, toggleTheme, theme } = useTheme();
  const {
    notifications,
    sounds,
    vibration,
    toggleNotifications,
    toggleSounds,
    toggleVibration,
  } = useSettings();

  const [imageUri, setImageUri] = useState(null);
  const [imageKey, setImageKey] = useState(Date.now().toString());
  const [showSettings, setShowSettings] = useState(false);

  // Load saved profile image on component mount or user change
  useEffect(() => {
    const loadSavedImage = async () => {
      if (!user) {
        setImageUri(null);
        return;
      }
      try {
        // Use user-specific key for profile image with sanitized email
        const userImageKey = `profile_image_${sanitizeEmail(user.email)}`;
        const savedUri = await SecureStore.getItemAsync(userImageKey);
        if (savedUri) {
          setImageUri(savedUri);
        } else {
          setImageUri(null);
        }
        setImageKey(Date.now().toString());
      } catch (error) {
        console.error("Error loading saved image:", error);
        setImageUri(null);
      }
    };

    loadSavedImage();
  }, [user]);

  const recentOrders = [];

  const pickAndCropImage = async () => {
    if (!user) {
      Alert.alert("Alert", "You must sign in first");
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissions Required",
          "We need permission to access photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const localUri = result.assets[0].uri;

        try {
          const userImageKey = `profile_image_${sanitizeEmail(user.email)}`;
          await SecureStore.setItemAsync(userImageKey, localUri);
          setImageUri(localUri);
          setImageKey(Date.now().toString());
        } catch (e) {
          console.error("Error saving image:", e);
          setImageUri(localUri);
          setImageKey(Date.now().toString());
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    {
      id: 1,
      type: "toggle",
      label: "Dark Mode",
      iconName: "moon",
      value: theme === "dark",
      onToggle: toggleTheme,
    },
    {
      id: 2,
      type: "toggle",
      label: "Notifications",
      iconName: "notifications",
      value: notifications,
      onToggle: toggleNotifications,
    },
    {
      id: 3,
      type: "toggle",
      label: "Sounds",
      iconName: "volume-high",
      value: sounds,
      onToggle: toggleSounds,
    },
    {
      id: 4,
      type: "toggle",
      label: "Vibration",
      iconName: "phone-portrait",
      value: vibration,
      onToggle: toggleVibration,
    },
    {
      id: 5,
      type: "link",
      label: "Settings",
      iconName: "settings",
      onPress: () => setShowSettings(true),
    },
    {
      id: 6,
      type: "logout",
      label: "Log Out",
      iconName: "log-out",
      onPress: handleLogout,
    },
  ];

  const renderMenuItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 100 + 200).springify()}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={
          item.type === "toggle"
            ? item.onToggle
            : item.onPress
              ? item.onPress
              : item.type === "logout"
                ? handleLogout
                : null
        }
        activeOpacity={0.7}
      >
        <View style={styles.menuIconContainer}>
          <Ionicons
            name={item.iconName}
            size={22}
            color="#fff"
          />
        </View>
        <Text style={styles.menuLabel}>
          {item.label}
        </Text>
        <View style={styles.menuAction}>
          {item.type === "toggle" ? (
            <Switch
              trackColor={{ false: "#767577", true: "#667eea" }}
              thumbColor="#f4f3f4"
              onValueChange={item.onToggle}
              value={item.value}
            />
          ) : (
            <Ionicons
              name="chevron-forward"
              size={20}
              color="rgba(255,255,255,0.5)"
            />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (!user) {
    return (
      <PremiumBackground>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
          <Ionicons name="person-circle-outline" size={100} color="rgba(255,255,255,0.8)" />
          <Text style={[styles.headerTitle, { marginTop: 20, marginBottom: 10 }]}>
            Welcome!
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 30 }}>
            Sign in to view your profile and orders
          </Text>

          <TouchableOpacity
            style={[styles.shopNowButton, { backgroundColor: '#fff', width: '100%', justifyContent: 'center', marginBottom: 15 }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.shopNowButtonText, { color: '#667eea' }]}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shopNowButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#fff', width: '100%', justifyContent: 'center' }]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.shopNowButtonText}>Create New Account</Text>
          </TouchableOpacity>
        </View>
      </PremiumBackground>
    );
  }

  return (
    <PremiumBackground>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View
            entering={FadeIn.delay(100).springify()}
            style={styles.header}
          >
            <View style={styles.headerTopRow}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
              <Text style={styles.headerTitle}>
                My Profile
              </Text>
              <View style={{ width: 28 }} />
            </View>
            <View style={styles.profileInfoContainer}>
              <View style={styles.profileImageWrapper}>
                <Image
                  key={imageKey}
                  source={
                    imageUri
                      ? { uri: imageUri }
                      : { uri: "https://via.placeholder.com/150/CCCCCC/FFFFFF/?text=Profile" }
                  }
                  style={styles.profileImage}
                />
                <TouchableOpacity
                  onPress={pickAndCropImage}
                  style={styles.cameraBadge}
                >
                  <Ionicons name="camera" size={14} color="#667eea" />
                </TouchableOpacity>
              </View>
              <Text style={styles.userName}>
                {user?.name ?? "User"}
              </Text>
              <Text style={styles.userEmail}>
                {user?.email ?? ""}
              </Text>
              <TouchableOpacity
                style={styles.editProfileBtn}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <View style={styles.contentSheet}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Recent Orders
              </Text>
              {recentOrders && recentOrders.length > 0 ? (
                <FlatList
                  horizontal
                  data={recentOrders}
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.orderCard}>
                      <Image source={{ uri: item.img }} style={styles.orderImage} />
                      <Text style={styles.orderName}>
                        {item.name}
                      </Text>
                      <Text style={styles.orderPrice}>
                        {item.price}
                      </Text>
                    </View>
                  )}
                  contentContainerStyle={{ paddingVertical: 10 }}
                />
              ) : (
                <View style={styles.emptyOrdersContainer}>
                  <Ionicons name="bag-outline" size={60} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.emptyOrdersTitle}>
                    No orders yet
                  </Text>
                  <Text style={styles.emptyOrdersSubtitle}>
                    You don't have any orders currently
                  </Text>
                  <TouchableOpacity
                    style={styles.shopNowButton}
                    onPress={() => navigation.navigate('index')}
                  >
                    <Text style={styles.shopNowButtonText}>Start Shopping Now</Text>
                    <Ionicons name="arrow-forward" size={18} color="#667eea" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Settings
              </Text>
              {menuItems.map((item, index) => (
                <View key={item.id}>{renderMenuItem({ item, index })}</View>
              ))}
            </View>
          </View>
        </ScrollView>

        <Modal
          visible={showSettings}
          animationType="slide"
          onRequestClose={() => setShowSettings(false)}
        >
          <SettingsScreen onClose={() => setShowSettings(false)} />
        </Modal>
      </View>
    </PremiumBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: '#fff' },
  profileInfoContainer: { alignItems: "center" },
  profileImageWrapper: { position: "relative", marginBottom: 15 },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userName: { fontSize: 24, fontWeight: "700", marginBottom: 4, color: '#fff' },
  userEmail: { fontSize: 14, marginBottom: 15, color: 'rgba(255,255,255,0.8)' },
  editProfileBtn: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editProfileText: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  contentSheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 50,
    minHeight: 500,
    backgroundColor: 'rgba(0,0,0,0.2)', // Glassy sheet
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, color: '#fff' },
  orderCard: {
    borderRadius: 15,
    padding: 10,
    marginRight: 15,
    alignItems: "center",
    width: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  orderName: { fontSize: 12, fontWeight: "600", color: '#fff' },
  orderPrice: { fontSize: 11, fontWeight: "bold", color: '#fff' },
  emptyOrdersContainer: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  emptyOrdersTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    color: '#fff',
  },
  emptyOrdersSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    color: 'rgba(255,255,255,0.7)',
  },
  shopNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    backgroundColor: '#fff',
  },
  shopNowButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: "500", color: '#fff' },
  menuAction: { justifyContent: "center" },
});

export default Profile;