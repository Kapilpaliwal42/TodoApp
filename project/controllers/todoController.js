import Todo from '../models/todo.js'; // Import the Todo model
import User from '../database/user.js'; // Import the User model to populate email

// Define roles that have elevated privileges to manage all todos
const ELEVATED_ROLES = ['admin', 'superAdmin', 'manager'];

// @desc    Create a new todo
// @route   POST /api/todos
// @access  Private (requires authentication)
export const createTodo = async (req, res) => {
  try {
    const { text } = req.body; // Get the todo text from the request body

    // Basic validation
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Todo text is required.' });
    }

    // Create a new todo, associating it with the authenticated user
    const newTodo = await Todo.create({
      text,
      user: req.user.id // Assign the todo to the logged-in user
    });

    res.status(201).json({ message: 'Todo created successfully', todo: newTodo });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Get all todos (for admin/manager) or user's own todos (for regular users)
//          Can also get todos for a specific userId if requested by an elevated role
// @route   GET /api/todos?userId=<id>
// @access  Private (requires authentication)
export const getTodos = async (req, res) => {
  try {
    let query = {}; // Initialize an empty query object
    const { userId } = req.query; // Get userId from query parameters

    // Check if the authenticated user has an elevated role
    if (ELEVATED_ROLES.includes(req.user.role)) {
      // If an elevated role provided a userId in the query, filter by that user
      if (userId) {
        // Optional: Verify if the userId exists, or handle cases where it doesn't
        const targetUser = await User.findById(userId);
        if (!targetUser) {
          return res.status(404).json({ message: 'Target user not found.' });
        }
        query = { user: userId };
      }
      // If elevated role and no userId query, query remains empty to fetch all todos
    } else {
      // If not an elevated role, restrict query to their own todos
      query = { user: req.user.id };
    }

    // Fetch todos and populate the 'user' field to get email for display in frontend
    const todos = await Todo.find(query).populate('user', 'email').sort({ createdAt: -1 });

    res.status(200).json({ todos });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Update a specific todo
// @route   PUT /api/todos/:id
// @access  Private (requires authentication)
export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params; // Get todo ID from URL parameters
    const { text, completed } = req.body; // Get updated fields from request body

    let todo;
    // Check if the authenticated user has an elevated role
    if (ELEVATED_ROLES.includes(req.user.role)) {
      // Elevated role: find any todo by ID
      todo = await Todo.findById(id);
    } else {
      // Regular user: find todo by ID AND ensure it belongs to them
      todo = await Todo.findOne({ _id: id, user: req.user.id });
    }

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found or you do not have permission to update it.' });
    }

    // Update fields if provided
    if (text !== undefined) {
      todo.text = text;
    }
    if (completed !== undefined) {
      todo.completed = completed;
    }

    await todo.save(); // Save the updated todo
    // Re-populate user data if it was populated before, for consistent response
    await todo.populate('user', 'email');

    res.status(200).json({ message: 'Todo updated successfully', todo });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Delete a specific todo
// @route   DELETE /api/todos/:id
// @access  Private (requires authentication)
export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params; // Get todo ID from URL parameters

    let result;
    // Check if the authenticated user has an elevated role
    if (ELEVATED_ROLES.includes(req.user.role)) {
      // Elevated role: delete any todo by ID
      result = await Todo.deleteOne({ _id: id });
    } else {
      // Regular user: delete todo by ID AND ensure it belongs to them
      result = await Todo.deleteOne({ _id: id, user: req.user.id });
    }

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Todo not found or you do not have permission to delete it.' });
    }

    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
