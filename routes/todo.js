const express = require('express');
const router = express.Router();
const { createTodo, getTodos, getTodoById, updateTodo, deleteTodo } = require('../controllers/todo');

// Create a todo
router.post('/', createTodo);

// Get all todos for a user
router.get('/', getTodos);

// Get a todo by ID
router.get('/:todoId', getTodoById);

// Update a todo by ID
router.put('/:todoId', updateTodo);

// Delete a todo by ID
router.delete('/:todoId', deleteTodo);

module.exports = router;
