# Multi-Language Email Support Implementation

This document describes the multi-language email support implementation for the Rice Shop project, covering both frontend and backend components.

## Overview

The email system now supports sending emails in multiple languages:
- **English (en)** - Default language
- **Burmese (my)** - မြန်မာဘာသာ

## Backend Implementation

### 1. Email Templates

**Location:** `backend/emailTemplates/`

#### English Templates (`en.js`)
- OTP emails (new and resent)
- Order confirmation emails
- Admin notification emails

#### Burmese Templates (`my.js`)
- Complete Burmese translations for all email types
- Proper Unicode support for Burmese characters

### 2. Email Service

**Location:** `backend/services/emailService.js`

#### Key Features:
- **Language Detection**: Automatically detects user's preferred language
- **Template Management**: Centralized template system for both languages
- **Async Support**: All email functions are async for better performance
- **Error Handling**: Comprehensive error handling for email failures

#### Functions:
- `sendOtpEmail(email, code, isResent)` - Send OTP emails
- `sendOrderConfirmationEmail(order, orderDetailsHtml)` - Send order confirmations
- `sendAdminNotificationEmail(order, orderDetailsHtml, total)` - Send admin notifications
- `detectLanguage(email, defaultLang)` - Detect user's language preference
- `generateOrderDetailsHtml(order, language)` - Generate order details in specified language

### 3. User Preference System

**Location:** `backend/models/UserPreference.js`

#### Features:
- Stores user language preferences by email
- Automatic fallback to email content analysis
- Database persistence for consistent language selection

#### Database Schema:
```sql
CREATE TABLE UserPreferences (
    email VARCHAR(255) PRIMARY KEY,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. API Endpoints

#### Language Preference Management:
- `POST /api/preferences/language` - Set user language preference
- `GET /api/preferences/language/:email` - Get user language preference

#### Updated Email Endpoints:
- `POST /api/orders` - Now sends OTP emails in user's preferred language
- `POST /api/orders/confirm` - Now sends confirmation emails in user's preferred language
- `POST /api/orders/resend-otp` - Now sends resent OTP emails in user's preferred language

## Frontend Implementation

### 1. Language Switcher Enhancement

**Location:** `frontend/src/components/LanguageSwitcher.js`

#### New Features:
- Automatically saves language preference to backend
- Uses user's email from order context
- Seamless integration with existing i18n system

### 2. API Integration

**Location:** `frontend/src/api.js`

#### New Functions:
- `setLanguagePreference(email, language)` - Save language preference
- `getLanguagePreference(email)` - Retrieve language preference

## Email Types and Templates

### 1. OTP Emails

#### English Template:
- Subject: "Your Rice Shop OTP"
- Content: Professional OTP delivery with security instructions
- Design: Clean, branded template with Rice Shop styling

#### Burmese Template:
- Subject: "သင့်ဆန်ဆိုင် OTP"
- Content: Full Burmese translation with proper Unicode support
- Design: Same professional styling as English version

### 2. Order Confirmation Emails

#### English Template:
- Subject: "Order Confirmed"
- Content: Complete order details with product list and totals
- Design: Professional confirmation with order summary table

#### Burmese Template:
- Subject: "အော်ဒါ အတည်ပြုပြီး"
- Content: Full Burmese translation of order confirmation
- Design: Maintains professional layout with Burmese text

### 3. Admin Notification Emails

#### English Template:
- Subject: "New Rice Order Received"
- Content: Detailed order information for shop owners
- Design: Admin-focused layout with customer and order details

## Language Detection Logic

### 1. Primary Method: Database Lookup
1. Check if user has a saved language preference
2. Use stored preference if available

### 2. Fallback Method: Email Content Analysis
1. Check if email contains Burmese Unicode characters
2. Default to English if no Burmese characters found

### 3. Final Fallback: Default Language
- Always defaults to English if no other method works

## Setup and Configuration

### 1. Environment Variables
```bash
# Required for email functionality
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
SHOP_OWNER_EMAIL=your_notify_email@gmail.com

# Optional
SMTP_SENDER_NAME=Rice Shop
JWT_SECRET=your_super_secret
```

### 2. Database Setup
```bash
cd backend
node sync.js  # Creates UserPreference table
```

### 3. Testing Email System
```bash
# Test OTP email
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","address":"Test Address","cart":[]}'

# Test language preference
curl -X POST http://localhost:3000/api/preferences/language \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","language":"my"}'
```

## Email Template Customization

### 1. Adding New Languages
1. Create new template file: `backend/emailTemplates/[lang].js`
2. Add language to templates object in `emailService.js`
3. Update language detection logic if needed

### 2. Modifying Existing Templates
1. Edit template files in `backend/emailTemplates/`
2. Templates support HTML and CSS styling
3. Variables are passed as function parameters

### 3. Template Structure
```javascript
const emailTemplates = {
    otp: {
        subject: 'Email Subject',
        text: (code) => `Plain text version: ${code}`,
        html: (code) => `<div>HTML version: ${code}</div>`
    }
};
```

## Error Handling

### 1. Email Service Errors
- Automatic fallback to default language
- Console logging for debugging
- Graceful degradation if email fails

### 2. Database Errors
- Fallback to email content analysis
- No interruption to user experience
- Error logging for monitoring

### 3. Template Errors
- Fallback to English templates
- Validation of template structure
- Error reporting for missing templates

## Performance Considerations

### 1. Database Queries
- UserPreference lookups are cached where possible
- Minimal impact on email sending performance

### 2. Template Loading
- Templates are loaded once at startup
- No runtime template compilation

### 3. Language Detection
- Async operations don't block email sending
- Fallback mechanisms ensure reliability

## Security Features

### 1. Input Validation
- Email format validation
- Language code validation
- SQL injection prevention

### 2. Error Information
- No sensitive data in error messages
- Secure error logging

### 3. Email Security
- SMTP over SSL/TLS
- Secure authentication
- No sensitive data in email subjects

## Monitoring and Logging

### 1. Email Logging
- All email sends are logged
- Language detection results logged
- Error conditions logged

### 2. Performance Monitoring
- Email send times tracked
- Language detection performance
- Database query performance

### 3. User Analytics
- Language preference statistics
- Email open rates by language
- User engagement metrics

## Future Enhancements

### 1. Additional Languages
- Thai language support
- Chinese language support
- RTL language support

### 2. Advanced Features
- Dynamic template loading
- A/B testing for email templates
- Personalized email content

### 3. Integration Features
- Email marketing platform integration
- Advanced analytics integration
- Customer feedback collection

## Troubleshooting

### 1. Common Issues
- **Emails not sending**: Check SMTP credentials
- **Language not detected**: Verify UserPreference table exists
- **Templates not loading**: Check file paths and syntax

### 2. Debug Mode
- Enable debug logging in email service
- Check console for detailed error messages
- Verify database connections

### 3. Testing
- Use test email addresses
- Verify SMTP settings
- Test all language combinations

## Support

For issues or questions regarding the multi-language email system:
1. Check the logs for error messages
2. Verify environment variables are set correctly
3. Test with different email addresses and languages
4. Review the email templates for syntax errors
