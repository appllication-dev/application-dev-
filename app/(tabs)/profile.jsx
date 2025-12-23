/**
 * Profile Screen - Kataraa
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const menuItems = [
    { icon: 'receipt-outline', title: 'طلباتي', subtitle: 'تتبع طلباتك' },
    { icon: 'location-outline', title: 'عناويني', subtitle: 'إدارة عناوين التوصيل' },
    { icon: 'card-outline', title: 'طرق الدفع', subtitle: 'البطاقات المحفوظة' },
    { icon: 'notifications-outline', title: 'الإشعارات', subtitle: 'إعدادات الإشعارات' },
    { icon: 'help-circle-outline', title: 'المساعدة', subtitle: 'الأسئلة الشائعة' },
    { icon: 'information-circle-outline', title: 'عن التطبيق', subtitle: 'الإصدار 1.0.0' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <SafeAreaView>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#667eea" />
            </View>
            <Text style={styles.name}>زائر</Text>
            <Text style={styles.email}>مرحباً بك في كتارا</Text>
            
            <TouchableOpacity style={styles.loginBtn}>
              <Text style={styles.loginBtnText}>تسجيل الدخول</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={24} color="#667eea" />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-back" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </ScrollView>
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
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    marginLeft: 15,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'right',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 3,
    textAlign: 'right',
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
});
