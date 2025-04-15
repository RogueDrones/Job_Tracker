// # backend/src/routes/locations.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getLocations, 
  getLocation, 
  createLocation, 
  updateLocation, 
  deleteLocation,
  uploadLocationPhoto,
  deleteLocationPhoto,
  getNearbyLocations
} = require('../controllers/locations');
const { upload } = require('../middleware/fileUpload');

// IMPORTANT: the /nearby route must be defined BEFORE the /:id routes
// to avoid conflict with the id parameter
router.get('/nearby', protect, getNearbyLocations);

// Main routes for CRUD operations
router.route('/')
  .get(protect, getLocations)
  .post(protect, createLocation);

router.route('/:id')
  .get(protect, getLocation)
  .put(protect, updateLocation)
  .delete(protect, deleteLocation);

// Photo-related routes
router.post('/:id/photos', protect, upload, uploadLocationPhoto);
router.delete('/:id/photos/:photoId', protect, deleteLocationPhoto);

module.exports = router;