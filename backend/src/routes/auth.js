// # backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;