const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000/api';

export async function getProducts() {
    const res = await fetch(`${API_BASE}/products`);
    return res.json();
}

export async function createOrder(order) {
    const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
    });
    return res.json();
}

export async function confirmOrder(data) {
    const res = await fetch(`${API_BASE}/orders/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function resendOTP(data) {
    const res = await fetch(`${API_BASE}/orders/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
} 