import React, { useState, useEffect } from 'react';
import { getOrders, getProducts } from '../api';

function Analytics() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        loadData();
    }, [selectedMonth, selectedYear]);

    async function loadData() {
        try {
            const [ordersData, productsData] = await Promise.all([
                getOrders(),
                getProducts()
            ]);
            setOrders(ordersData);
            setProducts(productsData);
        } catch (error) {
            console.error('Error loading analytics data:', error);
        } finally {
            setLoading(false);
        }
    }

    function getMonthName(monthIndex) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthIndex];
    }

    function getMonthlyData() {
        const confirmedOrders = orders.filter(order => order.confirmed);
        const monthlyOrders = confirmedOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === selectedMonth &&
                orderDate.getFullYear() === selectedYear;
        });

        const totalRevenue = monthlyOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        const totalOrders = monthlyOrders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate profit (assuming 30% profit margin for demo)
        const estimatedProfit = totalRevenue * 0.3;

        return {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            estimatedProfit,
            orders: monthlyOrders
        };
    }

    function getTopProducts() {
        const confirmedOrders = orders.filter(order => order.confirmed);
        const productSales = {};

        confirmedOrders.forEach(order => {
            order.cart?.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[item.productId].quantity += item.quantity;
                productSales[item.productId].revenue += (item.price * item.quantity);
            });
        });

        return Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }

    function formatMMK(amount) {
        return amount.toLocaleString('en-US') + ' MMK';
    }

    const monthlyData = getMonthlyData();
    const topProducts = getTopProducts();

    if (loading) {
        return <div>Loading analytics...</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Analytics</h1>
                <p className="page-subtitle">Financial insights and performance metrics</p>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>Monthly Statistics</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="form-input"
                            style={{ width: 'auto' }}
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>{getMonthName(i)}</option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="form-input"
                            style={{ width: 'auto' }}
                        >
                            {Array.from({ length: 5 }, (_, i) => {
                                const year = new Date().getFullYear() - 2 + i;
                                return <option key={year} value={year}>{year}</option>;
                            })}
                        </select>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-number">{formatMMK(monthlyData.totalRevenue)}</div>
                        <div className="stat-label">Total Revenue</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{formatMMK(monthlyData.estimatedProfit)}</div>
                        <div className="stat-label">Estimated Profit</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{monthlyData.totalOrders}</div>
                        <div className="stat-label">Total Orders</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{formatMMK(monthlyData.averageOrderValue)}</div>
                        <div className="stat-label">Average Order Value</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3>Top Selling Products</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity Sold</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topProducts.map((product, index) => (
                            <tr key={index}>
                                <td>{product.name}</td>
                                <td>{product.quantity}</td>
                                <td>{formatMMK(product.revenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <h3>Recent Orders ({getMonthName(selectedMonth)} {selectedYear})</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyData.orders.slice(0, 10).map(order => (
                            <tr key={order.id}>
                                <td>{order.purchaseOrderNumber}</td>
                                <td>{order.name}</td>
                                <td>{formatMMK(order.totalPrice)}</td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {monthlyData.orders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
                        No orders found for {getMonthName(selectedMonth)} {selectedYear}.
                    </div>
                )}
            </div>
        </div>
    );
}

export default Analytics; 