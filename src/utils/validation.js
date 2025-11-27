// وظائف التحقق من صحة البيانات

// التحقق من البريد الإلكتروني
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        return { isValid: false, error: 'البريد الإلكتروني مطلوب' };
    }
    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'البريد الإلكتروني غير صالح' };
    }
    return { isValid: true };
};

// التحقق من كلمة المرور
export const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, error: 'كلمة المرور مطلوبة' };
    }
    if (password.length < 6) {
        return { isValid: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
    }
    return { isValid: true };
};

// التحقق من قوة كلمة المرور
export const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '' };

    let strength = 0;

    // الطول
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;

    // أحرف كبيرة وصغيرة
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;

    // أرقام
    if (/\d/.test(password)) strength += 15;

    // رموز خاصة
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 10;

    let label = '';
    let color = '';

    if (strength < 30) {
        label = 'ضعيفة';
        color = '#EF4444';
    } else if (strength < 60) {
        label = 'متوسطة';
        color = '#F59E0B';
    } else if (strength < 80) {
        label = 'جيدة';
        color = '#10B981';
    } else {
        label = 'قوية جداً';
        color = '#059669';
    }

    return { strength, label, color };
};

// التحقق من تطابق كلمات المرور
export const validatePasswordMatch = (password, confirmPassword) => {
    if (!confirmPassword) {
        return { isValid: false, error: 'تأكيد كلمة المرور مطلوب' };
    }
    if (password !== confirmPassword) {
        return { isValid: false, error: 'كلمات المرور غير متطابقة' };
    }
    return { isValid: true };
};

// التحقق من الاسم
export const validateName = (name) => {
    if (!name) {
        return { isValid: false, error: 'الاسم مطلوب' };
    }
    if (name.length < 2) {
        return { isValid: false, error: 'الاسم يجب أن يكون حرفين على الأقل' };
    }
    if (name.length > 50) {
        return { isValid: false, error: 'الاسم طويل جداً' };
    }
    return { isValid: true };
};

// التحقق من رقم الهاتف
export const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phone) {
        return { isValid: false, error: 'رقم الهاتف مطلوب' };
    }
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        return { isValid: false, error: 'رقم الهاتف غير صالح' };
    }
    return { isValid: true };
};
