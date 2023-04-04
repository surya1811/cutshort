const express = require('express');
const router = express.Router();
const { createPost, getPosts, getPostById,updatePost, deletePost, addComment } = require('../controllers/post');
const { authenticateUser } = require('../middleware/authMiddleware');

// Create a post
router.post('/', createPost);

// Get all posts
router.get('/', getPosts);

// Get a post by ID
router.get('/:postId', getPostById);


//update post by postid
router.put('/:postId', authenticateUser,updatePost);

// Delete a post by ID
router.delete('/:postId',authenticateUser, deletePost);

// Add a comment to a post
router.post('/:postId/comment', addComment);

module.exports = router;
