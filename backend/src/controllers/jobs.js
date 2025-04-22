// # backend/src/controllers/jobs.js
const Job = require('../models/Job');
const Location = require('../models/Location');
const Organization = require('../models/Organization');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const XLSX = require('xlsx');
const mongoose = require('mongoose');

// Set NZ timezone offset
const NZ_OFFSET = 12; // NZ is UTC+12 (approximate, doesn't account for DST)

const adjustToNZTimezone = (date) => {
  if (!date) return date;
  return new Date(new Date(date).getTime() - (NZ_OFFSET * 60 * 60 * 1000));
};

/**
 * @desc    Get all jobs
 * @route   GET /api/jobs
 * @access  Private
 */
exports.getJobs = asyncHandler(async (req, res, next) => {
  const jobs = await Job.find({ user: req.user.id })
    .populate('location', 'name address')
    .populate('organization', 'name')
    .sort('-date');
  
  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs
  });
});

/**
 * @desc    Get single job
 * @route   GET /api/jobs/:id
 * @access  Private
 */
exports.getJob = asyncHandler(async (req, res, next) => {
  // Add logging to help debug issues
  console.log(`Get job request for job ID: ${req.params.id}`);
  
  const job = await Job.findById(req.params.id)
    .populate('location', 'name address coordinates photos')
    .populate('organization', 'name description');
  
  if (!job) {
    console.log(`Job not found with id: ${req.params.id}`);
    return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
  }
  
  // Check user owns the job
  if (job.user.toString() !== req.user.id) {
    console.log(`Authorization failed for job: ${req.params.id}, user: ${req.user.id}`);
    return next(new ErrorResponse(`User not authorized to access this job`, 401));
  }
  
  // Log the job data being sent to help debug
  console.log(`Job ${req.params.id} retrieved successfully`);
  
  res.status(200).json({
    success: true,
    data: job
  });
});

/**
 * @desc    Create new job
 * @route   POST /api/jobs
 * @access  Private
 */
exports.createJob = asyncHandler(async (req, res, next) => {
  // Add logging to help debug issues
  console.log('Creating job with request data:', {
    body: req.body,
    user: req.user ? req.user.id : 'No user found'
  });

  if (!req.user) {
    console.error('No user found in request');
    return next(new ErrorResponse('Authentication required', 401));
  }

  // Add user to req.body
  req.body.user = req.user.id;
  
  // Validate location exists and belongs to user
  const location = await Location.findById(req.body.location);
  if (!location) {
    console.log('Location not found:', req.body.location);
    return next(new ErrorResponse(`Location not found with id of ${req.body.location}`, 404));
  }
  if (location.user.toString() !== req.user.id) {
    console.log('Location authorization failed. Location user:', location.user, 'Request user:', req.user.id);
    return next(new ErrorResponse(`User not authorized to use this location`, 401));
  }

  // Validate organization exists and belongs to user
  const organization = await Organization.findById(req.body.organization);
  if (!organization) {
    console.log('Organization not found:', req.body.organization);
    return next(new ErrorResponse(`Organization not found with id of ${req.body.organization}`, 404));
  }
  if (organization.user.toString() !== req.user.id) {
    console.log('Organization authorization failed. Organization user:', organization.user, 'Request user:', req.user.id);
    return next(new ErrorResponse(`User not authorized to use this organization`, 401));
  }

  // Adjust dates from NZ timezone to UTC for storage
  if (req.body.date) {
    req.body.date = adjustToNZTimezone(req.body.date);
  }
  if (req.body.startTime) {
    req.body.startTime = adjustToNZTimezone(req.body.startTime);
  }
  if (req.body.endTime) {
    req.body.endTime = adjustToNZTimezone(req.body.endTime);
  }
  
  // Calculate duration if not provided but start and end times are available
  if (!req.body.duration && req.body.startTime && req.body.endTime) {
    const startTime = new Date(req.body.startTime);
    const endTime = new Date(req.body.endTime);
    req.body.duration = Math.round((endTime - startTime) / (1000 * 60));
  }
  
  try {
    // Create the job
    let job = await Job.create(req.body);
    console.log('Job created successfully:', job);
    
    // Fetch the populated job data
    job = await Job.findById(job._id)
      .populate('location', 'name address')
      .populate('organization', 'name');
    
    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error creating job:', error);
    return next(new ErrorResponse(`Error creating job: ${error.message}`, 500));
  }
});

