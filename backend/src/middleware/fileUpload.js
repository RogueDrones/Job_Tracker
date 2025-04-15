// # backend/src/middleware/fileUpload.js
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Make sure the uploads directory exists
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    // Generate a unique filename using timestamp and random string
    crypto.randomBytes(16, (err, buf) => {
      if (err) return cb(err);
      
      // Use original extension
      const ext = path.extname(file.originalname);
      const filename = buf.toString('hex') + '-' + Date.now() + ext;
      cb(null, filename);
    });
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Initialize upload with increased file size
const upload = multer({
  storage: storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB limit
  fileFilter: fileFilter
}).single('photo');

// Create a wrapper to handle Multer errors better
const uploadMiddleware = (req, res, next) => {
  upload(req, res, function(err) {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ErrorResponse(`File too large, maximum size is 30MB`, 400));
        }
        return next(new ErrorResponse(`File upload error: ${err.message}`, 400));
      }
      
      return next(new ErrorResponse(`${err.message}`, 400));
    }
    
    next();
  });
};

module.exports = {
  upload: uploadMiddleware
};