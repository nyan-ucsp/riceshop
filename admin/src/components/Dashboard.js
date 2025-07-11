import React, { useState, useEffect } from 'react';
import { getAnalytics, getOrders, getProducts } from '../api';

function Dashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function loadDashboardData() {
        try {
            const [analytics, orders, products] = await Promise.all([
                getAnalytics(),
                getOrders(),
                getProducts()
            ]);

            const confirmedOrders = orders.filter(order => order.confirmed);
            const pendingOrders = orders.filter(order => !order.confirmed);
            const totalRevenue = confirmedOrders.reduce((sum, order) => sum + order.totalPrice, 0);

            setStats({
                totalProducts: products.length,
                totalOrders: orders.length,
                totalRevenue: totalRevenue,
                pendingOrders: pendingOrders.length
            });

            setRecentOrders(orders.slice(0, 5)); // Show last 5 orders
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    function formatMMK(amount) {
        return amount.toLocaleString('en-US') + ' MMK';
    }

    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Overview of your rice shop business</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number">{stats.totalProducts}</div>
                    <div className="stat-label">Total Products</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.totalOrders}</div>
                    <div className="stat-label">Total Orders</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{formatMMK(stats.totalRevenue)}</div>
                    <div className="stat-label">Total Revenue</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.pendingOrders}</div>
                    <div className="stat-label">Pending Orders</div>
                </div>
            </div>

            <div className="card">
                <h3>Recent Orders</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentOrders.map(order => (
                            <tr key={order.id}>
                                <td>{order.purchaseOrderNumber}</td>
                                <td>{order.name}</td>
                                <td>{formatMMK(order.totalPrice)}</td>
                                <td>
                                    <span className={`status-badge ${order.confirmed ? 'confirmed' : 'pending'}`}>
                                        {order.confirmed ? 'Confirmed' : 'Pending'}
                                    </span>
                                </td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Dashboard; 