/**
 * @desc    Update job
 * @route   PUT /api/jobs/:id
 * @access  Private
 */
exports.updateJob = asyncHandler(async (req, res, next) => {
  console.log(`Updating job ID: ${req.params.id}`);
  console.log('Update data received:', req.body);

  // First, find the job to make sure it exists and user owns it
  let job = await Job.findById(req.params.id);
  
  if (!job) {
    console.log(`Job not found with id: ${req.params.id}`);
    return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
  }
  
  // Check user owns the job
  if (job.user.toString() !== req.user.id) {
    console.log(`Authorization failed for job update: ${req.params.id}, user: ${req.user.id}`);
    return next(new ErrorResponse(`User not authorized to update this job`, 401));
  }
  
  // If location is being updated, validate it
  if (req.body.location && req.body.location !== job.location.toString()) {
    console.log(`Validating new location: ${req.body.location}`);
    
    try {
      const location = await Location.findById(req.body.location);
      
      if (!location) {
        return next(new ErrorResponse(`Location not found with id of ${req.body.location}`, 404));
      }
      
      if (location.user && location.user.toString() !== req.user.id) {
        return next(new ErrorResponse(`User not authorized to use this location`, 401));
      }
    } catch (err) {
      console.error('Error validating location:', err);
      return next(new ErrorResponse(`Invalid location ID: ${req.body.location}`, 400));
    }
  }

  // If organization is being updated, validate it
  if (req.body.organization && req.body.organization !== (job.organization ? job.organization.toString() : null)) {
    console.log(`Validating new organization: ${req.body.organization}`);
    
    try {
      const organization = await Organization.findById(req.body.organization);
      
      if (!organization) {
        return next(new ErrorResponse(`Organization not found with id of ${req.body.organization}`, 404));
      }
      
      if (organization.user && organization.user.toString() !== req.user.id) {
        return next(new ErrorResponse(`User not authorized to use this organization`, 401));
      }
    } catch (err) {
      console.error('Error validating organization:', err);
      return next(new ErrorResponse(`Invalid organization ID: ${req.body.organization}`, 400));
    }
  }

  // Adjust dates from NZ timezone to UTC for storage
  if (req.body.date) {
    req.body.date = adjustToNZTimezone(req.body.date);
  }
  if (req.body.startTime) {
    req.body.startTime = adjustToNZTimezone(req.body.startTime);
  }
  if (req.body.endTime) {
    req.body.endTime = adjustToNZTimezone(req.body.endTime);
  }
  
  // Calculate duration if not provided but start and end times were updated
  if (!req.body.duration && req.body.startTime && req.body.endTime) {
    const startTime = new Date(req.body.startTime);
    const endTime = new Date(req.body.endTime);
    req.body.duration = Math.round((endTime - startTime) / (1000 * 60));
  }
  
  // Update the job
  try {
    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('location', 'name address').populate('organization', 'name');
    
    console.log(`Job ${req.params.id} updated successfully`);
    
    res.status(200).json({
      success: true,
      data: job
    });
  } catch (err) {
    console.error('Error updating job:', err);
    return next(new ErrorResponse(`Error updating job: ${err.message}`, 500));
  }
});

/**
 * @desc    Delete job
 * @route   DELETE /api/jobs/:id
 * @access  Private
 */
exports.deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  
  if (!job) {
    return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
  }
  
  // Check user owns the job
  if (job.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this job`, 401));
  }
  
  // Using findByIdAndDelete instead of remove() which is deprecated
  await Job.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get jobs by location
 * @route   GET /api/jobs/location/:locationId
 * @access  Private
 */
exports.getJobsByLocation = asyncHandler(async (req, res, next) => {
  const location = await Location.findById(req.params.locationId);
  
  if (!location) {
    return next(new ErrorResponse(`Location not found with id of ${req.params.locationId}`, 404));
  }
  
  // Check user owns the location
  if (location.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this location`, 401));
  }
  
  const jobs = await Job.find({
    user: req.user.id,
    location: req.params.locationId
  }).sort('-date');
  
  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs
  });
});

