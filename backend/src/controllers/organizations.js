// # backend/src/controllers/organizations.js
const Organization = require('../models/Organization');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get all organizations
 * @route   GET /api/organizations
 * @access  Private
 */
exports.getOrganizations = asyncHandler(async (req, res, next) => {
  const organizations = await Organization.find({ user: req.user.id });
  
  res.status(200).json({
    success: true,
    count: organizations.length,
    data: organizations
  });
});

/**
 * @desc    Get single organization
 * @route   GET /api/organizations/:id
 * @access  Private
 */
exports.getOrganization = asyncHandler(async (req, res, next) => {
  const organization = await Organization.findById(req.params.id);
  
  if (!organization) {
    return next(new ErrorResponse(`Organization not found with id of ${req.params.id}`, 404));
  }
  
  // Check user owns the organization
  if (organization.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this organization`, 401));
  }
  
  res.status(200).json({
    success: true,
    data: organization
  });
});

/**
 * @desc    Create new organization
 * @route   POST /api/organizations
 * @access  Private
 */
exports.createOrganization = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;
  
  const organization = await Organization.create(req.body);
  
  res.status(201).json({
    success: true,
    data: organization
  });
});

/**
 * @desc    Update organization
 * @route   PUT /api/organizations/:id
 * @access  Private
 */
exports.updateOrganization = asyncHandler(async (req, res, next) => {
  let organization = await Organization.findById(req.params.id);
  
  if (!organization) {
    return next(new ErrorResponse(`Organization not found with id of ${req.params.id}`, 404));
  }
  
  // Check user owns the organization
  if (organization.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this organization`, 401));
  }
  
  organization = await Organization.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: organization
  });
});

/**
 * @desc    Delete organization
 * @route   DELETE /api/organizations/:id
 * @access  Private
 */
exports.deleteOrganization = asyncHandler(async (req, res, next) => {
  const organization = await Organization.findById(req.params.id);
  
  if (!organization) {
    return next(new ErrorResponse(`Organization not found with id of ${req.params.id}`, 404));
  }
  
  // Check user owns the organization
  if (organization.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this organization`, 401));
  }
  
  await Organization.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    data: {}
  });
});