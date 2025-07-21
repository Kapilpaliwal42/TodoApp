import React, { useState, useEffect } from 'react';
import TodoList from './TodoList.jsx'; // Import TodoList to render it here

export default function AdminDashboard({ authToken, currentUserRole }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [viewingUserId, setViewingUserId] = useState(null); // State to store the ID of the user whose todos are being viewed
  const [viewingUserEmail, setViewingUserEmail] = useState(null); // State to store the email of the user whose todos are being viewed

  // Define available roles for the dropdown, matching backend's ROLE_LEVELS
  // IMPORTANT FIX: Ensure 'superAdmin' capitalization is consistent here
  const availableRoles = ['user', 'moderator', 'admin', 'superAdmin', 'manager'];

  // Define role levels for client-side hierarchy checks, MUST match backend's ROLE_LEVELS
  // This was already corrected in the previous turn, ensuring 'superAdmin' capitalization.
  const ROLE_LEVELS = {
    user: 0,
    moderator: 1,
    admin: 2,
    superAdmin: 3, // Corrected to match 'superAdmin' capitalization
    manager: 4
  };

  // Function to fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      // Added pagination parameters to the request
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/auth/users?page=1&limit=100`, { // Fetching a reasonable number of users
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.message || 'Failed to fetch users. Ensure you have permission.');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Network error or server is unreachable while fetching users. Ensure your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Function to change a user's role
  const handleChangeRole = async (userId, email, newRole) => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/auth/changeRole`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ email, newRole }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || `Role for ${email} updated to ${newRole}.`);
        // Update the user's role in the local state
        setUsers(users.map(user =>
          user._id === userId ? { ...user, role: newRole } : user
        ));
      } else {
        setError(data.message || 'Failed to change role. Check your permissions.');
      }
    } catch (err) {
      console.error('Error changing role:', err);
      setError('Network error or server is unreachable while changing role.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle deleting a user
  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user: ${userEmail}? This action cannot be undone.`)) {
      return; // User cancelled
    }

    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || `User ${userEmail} deleted successfully.`);
        setUsers(users.filter(user => user._id !== userId)); // Remove user from state
      } else {
        setError(data.message || 'Failed to delete user. Check your permissions.');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Network error or server is unreachable while deleting user.');
    } finally {
      setLoading(false);
    }
  };


  // Function to handle viewing a specific user's todos
  const handleViewUserTodos = (userId, userEmail) => {
    setViewingUserId(userId);
    setViewingUserEmail(userEmail);
  };

  // Function to go back to the user list
  const handleBackToUsers = () => {
    setViewingUserId(null);
    setViewingUserEmail(null);
    fetchUsers(); // Re-fetch users to ensure list is up-to-date
  };

  // Fetch users on component mount or when authToken/currentUserRole changes
  useEffect(() => {
    // Only fetch if authenticated and the current user has an admin-level role
    // IMPORTANT FIX: Ensure 'superAdmin' capitalization is consistent here
    if (authToken && (currentUserRole === 'admin' || currentUserRole === 'superAdmin' || currentUserRole === 'manager')) {
      fetchUsers();
    } else if (authToken && currentUserRole && currentUserRole !== 'admin' && currentUserRole !== 'superAdmin' && currentUserRole !== 'manager') {
      setError('You do not have sufficient administrative privileges to view this dashboard.');
    }
  }, [authToken, currentUserRole]); // Re-run if authToken or currentUserRole changes

  // Display message if not logged in
  if (!authToken) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-sm bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl overflow-hidden p-6 text-center text-red-500">
        Please log in to access the Admin Dashboard.
      </div>
    );
  }

  // Display access denied if not an admin/superAdmin/manager
  // IMPORTANT FIX: Ensure 'superAdmin' capitalization is consistent here
  if (currentUserRole !== 'admin' && currentUserRole !== 'superAdmin' && currentUserRole !== 'manager') {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-sm bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl overflow-hidden p-6 text-center text-red-500">
        Access Denied: You must be an administrator, super administrator, or manager to view this page.
      </div>
    );
  }

  // If viewing a specific user's todos, render TodoList
  if (viewingUserId) {
    return (
      <div className="flex flex-col items-center w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl overflow-hidden p-6">
        <button
          onClick={handleBackToUsers}
          className="self-start mb-4 bg-gray-500 dark:bg-gray-700 text-white dark:text-gray-200 font-bold py-2 px-4 rounded-lg
                     hover:bg-gray-600 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75
                     transition-colors duration-300 ease-in-out"
        >
          &larr; Back to Users
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Todos for {viewingUserEmail || 'Selected User'}
        </h2>
        {/* Pass the viewingUserId to TodoList */}
        <TodoList authToken={authToken} currentUserRole={currentUserRole} viewingUserId={viewingUserId} viewingUserEmail={viewingUserEmail} />
      </div>
    );
  }

  // Otherwise, render the user list dashboard
  return (
    <div className="flex flex-col items-center w-full max-w-4xl bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl overflow-hidden p-6">
      <h1 className="bg-blue-600 text-white text-4xl font-bold text-center py-4 w-full rounded-t-lg -mx-6 -mt-6 mb-6 flex items-center justify-center">
        Admin Dashboard
      </h1>

      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
      {message && <p className="text-green-600 mb-4 text-center">{message}</p>}
      {loading && <p className="text-blue-600 mb-4 text-center">Loading users...</p>}

      {users.length === 0 && !loading && !error && (
        <p className="text-gray-700 dark:text-gray-300 text-center">No users to display.</p>
      )}

      {users.length > 0 && (
        <div className="w-full overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow-md">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Name</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Email</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Current Role</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Change Role To</th>
                <th className="py-3 px-4 text-left text-gray-700 dark:text-gray-200 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                // Get current user's email from localStorage for self-comparison
                const loggedInUserEmail = localStorage.getItem('userEmail');
                const isCurrentUser = user.email === loggedInUserEmail;

                // Determine if the dropdown should be disabled
                // FIX: Simplified logic. Disable if loading, is current user, or current user's role level is less than target user's role level.
                const isDropdownDisabled =
                  loading ||
                  isCurrentUser ||
                  (ROLE_LEVELS[currentUserRole] < ROLE_LEVELS[user.role]);

                return (
                  <tr key={user._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-100">{user.name}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-100">{user.email}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-100 capitalize">{user.role}</td>
                    <td className="py-3 px-4">
                      <select
                        className="bg-gray-200 dark:bg-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={user.role} // Set current role as default selected
                        onChange={(e) => handleChangeRole(user._id, user.email, e.target.value)}
                        disabled={isDropdownDisabled}
                      >
                        {availableRoles.map(role => (
                          <option
                            key={role}
                            value={role}
                            className="capitalize"
                            // FIX: Disable options if the new role is higher than current user's role
                            // IMPORTANT FIX: Ensure 'superAdmin' capitalization is consistent here
                            disabled={
                              ROLE_LEVELS[role] > ROLE_LEVELS[currentUserRole] ||
                              (user.role === 'superAdmin' && currentUserRole !== 'superAdmin')
                            }
                          >
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 flex space-x-2">
                      <button
                        onClick={() => handleViewUserTodos(user._id, user.email)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-200"
                      >
                        View Todos
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id, user.email)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-colors duration-200"
                        // Disable delete button if:
                        // 1. Loading
                        // 2. Current user trying to delete themselves
                        // 3. Current user's role is lower than or equal to target user's role (unless current user is superAdmin)
                        // 4. Target user is superAdmin and current user is not superAdmin
                        disabled={
                          loading ||
                          isCurrentUser ||
                          (ROLE_LEVELS[currentUserRole] <= ROLE_LEVELS[user.role] && currentUserRole !== 'superAdmin') ||
                          (user.role === 'superAdmin' && currentUserRole !== 'superAdmin')
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
