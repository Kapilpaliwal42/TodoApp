import React, { useState, useEffect } from 'react';
import Signup from './Signup.jsx';
import Login from './login.jsx';
import TodoList from './TodoList.jsx';
import AdminDashboard from './AdminDashboard.jsx'; 
import './App.css'; 

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState(null); 
  const [currentUserRole, setCurrentUserRole] = useState(null); 

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole'); 
    if (token && role) {
      setAuthToken(token);
      setCurrentUserRole(role); 
      setIsLoggedIn(true);
    }
  }, []); 

  const resetView = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  const handleLoginSuccess = (token, role) => { 
    setAuthToken(token);
    setCurrentUserRole(role); 
    setIsLoggedIn(true);
    setShowLogin(false); 
    setShowSignup(false); 
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole'); 
    setAuthToken(null);
    setCurrentUserRole(null); 
    setIsLoggedIn(false);
    resetView(); 
  };

  const handleSwitchToLogin = () => {
    setShowLogin(true);
    setShowSignup(false);
  };

  const handleSwitchToSignup = () => {
    setShowSignup(true);
    setShowLogin(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 font-sans p-4 relative">

      {(showLogin || showSignup) && (
        <button
          onClick={resetView}
          className="absolute top-4 right-4 bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md
                     hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75
                     transition-colors duration-300 ease-in-out z-10"
          aria-label="Close form"
        >
          Close
        </button>
      )}

      {isLoggedIn && (
        <button
          onClick={handleLogout}
          className="absolute top-4 left-4 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow-md
                     hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75
                     transition-colors duration-300 ease-in-out z-10"
          aria-label="Logout"
        >
          Logout
        </button>
      )}

      {isLoggedIn ? (
        currentUserRole === 'admin' || currentUserRole === 'superAdmin' || currentUserRole === 'manager' || currentUserRole === 'moderator' ? (
          <AdminDashboard authToken={authToken} currentUserRole={currentUserRole} />
        ) : (
          <TodoList authToken={authToken} />
        )
      ) : showLogin ? (
        <Login onLoginSuccess={handleLoginSuccess} onSwitchToSignup={handleSwitchToSignup} />
      ) : showSignup ? (
        <Signup onSwitchToLogin={handleSwitchToLogin} />
      ) : (
        <div className="flex flex-col items-center w-full max-w-sm bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl overflow-hidden p-6">
          <h1 className="bg-blue-600 text-white text-4xl font-bold text-center py-4 w-full rounded-t-lg -mx-6 -mt-6 mb-6 flex items-center justify-center">
            Welcome
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-lg text-center mb-6">
            Please choose an option to proceed.
          </p>

          <button
            className='bg-blue-600 text-white font-bold py-3 px-6 rounded-lg h-12 w-full mb-4
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
                       transition-colors duration-300 ease-in-out text-lg'
            onClick={handleSwitchToLogin}
          >
            Login
          </button>

          <button
            className='bg-green-600 text-white font-bold py-3 px-6 rounded-lg h-12 w-full
                       hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75
                       transition-colors duration-300 ease-in-out text-lg'
            onClick={handleSwitchToSignup}
          >
            Sign Up
          </button>
        </div>
      )}
    </div>
  );
}
