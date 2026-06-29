import React, { useState, useEffect } from 'react';

const ConsentModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for the consent cookie
    const hasConsent = document.cookie.split('; ').find(row => row.startsWith('webmcp_demo_consent='));
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    // Set a simple cookie that expires in 1 year
    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
    document.cookie = `webmcp_demo_consent=true; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
    
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 3000 }}>
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '30px', 
        borderRadius: '12px', 
        maxWidth: '500px', 
        width: '90%', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
        textAlign: 'center',
        border: '2px solid #97b89d'
      }}>
        <h2 style={{ color: '#97b89d', marginTop: 0 }}>Demo Notice & Consent</h2>
        <p style={{ lineHeight: '1.6', color: '#444' }}>
          Welcome to the <strong>AmazingExperiences Prototype</strong>. This is a demonstration platform for Agent-Native web technology.
        </p>
        <p style={{ lineHeight: '1.6', color: '#444', fontSize: '0.95rem' }}>
          We use <strong>Amplitude</strong> to analyse both human and AI agent interactions. By using this platform, you consent to cookie-based tracking for these analytical purposes.
        </p>
        <button 
          onClick={handleDismiss}
          style={{ 
            backgroundColor: '#97b89d', 
            color: 'white', 
            border: 'none', 
            padding: '12px 30px', 
            borderRadius: '6px', 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            fontSize: '1rem',
            marginTop: '10px',
            width: '100%'
          }}
        >
          I Understand & Accept
        </button>
      </div>
    </div>
  );
};

export default ConsentModal;
