const express = require('express');
const router = express.Router();
const { registerUser, loginUser ,generateNewAccessToken} = require('../controllers/auth');

// Register user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

router.post("/generateNewAccessToken",generateNewAccessToken)

module.exports = router;
