import React from 'react';
import styles from './LoginSuccess.module.css';

function LoginSuccess({ userType, userData, onContinue }) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.successIcon}>🎉</div>
        
        <h1 className={styles.title}>
          Welcome back, {userData.name}!
        </h1>
        
        <p className={styles.subtitle}>
          Login successful! Ready to manage your bus operations.
        </p>

        <div className={styles.userInfo}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Account Type</span>
            <span className={styles.value}>
              {userType === 'bus' ? '🚌 Bus Operator' : '👤 User'}
            </span>
          </div>
          
          <div className={styles.infoItem}>
            <span className={styles.label}>Email</span>
            <span className={styles.value}>{userData.email}</span>
          </div>
          
          <div className={styles.infoItem}>
            <span className={styles.label}>Login Time</span>
            <span className={styles.value}>
              {new Date().toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.continueButton}
            onClick={onContinue}
          >
            Continue to Dashboard
          </button>
        </div>

        <div className={styles.footer}>
          <p>SmartBus - Making travel smarter</p>
        </div>
      </div>
    </div>
  );
}

export default LoginSuccess;