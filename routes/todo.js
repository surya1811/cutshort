const express = require('express');
const router = express.Router();
const { createTodo, getTodos, getTodoById, updateTodo, deleteTodo } = require('../controllers/todo');
const { authenticateUser,authenticateEditTodo } = require('../middleware/authMiddleware');

// Create a todo
router.post('/', authenticateUser,createTodo);

// Get all todos for a user
router.get('/', authenticateUser,getTodos);

// Get a todo by ID
router.get('/:todoId', authenticateUser,getTodoById);

// Update a todo by ID
router.put('/:todoId', authenticateEditTodo,updateTodo);

// Delete a todo by ID
router.delete('/:todoId',authenticateEditTodo ,deleteTodo);

module.exports = router;
