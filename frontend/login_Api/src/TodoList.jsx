import React, { useState, useEffect } from 'react';

export default function TodoList({ authToken, currentUserRole }) { // Added currentUserRole prop
  const [todos, setTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Determine if the current user has an elevated role
  const isElevatedRole = currentUserRole === 'admin' || currentUserRole === 'superAdmin' || currentUserRole === 'manager';

  // Function to fetch todos from the backend
  const fetchTodos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3000/api/todos', {
        headers: {
          'Authorization': `Bearer ${authToken}`, // Include the authentication token
        },
      });
      const data = await response.json();
      if (response.ok) {
        setTodos(data.todos || []); // Set the fetched todos
      } else {
        setError(data.message || 'Failed to fetch todos. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Network error or server is unreachable while fetching todos. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // useEffect hook to fetch todos when the component mounts or authToken changes
  useEffect(() => {
    if (authToken) { // Only fetch if an authentication token is available
      fetchTodos();
    }
  }, [authToken]); // Dependency array: re-run if authToken changes

  // Function to add a new todo item
  const addTodo = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!newTodoText.trim()) { // Basic validation for empty text
      setError('Todo text cannot be empty.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`, // Include the token
        },
        body: JSON.stringify({ text: newTodoText }), // Send the new todo text
      });
      const data = await response.json();
      if (response.ok) {
        // If an elevated user adds a todo, and they are viewing all todos,
        // we might need to re-fetch all todos to ensure the new one appears if it's for another user.
        // For now, we assume it's for the current user and add to the top.
        // If admins need to add todos for specific users, that would require a more complex UI/API.
        setTodos([data.todo, ...todos]); // Add the new todo to the beginning of the list
        setNewTodoText(''); // Clear the input field
      } else {
        setError(data.message || 'Failed to add todo.');
      }
    } catch (err) {
      console.error('Error adding todo:', err);
      setError('Network error or server is unreachable while adding todo.');
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle todo completion status
  const toggleTodo = async (id, currentCompleted) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:3000/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`, // Include the token
        },
        body: JSON.stringify({ completed: !currentCompleted }), // Toggle the completed status
      });
      const data = await response.json();
      if (response.ok) {
        // Update the specific todo item in the state
        setTodos(todos.map(todo =>
          todo._id === id ? { ...todo, completed: data.todo.completed } : todo
        ));
      } else {
        setError(data.message || 'Failed to update todo.');
      }
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Network error or server is unreachable while updating todo.');
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a todo item
  const deleteTodo = async (id) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:3000/api/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`, // Include the token
        },
      });
      if (response.ok) {
        // Remove the deleted todo from the state
        setTodos(todos.filter(todo => todo._id !== id));
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete todo.');
      }
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Network error or server is unreachable while deleting todo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xl overflow-hidden p-6">
      <h1 className="bg-blue-600 text-white text-4xl font-bold text-center py-4 w-full rounded-t-lg -mx-6 -mt-6 mb-6 flex items-center justify-center">
        {isElevatedRole ? 'All Todos (Admin View)' : 'My Todo List'} {/* Dynamic Title */}
      </h1>

      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
      {loading && <p className="text-blue-600 mb-4 text-center">Loading...</p>}

      {/* Form to add new todo */}
      <form onSubmit={addTodo} className="flex w-full mb-6">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-grow bg-gray-200 dark:bg-gray-700 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600 rounded-l-lg h-10 px-4
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-r-lg h-10
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
                     transition-colors duration-300 ease-in-out"
          disabled={loading} // Disable button when loading
        >
          Add Todo
        </button>
      </form>

      {/* Message when no todos are present */}
      {todos.length === 0 && !loading && !error && (
        <p className="text-gray-700 dark:text-gray-300 text-center">No todos yet. Add one above!</p>
      )}

      {/* List of todos */}
      <ul className="w-full space-y-3">
        {todos.map((todo) => (
          <li
            key={todo._id} // Use unique _id from MongoDB as key
            className={`flex items-center justify-between p-3 rounded-lg shadow-md
                        ${todo.completed ? 'bg-green-100 dark:bg-green-800 line-through text-gray-500 dark:text-gray-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'}`}
          >
            <span
              className="flex-grow cursor-pointer"
              onClick={() => toggleTodo(todo._id, todo.completed)} // Toggle completion on click
            >
              {todo.text}
              {isElevatedRole && todo.user && ( // Show user's email for elevated roles
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  (User: {todo.user.email || todo.user}) {/* Display user email if populated, else ID */}
                </span>
              )}
            </span>
            <button
              onClick={() => deleteTodo(todo._id)} // Delete todo on click
              className="ml-4 p-2 bg-red-500 text-white rounded-full text-sm
                         hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75
                         transition-colors duration-200"
              aria-label={`Delete todo: ${todo.text}`}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
