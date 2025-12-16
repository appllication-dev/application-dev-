
export const ARAB_LOCATIONS = {
    en: {
        "Morocco": ["Casablanca", "Rabat", "Marrakech", "Fes", "Tangier", "Agadir", "Meknes", "Oujda"],
        "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Tabuk"],
        "Egypt": ["Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez"],
        "UAE": ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras Al Khaimah"],
        "Qatar": ["Doha", "Al Rayyan", "Al Wakrah", "Al Khor"],
        "Kuwait": ["Kuwait City", "Al Ahmadi", "Hawalli", "Salmiya"],
        "Bahrain": ["Manama", "Riffa", "Muharraq", "Hamad Town"],
        "Oman": ["Muscat", "Salalah", "Sohar", "Nizwa"],
        "Jordan": ["Amman", "Zarqa", "Irbid", "Aqaba"],
        "Lebanon": ["Beirut", "Tripoli", "Sidon", "Tyre"],
        "Algeria": ["Algiers", "Oran", "Constantine", "Annaba"],
        "Tunisia": ["Tunis", "Sfax", "Sousse", "Kairouan"],
        "Iraq": ["Baghdad", "Basra", "Mosul", "Erbil"]
    },
    ar: {
        "المغرب": ["الدار البيضاء", "الرباط", "مراكش", "فاس", "طنجة", "أكادير", "مكناس", "وجدة"],
        "السعودية": ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "تبوك"],
        "مصر": ["القاهرة", "الإسكندرية", "الجيزة", "شبرا الخيمة", "بورسعيد", "السويس"],
        "الإمارات": ["دبي", "أبو ظبي", "الشارقة", "العين", "عجمان", "رأس الخيمة"],
        "قطر": ["الدوحة", "الريان", "الوكرة", "الخور"],
        "الكويت": ["مدينة الكويت", "الأحمدي", "حولي", "السالمية"],
        "البحرين": ["المنامة", "الرفاع", "المحرق", "مدينة حمد"],
        "عمان": ["مسقط", "صلالة", "صحار", "نزوى"],
        "الأردن": ["عمان", "الزرقاء", "إربد", "العقبة"],
        "لبنان": ["بيروت", "طرابلس", "صيدا", "صور"],
        "الجزائر": ["الجزائر", "وهران", "قسنطينة", "عنابة"],
        "تونس": ["تونس", "صفاقس", "سوسة", "القيروان"],
        "العراق": ["بغداد", "البصرة", "الموصل", "أربيل"]
    }
};

export const getLocalizedLocations = (locale) => {
    // Fallback to English if locale not found or partial match
    const lang = locale?.startsWith('ar') ? 'ar' : 'en';
    return ARAB_LOCATIONS[lang];
};
