const express = require('express');
const router = express.Router();
const { addPostComment, getUserById, searchUsers } = require('../controllers/user');

// Get user by ID
router.get('/:userId', getUserById);

// Get other users
router.get('/search/:q', searchUsers);

// Post comment of own 
router.post('/:userId/postComment', addPostComment);

module.exports = router;
