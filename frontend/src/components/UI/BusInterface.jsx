import React from 'react';
import ConductorDashboard from '../../pages/Dashboard/ConductorDashboard';

function BusInterface({ userData, onLogout }) {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback logout logic
      localStorage.clear();
      alert('You have been logged out successfully!');
      window.location.reload();
    }
  };

  return <ConductorDashboard busInfo={userData} onLogout={handleLogout} />;
}

export default BusInterface;
