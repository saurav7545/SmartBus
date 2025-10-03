import React from 'react';
import styles from './mapview.module.css';

function MapView() {
  return (
    <div className={styles.container}>
      <div className={styles.map} style={{
        background: '#e6f3ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3>🗺️ Map Loading...</h3>
          <p>Interactive map will appear here</p>
        </div>
      </div>
    </div>
  );
}

export default MapView;