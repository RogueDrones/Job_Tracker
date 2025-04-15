// # backend/src/routes/index.js
const express = require('express');
const router = express.Router();

router.use('/api/auth', require('./auth'));
router.use('/api/jobs', require('./jobs'));
router.use('/api/locations', require('./locations'));
router.use('/api/organizations', require('./organizations'));

module.exports = router;