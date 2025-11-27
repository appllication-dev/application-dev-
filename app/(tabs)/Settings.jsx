
import React from 'react';
import { View, Text, Switch, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import PremiumBackground from '../components/PremiumBackground';
import { useSettings } from '../../src/context/SettingsContext';
import { useRouter } from 'expo-router';

export default function SettingsScreen({ onClose }) {
    const { colors, toggleTheme, theme } = useTheme();
    const { clearUser } = useAuth();
    const router = useRouter();
    const { notifications, sounds, vibration, language, toggleNotifications, toggleSounds, toggleVibration, changeLanguage } = useSettings();

    const handleLogout = () => {
        clearUser();
        router.replace('/login');
    };

    const handleRateApp = () => {
        alert("Thanks for rating the app!");
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.profileBackground }]}>
            <ScrollView contentContainerStyle={styles.content}>

                {/* Header with back button */}
                {onClose && (
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={28} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
                        <View style={{ width: 28 }} />
                    </View>
                )}

                {!onClose && <Text style={[styles.title, { color: colors.text }]}>Settings</Text>}

                {/* Appearance */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>

                    <View style={styles.item}>
                        <Text style={[styles.label, { color: colors.text }]}>Dark Mode</Text>
                        <Switch
                            trackColor={{ false: '#aaa', true: colors.profilePrimary }}
                            thumbColor="#fff"
                            onValueChange={toggleTheme}
                            value={theme === 'dark'}
                        />
                    </View>
                </View>

                {/* Notifications */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications & Sounds</Text>

                    <View style={styles.item}>
                        <Text style={[styles.label, { color: colors.text }]}>Notifications</Text>
                        <Switch
                            trackColor={{ false: '#aaa', true: colors.profilePrimary }}
                            thumbColor="#fff"
                            onValueChange={toggleNotifications}
                            value={notifications}
                        />
                    </View>

                    <View style={styles.item}>
                        <Text style={[styles.label, { color: colors.text }]}>Sounds</Text>
                        <Switch
                            trackColor={{ false: '#aaa', true: colors.profilePrimary }}
                            thumbColor="#fff"
                            onValueChange={toggleSounds}
                            value={sounds}
                        />
                    </View>

                    <View style={styles.item}>
                        <Text style={[styles.label, { color: colors.text }]}>Vibration</Text>
                        <Switch
                            trackColor={{ false: '#aaa', true: colors.profilePrimary }}
                            thumbColor="#fff"
                            onValueChange={toggleVibration}
                            value={vibration}
                        />
                    </View>
                </View>

                {/* Language */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Language</Text>

                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={language}
                            style={{ color: colors.text }}
                            dropdownIconColor={colors.text}
                            onValueChange={(value) => changeLanguage(value)}
                        >
                            <Picker.Item label="Arabic" value="ar" />
                            <Picker.Item label="English" value="en" />
                        </Picker>
                    </View>
                </View>

                {/* Rate App */}
                <TouchableOpacity style={styles.rateBtn} onPress={handleRateApp}>
                    <Text style={styles.rateText}>⭐ Rate App</Text>
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },

    backButton: {
        padding: 5,
    },

    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    section: {
        marginBottom: 25,
        padding: 15,
        borderRadius: 12,
        backgroundColor: '#ffffff15',
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
    },

    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },

    label: { fontSize: 18 },

    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 10,
    },

    rateBtn: {
        marginTop: 20,
        paddingVertical: 12,
        backgroundColor: '#1976D2',
        borderRadius: 10,
        alignItems: 'center',
    },

    rateText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },

    logoutBtn: {
        marginTop: 25,
        paddingVertical: 12,
        backgroundColor: '#E53935',
        borderRadius: 10,
        alignItems: 'center',
    },

    logoutText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
