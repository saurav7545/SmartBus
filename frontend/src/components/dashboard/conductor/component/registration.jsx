import React, { useState } from 'react';
import styles from './registration.module.css';

function Registration({ onBackToLogin, onRegistrationSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    busName: '',
    busNumber: '',
    route: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    if (!formData.busName.trim()) newErrors.busName = 'Bus name is required';
    if (!formData.busNumber.trim()) newErrors.busNumber = 'Bus number is required';
    if (!formData.route.trim()) newErrors.route = 'Route is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call - replace with actual backend endpoint
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: 'bus',
          busName: formData.busName,
          busNumber: formData.busNumber,
          route: formData.route
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Store registration data in localStorage
        localStorage.setItem('busRegistration', JSON.stringify({
          name: formData.name,
          email: formData.email,
          busName: formData.busName,
          busNumber: formData.busNumber,
          route: formData.route
        }));
        
        // Call success callback after 2 seconds
        setTimeout(() => {
          onRegistrationSuccess(formData.email, formData.password);
        }, 2000);
      } else {
        setErrors({ general: data.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successIcon}>🎉</div>
          <h2 className={styles.successTitle}>Welcome {formData.name}!</h2>
          <p className={styles.successMessage}>
            Your SmartBus account has been created successfully! 
            You can now login with your credentials.
          </p>
          <div className={styles.successDetails}>
            <div className={styles.successCard}>
              <h3>🚌 Your Bus Details</h3>
              <p><strong>Operator:</strong> {formData.name}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Bus:</strong> {formData.busName}</p>
              <p><strong>Number:</strong> {formData.busNumber}</p>
              <p><strong>Route:</strong> {formData.route}</p>
            </div>
          </div>
          <p className={styles.redirectMessage}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>🚌</div>
          <h2>Bus Operator Registration</h2>
          <p>Join SmartBus network and manage your bus operations</p>
        </div>

        {errors.general && (
          <div className={styles.errorMessage}>{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? styles.inputError : styles.input}
                placeholder="Full Name"
              />
              {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? styles.inputError : styles.input}
                placeholder="Email Address"
              />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? styles.inputError : styles.input}
                placeholder="Password"
              />
              {errors.password && <span className={styles.error}>{errors.password}</span>}
            </div>

            <div className={styles.formGroup}>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? styles.inputError : styles.input}
                placeholder="Confirm Password"
              />
              {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
            </div>

            <div className={styles.formGroup}>
              <input
                type="text"
                id="busName"
                name="busName"
                value={formData.busName}
                onChange={handleInputChange}
                className={errors.busName ? styles.inputError : styles.input}
                placeholder="Bus Name"
              />
              {errors.busName && <span className={styles.error}>{errors.busName}</span>}
            </div>

            <div className={styles.formGroup}>
              <input
                type="text"
                id="busNumber"
                name="busNumber"
                value={formData.busNumber}
                onChange={handleInputChange}
                className={errors.busNumber ? styles.inputError : styles.input}
                placeholder="Bus Number"
              />
              {errors.busNumber && <span className={styles.error}>{errors.busNumber}</span>}
            </div>

            <div className={styles.formGroup}>
              <input
                type="text"
                id="route"
                name="route"
                value={formData.route}
                onChange={handleInputChange}
                className={errors.route ? styles.inputError : styles.input}
                placeholder="Route (e.g., Delhi to Dehradun)"
              />
              {errors.route && <span className={styles.error}>{errors.route}</span>}
            </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={onBackToLogin}
              className={styles.secondaryButton}
            >
              Back to Login
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Registration;
