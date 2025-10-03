import React from 'react';

function Loading() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #0c8790 0%, #2478cd 100%)',
      color: 'white',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <img src="./logo.png" alt="Bus Logo" style={{ width: '200px', height: '200px', marginBottom: '20px', opacity: 0.8 }} />
        <p>Loading...</p>
      </div>
    </div>
  );
}

export default Loading;
