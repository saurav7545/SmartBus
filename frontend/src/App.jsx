import React, { useState, useEffect } from 'react';
import Login from './login page/login';
import Mode from './login page/mode';
import Bus from './trackies (user)/bus';
import Inter from './traceers (conductor)/inter';
import Loading from './Loading';
import Setup from './Setup';
import buscount from './trackies (user)/component/buscount';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('user'); // 'user' or 'conductor'
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    // Simulate loading delay for splash screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds loading screen

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (selectedUserType, data) => {
    setUserType(selectedUserType);
    setShowSetup(true);
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    setIsLoggedIn(true);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (showSetup) {
    return <Setup userType={userType} onSetupComplete={handleSetupComplete} />;
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div>
      {userType === 'user' ? <Bus /> : <Inter />}
    </div>
  );
}

export default App;

