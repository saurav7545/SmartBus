import React from 'react';
import ConductorDashboard from '../../pages/Dashboard/ConductorDashboard';

function BusInterface({ userData }) {
  const handleLogout = () => {
    // Clear localStorage
    localStorage.clear();
    
    // Show confirmation and reload
    alert('You have been logged out successfully!');
    
    // Reload the page to reset to login state
    window.location.reload();
  };

  return <ConductorDashboard busInfo={userData} onLogout={handleLogout} />;
}

export default BusInterface;
