import React, { useState } from 'react';

function Infopage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    conductorName: '',
    busName: '',
    busNumber: ''
  });
  const [location, setLocation] = useState(null);
  const [available, setAvailable] = useState(false);

  const questions = [
    { key: 'conductorName', label: 'Name of Conductor or Driver' },
    { key: 'busName', label: 'Name of Bus or Travels' },
    { key: 'busNumber', label: 'Bus Number' }
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [questions[step].key]: e.target.value });
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Save to localStorage
      localStorage.setItem('busInfo', JSON.stringify(formData));
      setStep(step + 1); // Move to summary page
    }
  };

  const handleGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to retrieve location');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser');
    }
  };

  const handleAvailability = () => {
    setAvailable(!available);
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0c8790 0%, #2478cd 100%)',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    padding: '20px'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    padding: '30px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px'
  };

  const buttonStyle = {
    background: '#2478cd',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    margin: '10px'
  };

  if (step < questions.length) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2>Step {step + 1} of {questions.length}</h2>
          <label>{questions[step].label}</label>
          <input
            type="text"
            value={formData[questions[step].key]}
            onChange={handleInputChange}
            style={inputStyle}
            placeholder={`Enter ${questions[step].label.toLowerCase()}`}
          />
          <button onClick={handleNext} style={buttonStyle}>
            {step === questions.length - 1 ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    );
  } else {
    // Summary page
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2>Bus Information Saved</h2>
          <p><strong>Conductor/Driver Name:</strong> {formData.conductorName}</p>
          <p><strong>Bus/Travels Name:</strong> {formData.busName}</p>
          <p><strong>Bus Number:</strong> {formData.busNumber}</p>
          <div>
            <button onClick={handleGPS} style={buttonStyle}>
              Get GPS Location
            </button>
            <button onClick={handleAvailability} style={buttonStyle}>
              {available ? 'Set Unavailable' : 'Set Available'}
            </button>
          </div>
          {location && (
            <p>Location: Latitude {location.latitude}, Longitude {location.longitude}</p>
          )}
          <p>Status: {available ? 'Available' : 'Unavailable'}</p>
        </div>
      </div>
    );
  }
}

export default Infopage;

