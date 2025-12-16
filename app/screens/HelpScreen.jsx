import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useTranslation } from '../../src/hooks/useTranslation';
import { useTheme } from '../../src/context/ThemeContext';
import PremiumBackground from '../components/PremiumBackground';
import Constants from 'expo-constants';

const HelpScreen = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors, isDark } = useTheme();

    const openLink = (url) => {
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                console.log("Don't know how to open URI: " + url);
            }
        });
    };

    const SocialButton = ({ icon, label, color, onPress }) => (
        <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onPress}
        >
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <FontAwesome name={icon} size={24} color={color} />
            </View>
            <Text style={[styles.socialLabel, { color: colors.text }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <PremiumBackground>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.card }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('helpSupport')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* App Info Section */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="bag-handle" size={60} color={colors.primary} />
                    </View>
                    <Text style={[styles.appName, { color: colors.text }]}>{t('shopName')}</Text>
                    <Text style={[styles.version, { color: colors.textSecondary }]}>{t('version')} 1.0.0</Text>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                        {t('onboardingDesc1')}
                    </Text>
                </View>

                {/* Contact Section */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('contactUs')}</Text>

                <View style={styles.socialContainer}>
                    <SocialButton
                        icon="instagram"
                        label={t('instagram')}
                        color="#E1306C"
                        onPress={() => openLink('https://www.instagram.com/mohamed____10m?igsh=aGI5aDM4aGxqeHUy')}
                    />
                    <SocialButton
                        icon="twitter"
                        label="X (Twitter)"
                        color="#1DA1F2"
                        onPress={() => openLink('https://x.com/motaoukkel29253')}
                    />
                    <SocialButton
                        icon="whatsapp"
                        label={t('whatsapp')}
                        color="#25D366"
                        onPress={() => openLink('https://wa.me/212772987053')}
                    />
                    <SocialButton
                        icon="envelope"
                        label={t('emailSupport')}
                        color="#EA4335"
                        onPress={() => openLink('mailto:support@funnyshop.com')}
                    />
                </View>

                {/* FAQ / Guide Section Placeholder */}
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>{t('appGuide')}</Text>
                <TouchableOpacity style={[styles.guideCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="book-outline" size={24} color={colors.primary} />
                    <View style={styles.guideText}>
                        <Text style={[styles.guideTitle, { color: colors.text }]}>{t('aboutUs')}</Text>
                        <Text style={[styles.guideSubtitle, { color: colors.textSecondary }]}>{t('onboardingDesc2')}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

            </ScrollView>
        </PremiumBackground>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
        paddingBottom: 50,
    },
    section: {
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 30,
    },
    logoContainer: {
        marginBottom: 15,
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    appName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    version: {
        fontSize: 14,
        marginBottom: 15,
    },
    description: {
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15,
        marginLeft: 5,
    },
    socialContainer: {
        gap: 15,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    socialLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    guideCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
    guideText: {
        flex: 1,
        marginLeft: 15,
    },
    guideTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    guideSubtitle: {
        fontSize: 12,
    }
});

export default HelpScreen;
