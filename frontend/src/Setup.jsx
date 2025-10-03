import React, { useEffect, useState } from 'react';
import styles from './setup.module.css';

function Setup({ userType, onSetupComplete }) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Setting up your experience...');

  useEffect(() => {
    const messages = [
      'Setting up your experience...',
      'Loading your dashboard...',
      'Almost ready...'
    ];

    let currentMessage = 0;
    const messageInterval = setInterval(() => {
      currentMessage = (currentMessage + 1) % messages.length;
      setMessage(messages[currentMessage]);
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(messageInterval);
          setTimeout(() => {
            onSetupComplete();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [onSetupComplete]);

  return (
    <div className={styles.setupContainer}>
      <div className={styles.setupContent}>
        <div className={styles.logoContainer}>
          <img
            src="./logo.png"
            alt="Bus Logo"
            className={styles.logo}
          />
        </div>

        <div className={styles.textContainer}>
          <h1 className={styles.setupTitle}>
            Welcome to BusGo
          </h1>
          <p className={styles.setupSubtitle}>
            {userType === 'user' ? 'User Dashboard' : 'Conductor Dashboard'}
          </p>
        </div>

        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className={styles.progressText}>{progress}%</p>
          <p className={styles.progressMessage}>{message}</p>
        </div>

        <div className={styles.loadingDots}>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
          <div className={styles.dot}></div>
        </div>
      </div>
    </div>
  );
}

export default Setup;
