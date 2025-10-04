import React, { useState } from 'react';
import styles from './login.module.css';
import Mode from './mode';
import Registration from '../dashboard/conductor/component/registration';

const FIXED_CREDENTIALS = {
  user: { email: 'user@smartbus.com', password: 'user123' },
};

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Mock authentication logic
      let isValidUser = false;
      let userData = {};

      if (userType === 'user') {
        // Check against fixed credentials for users
        if (email === FIXED_CREDENTIALS.user.email && password === FIXED_CREDENTIALS.user.password) {
          isValidUser = true;
          userData = {
            success: true,
            user: {
              id: 'user_001',
              name: 'Smart User',
              email: email,
              userType: 'user'
            },
            token: 'mock_token_' + Date.now()
          };
        }
      } else if (userType === 'bus') {
        // Check against localStorage for registered bus operators
        const registeredUsers = JSON.parse(localStorage.getItem('registeredBusOperators')) || [];
        const user = registeredUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
          isValidUser = true;
          userData = {
            success: true,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              userType: 'bus',
              busName: user.busName,
              busNumber: user.busNumber,
              route: user.route
            },
            token: 'mock_token_' + Date.now()
          };
        }
      }

      if (isValidUser) {
        console.log('Login successful:', userData);
        onLogin(userType, userData);
      } else {
        setError('Invalid email or password. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = (registeredEmail, registeredPassword) => {
    setEmail(registeredEmail);
    setPassword(registeredPassword);
    setUserType('bus');
    setShowRegistration(false);
    // Auto-submit login form
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  const handleBackToLogin = () => {
    setShowRegistration(false);
  };

  if (showRegistration) {
    return (
      <Registration 
        onBackToLogin={handleBackToLogin}
        onRegistrationSuccess={handleRegistrationSuccess}
      />
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.left}>
          <div className={styles.loginContainer}>
            <div className={styles.brand}>
              <img src={import.meta.env.BASE_URL + 'logo.png'} alt="SmartBus logo" className={styles.brandLogo} />
              <span className={styles.brandName}>SmartBus</span>
            </div>
            <h2 className={styles.loginTitle}>Login to SmartBus</h2>
            <p className={styles.subtitle}>Welcome back! Please enter your details to continue.</p>
            <Mode onModeChange={setUserType} />
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <button 
          type="submit" 
          className={styles.button}
          disabled={loading}
        >
          {loading ? 'Logging in...' : `Login as ${userType}`}
        </button>
            </form>

            <div className={styles.authLinks}>
              <button type="button" className={styles.linkButton} onClick={() => alert('Forgot password flow coming soon')}>Forgot password?</button>
              {userType === 'bus' && (
                <>
                  <span className={styles.linkDivider}>·</span>
                  <button 
                    type="button" 
                    className={styles.linkButton} 
                    onClick={() => setShowRegistration(true)}
                  >
                    Register for Bus Operator
                  </button>
                </>
              )}
            </div>
            {userType === 'user' && (
              <div className={styles.demoSection}>
                <div className={styles.demoHeader}>
                  <div className={styles.demoIcon}>🔐</div>
                  <h4 className={styles.demoTitle}>Demo Login Credentials</h4>
                </div>
                <div className={styles.demoContent}>
                  <div className={styles.userType}>
                    <span className={styles.userBadge}>For {userType}</span>
                  </div>
                  <div className={styles.credentialRow}>
                    <div className={styles.credentialItem}>
                      <span className={styles.credentialLabel}>Email:</span>
                      <span className={styles.credentialValue}>{FIXED_CREDENTIALS[userType].email}</span>
                    </div>
                    <div className={styles.credentialItem}>
                      <span className={styles.credentialLabel}>Password:</span>
                      <span className={styles.credentialValue}>{FIXED_CREDENTIALS[userType].password}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={styles.right}>
          <img src={import.meta.env.BASE_URL + 'logo.png'} alt="SmartBus" className={styles.heroImage} />
        </div>
      </div>
    </div>
  );
}

export default Login;