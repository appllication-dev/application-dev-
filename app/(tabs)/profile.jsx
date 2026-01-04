/**
 * 👤 Profile Screen - Kataraa
 * With Language & Currency Selectors
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency, AVAILABLE_CURRENCIES } from '../context/CurrencyContext';
import { COLORS, SHADOWS } from '../theme/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { t, language, toggleLanguage, isArabic } = useLanguage();
  const { currency, currencyInfo, changeCurrency } = useCurrency();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const menuItems = [
    { icon: 'receipt-outline', title: t('myOrders'), subtitle: isArabic ? 'تتبع طلباتك' : 'Track your orders', route: null },
    { icon: 'location-outline', title: isArabic ? 'عناويني' : 'Addresses', subtitle: isArabic ? 'إدارة عناوين التوصيل' : 'Manage delivery addresses', route: null },
    { icon: 'card-outline', title: isArabic ? 'طرق الدفع' : 'Payment Methods', subtitle: isArabic ? 'البطاقات المحفوظة' : 'Saved cards', route: null },
    { icon: 'notifications-outline', title: isArabic ? 'الإشعارات' : 'Notifications', subtitle: isArabic ? 'إعدادات الإشعارات' : 'Notification settings', route: null },
    { icon: 'help-circle-outline', title: isArabic ? 'المساعدة' : 'Help', subtitle: isArabic ? 'الأسئلة الشائعة' : 'FAQ', route: null },
    { icon: 'stats-chart-outline', title: t('dashboard'), subtitle: isArabic ? 'لوحة التحكم' : 'Admin Panel', route: '/admin' },
  ];

  const handleCurrencySelect = (code) => {
    changeCurrency(code);
    setShowCurrencyModal(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <SafeAreaView>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#667eea" />
            </View>
            <Text style={styles.name}>{isArabic ? 'زائر' : 'Guest'}</Text>
            <Text style={styles.email}>{isArabic ? 'مرحباً بك في كتارا' : 'Welcome to Kataraa'}</Text>

            <TouchableOpacity style={styles.loginBtn}>
              <Text style={styles.loginBtnText}>{isArabic ? 'تسجيل الدخول' : 'Login'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.menuContainer}>
        {/* Language Toggle */}
        <TouchableOpacity style={styles.languageCard} onPress={toggleLanguage}>
          <View style={styles.languageLeft}>
            <View style={styles.languageIcon}>
              <Ionicons name="language" size={24} color="#667eea" />
            </View>
            <View>
              <Text style={styles.languageTitle}>{t('language')}</Text>
              <Text style={styles.languageValue}>
                {language === 'ar' ? 'العربية 🇸🇦' : 'English 🇬🇧'}
              </Text>
            </View>
          </View>
          <View style={styles.languageToggle}>
            <Text style={[styles.langOption, language === 'ar' && styles.langActive]}>عربي</Text>
            <Text style={styles.langDivider}>|</Text>
            <Text style={[styles.langOption, language === 'en' && styles.langActive]}>EN</Text>
          </View>
        </TouchableOpacity>

        {/* Currency Selector */}
        <TouchableOpacity style={styles.languageCard} onPress={() => setShowCurrencyModal(true)}>
          <View style={styles.languageLeft}>
            <View style={[styles.languageIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="cash-outline" size={24} color="#FF9800" />
            </View>
            <View>
              <Text style={styles.languageTitle}>{isArabic ? 'العملة' : 'Currency'}</Text>
              <Text style={styles.languageValue}>
                {currencyInfo.flag} {currencyInfo.code} - {isArabic ? currencyInfo.name : currencyInfo.nameEn}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-down" size={20} color="#999" />
        </TouchableOpacity>

        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => item.route && router.push(item.route)}
          >
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={24} color="#667eea" />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name={isArabic ? "chevron-back" : "chevron-forward"} size={20} color="#ccc" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{isArabic ? 'اختر العملة' : 'Select Currency'}</Text>
              <View style={{ width: 24 }} />
            </View>

            {Object.values(AVAILABLE_CURRENCIES).map((curr) => (
              <TouchableOpacity
                key={curr.code}
                style={[
                  styles.currencyOption,
                  currency === curr.code && styles.currencyOptionActive
                ]}
                onPress={() => handleCurrencySelect(curr.code)}
              >
                <Text style={styles.currencyFlag}>{curr.flag}</Text>
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencyCode}>{curr.code}</Text>
                  <Text style={styles.currencyName}>{isArabic ? curr.name : curr.nameEn}</Text>
                </View>
                {currency === curr.code && (
                  <Ionicons name="checkmark-circle" size={24} color="#667eea" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 5,
  },
  loginBtn: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  menuContainer: {
    padding: 16,
  },
  languageCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.sm,
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(102,126,234,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  languageValue: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  langOption: {
    fontSize: 12,
    color: '#999',
  },
  langActive: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  langDivider: {
    color: '#ddd',
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(102,126,234,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    marginHorizontal: 15,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 3,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    marginBottom: 40,
    padding: 16,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  currencyOptionActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  currencyFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  currencyName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
