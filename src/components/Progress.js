import React from 'react';

function Progress({ current, total, label }) {
  const percentage = (current / total) * 100;

  return (
    <div className="assessment-progress">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span>{label || 'Assessment Progress'}</span>
        <span style={{ fontWeight: 600, color: '#0f766e' }}>
          Step {current + 1} of {total}
        </span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: ${percentage}% }}
        />
      </div>
    </div>
  );
}

export default Progress;
