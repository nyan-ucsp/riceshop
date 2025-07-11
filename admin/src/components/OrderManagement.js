import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, getProducts } from '../api';
import { useNavigate, Routes, Route } from 'react-router-dom';

function OrderDetail({ order, products }) {
    if (!order) return <div>Order not found.</div>;
    // Map productId to product for cost lookup
    const productMap = Object.fromEntries(products.map(p => [p.id, p]));
    let totalProfit = 0;
    function formatMMK(value) {
        return value ? value.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' MMK' : '0 MMK';
    }
    return (
        <div className="card" style={{ maxWidth: 700, margin: '40px auto', padding: 32, boxShadow: '0 2px 16px #0001', borderRadius: 16 }}>
            <h2 style={{ marginBottom: 16, color: '#2d7a2d' }}>Order Details</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 24 }}>
                <div style={{ minWidth: 220 }}>
                    <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>{order.purchaseOrderNumber}</div>
                    <div><b>Customer:</b> {order.name}</div>
                    <div><b>Email:</b> {order.email}</div>
                    <div><b>Address:</b> {order.address}</div>
                </div>
                <div style={{ minWidth: 180 }}>
                    <div><b>Status:</b> <span className={order.status === 'delivered' ? 'status-badge delivered' : order.confirmed ? 'status-badge confirmed' : 'status-badge pending'}>{order.status || (order.confirmed ? 'Confirmed' : 'Pending')}</span></div>
                    <div><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</div>
                    <div><b>Total:</b> <span style={{ color: '#2d7a2d', fontWeight: 600 }}>{formatMMK(order.totalPrice)}</span></div>
                    <div><b>Total Profit:</b> <span style={{ color: '#16a085', fontWeight: 600 }}>{formatMMK(order.cart.reduce((sum, item) => sum + ((item.price - (productMap[item.productId]?.cost || 0)) * item.quantity), 0))}</span></div>
                </div>
            </div>
            <h3 style={{ marginTop: 20, marginBottom: 12, color: '#2d7a2d' }}>Items</h3>
            <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ minWidth: 600, background: '#f9f9f9', borderRadius: 8 }}>
                    <thead>
                        <tr style={{ background: '#f3f7f3' }}>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Price</th>
                            <th>Cost</th>
                            <th>Qty</th>
                            <th>Subtotal</th>
                            <th>Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.cart.map((item, idx) => {
                            const prod = products.find(p => p.id === item.productId);
                            const cost = prod?.cost || 0;
                            const profit = (item.price - cost) * item.quantity;
                            totalProfit += profit;
                            return (
                                <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f6f6f6' }}>
                                    <td>{item.name}</td>
                                    <td>{prod?.sku || '-'}</td>
                                    <td>{formatMMK(item.price)}</td>
                                    <td>{formatMMK(cost)}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatMMK(item.price * item.quantity)}</td>
                                    <td>{formatMMK(profit)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                            <td>{formatMMK(order.totalPrice)}</td>
                            <td>{formatMMK(totalProfit)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            const [ordersData, productsData] = await Promise.all([
                getOrders(),
                getProducts()
            ]);
            setOrders(ordersData);
            setProducts(productsData);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusUpdate(orderId, newStatus) {
        try {
            await updateOrderStatus(orderId, newStatus);
            loadOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    }

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'delivered':
                return 'status-badge delivered';
            case 'confirmed':
                return 'status-badge confirmed';
            default:
                return 'status-badge pending';
        }
    }

    function getFilteredOrders() {
        switch (filter) {
            case 'pending':
                return orders.filter(order => !order.confirmed);
            case 'confirmed':
                return orders.filter(order => order.confirmed && order.status !== 'delivered');
            case 'delivered':
                return orders.filter(order => order.status === 'delivered');
            default:
                return orders;
        }
    }

    const filteredOrders = getFilteredOrders();

    if (loading) {
        return <div>Loading orders...</div>;
    }

    if (selectedOrder) {
        const order = orders.find(o => o.id === selectedOrder);
        return <OrderDetail order={order} products={products} />;
    }

    function formatMMK(amount) {
        return amount.toLocaleString('en-US') + ' MMK';
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Order Management</h1>
                <p className="page-subtitle">Manage and track customer orders</p>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>Orders ({filteredOrders.length})</h3>
                    <div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="form-input"
                            style={{ width: 'auto' }}
                        >
                            <option value="all">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="delivered">Delivered</option>
                        </select>
                    </div>
                </div>

                <table className="table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Email</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.id}>
                                <td>{order.purchaseOrderNumber}</td>
                                <td>{order.name}</td>
                                <td>{order.email}</td>
                                <td>{formatMMK(order.totalPrice)}</td>
                                <td>
                                    <span className={getStatusBadgeClass(order.status || (order.confirmed ? 'confirmed' : 'pending'))}>
                                        {order.status || (order.confirmed ? 'Confirmed' : 'Pending')}
                                    </span>
                                </td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setSelectedOrder(order.id)}
                                        style={{ marginRight: 5 }}
                                    >
                                        View Details
                                    </button>
                                    {order.confirmed && order.status !== 'delivered' && (
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                        >
                                            Mark Delivered
                                        </button>
                                    )}
                                    {!order.confirmed && (
                                        <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                                            Awaiting OTP
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredOrders.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                        No orders found for the selected filter.
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderManagement; 