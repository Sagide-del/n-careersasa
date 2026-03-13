import React, { useEffect } from 'react';

function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={	oast-notification }>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {type === 'success' && '?'}
        {type === 'error' && '?'}
        {type === 'info' && '??'}
        <span style={{ flex: 1 }}>{message}</span>
        <button 
          onClick={onClose}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '0 0.5rem'
          }}
        >
          ?
        </button>
      </div>
    </div>
  );
}

export default Toast;
