const express = require('express');
const router = express.Router();
const {  getUserById, searchUsers } = require('../controllers/user');

// Get user by ID
router.get('/:userId', getUserById);

// Get other users
router.get('/search/:q', searchUsers);


module.exports = router;
