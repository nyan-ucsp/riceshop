# Multi-Language Support Implementation

This document describes the multi-language support implementation for both the frontend and admin applications of the Rice Shop project.

## Overview

The application now supports two languages:
- **English (en)** - Default language
- **Burmese (my)** - မြန်မာဘာသာ

## Implementation Details

### 1. Dependencies Added

Both frontend and admin applications now include:
- `react-i18next` - React integration for i18next
- `i18next` - Internationalization framework
- `i18next-browser-languagedetector` - Automatic language detection

### 2. File Structure

```
frontend/src/
├── i18n.js                    # i18n configuration
├── locales/
│   ├── en/
│   │   └── translation.json   # English translations
│   └── my/
│       └── translation.json   # Burmese translations
└── components/
    └── LanguageSwitcher.js    # Language switcher component

admin/src/
├── i18n.js                    # i18n configuration
├── locales/
│   ├── en/
│   │   └── translation.json   # English translations
│   └── my/
│       └── translation.json   # Burmese translations
└── components/
    └── LanguageSwitcher.js    # Language switcher component
```

### 3. Key Features

#### Language Detection
- Automatically detects user's browser language
- Falls back to English if Burmese is not available
- Remembers user's language preference in localStorage

#### Language Switcher
- Dropdown selector in both applications
- Located in the navigation bar (frontend) and sidebar (admin)
- Also available on the login page (admin)

#### Translation Keys
The translation files are organized into logical sections:

**Frontend:**
- `common` - Common UI elements (buttons, labels, etc.)
- `navigation` - Navigation menu items
- `product` - Product-related text
- `cart` - Shopping cart functionality
- `checkout` - Checkout process
- `otp` - OTP confirmation
- `order` - Order-related text
- `messages` - Success/error messages

**Admin:**
- `common` - Common UI elements
- `auth` - Authentication-related text
- `dashboard` - Dashboard statistics and labels
- `productManagement` - Product management interface
- `orderManagement` - Order management interface
- `analytics` - Analytics page
- `adminManagement` - Admin user management
- `messages` - System messages

### 4. Usage in Components

To use translations in a React component:

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.title')}</h1>
      <button>{t('common.submit')}</button>
    </div>
  );
}
```

### 5. Language Switching

Users can switch languages using the language switcher dropdown. The selected language is:
- Immediately applied to the current page
- Saved to localStorage for future visits
- Automatically detected on subsequent visits

### 6. Adding New Translations

To add new text to the application:

1. Add the English translation to `locales/en/translation.json`
2. Add the Burmese translation to `locales/my/translation.json`
3. Use the translation key in your component with `t('key.path')`

Example:
```json
// locales/en/translation.json
{
  "newSection": {
    "welcomeMessage": "Welcome to our store!"
  }
}

// locales/my/translation.json
{
  "newSection": {
    "welcomeMessage": "ကျွန်ုပ်တို့ဆိုင်သို့ ကြိုဆိုပါတယ်!"
  }
}
```

### 7. Best Practices

- Use descriptive translation keys that reflect the content hierarchy
- Keep translations concise and clear
- Test both languages thoroughly
- Consider text length differences between languages
- Use interpolation for dynamic content: `t('welcome', { name: userName })`

### 8. Browser Support

The language detection works in all modern browsers and automatically:
- Detects the user's preferred language
- Falls back gracefully if translations are missing
- Maintains user preferences across sessions

## Running the Applications

1. **Frontend**: `cd frontend && npm start`
2. **Admin**: `cd admin && npm start`

Both applications will be available with full multi-language support.

## Future Enhancements

- Add more languages (Thai, Chinese, etc.)
- Implement RTL (Right-to-Left) support for languages that need it
- Add language-specific formatting for dates, numbers, and currencies
- Implement server-side language detection
- Add translation management interface for admins
