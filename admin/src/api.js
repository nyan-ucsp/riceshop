const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000/api';

function getAuthHeaders() {
    const token = localStorage.getItem('admin_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// Admin Auth
export async function adminLogin(username, password) {
    const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    return res.json();
}

export async function adminChangePassword(oldPassword, newPassword) {
    const res = await fetch(`${API_BASE}/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ oldPassword, newPassword })
    });
    return res.json();
}

export function adminLogout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
}

// Product Management
export async function getProducts() {
    const res = await fetch(`${API_BASE}/products`, { headers: getAuthHeaders() });
    return res.json();
}

export async function createProduct(productData) {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('sku', productData.sku);
    formData.append('price', productData.price);
    if (productData.cost !== undefined) {
        formData.append('cost', productData.cost);
    }
    if (productData.description) {
        formData.append('description', productData.description);
    }
    if (productData.image && productData.image instanceof File) {
        formData.append('image', productData.image);
    }
    const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
    });
    return res.json();
}

export async function updateProduct(id, productData) {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('sku', productData.sku);
    formData.append('price', productData.price);
    if (productData.cost !== undefined) {
        formData.append('cost', productData.cost);
    }
    if (productData.description) {
        formData.append('description', productData.description);
    }
    if (productData.image && productData.image instanceof File) {
        formData.append('image', productData.image);
    }
    const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: formData,
    });
    return res.json();
}

export async function deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return res.json();
}

export async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
    });
    return res.json();
}

// Order Management
export async function getOrders() {
    const res = await fetch(`${API_BASE}/orders`, { headers: getAuthHeaders() });
    return res.json();
}

export async function updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status }),
    });
    return res.json();
}

// Analytics
export async function getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`, { headers: getAuthHeaders() });
    return res.json();
}

export async function getMonthlyStats() {
    const res = await fetch(`${API_BASE}/analytics/monthly`, { headers: getAuthHeaders() });
    return res.json();
}

export async function getAdminUsers(token) {
    const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
}

export async function addAdminUser(token, username, password) {
    const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, password }),
    });
    return res.json();
}

export async function deleteAdminUser(token, id) {
    const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
}

export async function updateAdminUsername(token, id, username) {
    const res = await fetch(`/api/admin/users/${id}/username`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
    });
    return res.json();
}

export async function resetAdminPassword(token, id, password) {
    const res = await fetch(`/api/admin/users/${id}/password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
    });
    return res.json();
} 