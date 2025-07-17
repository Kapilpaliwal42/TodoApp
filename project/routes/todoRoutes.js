import express from 'express';
import { createTodo, getTodos, updateTodo, deleteTodo } from '../controllers/todoController.js';
import { protect, authorization } from '../middlewares/middlewares.js'; // Import authorization middleware

const router = express.Router();

// Define roles that can manage ALL todos
// You can adjust these roles based on your desired hierarchy
const ADMIN_ROLES = ['admin', 'superAdmin', 'manager'];

// Routes for creating and getting todos
router.route('/')
  .post(protect, createTodo) // Create a new todo (will be associated with the user who creates it)
  // For GET, allow ADMIN_ROLES to see all todos, others see their own
  .get(protect, getTodos);

// Routes for updating and deleting specific todos
router.route('/:id')
  // For PUT and DELETE, allow ADMIN_ROLES to modify/delete any todo, others only their own
  .put(protect, updateTodo)
  .delete(protect, deleteTodo);

export default router;
