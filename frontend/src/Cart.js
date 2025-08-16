import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CartContext } from './App';
import { useNavigate } from 'react-router-dom';

function Cart() {
    const { cart, setCart } = useContext(CartContext);
    const navigate = useNavigate();
    const { t } = useTranslation();

    function updateQuantity(productId, quantity) {
        setCart(cart.map(item => item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item));
    }

    function removeItem(productId) {
        setCart(cart.filter(item => item.productId !== productId));
    }

    function formatMMK(amount) {
        return amount.toLocaleString('en-US') + ' MMK';
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div style={{ maxWidth: 700, margin: '40px auto', background: '#f8fafc', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 32 }}>
            <h2 style={{ textAlign: 'center', color: '#2d7a2d', marginBottom: 32 }}>{t('cart.cartItems')}</h2>
            {cart.length === 0 ? <div style={{ textAlign: 'center', color: '#888' }}>{t('cart.emptyCart')}</div> : (
                <>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {cart.map(item => (
                            <li key={item.productId} style={{
                                marginBottom: 20,
                                border: '1px solid #e0e0e0',
                                padding: 18,
                                borderRadius: 10,
                                background: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 1px 4px #0001'
                            }}>
                                <div>
                                    <b style={{ fontSize: 18 }}>{item.name}</b>
                                    <div style={{ color: '#2d7a2d', fontWeight: 500, marginTop: 4 }}>{formatMMK(item.price)}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <input type="number" min="1" value={item.quantity} onChange={e => updateQuantity(item.productId, parseInt(e.target.value))} style={{ width: 60, margin: '0 12px', padding: 6, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }} />
                                    <span style={{ fontWeight: 500, marginRight: 16 }}>= {formatMMK(item.price * item.quantity)}</span>
                                    <button onClick={() => removeItem(item.productId)} style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontWeight: 500 }}>{t('common.removeFromCart')}</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div style={{
                        fontWeight: 'bold',
                        margin: '32px 0 16px 0',
                        fontSize: 22,
                        textAlign: 'right',
                        color: '#2d7a2d',
                        borderTop: '1px solid #e0e0e0',
                        paddingTop: 16
                    }}>{t('common.total')}: {formatMMK(total)}</div>
                    <div style={{ textAlign: 'right' }}>
                        <button onClick={() => navigate('/checkout')} style={{ background: '#2d7a2d', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 32px', fontSize: 18, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}>{t('cart.proceedToCheckout')}</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Cart; 