import React from 'react';

function OrderSuccess() {
    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ maxWidth: 400, width: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 56, color: '#2d7a2d', marginBottom: 16 }}>✔️</div>
                <h2 style={{ color: '#2d7a2d', marginBottom: 12 }}>Order Confirmed!</h2>
                <p style={{ color: '#333', fontSize: 18, marginBottom: 24 }}>Thank you for your order. Please check your email for confirmation.</p>
                <a href="/" style={{
                    display: 'inline-block',
                    background: '#2d7a2d',
                    color: '#fff',
                    borderRadius: 8,
                    padding: '12px 28px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    fontSize: 16,
                    boxShadow: '0 2px 8px #0001'
                }}>Back to Shop</a>
            </div>
        </div>
    );
}

export default OrderSuccess; 