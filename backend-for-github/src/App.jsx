import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check for stored token on app load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('login');
  };

  const switchToRegister = () => setCurrentView('register');
  const switchToLogin = () => setCurrentView('login');

  // If user is logged in, show dashboard
  if (user && token) {
    return <Dashboard user={user} token={token} onLogout={handleLogout} />;
  }

  // Show login or register form
  return (
    <div className="container">
      {currentView === 'login' ? (
        <LoginForm 
          onLogin={handleLogin} 
          onSwitchToRegister={switchToRegister}
        />
      ) : (
        <RegisterForm 
          onRegister={handleLogin}
          onSwitchToLogin={switchToLogin}
        />
      )}
    </div>
  );
}

export default App;