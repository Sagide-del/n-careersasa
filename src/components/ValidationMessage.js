import React from 'react';

function ValidationMessage({ message, type = 'error' }) {
  if (!message) return null;
  
  return (
    <div className={alidation-message }>
      {type === 'error' ? '?? ' : '? '}
      {message}
    </div>
  );
}

export default ValidationMessage;
