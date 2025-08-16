import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { testLanguageDetection, setLanguagePreference } from '../api';

const LanguageTest = () => {
  const { t, i18n } = useTranslation();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLanguage = async () => {
    setLoading(true);
    try {
      const result = await testLanguageDetection();
      setTestResult(result);
      console.log('Language detection test result:', result);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult({ error: error.message });
    }
    setLoading(false);
  };

  const testEmailLanguage = async () => {
    setLoading(true);
    try {
      // Test with a sample email
      const result = await setLanguagePreference('test@example.com', i18n.language);
      setTestResult(result);
      console.log('Email language preference test result:', result);
    } catch (error) {
      console.error('Email test failed:', error);
      setTestResult({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>Language Detection Test</h3>
      <p>Current Language: <strong>{i18n.language}</strong></p>
      <p>LocalStorage Language: <strong>{localStorage.getItem('userLanguage') || 'not set'}</strong></p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testLanguage}
          disabled={loading}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          {loading ? 'Testing...' : 'Test Language Detection'}
        </button>
        
        <button 
          onClick={testEmailLanguage}
          disabled={loading}
          style={{ padding: '8px 16px' }}
        >
          {loading ? 'Testing...' : 'Test Email Language'}
        </button>
      </div>

      {testResult && (
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          <h4>Test Result:</h4>
          <pre>{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default LanguageTest;
