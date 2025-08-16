import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CartContext } from './App';
import { createOrder } from './api';
import { useNavigate } from 'react-router-dom';

function Checkout() {
    const { cart, setCart, setOrderInfo } = useContext(CartContext);
    const [form, setForm] = useState({ name: '', email: '', address: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name || !form.email || !form.address) {
            setError(t('messages.allFieldsRequired'));
            return;
        }
        if (cart.length === 0) {
            setError(t('cart.emptyCart'));
            return;
        }
        setLoading(true);
        // Use current website language for email communications
        const orderData = { 
            ...form, 
            cart, 
            language: i18n.language 
        };
        const res = await createOrder(orderData);
        setLoading(false);
        if (res.orderId) {
            setOrderInfo({ orderId: res.orderId, email: form.email });
            setCart([]);
            navigate('/otp');
        } else {
            setError(res.error || t('messages.orderFailed'));
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ maxWidth: 500, width: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 36 }}>
                <h2 style={{ textAlign: 'center', color: '#2d7a2d', marginBottom: 32 }}>{t('common.checkout')}</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 22 }}>
                        <label style={{ fontWeight: 500, color: '#333' }}>{t('checkout.firstName')}:<br />
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{
                                width: '100%',
                                fontSize: 18,
                                padding: '12px 14px',
                                borderRadius: 8,
                                border: '1.5px solid #2d7a2d',
                                marginTop: 8,
                                outline: 'none',
                                boxSizing: 'border-box'
                            }} />
                        </label>
                    </div>
                    <div style={{ marginBottom: 22 }}>
                        <label style={{ fontWeight: 500, color: '#333' }}>{t('checkout.email')}:<br />
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={{
                                width: '100%',
                                fontSize: 18,
                                padding: '12px 14px',
                                borderRadius: 8,
                                border: '1.5px solid #2d7a2d',
                                marginTop: 8,
                                outline: 'none',
                                boxSizing: 'border-box'
                            }} />
                        </label>
                    </div>
                    <div style={{ marginBottom: 22 }}>
                        <label style={{ fontWeight: 500, color: '#333' }}>{t('checkout.address')}:<br />
                            <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required style={{
                                width: '100%',
                                fontSize: 18,
                                padding: '12px 14px',
                                borderRadius: 8,
                                border: '1.5px solid #2d7a2d',
                                marginTop: 8,
                                outline: 'none',
                                minHeight: 70,
                                resize: 'vertical',
                                boxSizing: 'border-box'
                            }} />
                        </label>
                    </div>
                    {error && <div style={{ color: '#ff4d4f', margin: '10px 0', textAlign: 'center' }}>{error}</div>}
                    <button type="submit" disabled={loading} style={{
                        width: '100%',
                        background: '#2d7a2d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '16px 0',
                        fontSize: 20,
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 8px #0001',
                        marginTop: 8
                    }}>{loading ? t('messages.placingOrder') : t('checkout.placeOrder')}</button>
                </form>
            </div>
        </div>
    );
}

export default Checkout; 