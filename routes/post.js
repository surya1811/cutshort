const express = require('express');
const router = express.Router();
const { createPost, getPosts, getPostById,updatePost, deletePost, addComment } = require('../controllers/post');
const { authenticateUser,authenticateEditPost } = require('../middleware/authMiddleware');

// Create a post
router.post('/',authenticateUser, createPost);

// Get all posts
router.get('/', authenticateUser,getPosts);

// Get a post by ID
router.get('/:postId',authenticateUser, getPostById);


//update post by postid
router.put('/:postId', authenticateUser,updatePost);

// Delete a post by ID
router.delete('/:postId',authenticateEditPost, deletePost);

// Add a comment to a post
router.post('/:postId/comment',authenticateUser, addComment);

module.exports = router;
