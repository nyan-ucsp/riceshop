const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const Otp = require('../models/Otp');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AdminUser = require('../models/AdminUser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Admin Auth Middleware
function requireAdminAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = auth.replace('Bearer ', '');
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.admin = payload;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// POST /api/admin/login
router.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    const user = await AdminUser.findOne({ where: { username } });
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, username: user.username });
});

// POST /api/admin/change-password
router.post('/admin/change-password', requireAdminAuth, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Old and new password required' });
    }
    const user = await AdminUser.findByPk(req.admin.id);
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
        return res.status(401).json({ error: 'Old password incorrect' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Helper: Generate random 6-digit OTP
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper: Generate purchase order number
function generatePurchaseOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `PO-${year}${month}${day}-${random}`;
}

// Helper: Send email
async function sendEmail(to, subject, text, html) {
    // Configure your SMTP settings here
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // or your SMTP
        port: 465,
        secure: true, // Use SSL
        auth: {
            user: process.env.SMTP_USER, // set in .env
            pass: process.env.SMTP_PASS, // set in .env
        },
    });
    const senderName = process.env.SMTP_SENDER_NAME || 'Rice Shop';
    const from = `${senderName} <${process.env.SMTP_USER}>`;
    await transporter.sendMail({ from, to, subject, text, html });
}

// GET /api/products - List all products
router.get('/products', async (req, res) => {
    const products = await Product.findAll();
    res.json(products);
});

