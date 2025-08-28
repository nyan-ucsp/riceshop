const nodemailer = require('nodemailer');
const enTemplates = require('../emailTemplates/en');
const myTemplates = require('../emailTemplates/my');

// Email templates for different languages
const templates = {
    en: enTemplates,
    my: myTemplates
};

// Helper: Generate random 6-digit OTP
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper: Format MMK currency
function formatMMK(amount) {
    return amount.toLocaleString('en-US') + ' MMK';
}

// Helper: Detect language from email or use default
async function detectLanguage(email, defaultLang = 'en') {
    try {
        const { UserPreference } = require('../models/index');
        const preference = await UserPreference.findOne({ where: { email } });
        
        if (preference) {
            return preference.language;
        }
        
        // Fallback: Check if email contains Burmese characters
        const burmeseRegex = /[\u1000-\u109F]/;
        if (burmeseRegex.test(email)) {
            return 'my';
        }
        
        return defaultLang;
    } catch (error) {
        console.error('Error detecting language:', error);
        return defaultLang;
    }
}

// Helper: Detect language from request headers (for immediate language detection)
function detectLanguageFromHeaders(req, defaultLang = 'en') {
    try {
        console.log('Headers received:', req.headers);
        
        // Check for language preference in headers (set by frontend)
        const userLanguage = req.headers['x-user-language'];
        console.log('X-User-Language header:', userLanguage);
        
        if (userLanguage && ['en', 'my'].includes(userLanguage)) {
            console.log('Language detected from X-User-Language:', userLanguage);
            return userLanguage;
        }
        
        // Check Accept-Language header
        const acceptLanguage = req.headers['accept-language'];
        console.log('Accept-Language header:', acceptLanguage);
        
        if (acceptLanguage) {
            if (acceptLanguage.includes('my') || acceptLanguage.includes('my-MM')) {
                console.log('Language detected from Accept-Language: my');
                return 'my';
            }
        }
        
        console.log('No language detected from headers, using default:', defaultLang);
        return defaultLang;
    } catch (error) {
        console.error('Error detecting language from headers:', error);
        return defaultLang;
    }
}

// Helper: Send email with language support
async function sendEmail(to, subject, text, html, language = 'en') {
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

// Send OTP email
async function sendOtpEmail(email, code, isResent = false, req = null) {
    let language = 'en';
    
    // First try to detect from request headers (immediate language detection)
    if (req) {
        language = detectLanguageFromHeaders(req);
        console.log('Language detected from headers:', language);
    }
    
    // If no language detected from headers, try database lookup
    if (language === 'en') {
        language = await detectLanguage(email);
        console.log('Language detected from database:', language);
    }
    
    console.log('Final language for email:', language, 'Email:', email);
    
    const template = templates[language];
    const emailTemplate = isResent ? template.otpResent : template.otp;
    
    const subject = emailTemplate.subject;
    const text = emailTemplate.text(code);
    const html = emailTemplate.html(code);
    
    await sendEmail(email, subject, text, html, language);
}

// Send order confirmation email
async function sendOrderConfirmationEmail(order, orderDetailsHtml, req = null) {
    // Use the language stored in the order
    const language = order.language || 'en';
    
    const template = templates[language];
    const emailTemplate = template.orderConfirmation;
    
    const subject = emailTemplate.subject;
    const text = emailTemplate.text(order.name);
    const html = emailTemplate.html(
        order.name, 
        order.purchaseOrderNumber, 
        formatMMK(order.totalPrice), 
        orderDetailsHtml
    );
    
    await sendEmail(order.email, subject, text, html, language);
}

// Send admin notification email
async function sendAdminNotificationEmail(order, orderDetailsHtml, total) {
    const shopOwnerEmail = process.env.SHOP_OWNER_EMAIL;
    if (!shopOwnerEmail) return;
    
    // Admin emails are always in English for consistency
    const template = templates.en;
    const emailTemplate = template.adminNotification;
    
    const subject = emailTemplate.subject;
    const text = emailTemplate.text(
        order.name, 
        order.email, 
        order.address, 
        '', // details text version
        formatMMK(total)
    );
    const html = emailTemplate.html(
        order.name, 
        order.email, 
        order.address, 
        orderDetailsHtml, 
        formatMMK(total)
    );
    
    await sendEmail(shopOwnerEmail, subject, text, html, 'en');
}

// Send delivery notification email
async function sendDeliveryNotificationEmail(order, orderDetailsHtml) {
    // Use the language stored in the order
    const language = order.language || 'en';
    const template = templates[language];
    const emailTemplate = template.deliveryNotification;
    
    const subject = emailTemplate.subject;
    const text = emailTemplate.text(order.name, order.purchaseOrderNumber);
    const html = emailTemplate.html(
        order.name, 
        order.purchaseOrderNumber, 
        orderDetailsHtml
    );
    
    await sendEmail(order.email, subject, text, html, language);
}

// Generate order details HTML for email
async function generateOrderDetailsHtml(order, language = 'en') {
    const { Product } = require('../models/index');
    let orderDetailsHtml = '';
    
    for (const item of order.cart) {
        const product = await Product.findByPk(item.productId);
        if (product) {
            const itemTotal = product.price * item.quantity;
            const formattedPrice = formatMMK(itemTotal);
            
            if (language === 'my') {
                orderDetailsHtml += `<tr><td style='padding:8px 12px;border-bottom:1px solid #eee;'>${product.name} (SKU: ${product.sku})</td><td style='padding:8px 12px;border-bottom:1px solid #eee;text-align:center;'>${item.quantity}</td><td style='padding:8px 12px;border-bottom:1px solid #eee;text-align:right;'>${formattedPrice}</td></tr>`;
            } else {
                orderDetailsHtml += `<tr><td style='padding:8px 12px;border-bottom:1px solid #eee;'>${product.name} (SKU: ${product.sku})</td><td style='padding:8px 12px;border-bottom:1px solid #eee;text-align:center;'>${item.quantity}</td><td style='padding:8px 12px;border-bottom:1px solid #eee;text-align:right;'>${formattedPrice}</td></tr>`;
            }
        }
    }
    
    return orderDetailsHtml;
}

module.exports = {
    generateOtp,
    formatMMK,
    detectLanguage,
    detectLanguageFromHeaders,
    sendEmail,
    sendOtpEmail,
    sendOrderConfirmationEmail,
    sendAdminNotificationEmail,
    sendDeliveryNotificationEmail,
    generateOrderDetailsHtml
};
