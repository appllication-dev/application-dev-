import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { RevolutionTheme } from '../../../src/theme/RevolutionTheme';
import { useTranslation } from '../../../src/hooks/useTranslation';
import { useSettings } from '../../../src/context/SettingsContext';

const TermsOfServiceScreen = () => {
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
                { title: '1. Acceptance of Terms', text: 'By accessing or using our application, you agree to be bound by these Terms of Service. If you do not agree, please do not use the app.' },
                { title: '2. User Accounts', text: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.' },
                { title: '3. Orders and Payments', text: 'All orders are subject to availability and confirmation of the order price. We reserve the right to refuse or cancel any order for any reason. Payment must be received prior to shipping.' },
                { title: '4. Shipping and Returns', text: 'Shipping times are estimates and not guaranteed. Please refer to our Return Policy for information on returns and exchanges. Items must be in original condition.' },
                { title: '5. Limitation of Liability', text: 'We shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the app.' },
                { title: '6. Governing Law', text: 'These Terms shall be governed by and construed in accordance with the laws of your jurisdiction.' },
                { title: '7. Contact Us', text: 'If you have any questions about these Terms, please contact us at support@example.com.' },
            ]
        },
        ar: {
            lastUpdated: 'آخر تحديث: ديسمبر 2024',
            sections: [
                { title: '1. قبول الشروط', text: 'بالوصول إلى تطبيقنا أو استخدامه، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق، يرجى عدم استخدام التطبيق.' },
                { title: '2. حسابات المستخدمين', text: 'أنت مسؤول عن الحفاظ على سرية بيانات اعتماد حسابك وعن جميع الأنشطة التي تتم باستخدام حسابك. يجب عليك إخطارنا فوراً بأي استخدام غير مصرح به.' },
                { title: '3. الطلبات والمدفوعات', text: 'جميع الطلبات تخضع للتوفر وتأكيد سعر الطلب. نحتفظ بالحق في رفض أو إلغاء أي طلب لأي سبب. يجب استلام الدفع قبل الشحن.' },
                { title: '4. الشحن والإرجاع', text: 'أوقات الشحن تقديرية وغير مضمونة. يرجى الرجوع إلى سياسة الإرجاع للحصول على معلومات حول الإرجاع والاستبدال. يجب أن تكون العناصر بحالتها الأصلية.' },
                { title: '5. تحديد المسؤولية', text: 'لن نكون مسؤولين عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية ناشئة عن أو فيما يتعلق باستخدامك للتطبيق.' },
                { title: '6. القانون الحاكم', text: 'يخضع تفسير هذه الشروط وتنفيذها لقوانين نطاق اختصاصك القضائي.' },
                { title: '7. اتصل بنا', text: 'إذا كانت لديك أي أسئلة حول هذه الشروط، يرجى الاتصال بنا على support@example.com.' },
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
                <Text style={[styles.headerTitle, { color: textColor }]}>{t('termsOfService')}</Text>
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

export default TermsOfServiceScreen;
