// # backend/src/routes/jobs.js - Add the export route
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getJobs, 
  getJob, 
  createJob, 
  updateJob, 
  deleteJob,
  getJobsByLocation,
  getJobStatistics,
  exportJobs,
  uploadJobPhoto,
  deleteJobPhoto
} = require('../controllers/jobs');
const { upload } = require('../middleware/fileUpload');

// Important: Statistics and export routes must be defined BEFORE any routes with params
router.get('/statistics', protect, getJobStatistics);
router.get('/export', protect, exportJobs);

// Get jobs by location
router.get('/location/:locationId', protect, getJobsByLocation);

// Main routes
router.route('/')
  .get(protect, getJobs)
  .post(protect, createJob);

router.route('/:id')
  .get(protect, getJob)
  .put(protect, updateJob)
  .delete(protect, deleteJob);

// Photo-related routes
router.post('/:id/photos', protect, upload, uploadJobPhoto);
router.delete('/:id/photos/:photoId', protect, deleteJobPhoto);

module.exports = router;