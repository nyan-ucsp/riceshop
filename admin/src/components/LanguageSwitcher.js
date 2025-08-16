import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-select"
        style={{
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid #ddd',
          backgroundColor: '#fff',
          fontSize: '14px',
          cursor: 'pointer'
        }}
      >
        <option value="en">English</option>
        <option value="my">မြန်မာ</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
