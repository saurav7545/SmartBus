import React from 'react';
import Dashboard from './serviceccontrol/dashboard';

function Inter({ userData }) {
  // The onLogout prop will be handled in a future step.
  // For now, we are focusing on passing the user data.
  return <Dashboard busInfo={userData} onLogout={() => alert('Logout functionality coming soon!')} />;
}

export default Inter;