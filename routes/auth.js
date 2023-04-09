const express = require('express');
const router = express.Router();
const { registerUser, loginUser ,generateNewAccessToken} = require('../controllers/auth');
const {  accessTokenRateLimiter, userRegistrationRateLimiter} = require('../middleware/authMiddleware');

// Register user
router.post('/register',userRegistrationRateLimiter,registerUser);

// Login user
router.post('/login', loginUser);

router.post('/generateNewAccessToken',accessTokenRateLimiter,generateNewAccessToken)

module.exports = router;
