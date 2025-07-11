import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import OrderManagement from './components/OrderManagement';
import Analytics from './components/Analytics';
import AdminManagement from './components/AdminManagement';
import { adminLogin, adminLogout, adminChangePassword } from './api';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
    const [username, setUsername] = useState(() => localStorage.getItem('admin_username'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const login = async (username, password) => {
        setLoading(true);
        setError('');
        const res = await adminLogin(username, password);
        setLoading(false);
        if (res.token) {
            setToken(res.token);
            setUsername(res.username);
            localStorage.setItem('admin_token', res.token);
            localStorage.setItem('admin_username', res.username);
            return true;
        } else {
            setError(res.error || 'Login failed');
            return false;
        }
    };

    const logout = () => {
        setToken(null);
        setUsername(null);
        adminLogout();
    };

    const changePassword = async (oldPassword, newPassword) => {
        setLoading(true);
        setError('');
        const res = await adminChangePassword(oldPassword, newPassword);
        setLoading(false);
        if (res.message) {
            return { success: true };
        } else {
            setError(res.error || 'Change password failed');
            return { success: false, error: res.error };
        }
    };

    return (
        <AuthContext.Provider value={{ token, username, login, logout, changePassword, loading, error, setError }}>
            {children}
        </AuthContext.Provider>
    );
}

function RequireAuth({ children }) {
    const { token } = useAuth();
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function Sidebar() {
    const location = useLocation();
    const { username, logout } = useAuth();
    const [showChangePw, setShowChangePw] = useState(false);
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>Rice Shop Admin</h2>
                <div style={{ fontSize: 14, marginTop: 8, color: '#bdc3c7' }}>👤 {username}</div>
            </div>
            <ul className="nav-menu">
                <li className="nav-item">
                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        📊 Dashboard
                    </Link>
                </li>
                <li className="nav-item">
                    <Link
                        to="/products"
                        className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}
                    >
                        📦 Product Management
                    </Link>
                </li>
                <li className="nav-item">
                    <Link
                        to="/orders"
                        className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
                    >
                        📋 Order Management
                    </Link>
                </li>
                <li className="nav-item">
                    <Link
                        to="/analytics"
                        className={`nav-link ${location.pathname === '/analytics' ? 'active' : ''}`}
                    >
                        📈 Analytics
                    </Link>
                </li>
                <li className="nav-item">
                    <Link
                        to="/admin-users"
                        className={`nav-link ${location.pathname === '/admin-users' ? 'active' : ''}`}
                    >
                        👥 Admin Management
                    </Link>
                </li>
            </ul>
            <div style={{ marginTop: 40, padding: '0 20px' }}>
                <button className="btn btn-primary" style={{ width: '100%', marginBottom: 10 }} onClick={() => setShowChangePw(true)}>
                    Change Password
                </button>
                <button className="btn btn-danger" style={{ width: '100%' }} onClick={logout}>
                    Logout
                </button>
            </div>
            {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
        </div>
    );
}

function ChangePasswordModal({ onClose }) {
    const { changePassword, loading, error, setError } = useAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [success, setSuccess] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await changePassword(oldPassword, newPassword);
        if (res.success) {
            setSuccess(true);
            setTimeout(onClose, 1500);
        }
    };
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ minWidth: 320, maxWidth: 400 }}>
                <h3>Change Password</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Old Password</label>
                        <input type="password" className="form-input" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input type="password" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                    </div>
                    {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
                    {success && <div style={{ color: 'green', marginBottom: 10 }}>Password changed!</div>}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="submit" className="btn btn-success" disabled={loading}>Change</button>
                        <button type="button" className="btn btn-danger" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function LoginPage() {
    const { login, loading, error, setError } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const ok = await login(username, password);
        if (ok) setRedirect(true);
    };
    if (redirect) return <Navigate to="/" replace />;
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
            <div className="card" style={{ minWidth: 320, maxWidth: 400 }}>
                <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Admin Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input type="text" className="form-input" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="*" element={
                        <RequireAuth>
                            <div className="admin-container">
                                <Sidebar />
                                <div className="main-content">
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/products" element={<ProductManagement />} />
                                        <Route path="/orders" element={<OrderManagement />} />
                                        <Route path="/analytics" element={<Analytics />} />
                                        <Route path="/admin-users" element={<AdminManagement />} />
                                    </Routes>
                                </div>
                            </div>
                        </RequireAuth>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App; 