import React, { useState } from 'react';

// Signup component
export default function Signup({ onSwitchToLogin }) {
  const [fullName, setFullName] = useState(''); // State for the full name input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // IMPORTANT FIX: Changed 'fullName' to 'name' to match backend's expectation
        body: JSON.stringify({ name: fullName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Registration successful!');
        setFullName('');
        setEmail('');
        setPassword('');
        // After successful signup, automatically switch to login
        if (onSwitchToLogin) {
          onSwitchToLogin();
        }
      } else {
        setError(data.message || 'Registration failed. ' + (data.message || 'Please try again.'));
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error or server is unreachable. Please ensure your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Main container background and text should respond to dark mode
    <div className="flex flex-col items-center w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <h1 className="bg-blue-600 text-white text-4xl font-bold text-center py-4 w-full rounded-t-lg flex items-center justify-center">
        Sign Up
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col items-center p-6 w-full">
        {/* Label and Input for Full Name */}
        <label className='text-gray-700 dark:text-gray-300 font-semibold mb-2 self-start' htmlFor="signup-name">Full Name</label>
        <input
          id="signup-name"
          className='bg-gray-200 dark:bg-gray-700 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600 rounded-lg h-10 mb-4 w-full px-4
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600'
          type="text"
          placeholder="e.g., Nagender Gameti"
          aria-label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        {/* Label and Input for Email */}
        <label className='text-gray-700 dark:text-gray-300 font-semibold mb-2 self-start' htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
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
        <label className='text-gray-700 dark:text-gray-300 font-semibold mb-2 self-start' htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
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

        <button
          type="submit"
          className='bg-blue-600 text-white font-bold py-2 px-4 rounded-lg h-10 w-full
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
                     transition-colors duration-300 ease-in-out'
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Sign Up'}
        </button>

        {message && <p className="text-green-600 mt-4 text-center">{message}</p>}
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

        <p className="text-gray-700 dark:text-gray-300 text-sm mt-4">
          Already have an account?{' '}
          <span
            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            onClick={onSwitchToLogin}
            role="button"
            tabIndex="0"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
