import React, { useState } from 'react';

// Login component
export default function Login({ onSwitchToSignup, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Login successful!');
        if (data.token && data.user) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userRole', data.user.role);
          if (onLoginSuccess) {
            onLoginSuccess(data.token, data.user.role);
          }
        }
        setEmail('');
        setPassword('');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error or server is unreachable. Please ensure your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Main container background and text should respond to dark mode
    <div className="flex flex-col items-center w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <h1 className="bg-blue-600 text-white text-4xl font-bold text-center py-4 w-full rounded-t-lg flex items-center justify-center">
        Login
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col items-center p-6 w-full">
        {/* Label and Input for Email */}
        <label className='text-gray-700 dark:text-gray-300 font-semibold mb-2 self-start' htmlFor="login-email">Email</label>
        <input
          id="login-email"
          className='bg-gray-200 dark:bg-gray-700 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600 rounded-lg h-10 mb-4 w-full px-4
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600'
          type="email"
          placeholder="e.g., nagender@example.com"
          aria-label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Label and Input for Password */}
        <label className='text-gray-700 dark:text-gray-300 font-semibold mb-2 self-start' htmlFor="login-password">Password</label>
        <input
          id="login-password"
          className='bg-gray-200 dark:bg-gray-700 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600 rounded-lg h-10 mb-6 w-full px-4
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600'
          type="password"
          placeholder="********"
          aria-label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Forgot Password Link */}
        <a href="#" className="text-blue-600 dark:text-blue-400 text-sm mb-4 self-end hover:underline">Forgot Password?</a>

        {/* Login Button */}
        <button
          type="submit"
          className='bg-blue-600 text-white font-bold py-2 px-4 rounded-lg h-10 w-full
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
                     transition-colors duration-300 ease-in-out'
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* Message and Error Display */}
        {message && <p className="text-green-600 mt-4 text-center">{message}</p>}
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

        {/* Sign Up Link */}
        <p className="text-gray-700 dark:text-gray-300 text-sm mt-4">
          Don't have an account?{' '}
          <span
            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            onClick={onSwitchToSignup}
            role="button"
            tabIndex="0"
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
}
