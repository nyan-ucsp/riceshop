import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CartContext } from './App';
import { confirmOrder, resendOTP } from './api';
import { useNavigate } from 'react-router-dom';

function OTPConfirmation() {
    const { orderInfo, setOrderInfo } = useContext(CartContext);
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60); // Start with 60 seconds
    const [resendLoading, setResendLoading] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    if (!orderInfo) {
        return <div>{t('messages.noOrderToConfirm')}</div>;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        const res = await confirmOrder({ orderId: orderInfo.orderId, email: orderInfo.email, code });
        setLoading(false);
        if (res.message) {
            setOrderInfo(null);
            navigate('/success');
        } else {
            setError(res.error || t('messages.confirmOrderFailed'));
        }
    }

    async function handleResendOTP() {
        setResendLoading(true);
        try {
            const data = await resendOTP({
                orderId: orderInfo.orderId,
                email: orderInfo.email
            });
            if (data.message) {
                setError('');
                setResendTimer(60);
            } else {
                setError(data.error || t('messages.resendOTPFailed'));
            }
        } catch (err) {
            setError(t('messages.resendOTPError'));
        }
        setResendLoading(false);
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ maxWidth: 400, width: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: 32 }}>
                <h2 style={{ color: '#2d7a2d', textAlign: 'center', marginBottom: 24 }}>{t('otp.title')}</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: 500, color: '#333' }}>{t('otp.otpCode')}:<br />
                            <input value={code} onChange={e => setCode(e.target.value)} required style={{
                                width: '100%',
                                fontSize: 24,
                                letterSpacing: 8,
                                padding: '12px 16px',
                                borderRadius: 8,
                                border: '1.5px solid #2d7a2d',
                                marginTop: 8,
                                textAlign: 'center',
                                outline: 'none',
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
                        padding: '14px 0',
                        fontSize: 18,
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 8px #0001',
                        marginTop: 8
                    }}>{loading ? t('messages.verifying') : t('otp.verifyOtp')}</button>
                </form>

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <button
                        onClick={handleResendOTP}
                        disabled={resendTimer > 0 || resendLoading}
                        style={{
                            background: resendTimer > 0 ? '#808080' : '#87CEEB', // Grey when disabled, light blue when enabled
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '10px 20px',
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: (resendTimer > 0 || resendLoading) ? 'not-allowed' : 'pointer',
                            opacity: resendTimer > 0 ? 0.7 : 1,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {resendLoading ? t('messages.sending') :
                            resendTimer > 0 ? `${t('otp.resendOtp')} ${resendTimer}s` : t('otp.resendOtp')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OTPConfirmation; 