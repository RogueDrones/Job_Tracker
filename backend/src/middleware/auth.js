// # backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    // Set token from cookie
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and make sure they exist
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorResponse('No user found with this id', 401));
    }

    // Set user on request object
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});