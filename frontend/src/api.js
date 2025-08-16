const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000/api';

// Helper function to get current language
function getCurrentLanguage() {
    return localStorage.getItem('userLanguage') || 'en';
}

// Helper function to create headers with language
function createHeaders() {
    const currentLanguage = getCurrentLanguage();
    return {
        'Content-Type': 'application/json',
        'X-User-Language': currentLanguage
    };
}

export async function getProducts() {
    const res = await fetch(`${API_BASE}/products`);
    return res.json();
}

export async function createOrder(order) {
    const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(order),
    });
    return res.json();
}

export async function confirmOrder(data) {
    const res = await fetch(`${API_BASE}/orders/confirm`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function resendOTP(data) {
    const res = await fetch(`${API_BASE}/orders/resend-otp`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(data),
    });
    return res.json();
}

// Language preference functions
export async function setLanguagePreference(email, language) {
    const res = await fetch(`${API_BASE}/preferences/language`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ email, language }),
    });
    return res.json();
}

export async function getLanguagePreference(email) {
    const res = await fetch(`${API_BASE}/preferences/language/${encodeURIComponent(email)}`);
    return res.json();
}

// Test function to verify language detection
export async function testLanguageDetection() {
    const res = await fetch(`${API_BASE}/test/language-detection`, {
        headers: createHeaders()
    });
    return res.json();
} 