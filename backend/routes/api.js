const express = require('express');
const router = express.Router();
const { Product, Order, Otp, AdminUser, UserPreference } = require('../models/index');
const { safeDbOperation } = require('../middleware/dbErrorHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');

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
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        
        const user = await safeDbOperation(
            () => AdminUser.findOne({ where: { username } }),
            'Failed to authenticate admin user'
        );
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ token, username: user.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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
        return res.status(401).json({ error: 'Current password incorrect' });
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

// Helper: Generate purchase order number
function generatePurchaseOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `PO-${year}${month}${day}-${random}`;
}

// GET /api/products - List all products
router.get('/products', async (req, res) => {
    try {
        const products = await safeDbOperation(
            () => Product.findAll(),
            'Failed to fetch products'
        );
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/orders - Create order, send OTP
router.post('/orders', async (req, res) => {
    try {
        const { name, email, address, cart, language } = req.body;
        if (!name || !email || !address || !cart) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Calculate total price
        let totalPrice = 0;
        for (const item of cart) {
            const product = await safeDbOperation(
                () => Product.findByPk(item.productId),
                'Failed to fetch product for price calculation'
            );
            if (product) {
                totalPrice += product.price * item.quantity;
            }
        }

        // Generate purchase order number
        const purchaseOrderNumber = generatePurchaseOrderNumber();

        // Create order (not confirmed yet)
        const order = await safeDbOperation(
            () => Order.create({
                name,
                email,
                address,
                cart,
                totalPrice,
                purchaseOrderNumber,
                confirmed: false,
                language: language || 'en' // Default to English if not specified
            }),
            'Failed to create order'
        );

        // Generate OTP
        const code = emailService.generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
        await safeDbOperation(
            () => Otp.create({ email, code, expiresAt }),
            'Failed to create OTP'
        );

        // Send OTP email with language support
        await emailService.sendOtpEmail(email, code, false, req);
        res.json({ orderId: order.id, message: 'OTP sent to email' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/orders/confirm - Confirm OTP, finalize order
router.post('/orders/confirm', async (req, res) => {
    try {
        const { orderId, email, code } = req.body;
        if (!orderId || !email || !code) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Find OTP
        const otp = await safeDbOperation(
            () => Otp.findOne({ where: { email, code } }),
            'Failed to verify OTP'
        );
        if (!otp || otp.expiresAt < new Date()) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }
        
        // Confirm order
        const order = await safeDbOperation(
            () => Order.findByPk(orderId),
            'Failed to find order'
        );
        if (!order || order.email !== email) {
            return res.status(400).json({ error: 'Order not found' });
        }
        
        order.confirmed = true;
        order.status = 'confirmed';
        await safeDbOperation(
            () => order.save(),
            'Failed to confirm order'
        );
        
        // Delete OTP
        await safeDbOperation(
            () => otp.destroy(),
            'Failed to clean up OTP'
        );

        // Generate order details for customer email with stored language
        const orderDetailsHtml = await emailService.generateOrderDetailsHtml(order, order.language);

        // Send confirmation email to customer with stored language
        await emailService.sendOrderConfirmationEmail(order, orderDetailsHtml, req);

        // Send notification email to shop owner
        const total = order.totalPrice;
        await emailService.sendAdminNotificationEmail(order, orderDetailsHtml, total);

        res.json({ message: 'Order confirmed and email sent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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
    const code = emailService.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    await Otp.create({ email, code, expiresAt });

    // Send new OTP email with language support
    await emailService.sendOtpEmail(email, code, true, req);

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

    const previousStatus = order.status;
    order.status = status;
    await order.save();

    // Send delivery notification email when status changes to 'delivered'
    if (status === 'delivered' && previousStatus !== 'delivered' && order.confirmed) {
        try {
            const orderDetailsHtml = await emailService.generateOrderDetailsHtml(order, order.language);
            await emailService.sendDeliveryNotificationEmail(order, orderDetailsHtml);
        } catch (error) {
            console.error('Error sending delivery notification email:', error);
            // Don't fail the request if email fails
        }
    }

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
    try {
        const admins = await safeDbOperation(
            () => AdminUser.findAll({ attributes: ['id', 'username', 'createdAt', 'updatedAt'] }),
            'Failed to fetch admin users'
        );
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/admin/users - Add a new admin user
router.post('/admin/users', requireAdminAuth, async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        
        const existing = await safeDbOperation(
            () => AdminUser.findOne({ where: { username } }),
            'Failed to check existing admin'
        );
        if (existing) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        const hashed = await bcrypt.hash(password, 10);
        const newAdmin = await safeDbOperation(
            () => AdminUser.create({ username, password: hashed }),
            'Failed to create admin user'
        );
        res.json({ id: newAdmin.id, username: newAdmin.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/admin/users/:id - Remove an admin user
router.delete('/admin/users/:id', requireAdminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const adminToDelete = await safeDbOperation(
            () => AdminUser.findByPk(id),
            'Failed to find admin user'
        );
        if (!adminToDelete) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        // Prevent self-deletion
        if (adminToDelete.id === req.admin.id) {
            return res.status(400).json({ error: 'You cannot delete your own account.' });
        }
        // Prevent deletion if only one admin remains
        const adminCount = await safeDbOperation(
            () => AdminUser.count(),
            'Failed to count admin users'
        );
        if (adminCount <= 1) {
            return res.status(400).json({ error: 'Cannot delete the last remaining admin.' });
        }
        await safeDbOperation(
            () => adminToDelete.destroy(),
            'Failed to delete admin user'
        );
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/admin/users/:id/username - Update admin username
router.put('/admin/users/:id/username', requireAdminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username required' });
        }
        
        const admin = await safeDbOperation(
            () => AdminUser.findByPk(id),
            'Failed to find admin user'
        );
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        
        // Prevent duplicate username
        const existing = await safeDbOperation(
            () => AdminUser.findOne({ where: { username } }),
            'Failed to check existing username'
        );
        if (existing && existing.id !== admin.id) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        admin.username = username;
        await safeDbOperation(
            () => admin.save(),
            'Failed to update username'
        );
        res.json({ message: 'Username updated', username: admin.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/admin/users/:id/password - Reset admin password
router.put('/admin/users/:id/password', requireAdminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ error: 'Password required' });
        }
        // Prevent self-reset
        if (parseInt(id) === req.admin.id) {
            return res.status(400).json({ error: 'You cannot reset your own password here.' });
        }
        
        const admin = await safeDbOperation(
            () => AdminUser.findByPk(id),
            'Failed to find admin user'
        );
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        
        admin.password = await bcrypt.hash(password, 10);
        await safeDbOperation(
            () => admin.save(),
            'Failed to reset password'
        );
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// All admin routes below require authentication
router.use('/products', requireAdminAuth);
router.use('/orders', requireAdminAuth);
router.use('/analytics', requireAdminAuth);
router.use('/admin/users', requireAdminAuth); // Add this line to protect admin user management routes

function formatMMK(amount) {
    return amount.toLocaleString('en-US') + ' MMK';
}

// --- Language Preference Endpoints ---
// POST /api/preferences/language - Set user language preference
router.post('/preferences/language', async (req, res) => {
    const { email, language } = req.body;
    
    if (!email || !language) {
        return res.status(400).json({ error: 'Email and language are required' });
    }
    
    if (!['en', 'my'].includes(language)) {
        return res.status(400).json({ error: 'Invalid language. Supported: en, my' });
    }
    
    try {
        const [preference, created] = await UserPreference.findOrCreate({
            where: { email },
            defaults: { language }
        });
        
        if (!created) {
            preference.language = language;
            await preference.save();
        }
        
        res.json({ 
            message: 'Language preference updated successfully',
            email: preference.email,
            language: preference.language
        });
    } catch (error) {
        console.error('Error updating language preference:', error);
        res.status(500).json({ error: 'Failed to update language preference' });
    }
});

// GET /api/preferences/language/:email - Get user language preference
router.get('/preferences/language/:email', async (req, res) => {
    const { email } = req.params;
    
    try {
        const preference = await UserPreference.findOne({ where: { email } });
        
        if (preference) {
            res.json({ 
                email: preference.email,
                language: preference.language
            });
        } else {
            res.json({ 
                email,
                language: 'en' // default language
            });
        }
    } catch (error) {
        console.error('Error getting language preference:', error);
        res.status(500).json({ error: 'Failed to get language preference' });
    }
});

// GET /api/test/language-detection - Test language detection
router.get('/test/language-detection', async (req, res) => {
    try {
        const detectedLanguage = emailService.detectLanguageFromHeaders(req);
        res.json({ 
            message: 'Language detection test',
            detectedLanguage,
            headers: req.headers,
            userLanguage: req.headers['x-user-language']
        });
    } catch (error) {
        console.error('Error in language detection test:', error);
        res.status(500).json({ error: 'Failed to test language detection' });
    }
});

module.exports = router; 