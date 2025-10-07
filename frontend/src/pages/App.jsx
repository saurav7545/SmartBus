import React, { useState, useEffect } from 'react';
import Login from './Auth/Login';
import UserDashboard from './Dashboard/UserDashboard';
import BusInterface from '../components/UI/BusInterface';
import Loading from '../components/common/Loading';
import LoginSuccess from '../components/common/LoginSuccess';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('user'); // 'user' or 'conductor'
  const [isLoading, setIsLoading] = useState(true);
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
      // User को directly dashboard पर भेजें
      setIsLoggedIn(true);
    }
  };

  const handleContinueToDashboard = () => {
    setShowLoginSuccess(false);
    setIsLoggedIn(true);
    // Clean up temporary registration data from localStorage
    if (userType === 'bus') {
      localStorage.removeItem('busRegistration');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (showLoginSuccess) {
    return (
      <LoginSuccess 
        userType={userType}
        userData={userData.user}
        onContinue={handleContinueToDashboard}
      />
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div>
      {userType === 'user' ? <UserDashboard /> : <BusInterface userData={userData.user} />}
    </div>
  );
}

export default App;
