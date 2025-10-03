import React, { useState } from 'react';

import styles from './registrationb.css';

function Infopage() {
  const [formData, setFormData] = useState({
    driverName: '',
    busName: '',
    travelAgency: '',
    busNumber: ''
  });
  const [registered, setRegistered] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save to localStorage
    localStorage.setItem('busInfo', JSON.stringify(formData));
    setRegistered(true);
  };

  if (!registered) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2>Bus Registration</h2>
          <form onSubmit={handleSubmit}>
            <label>Bus Name</label>
            <input
              type="text"
              name="busName"
              value={formData.busName}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter bus name"
              required
            />
            <label>Driver Name</label>
            <input
              type="text"
              name="driverName"
              value={formData.driverName}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter driver name"
              required
            />
            <label>Travel Agency</label>
            <input
              type="text"
              name="travelAgency"
              value={formData.travelAgency}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter travel agency"
              required
            />
            <label>Bus Number</label>
            <input
              type="text"
              name="busNumber"
              value={formData.busNumber}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter bus number"
              required
            />
            <button type="submit" className={styles.button}>
              Register
            </button>
          </form>
        </div>
      </div>
    );
  } else {
    // Registered page
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2>Bus Information</h2>
          <p><strong>Bus Name:</strong> {formData.busName}</p>
          <p><strong>Driver Name:</strong> {formData.driverName}</p>
          <p><strong>Travel Agency:</strong> {formData.travelAgency}</p>
          <p><strong>Bus Number:</strong> {formData.busNumber}</p>
        </div>
      </div>
    );
  }
}

export default Infopage;
