/**
 * useTranslation Hook
 * Provides easy access to translated strings based on current language
 * 
 * Usage:
 * const { t, language, isRTL } = useTranslation();
 * <Text>{t('home')}</Text>
 * <Text>{t('foundResults', { count: 5 })}</Text>
 */

import { useSettings } from '../context/SettingsContext';
import { translations } from '../i18n/translations';

export const useTranslation = () => {
    const { language } = useSettings();

    /**
     * Translate a key to the current language
     * @param {string} key - The translation key
     * @param {Object} params - Optional parameters to replace in the string
     * @returns {string} - The translated string
     */
    const t = (key, params = {}) => {
        // Get translation for current language, fallback to English, then to key
        let text = translations[language]?.[key] || translations['en']?.[key] || key;

        // Replace placeholders like {count}, {name}, etc.
        Object.keys(params).forEach(param => {
            text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
        });

        return text;
    };

    /**
     * Check if current language is RTL (Right-to-Left)
     */
    const isRTL = language === 'ar';

    /**
     * Get text alignment based on language direction
     */
    const textAlign = isRTL ? 'right' : 'left';

    /**
     * Get flex direction based on language direction
     */
    const flexDirection = isRTL ? 'row-reverse' : 'row';

    return {
        t,
        language,
        isRTL,
        textAlign,
        flexDirection,
        translations: translations[language] || translations['en']
    };
};

export default useTranslation;
