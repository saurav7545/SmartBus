import React, { useState } from 'react';
import styles from './login.module.css';
import Mode from './mode';

const FIXED_CREDENTIALS = {
  user: { email: 'user@smartbus.com', password: 'user123' },
  bus: { email: 'bus@smartbus.com', password: 'bus123' }
};

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          userType: userType
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Login successful:', data);
        onLogin(userType, data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <span className={styles.linkDivider}>·</span>
              <button type="button" className={styles.linkButton} onClick={() => alert('Sign up flow coming soon')}>Create account</button>
            </div>
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