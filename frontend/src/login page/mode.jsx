import React, { useState } from 'react';
import styles from './mode.module.css';

function Mode({ onModeChange }) {
  const [isBus, setIsBus] = useState(false);

  const toggleMode = () => {
    setIsBus(!isBus);
    onModeChange(!isBus ? 'conductor' : 'user');
  };

  return (
    <div className={styles.toggleBox} onClick={toggleMode}>
      <div className={`${styles.option} ${!isBus ? styles.active : ''}`}>User</div>
      <div className={`${styles.option} ${isBus ? styles.active : ''}`}>Bus</div>
      <div
        className={styles.slider}
        style={{ transform: isBus ? 'translateX(100%)' : 'translateX(0)' }}
      />
    </div>
  );
}

export default Mode;
