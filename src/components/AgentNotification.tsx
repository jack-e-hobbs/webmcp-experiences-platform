import React, { useState, useEffect } from 'react';

interface Props {
  message: string | null;
  onClear: () => void;
}

const AgentNotification: React.FC<Props> = ({ message, onClear }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onClear();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  if (!message || !visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#333',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: '30px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 4000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '0.95rem',
      border: '1px solid #97b89d',
      animation: 'fadeInOut 4s ease-in-out'
    }}>
      <span style={{ fontSize: '1.2rem' }}>🤖</span>
      <span>{message}</span>
    </div>
  );
};

export default AgentNotification;
