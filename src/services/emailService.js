/**
 * Email Service using EmailJS
 * Allows sending "Real" emails from the client side without a backend.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://www.emailjs.com/ and create a free account.
 * 2. Add a new Email Service (e.g., Gmail). Copy the "Service ID".
 * 3. Create an Email Template.
 *    - Subject: "Your Verification Code"
 *    - Content: "Your code is: {{otp_code}}"
 *    - Copy the "Template ID".
 * 4. Go to Account > API Keys. Copy the "Public Key".
 * 5. Paste these values below.
 */

// REPLACE THESE WITH YOUR ACTUAL KEYS FROM EMAILJS DASHBOARD
const EMAILJS_CONFIG = {
    SERVICE_ID: 'YOUR_SERVICE_ID', // e.g., 'service_gmail'
    TEMPLATE_ID: 'YOUR_TEMPLATE_ID', // e.g., 'template_otp'
    PUBLIC_KEY: 'YOUR_PUBLIC_KEY', // e.g., 'user_123456789'
};

/**
 * Send OTP Email via EmailJS API
 * @param {string} to_email 
 * @param {string} code 
 */
export const sendOTPEmail = async (to_email, code) => {
    // Validation
    if (EMAILJS_CONFIG.SERVICE_ID === 'YOUR_SERVICE_ID') {
        throw new Error('EmailJS keys are not configured. Please add them in src/services/emailService.js');
    }

    try {
        const data = {
            service_id: EMAILJS_CONFIG.SERVICE_ID,
            template_id: EMAILJS_CONFIG.TEMPLATE_ID,
            user_id: EMAILJS_CONFIG.PUBLIC_KEY,
            template_params: {
                to_email: to_email,
                otp_code: code,
                // Add any other template params you defined in EmailJS
            }
        };

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            console.log('✅ Email sent successfully');
            return { success: true };
        } else {
            const errorText = await response.text();
            console.error('❌ EmailJS Error:', errorText);
            throw new Error('Failed to send email: ' + errorText);
        }
    } catch (error) {
        console.error('Email Service Error:', error);
        throw error;
    }
};

export default {
    sendOTPEmail
};
