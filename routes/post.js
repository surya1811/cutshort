const express = require('express');
const router = express.Router();
const { createPost, getPosts, getPostById, deletePost, addComment } = require('../controllers/post');

// Create a post
router.post('/', createPost);

// Get all posts
router.get('/', getPosts);

// Get a post by ID
router.get('/:postId', getPostById);

// Delete a post by ID
router.delete('/:postId', deletePost);

// Add a comment to a post
router.post('/:postId/comment', addComment);

module.exports = router;
