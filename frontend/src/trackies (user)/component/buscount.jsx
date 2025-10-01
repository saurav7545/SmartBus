import React from 'react';
import styles from './buscount.module.css';

function BusCount({ buses, onClose }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Available Buses</h3>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>
      <div className={styles.busList}>
        {buses.map((bus, index) => (
          <div key={index} className={styles.busItem}>
            <div className={styles.busInfo}>
              <h4>{bus.route}</h4>
              <p>Departure: {bus.departureTime}</p>
              <p>Arrival: {bus.arrivalTime}</p>
              <p>Seats Available: {bus.seats}</p>
            </div>
            <button className={styles.bookButton}>book</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BusCount;
