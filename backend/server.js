// # backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/error');
const path = require('path');

// Load env vars
dotenv.config();

// Create Express app
const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS
app.use(cors());

// Set static folder for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use(require('./src/routes'));

// Error handler middleware
app.use(errorHandler);

// Only connect to database and start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  // Connect to database
  connectDB();

  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
}

module.exports = app;