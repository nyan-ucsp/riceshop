import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CartContext } from '../App';
import { setLanguagePreference } from '../api';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { orderInfo } = useContext(CartContext);

  // Save language preference whenever it changes
  const changeLanguage = async (lng) => {
    i18n.changeLanguage(lng);
    
    // Save language preference to localStorage for immediate use
    localStorage.setItem('userLanguage', lng);
    
    // Save language preference to backend if user has an email
    if (orderInfo && orderInfo.email) {
      try {
        await setLanguagePreference(orderInfo.email, lng);
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }
  };

  // Load saved language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('userLanguage');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  return (
    <div className="language-switcher">
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-select"
      >
        <option value="en">English</option>
        <option value="my">မြန်မာ</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
