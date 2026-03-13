import React from 'react';

function AutoSaveIndicator({ status = 'idle' }) {
  return (
    <div className={uto-save-indicator }>
      {status === 'saving' && (
        <>
          <span className="saving-spinner">?</span>
          <span>Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <span>?</span>
          <span>All changes saved</span>
        </>
      )}
      {status === 'idle' && (
        <>
          <span>??</span>
          <span>Auto-save ready</span>
        </>
      )}
    </div>
  );
}

export default AutoSaveIndicator;
