import React, { useState } from 'react';
import styles from './LoginMode.module.css';

function Mode({ onModeChange }) {
  const [activeMode, setActiveMode] = useState('user');

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    onModeChange(mode);
  };

  return (
    <div className={styles.modeContainer}>
      <h3 className={styles.modeTitle}>Select Login Type</h3>
      <div className={styles.modeButtons}>
        <button
          type="button"
          className={`${styles.modeButton} ${activeMode === 'user' ? styles.active : ''}`}
          onClick={() => handleModeChange('user')}
        >
          👤 User
        </button>
        <button
          type="button"
          className={`${styles.modeButton} ${activeMode === 'bus' ? styles.active : ''}`}
          onClick={() => handleModeChange('bus')}
        >
          🚌 Bus
        </button>
      </div>
    </div>
  );
}

export default Mode;