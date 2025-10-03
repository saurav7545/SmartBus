import React, { useState, useEffect } from 'react';
import Login from './login page/login';
import Bus from './trackies (user)/bus';
import Inter from './traceers (conductor)/inter';
import Loading from './Loading';
import Setup from './Setup';
import LoginSuccess from './components/LoginSuccess';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('user'); // 'user' or 'conductor'
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Simulate loading delay for splash screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds loading screen

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (selectedUserType, data) => {
    setUserType(selectedUserType);
    setUserData(data);
    
    if (selectedUserType === 'bus') {
      // Bus operator को success screen दिखाएं
      setShowLoginSuccess(true);
    } else {
      // User को directly setup screen (map) पर भेजें
      setShowSetup(true);
    }
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    setIsLoggedIn(true);
  };

  const handleContinueToDashboard = () => {
    setShowLoginSuccess(false);
    setShowSetup(true);
  };

  const handleLoginSuccessSkip = () => {
    setShowLoginSuccess(false);
    setIsLoggedIn(true);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (showLoginSuccess) {
    return (
      <LoginSuccess 
        userType={userType}
        userData={userData}
        onContinue={handleContinueToDashboard}
      />
    );
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