// POST /api/orders - Create order, send OTP
router.post('/orders', async (req, res) => {
    const { name, email, address, cart } = req.body;
    if (!name || !email || !address || !cart) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate total price
    let totalPrice = 0;
    for (const item of cart) {
        const product = await Product.findByPk(item.productId);
        if (product) {
            totalPrice += product.price * item.quantity;
        }
    }

    // Generate purchase order number
    const purchaseOrderNumber = generatePurchaseOrderNumber();

    // Create order (not confirmed yet)
    const order = await Order.create({
        name,
        email,
        address,
        cart,
        totalPrice,
        purchaseOrderNumber,
        confirmed: false
    });

    // Generate OTP
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    await Otp.create({ email, code, expiresAt });

    // Send OTP email (HTML)
    const otpHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fafcff;">
            <h2 style="color: #2d7a2d;">Rice Shop OTP</h2>
            <p>Dear Customer,</p>
            <p>Your One-Time Password (OTP) is:</p>
            <div style="font-size: 2em; font-weight: bold; letter-spacing: 6px; color: #2d7a2d; margin: 16px 0;">${code}</div>
            <p>This code is valid for 10 minutes. Please do not share it with anyone.</p>
            <p style="margin-top: 32px; color: #888; font-size: 0.9em;">Rice Shop Team</p>
        </div>
    `;
    await sendEmail(email, 'Your Rice Shop OTP', `Your OTP is: ${code}`, otpHtml);
    res.json({ orderId: order.id, message: 'OTP sent to email' });
});

// POST /api/orders/confirm - Confirm OTP, finalize order
router.post('/orders/confirm', async (req, res) => {
    const { orderId, email, code } = req.body;
    if (!orderId || !email || !code) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    // Find OTP
    const otp = await Otp.findOne({ where: { email, code } });
    if (!otp || otp.expiresAt < new Date()) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    // Confirm order
    const order = await Order.findByPk(orderId);
    if (!order || order.email !== email) {
        return res.status(400).json({ error: 'Order not found' });
    }
    order.confirmed = true;
    order.status = 'confirmed';
    await order.save();
    // Delete OTP
    await otp.destroy();

    // Generate order details for customer email
    let orderDetailsHtml = '';
    for (const item of order.cart) {
        const product = await Product.findByPk(item.productId);
        if (product) {
            const itemTotal = product.price * item.quantity;
            orderDetailsHtml += `<tr><td style='padding:8px 12px;border-bottom:1px solid #eee;'>${product.name} (SKU: ${product.sku})</td><td style='padding:8px 12px;border-bottom:1px solid #eee;text-align:center;'>${item.quantity}</td><td style='padding:8px 12px;border-bottom:1px solid #eee;text-align:right;'>${formatMMK(itemTotal)}</td></tr>`;
        }
    }

    // Send confirmation email to customer (HTML) with order details
    const confirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #f6fff6;">
            <h2 style="color: #2d7a2d;">Order Confirmed!</h2>
            <p>Thank you <b>${order.name}</b>, your rice order is confirmed!</p>
            <div style="margin: 20px 0;">
                <b>Order Number:</b> ${order.purchaseOrderNumber}<br/>
                <b>Total Amount:</b> ${formatMMK(order.totalPrice)}
            </div>
            <table style="width:100%; border-collapse:collapse; margin: 20px 0;">
                <thead>
                    <tr style="background:#f8fafc; color:#2d7a2d;">
                        <th style="padding:10px 12px; text-align:left; border-bottom:2px solid #2d7a2d;">Product</th>
                        <th style="padding:10px 12px; text-align:center; border-bottom:2px solid #2d7a2d;">Qty</th>
                        <th style="padding:10px 12px; text-align:right; border-bottom:2px solid #2d7a2d;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderDetailsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding:10px 12px; text-align:right; font-weight:bold; color:#2d7a2d;">Total:</td>
                        <td style="padding:10px 12px; text-align:right; font-weight:bold; color:#2d7a2d;">${formatMMK(order.totalPrice)}</td>
                    </tr>
                </tfoot>
            </table>
            <p>We appreciate your business. You will receive another email when your order is shipped.</p>
            <p style="margin-top: 32px; color: #888; font-size: 0.9em;">Rice Shop Team</p>
        </div>
    `;
    await sendEmail(email, 'Order Confirmed', `Thank you ${order.name}, your rice order is confirmed!`, confirmationHtml);

    // Send notification email to shop owner
    const shopOwnerEmail = process.env.SHOP_OWNER_EMAIL;
    if (shopOwnerEmail) {
        // Calculate total price
        let total = 0;
        let details = '';
        let detailsHtml = '';
        for (const item of order.cart) {
            // item: { productId, quantity }
            const product = await Product.findByPk(item.productId);
            if (product) {
                const itemTotal = product.price * item.quantity;
                total += itemTotal;
                details += `- ${product.name} x ${item.quantity} = ${formatMMK(itemTotal)}\n`;
                detailsHtml += `<tr><td style='padding:8px 12px;border-bottom:1px solid #eee;'>${product.name}</td><td style='padding:8px 12px;border-bottom:1px solid #eee;text-align:center;'>${item.quantity}</td><td style='padding:8px 12px;border-bottom:1px solid #eee;text-align:right;'>${formatMMK(itemTotal)}</td></tr>`;
            }
        }
        const ownerMsg = `New order from ${order.name} (${order.email})\nAddress: ${order.address}\n\nOrder details:\n${details}\nTotal: ${formatMMK(total)}`;
        const ownerHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 32px; background: #fffef8;">
                <h2 style="color: #2d7a2d; margin-bottom: 18px;">New Rice Order Received</h2>
                <div style="margin-bottom: 18px;">
                    <b>Customer:</b> ${order.name} (<a href="mailto:${order.email}">${order.email}</a>)<br/>
                    <b>Address:</b> ${order.address}
                </div>
                <table style="width:100%; border-collapse:collapse; margin-bottom: 18px;">
                    <thead>
                        <tr style="background:#f8fafc; color:#2d7a2d;">
                            <th style="padding:10px 12px; text-align:left; border-bottom:2px solid #2d7a2d;">Product</th>
                            <th style="padding:10px 12px; text-align:center; border-bottom:2px solid #2d7a2d;">Qty</th>
                            <th style="padding:10px 12px; text-align:right; border-bottom:2px solid #2d7a2d;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${detailsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding:10px 12px; text-align:right; font-weight:bold; color:#2d7a2d;">Total:</td>
                            <td style="padding:10px 12px; text-align:right; font-weight:bold; color:#2d7a2d;">${formatMMK(total)}</td>
                        </tr>
                    </tfoot>
                </table>
                <div style="color:#888; font-size:0.95em;">Order placed via Rice Shop</div>
            </div>
        `;
        await sendEmail(shopOwnerEmail, 'New Rice Order Received', ownerMsg, ownerHtml);
    }

    res.json({ message: 'Order confirmed and email sent' });
});

// POST /api/orders/resend-otp - Resend OTP to customer
router.post('/orders/resend-otp', async (req, res) => {
    const { orderId, email } = req.body;
    if (!orderId || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find the order
    const order = await Order.findByPk(orderId);
    if (!order || order.email !== email) {
        return res.status(400).json({ error: 'Order not found' });
    }

    // Delete any existing OTP for this email
    await Otp.destroy({ where: { email } });

    // Generate new OTP
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    await Otp.create({ email, code, expiresAt });

    // Send new OTP email (HTML)
    const otpHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fafcff;">
            <h2 style="color: #2d7a2d;">Rice Shop OTP (Resent)</h2>
            <p>Dear Customer,</p>
            <p>Your new One-Time Password (OTP) is:</p>
            <div style="font-size: 2em; font-weight: bold; letter-spacing: 6px; color: #2d7a2d; margin: 16px 0;">${code}</div>
            <p>This code is valid for 10 minutes. Please do not share it with anyone.</p>
            <p style="margin-top: 32px; color: #888; font-size: 0.9em;">Rice Shop Team</p>
        </div>
    `;
    await sendEmail(email, 'Your Rice Shop OTP (Resent)', `Your new OTP is: ${code}`, otpHtml);

    res.json({ message: 'OTP resent successfully' });
});

// GET /api/orders - Get all orders (admin)
router.get('/orders', async (req, res) => {
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
    res.json(orders);
});

// PUT /api/orders/:id/status - Update order status (admin)
router.put('/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json({ message: 'Order status updated', order });
});

// POST /api/upload - Upload product image
router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({
        message: 'File uploaded successfully',
        imageUrl: imageUrl,
        filename: req.file.filename
    });
});

