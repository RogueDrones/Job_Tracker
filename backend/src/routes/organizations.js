// # backend/src/routes/organizations.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization
} = require('../controllers/organizations');

router.route('/')
  .get(protect, getOrganizations)
  .post(protect, createOrganization);

router.route('/:id')
  .get(protect, getOrganization)
  .put(protect, updateOrganization)
  .delete(protect, deleteOrganization);

module.exports = router;