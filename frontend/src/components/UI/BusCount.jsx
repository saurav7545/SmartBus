import React from 'react';
import styles from './BusCount.module.css';

function BusCount({ buses, onClose, onTrackBus }) {
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Available Buses ({buses.length})</h3>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>
      <div className={styles.busList}>
        {buses.map((bus, index) => (
          <div key={index} className={styles.busItem}>
            <div className={styles.busInfo}>
              <div className={styles.busHeader}>
                <div className={styles.busLogo}>🚌</div>
                <div className={styles.busDetails}>
                  <h4>{bus.name || 'Bus Service'}</h4>
                  <div className={styles.busNumber}>Bus: {bus.busNumber || 'N/A'}</div>
                </div>
              </div>
              <p className={styles.route}><strong>Route:</strong> {bus.route}</p>
              <div className={styles.liveInfo}>
                {bus.distance && (
                  <p className={styles.distance}>
                    <span className={styles.distanceIcon}>📏</span>
                    <strong>Distance:</strong> 
                    <span className={styles.distanceValue}>{bus.distance} km from you</span>
                  </p>
                )}
                {bus.eta !== undefined && (
                  <p className={styles.eta}>
                    <span className={styles.etaIcon}>⏱️</span>
                    <strong>ETA:</strong> {bus.eta > 0 ? `${bus.eta} mins` : 'Departing now'}
                  </p>
                )}
              </div>
            </div>
            <div className={styles.actionButtons}>
              <button 
                className={styles.trackNowButton}
                onClick={() => onTrackBus && onTrackBus(bus)}
              >
                🔴 Track Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BusCount;
