import React from 'react';
import Dashboard from './serviceccontrol/dashboard';

function Inter({ userData, onLogout }) {
  return <Dashboard busInfo={userData} onLogout={onLogout} />;
}

export default Inter;