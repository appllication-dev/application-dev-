import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { RevolutionTheme } from '../../../src/theme/RevolutionTheme';
import { useTranslation } from '../../../src/hooks/useTranslation';
import { useSettings } from '../../../src/context/SettingsContext';

const PrivacyPolicyScreen = () => {
    const router = useRouter();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { language } = useSettings();
    const isDark = theme === 'dark';
    const isArabic = language === 'ar';

    const bgColor = isDark ? RevolutionTheme.colors.background : '#FFF';
    const textColor = isDark ? '#FFF' : '#333';
    const mutedColor = isDark ? '#AAA' : '#666';

    const content = {
        en: {
            lastUpdated: 'Last Updated: December 2024',
            sections: [
                { title: '1. Information We Collect', text: 'We collect information you provide directly, such as when you create an account, make a purchase, or contact us. This may include your name, email address, shipping address, and payment information.' },
                { title: '2. How We Use Your Information', text: 'We use your information to process orders, communicate with you, improve our services, and personalize your experience. We may also use it to send promotional materials if you have opted in.' },
                { title: '3. Data Security', text: 'We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.' },
                { title: '4. Third-Party Services', text: 'We may share your information with third-party service providers who assist us in operating our app, such as payment processors and shipping carriers. These parties are obligated to keep your information confidential.' },
                { title: '5. Your Rights', text: 'You have the right to access, correct, or delete your personal data. Contact us at support@example.com to exercise these rights.' },
                { title: '6. Contact Us', text: 'If you have any questions about this Privacy Policy, please contact us at support@example.com.' },
            ]
        },
        ar: {
            lastUpdated: 'آخر تحديث: ديسمبر 2024',
            sections: [
                { title: '1. المعلومات التي نجمعها', text: 'نجمع المعلومات التي تقدمها مباشرة، مثل عند إنشاء حساب أو إجراء عملية شراء أو الاتصال بنا. قد تشمل هذه المعلومات اسمك وعنوان بريدك الإلكتروني وعنوان الشحن ومعلومات الدفع.' },
                { title: '2. كيف نستخدم معلوماتك', text: 'نستخدم معلوماتك لمعالجة الطلبات والتواصل معك وتحسين خدماتنا وتخصيص تجربتك. قد نستخدمها أيضًا لإرسال مواد ترويجية إذا كنت قد اشتركت في ذلك.' },
                { title: '3. أمن البيانات', text: 'نطبق إجراءات أمنية قياسية لحماية معلوماتك الشخصية. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت آمنة بنسبة 100%.' },
                { title: '4. خدمات الطرف الثالث', text: 'قد نشارك معلوماتك مع مزودي خدمات من جهات خارجية يساعدوننا في تشغيل التطبيق، مثل معالجي الدفع وشركات الشحن. هذه الأطراف ملزمة بالحفاظ على سرية معلوماتك.' },
                { title: '5. حقوقك', text: 'لديك الحق في الوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها. اتصل بنا على support@example.com لممارسة هذه الحقوق.' },
                { title: '6. اتصل بنا', text: 'إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا على support@example.com.' },
            ]
        }
    };

    const currentContent = content[isArabic ? 'ar' : 'en'];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Feather name={isArabic ? "arrow-right" : "arrow-left"} size={24} color={textColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>{t('privacyPolicy')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.lastUpdated, { color: mutedColor, textAlign: isArabic ? 'right' : 'center' }]}>{currentContent.lastUpdated}</Text>

                {currentContent.sections.map((section, index) => (
                    <View key={index}>
                        <Text style={[styles.sectionTitle, { color: textColor, textAlign: isArabic ? 'right' : 'left' }]}>{section.title}</Text>
                        <Text style={[styles.paragraph, { color: mutedColor, textAlign: isArabic ? 'right' : 'left' }]}>{section.text}</Text>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { padding: 20, paddingBottom: 50 },
    lastUpdated: { fontSize: 12, marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 10 },
    paragraph: { fontSize: 14, lineHeight: 22 },
});

export default PrivacyPolicyScreen;
