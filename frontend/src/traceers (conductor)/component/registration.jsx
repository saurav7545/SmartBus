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
    routeFrom: '',
    routeTo: '',
    travelAgency: '',
    phoneNumber: '',
    licenseNumber: ''
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
    if (!formData.routeFrom.trim()) newErrors.routeFrom = 'Route from is required';
    if (!formData.routeTo.trim()) newErrors.routeTo = 'Route to is required';
    if (!formData.travelAgency.trim()) newErrors.travelAgency = 'Travel agency is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';

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

    // Phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
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
          routeFrom: formData.routeFrom,
          routeTo: formData.routeTo,
          travelAgency: formData.travelAgency,
          phoneNumber: formData.phoneNumber,
          licenseNumber: formData.licenseNumber
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
          routeFrom: formData.routeFrom,
          routeTo: formData.routeTo,
          travelAgency: formData.travelAgency,
          phoneNumber: formData.phoneNumber,
          licenseNumber: formData.licenseNumber
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
          <div className={styles.successIcon}>✅</div>
          <h2 className={styles.successTitle}>Registration Successful!</h2>
          <p className={styles.successMessage}>
            Your bus conductor account has been created successfully. 
            You can now login with your credentials.
          </p>
          <div className={styles.successDetails}>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Bus:</strong> {formData.busName} ({formData.busNumber})</p>
            <p><strong>Route:</strong> {formData.routeFrom} → {formData.routeTo}</p>
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
          <h2>Bus Conductor Registration</h2>
          <p>Create your account to start managing your bus</p>
        </div>

        {errors.general && (
          <div className={styles.errorMessage}>{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            <h3>Personal Information</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? styles.inputError : styles.input}
                placeholder="Enter your full name"
              />
              {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? styles.inputError : styles.input}
                placeholder="Enter your email address"
              />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className={errors.phoneNumber ? styles.inputError : styles.input}
                placeholder="Enter your 10-digit phone number"
              />
              {errors.phoneNumber && <span className={styles.error}>{errors.phoneNumber}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="licenseNumber">License Number *</label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className={errors.licenseNumber ? styles.inputError : styles.input}
                placeholder="Enter your driving license number"
              />
              {errors.licenseNumber && <span className={styles.error}>{errors.licenseNumber}</span>}
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>Login Credentials</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? styles.inputError : styles.input}
                placeholder="Create a strong password"
              />
              {errors.password && <span className={styles.error}>{errors.password}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? styles.inputError : styles.input}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>Bus Information</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="busName">Bus Name *</label>
              <input
                type="text"
                id="busName"
                name="busName"
                value={formData.busName}
                onChange={handleInputChange}
                className={errors.busName ? styles.inputError : styles.input}
                placeholder="Enter bus name"
              />
              {errors.busName && <span className={styles.error}>{errors.busName}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="busNumber">Bus Number *</label>
              <input
                type="text"
                id="busNumber"
                name="busNumber"
                value={formData.busNumber}
                onChange={handleInputChange}
                className={errors.busNumber ? styles.inputError : styles.input}
                placeholder="Enter bus number (e.g., UP-14-AB-1234)"
              />
              {errors.busNumber && <span className={styles.error}>{errors.busNumber}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="travelAgency">Travel Agency *</label>
              <input
                type="text"
                id="travelAgency"
                name="travelAgency"
                value={formData.travelAgency}
                onChange={handleInputChange}
                className={errors.travelAgency ? styles.inputError : styles.input}
                placeholder="Enter travel agency name"
              />
              {errors.travelAgency && <span className={styles.error}>{errors.travelAgency}</span>}
            </div>

            <div className={styles.routeGroup}>
              <div className={styles.formGroup}>
                <label htmlFor="routeFrom">Route From *</label>
                <input
                  type="text"
                  id="routeFrom"
                  name="routeFrom"
                  value={formData.routeFrom}
                  onChange={handleInputChange}
                  className={errors.routeFrom ? styles.inputError : styles.input}
                  placeholder="Starting point"
                />
                {errors.routeFrom && <span className={styles.error}>{errors.routeFrom}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="routeTo">Route To *</label>
                <input
                  type="text"
                  id="routeTo"
                  name="routeTo"
                  value={formData.routeTo}
                  onChange={handleInputChange}
                  className={errors.routeTo ? styles.inputError : styles.input}
                  placeholder="Destination"
                />
                {errors.routeTo && <span className={styles.error}>{errors.routeTo}</span>}
              </div>
            </div>
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
              {loading ? 'Creating Account...' : 'Register Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Registration;