/**
 * @desc    Get jobs by organization
 * @route   GET /api/jobs/organization/:organizationId
 * @access  Private
 */
exports.getJobsByOrganization = asyncHandler(async (req, res, next) => {
  const organization = await Organization.findById(req.params.organizationId);
  
  if (!organization) {
    return next(new ErrorResponse(`Organization not found with id of ${req.params.organizationId}`, 404));
  }
  
  // Check user owns the organization
  if (organization.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this organization`, 401));
  }
  
  const jobs = await Job.find({
    user: req.user.id,
    organization: req.params.organizationId
  })
    .populate('location', 'name')
    .populate('organization', 'name')
    .sort('-date');
  
  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs
  });
});

/**
 * @desc    Get job statistics
 * @route   GET /api/jobs/statistics
 * @access  Private
 */
exports.getJobStatistics = asyncHandler(async (req, res, next) => {
  // Convert the user id string to a Mongoose ObjectId
  const userId = new mongoose.Types.ObjectId(req.user.id);

  // Get total jobs
  const totalJobs = await Job.countDocuments({ user: userId });
  
  // Get total hours
  const totalHoursResult = await Job.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, totalMinutes: { $sum: '$duration' } } }
  ]);
  
  const totalHours =
    totalHoursResult.length > 0 && totalHoursResult[0].totalMinutes
      ? totalHoursResult[0].totalMinutes / 60
      : 0;
  
  // Get all jobs
  const allJobs = await Job.find({ user: userId }).select('date').lean();

  // Manually count unique dates using a Map to collect jobs by date
  const dateMap = new Map();
  const nzOffset = 12; // NZ is approximately UTC+12 (or +13 during daylight savings)

  allJobs.forEach(job => {
    const dateObj = new Date(job.date);

    // Add NZ timezone offset to get the date in NZ timezone
    const nzDateObj = new Date(dateObj.getTime() + (nzOffset * 60 * 60 * 1000));

    // Format to YYYY-MM-DD to normalize dates
    const dateStr = nzDateObj.toISOString().split('T')[0];
    
    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, []);
    }
    dateMap.get(dateStr).push(job._id);
  });

  // Log all unique dates found with count of jobs per date
  console.log('Unique dates in NZ timezone with job counts:');
  dateMap.forEach((jobs, dateStr) => {
    console.log(`- ${dateStr}: ${jobs.length} jobs`);
  });

  // Get the count of unique dates
  const uniqueDaysManualCount = dateMap.size;
  console.log(`Total unique days in NZ timezone (manual count): ${uniqueDaysManualCount}`);

  // Use this count for the response
  const finalUniqueDays = uniqueDaysManualCount;

  // Get hours by location
  const hoursByLocation = await Job.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$location',
        hours: { $sum: { $divide: ['$duration', 60] } },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        locationId: '$_id',
        hours: 1,
        count: 1,
        _id: 0
      }
    }
  ]);
  
  // Get hours by tag
  const hoursByTag = await Job.aggregate([
    { $match: { user: userId } },
    { $unwind: { path: '$tags', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ['$tags', 'Untagged'] },
        hours: { $sum: { $divide: ['$duration', 60] } },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        tag: '$_id',
        hours: 1,
        count: 1,
        _id: 0
      }
    }
  ]);
  
  // Get recent jobs
  const recentJobs = await Job.find({ user: userId })
    .select('title date duration location')
    .populate('location', 'name')
    .sort('-date')
    .limit(8);
  
  // Calculate monthly stats
  const monthlyStats = await Job.aggregate([
    { $match: { user: userId } },
    {
      $project: {
        year: { $year: '$date' },
        month: { $month: '$date' },
        duration: 1
      }
    },
    {
      $group: {
        _id: { year: '$year', month: '$month' },
        hours: { $sum: { $divide: ['$duration', 60] } },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    {
      $project: {
        yearMonth: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            {
              $cond: [
                { $lt: ['$_id.month', 10] },
                { $concat: ['0', { $toString: '$_id.month' }] },
                { $toString: '$_id.month' }
              ]
            }
          ]
        },
        hours: 1,
        count: 1,
        _id: 0
      }
    }
  ]);
  
  // Log the statistics for debugging
  console.log('Job statistics calculated:', {
    totalJobs,
    totalHours,
    hoursByLocation: hoursByLocation.length,
    hoursByTag: hoursByTag.length
  });
  
  res.status(200).json({
    success: true,
    data: {
      totalJobs,
      totalHours,
      uniqueDays: finalUniqueDays,
      hoursByLocation,
      hoursByTag,
      recentJobs,
      monthlyStats
    }
  });
});

/**
 * @desc    Export jobs data to Excel
 * @route   GET /api/jobs/export
 * @access  Private
 */
exports.exportJobs = asyncHandler(async (req, res, next) => {
  try {
    // Parse query parameters for filtering
    const { startDate, endDate, locationId, tags } = req.query;
    
    // Build filter object
    const filter = { user: req.user.id };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add 1 day to endDate to include the entire day
        const endDateObj = new Date(endDate);
        endDateObj.setDate(endDateObj.getDate() + 1);
        filter.date.$lt = endDateObj;
      }
    }
    
    // Add location filter if provided
    if (locationId) {
      filter.location = locationId;
    }
    
    // Add tags filter if provided
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }
    
    // Fetch the filtered jobs with populated location data
    const jobs = await Job.find(filter)
      .populate('location', 'name address')
      .sort('-date');
    
    // Early return if no jobs found
    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No jobs found matching the criteria'
      });
    }
    
    // Calculate total hours
    const totalMinutes = jobs.reduce((total, job) => total + job.duration, 0);
    const totalHours = totalMinutes / 60;
    
    // Create worksheet data
    const worksheetData = [
      // Header row
      ['Date', 'Title', 'Location', 'Start Time', 'End Time', 'Duration (hours)', 'Tags', 'Notes']
    ];
    
    // Add job data rows
    jobs.forEach(job => {
      const jobDate = new Date(job.date);
      const formattedDate = `${jobDate.getDate().toString().padStart(2, '0')}/${(jobDate.getMonth() + 1).toString().padStart(2, '0')}/${jobDate.getFullYear()}`;
      
      const startTime = new Date(job.startTime);
      const formattedStartTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const endTime = new Date(job.endTime);
      const formattedEndTime = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const durationHours = job.duration / 60;
      
      worksheetData.push([
        formattedDate,
        job.title,
        job.location.name,
        formattedStartTime,
        formattedEndTime,
        durationHours.toFixed(2),
        job.tags ? job.tags.join(', ') : '',
        job.notes || ''
      ]);
    });
    
    // Add summary row
    worksheetData.push([]);
    worksheetData.push(['Total Hours:', '', '', '', '', totalHours.toFixed(2), '', '']);
    worksheetData.push(['Total Jobs:', '', '', '', '', jobs.length, '', '']);
    
    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    const columnWidths = [
      { wch: 12 },  // Date
      { wch: 30 },  // Title
      { wch: 25 },  // Location
      { wch: 12 },  // Start Time
      { wch: 12 },  // End Time
      { wch: 15 },  // Duration
      { wch: 25 },  // Tags
      { wch: 40 }   // Notes
    ];
    worksheet['!cols'] = columnWidths;
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Job Records');
    
    // Generate buffer for the workbook
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set response headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=TFG_Job_Tracker_Export.xlsx');
    res.setHeader('Content-Length', excelBuffer.length);
    
    // Send the file
    return res.send(excelBuffer);
    
  } catch (error) {
    console.error('Export error:', error);
    return next(new ErrorResponse('Error generating export', 500));
  }
});