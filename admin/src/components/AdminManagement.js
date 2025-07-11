import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { updateAdminUsername, resetAdminPassword } from '../api';

function AdminManagement() {
    const { token, username } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [success, setSuccess] = useState('');
    const [search, setSearch] = useState('');
    const [editId, setEditId] = useState(null);
    const [editUsername, setEditUsername] = useState('');
    const [resetId, setResetId] = useState(null);
    const [resetPassword, setResetPassword] = useState('');

    const fetchAdmins = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setAdmins(data);
        } catch (e) {
            setError('Failed to load admins');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAdmins();
        // eslint-disable-next-line
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ username: newUsername, password: newPassword }),
            });
            const data = await res.json();
            if (data.error) {
                setError(data.error);
            } else {
                setSuccess('Admin added!');
                setShowAdd(false);
                setNewUsername('');
                setNewPassword('');
                fetchAdmins();
            }
        } catch (e) {
            setError('Failed to add admin');
        }
    };

    const handleDelete = async (id) => {
        setError('');
        setSuccess('');
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.error) {
                setError(data.error);
            } else {
                setSuccess('Admin deleted!');
                setDeletingId(null);
                fetchAdmins();
            }
        } catch (e) {
            setError('Failed to delete admin');
        }
    };

    const canDelete = (admin) => {
        if (admins.length <= 1) return false;
        if (admin.username === username) return false;
        return true;
    };

    const filteredAdmins = admins.filter(a => a.username.toLowerCase().includes(search.toLowerCase()));

    const handleEdit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const res = await updateAdminUsername(token, editId, editUsername);
        if (res.error) setError(res.error);
        else {
            setSuccess('Username updated!');
            setEditId(null);
            fetchAdmins();
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const res = await resetAdminPassword(token, resetId, resetPassword);
        if (res.error) setError(res.error);
        else {
            setSuccess('Password reset!');
            setResetId(null);
            setResetPassword('');
        }
    };

    return (
        <div className="card" style={{ maxWidth: 600, margin: '40px auto', padding: 32 }}>
            <h2 style={{ marginBottom: 24 }}>Admin Management</h2>
            {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}
            <input
                type="text"
                className="form-input"
                placeholder="Search by username..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ marginBottom: 16, width: '100%' }}
            />
            <button className="btn btn-primary" style={{ marginBottom: 20 }} onClick={() => setShowAdd(!showAdd)}>
                {showAdd ? 'Cancel' : 'Add Admin'}
            </button>
            {showAdd && (
                <form onSubmit={handleAdd} style={{ marginBottom: 20 }}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input type="text" className="form-input" value={newUsername} onChange={e => setNewUsername(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-success">Add</button>
                </form>
            )}
            {loading ? (
                <div>Loading...</div>
            ) : (
                <table className="table" style={{ width: '100%', marginTop: 10 }}>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAdmins.map(admin => (
                            <tr key={admin.id}>
                                <td>{admin.username}</td>
                                <td>{new Date(admin.createdAt).toLocaleString()}</td>
                                <td style={{ position: 'relative' }}>
                                    <button className="btn btn-secondary" style={{ marginRight: 8 }} onClick={() => { setEditId(admin.id); setEditUsername(admin.username); }}>Edit</button>
                                    {canDelete(admin) ? (
                                        <>
                                            <button className="btn btn-danger" style={{ marginRight: 8 }} onClick={() => setDeletingId(admin.id)}>
                                                Delete
                                            </button>
                                            <button className="btn btn-warning" onClick={() => setResetId(admin.id)} disabled={admin.username === username}>Reset Password</button>
                                            {deletingId === admin.id && (
                                                <div style={{ background: '#fff', border: '1px solid #ccc', padding: 12, position: 'absolute', zIndex: 10 }}>
                                                    <div>Are you sure?</div>
                                                    <button className="btn btn-danger" style={{ marginRight: 8 }} onClick={() => handleDelete(admin.id)}>Yes</button>
                                                    <button className="btn btn-secondary" onClick={() => setDeletingId(null)}>No</button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <span style={{ color: '#aaa' }}>Cannot delete</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {/* Edit Username Modal */}
            {editId && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ minWidth: 320, maxWidth: 400 }}>
                        <h3>Edit Username</h3>
                        <form onSubmit={handleEdit}>
                            <div className="form-group">
                                <label className="form-label">New Username</label>
                                <input type="text" className="form-input" value={editUsername} onChange={e => setEditUsername(e.target.value)} required />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="submit" className="btn btn-success">Save</button>
                                <button type="button" className="btn btn-danger" onClick={() => setEditId(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Reset Password Modal */}
            {resetId && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ minWidth: 320, maxWidth: 400 }}>
                        <h3>Reset Password</h3>
                        <form onSubmit={handleReset}>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input type="password" className="form-input" value={resetPassword} onChange={e => setResetPassword(e.target.value)} required />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="submit" className="btn btn-warning">Reset</button>
                                <button type="button" className="btn btn-danger" onClick={() => { setResetId(null); setResetPassword(''); }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminManagement; 