// POST /api/products - Create product (admin)
router.post('/products', upload.single('image'), async (req, res) => {
    const { name, sku, price, description, cost } = req.body;

    if (!name || !sku || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    let imageUrl = null;
    if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
    }

    try {
        const product = await Product.create({
            name,
            sku,
            price,
            cost, // <-- Add cost field
            description,
            image: imageUrl
        });
        res.json(product);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ error: 'SKU already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create product' });
        }
    }
});

// PUT /api/products/:id - Update product (admin)
router.put('/products/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, sku, price, description, cost } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    let imageUrl = product.image; // Keep existing image if no new one uploaded
    if (req.file) {
        // Delete old image if it exists
        if (product.image && product.image.startsWith('/uploads/')) {
            const oldImagePath = path.join('public', product.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        imageUrl = `/uploads/${req.file.filename}`;
    }

    try {
        await product.update({ name, sku, price, cost, description, image: imageUrl }); // <-- Add cost field
        res.json(product);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ error: 'SKU already exists' });
        } else {
            res.status(500).json({ error: 'Failed to update product' });
        }
    }
});

// DELETE /api/products/:id - Delete product (admin)
router.delete('/products/:id', async (req, res) => {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    // Delete associated image file
    if (product.image && product.image.startsWith('/uploads/')) {
        const imagePath = path.join('public', product.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
});

// GET /api/analytics - Get analytics data (admin)
router.get('/analytics', async (req, res) => {
    const orders = await Order.findAll();
    const products = await Product.findAll();

    const confirmedOrders = orders.filter(order => order.confirmed);
    const totalRevenue = confirmedOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.json({
        totalOrders: orders.length,
        confirmedOrders: confirmedOrders.length,
        totalRevenue,
        totalProducts: products.length
    });
});

// GET /api/analytics/monthly - Get monthly analytics (admin)
router.get('/analytics/monthly', async (req, res) => {
    const { month, year } = req.query;

    const orders = await Order.findAll();
    const confirmedOrders = orders.filter(order => order.confirmed);

    let filteredOrders = confirmedOrders;
    if (month && year) {
        filteredOrders = confirmedOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === parseInt(month) &&
                orderDate.getFullYear() === parseInt(year);
        });
    }

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.json({
        orders: filteredOrders,
        totalRevenue,
        totalOrders: filteredOrders.length
    });
});

// --- Admin Management Endpoints ---
// GET /api/admin/users - List all admin users
router.get('/admin/users', requireAdminAuth, async (req, res) => {
    const admins = await AdminUser.findAll({ attributes: ['id', 'username', 'createdAt', 'updatedAt'] });
    res.json(admins);
});

// POST /api/admin/users - Add a new admin user
router.post('/admin/users', requireAdminAuth, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    const existing = await AdminUser.findOne({ where: { username } });
    if (existing) {
        return res.status(400).json({ error: 'Username already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = await AdminUser.create({ username, password: hashed });
    res.json({ id: newAdmin.id, username: newAdmin.username });
});

// DELETE /api/admin/users/:id - Remove an admin user
router.delete('/admin/users/:id', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    const adminToDelete = await AdminUser.findByPk(id);
    if (!adminToDelete) {
        return res.status(404).json({ error: 'Admin not found' });
    }
    // Prevent self-deletion
    if (adminToDelete.id === req.admin.id) {
        return res.status(400).json({ error: 'You cannot delete your own account.' });
    }
    // Prevent deletion if only one admin remains
    const adminCount = await AdminUser.count();
    if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last remaining admin.' });
    }
    await adminToDelete.destroy();
    res.json({ message: 'Admin deleted successfully' });
});

// PUT /api/admin/users/:id/username - Update admin username
router.put('/admin/users/:id/username', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username required' });
    }
    const admin = await AdminUser.findByPk(id);
    if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
    }
    // Prevent duplicate username
    const existing = await AdminUser.findOne({ where: { username } });
    if (existing && existing.id !== admin.id) {
        return res.status(400).json({ error: 'Username already exists' });
    }
    admin.username = username;
    await admin.save();
    res.json({ message: 'Username updated', username: admin.username });
});

// PUT /api/admin/users/:id/password - Reset admin password
router.put('/admin/users/:id/password', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ error: 'Password required' });
    }
    // Prevent self-reset
    if (parseInt(id) === req.admin.id) {
        return res.status(400).json({ error: 'You cannot reset your own password here.' });
    }
    const admin = await AdminUser.findByPk(id);
    if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
    }
    admin.password = await bcrypt.hash(password, 10);
    await admin.save();
    res.json({ message: 'Password reset successfully' });
});

// All admin routes below require authentication
router.use('/products', requireAdminAuth);
router.use('/orders', requireAdminAuth);
router.use('/analytics', requireAdminAuth);
router.use('/admin/users', requireAdminAuth); // Add this line to protect admin user management routes

function formatMMK(amount) {
    return amount.toLocaleString('en-US') + ' MMK';
}

module.exports = router; 