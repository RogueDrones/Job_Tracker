# .cspell.json

```json
{
    "version": "0.2",
    "language": "en",
    "ignorePaths": [
        "node_modules/**",
        "dist/**",
        "build/**",
        ".git/**",
        "package-lock.json",
        "yarn.lock",
        "public/assets/**",
        "**/*.min.js",
        "**/*.min.css",
        "uploads/**"
    ],
    "words": [
        "appbar",
        "asyncHandler",
        "authn",
        "authz",
        "autofit",
        "bcrypt",
        "bcryptjs",
        "browserslist",
        "camelcase",
        "cloudinary",
        "coords",
        "CORS",
        "cspell",
        "darkblue",
        "darkgreen",
        "dateformat",
        "datepicker",
        "datetime",
        "dduwlcwot",
        "doctype",
        "dotenv",
        "dsphere",
        "dunedin",
        "ERRORLEVEL",
        "errormsg",
        "EXIF",
        "exifdata",
        "fieldname",
        "formdata",
        "geocoding",
        "geopoint",
        "geospatial",
        "gridfs",
        "jobtracker",
        "jsonwebtoken",
        "latituderef",
        "lcov",
        "leaflet",
        "lightblue",
        "lightgreen",
        "lnglat",
        "locationid",
        "longituderef",
        "lonlat",
        "mapbox",
        "mapboxgl",
        "maxlength",
        "middlewares",
        "mimetype",
        "minlength",
        "mongodb",
        "msgbox",
        "multipart",
        "nodemailer",
        "nodemon",
        "officedocument",
        "openxmlformats",
        "originalname",
        "photodata",
        "photoid",
        "powershell",
        "recharts",
        "REPL",
        "reqbody",
        "resdata",
        "signin",
        "signout",
        "signup",
        "spreadsheetml",
        "successmsg",
        "taskforce",
        "TFG",
        "timeentry",
        "timesheet",
        "timestamped",
        "timetracker",
        "toastify",
        "todos",
        "unlink",
        "useEffect",
        "useNavigate",
        "useParams",
        "useRef",
        "userid",
        "useState",
        "viewbox",
        "yearmonth"
    ],
    "flagWords": [],
    "ignoreWords": [],
    "patterns": [
        {
            "name": "hex-color",
            "pattern": "/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g"
        },
        {
            "name": "environment-variables",
            "pattern": "/\\b[A-Z][A-Z0-9_]*\\b/g"
        }
    ],
    "dictionaries": [
        "en_US",
        "html",
        "css",
        "typescript",
        "node",
        "npm",
        "fullstack"
    ],
    "dictionaryDefinitions": [
        {
            "name": "fullstack",
            "path": "./fullstack-dictionary.txt",
            "addWords": true
        }
    ],
    "languageSettings": [
        {
            "languageId": "javascript,typescript,javascriptreact,typescriptreact",
            "ignoreRegExpList": [
                "import\\s+.*?\\s+from\\s+['\"].*?['\"]",
                "require\\(['\"].*?['\"]\\)",
                "//.*"
            ]
        },
        {
            "languageId": "markdown,plaintext",
            "caseSensitive": false
        }
    ]
}

```

# .gitignore

```
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/frontend/build

# Misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE specific files
.idea
.vscode
*.swp
*.swo

# Temporary files
*.log
*.tmp

# Image uploads
/backend/uploads/*
!/backend/uploads/.gitkeep
```

# backend\check-db.js

```js
// # backend/check-db.js
// Simple script to check the MongoDB database contents

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Job model (simplified version)
const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  startTime: Date,
  endTime: Date,
  duration: Number,
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  tags: [String],
  notes: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: Date,
  updatedAt: Date
});

const Job = mongoose.model('Job', JobSchema);

// Connect to the database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');

  try {
    // Find all jobs
    const jobs = await Job.find({});
    console.log('All jobs in database:');
    
    jobs.forEach(job => {
      console.log(`\nJob ID: ${job._id}`);
      console.log(`Title: ${job.title}`);
      console.log(`Duration (minutes): ${job.duration}`);
      console.log(`User: ${job.user}`);
      console.log(`Location: ${job.location}`);
      console.log(`Created: ${job.createdAt}`);
    });

    // Calculate total hours using aggregation
    const totalHoursResult = await Job.aggregate([
      { $group: { _id: null, totalMinutes: { $sum: '$duration' } } }
    ]);
    
    console.log('\nAggregation result:');
    console.log(totalHoursResult);
    
    if (totalHoursResult.length > 0) {
      const totalHours = totalHoursResult[0].totalMinutes / 60;
      console.log(`Total hours calculated: ${totalHours.toFixed(1)}`);
    } else {
      console.log('No hours calculated from aggregation');
    }
    
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
});
```

# backend\package.json

```json
{
  "name": "tfg-job-tracker-backend",
  "version": "1.0.0",
  "description": "Task Force Green Job Tracker Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cloudinary": "^1.40.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "exif-parser": "^0.1.12",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.1",
    "mongoose": "^7.4.3",
    "multer": "^1.4.5-lts.1",
    "path": "^0.12.7",
    "sharp": "^0.33.5",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "morgan": "^1.10.0",
    "nodemon": "^3.0.1"
  }
}

```

# backend\server.js

```js
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

// Connect to database
connectDB();

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
```

# backend\src\config\cloudinary.js

```js
// # backend/src/config/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
```

# backend\src\config\db.js

```js
// # backend/src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;
```

# backend\src\controllers\auth.js

```js
// # backend/src/controllers/auth.js
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password
  });

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * Get token from model, create cookie and send response
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Remove password from output
  user.password = undefined;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user
    });
};
```

# backend\src\controllers\jobs.js

```js
// # backend/src/controllers/jobs.js
const Job = require('../models/Job');
const Location = require('../models/Location');
const Organization = require('../models/Organization');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const XLSX = require('xlsx');
const mongoose = require('mongoose');

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
  // Add user to req.body
  req.body.user = req.user.id;
  
  // Validate location exists and belongs to user
  const location = await Location.findById(req.body.location);
  if (!location) {
    return next(new ErrorResponse(`Location not found with id of ${req.body.location}`, 404));
  }
  if (location.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to use this location`, 401));
  }

  // Validate organization exists and belongs to user
  const organization = await Organization.findById(req.body.organization);
  if (!organization) {
    return next(new ErrorResponse(`Organization not found with id of ${req.body.organization}`, 404));
  }
  if (organization.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to use this organization`, 401));
  }
  
  // Calculate duration if not provided but start and end times are available
  if (!req.body.duration && req.body.startTime && req.body.endTime) {
    const startTime = new Date(req.body.startTime);
    const endTime = new Date(req.body.endTime);
    req.body.duration = Math.round((endTime - startTime) / (1000 * 60));
  }
  
  const job = await Job.create(req.body);
  
  res.status(201).json({
    success: true,
    data: job
  });
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
```

# backend\src\controllers\locations.js

```js
// # backend/src/controllers/locations.js
const Location = require('../models/Location');
const { processUploadedImage } = require('../utils/exifExtractor');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

// Helper function to safely delete a file (handles Windows file locking issues)
const safeDeleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Successfully deleted: ${filePath}`);
      return true;
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error.message);
      // Schedule file for deletion after a delay (Windows workaround)
      setTimeout(() => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Delayed deletion successful: ${filePath}`);
          }
        } catch (delayedError) {
          console.error(`Delayed deletion failed for ${filePath}:`, delayedError.message);
        }
      }, 1000);
      return false;
    }
  }
  return false;
};

/**
 * @desc    Get all locations
 * @route   GET /api/locations
 * @access  Private
 */
exports.getLocations = asyncHandler(async (req, res, next) => {
  const locations = await Location.find({ user: req.user.id });
  
  res.status(200).json({
    success: true,
    count: locations.length,
    data: locations
  });
});

/**
 * @desc    Get single location
 * @route   GET /api/locations/:id
 * @access  Private
 */
exports.getLocation = asyncHandler(async (req, res, next) => {
  const location = await Location.findById(req.params.id);
  
  if (!location) {
    return next(new ErrorResponse(`Location not found with id of ${req.params.id}`, 404));
  }
  
  // Check user owns the location
  if (location.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this location`, 401));
  }
  
  res.status(200).json({
    success: true,
    data: location
  });
});

/**
 * @desc    Create new location
 * @route   POST /api/locations
 * @access  Private
 */
exports.createLocation = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;
  
  const location = await Location.create(req.body);
  
  res.status(201).json({
    success: true,
    data: location
  });
});

/**
 * @desc    Update location
 * @route   PUT /api/locations/:id
 * @access  Private
 */
exports.updateLocation = asyncHandler(async (req, res, next) => {
  let location = await Location.findById(req.params.id);
  
  if (!location) {
    return next(new ErrorResponse(`Location not found with id of ${req.params.id}`, 404));
  }
  
  // Check user owns the location
  if (location.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this location`, 401));
  }
  
  location = await Location.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: location
  });
});

/**
 * @desc    Delete location
 * @route   DELETE /api/locations/:id
 * @access  Private
 */
exports.deleteLocation = asyncHandler(async (req, res, next) => {
  const location = await Location.findById(req.params.id);
  
  if (!location) {
    return next(new ErrorResponse(`Location not found with id of ${req.params.id}`, 404));
  }
  
  // Check user owns the location
  if (location.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this location`, 401));
  }
  
  // Delete all photos from Cloudinary
  for (const photo of location.photos) {
    if (photo.url) {
      try {
        // Extract public_id from Cloudinary URL
        const publicId = photo.url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Error deleting photo from Cloudinary:', err);
        // Continue with other deletions even if one fails
      }
    }
  }
  
  // Using findByIdAndDelete instead of remove()
  await Location.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// # backend/src/controllers/locations.js - uploadLocationPhoto function

// # backend/src/controllers/locations.js - uploadLocationPhoto function

/**
 * @desc    Upload photo to location
 * @route   POST /api/locations/:id/photos
 * @access  Private
 */
exports.uploadLocationPhoto = asyncHandler(async (req, res, next) => {
  // Variables to track files
  let fileUploaded = false;
  let cloudinaryResult = null;
  let compressedFilePath = null;

  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      // Remove uploaded file if exists
      if (req.file) {
        safeDeleteFile(req.file.path);
      }
      return next(new ErrorResponse(`Location not found with id of ${req.params.id}`, 404));
    }
    
    // Check user owns the location
    if (location.user.toString() !== req.user.id) {
      // Remove uploaded file if exists
      if (req.file) {
        safeDeleteFile(req.file.path);
      }
      return next(new ErrorResponse(`User not authorized to update this location`, 401));
    }
    
    if (!req.file) {
      return next(new ErrorResponse(`Please upload a file`, 400));
    }
    
    fileUploaded = true;
    
    // Extract GPS data from image first
    let exifData = null;
    try {
      exifData = processUploadedImage(req.file);
      console.log('EXIF data extracted:', exifData);
    } catch (exifError) {
      console.error('Error extracting EXIF data:', exifError);
      // Continue with upload even if EXIF extraction fails
    }
    
    // Compress the image before uploading to Cloudinary
    try {
      const originalFilePath = req.file.path;
      const fileExt = path.extname(originalFilePath);
      compressedFilePath = `${originalFilePath.replace(fileExt, '')}-compressed${fileExt}`;
      
      console.log(`Compressing image from ${originalFilePath} to ${compressedFilePath}`);
      
      // First compression attempt - moderate quality
      await sharp(originalFilePath)
        .resize(1800, 1800, { fit: 'inside' }) // Resize to max dimensions
        .jpeg({ quality: 75 }) // Use JPEG format with 75% quality
        .toFile(compressedFilePath);
      
      // Check if the file is still too large (>10MB)
      const stats = fs.statSync(compressedFilePath);
      console.log(`Compressed file size: ${stats.size} bytes (${Math.round(stats.size/1024/1024 * 100) / 100}MB)`);
      
      if (stats.size > 10 * 1024 * 1024) {
        console.log('First compression not enough, compressing further...');
        
        // Second compression attempt - more aggressive
        const moreCompressedPath = `${originalFilePath.replace(fileExt, '')}-compressed-more${fileExt}`;
        
        await sharp(originalFilePath)
          .resize(1200, 1200, { fit: 'inside' }) // Smaller dimensions
          .jpeg({ quality: 60 }) // Lower quality
          .toFile(moreCompressedPath);
        
        // If first compressed file exists, delete it
        safeDeleteFile(compressedFilePath);
        
        // Use the more compressed file instead
        compressedFilePath = moreCompressedPath;
        
        const newStats = fs.statSync(compressedFilePath);
        console.log(`Further compressed file size: ${newStats.size} bytes (${Math.round(newStats.size/1024/1024 * 100) / 100}MB)`);
        
        // If still too large, compress one more time with extreme settings
        if (newStats.size > 10 * 1024 * 1024) {
          console.log('Still too large, using extreme compression...');
          
          const extremeCompressedPath = `${originalFilePath.replace(fileExt, '')}-compressed-extreme${fileExt}`;
          
          await sharp(originalFilePath)
            .resize(800, 800, { fit: 'inside' }) // Much smaller dimensions
            .jpeg({ quality: 40 }) // Very low quality
            .toFile(extremeCompressedPath);
          
          // Delete the previous compressed file
          safeDeleteFile(compressedFilePath);
          
          // Use the extremely compressed file
          compressedFilePath = extremeCompressedPath;
          
          const finalStats = fs.statSync(compressedFilePath);
          console.log(`Extreme compressed file size: ${finalStats.size} bytes (${Math.round(finalStats.size/1024/1024 * 100) / 100}MB)`);
        }
      }
    } catch (compressionError) {
      console.error('Error compressing image:', compressionError);
      // If compression fails, we'll try uploading the original (though it will likely fail)
      compressedFilePath = null;
    }
    
    // Upload to Cloudinary
    try {
      // Choose which file to upload
      const fileToUpload = compressedFilePath && fs.existsSync(compressedFilePath) 
        ? compressedFilePath 
        : req.file.path;
        
      console.log(`Uploading to Cloudinary: ${fileToUpload}`);
      
      cloudinaryResult = await cloudinary.uploader.upload(fileToUpload, {
        folder: 'tfg-job-tracker',
        resource_type: 'image'
      });
      
      console.log('Cloudinary upload successful:', cloudinaryResult.secure_url);
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      
      // Clean up files
      if (req.file) {
        safeDeleteFile(req.file.path);
      }
      
      if (compressedFilePath && compressedFilePath !== req.file.path) {
        safeDeleteFile(compressedFilePath);
      }
      
      return next(new ErrorResponse(`Failed to upload image to cloud storage: ${cloudinaryError.message}`, 500));
    }
    
    // Add photo to location
    const photo = {
      url: cloudinaryResult.secure_url,
      caption: req.body.caption || '',
      takenAt: exifData?.timestamp ? new Date(exifData.timestamp * 1000) : new Date()
    };
    
    // Update location coordinates if none exist and GPS data is available
    if (exifData && exifData.latitude && exifData.longitude && 
        (!location.coordinates || !location.coordinates.coordinates[0])) {
      
      // Make sure the coordinates are correctly stored in MongoDB's GeoJSON format
      // The order for GeoJSON is [longitude, latitude]
      console.log(`Updating location coordinates to: [${exifData.longitude}, ${exifData.latitude}]`);
      
      location.coordinates = {
        type: 'Point',
        coordinates: [exifData.longitude, exifData.latitude]
      };
      
      // Log the stored coordinates to verify
      console.log('Location coordinates set to:', location.coordinates);
    }
    
    location.photos.push(photo);
    await location.save();
    
    // Clean up files after everything is done
    // Do this after saving to the database to ensure we don't lose data
    // if file deletion causes an error
    if (req.file) {
      safeDeleteFile(req.file.path);
    }
    
    if (compressedFilePath && compressedFilePath !== req.file.path) {
      safeDeleteFile(compressedFilePath);
    }
    
    res.status(200).json({
      success: true,
      data: photo,
      location: location
    });
  } catch (error) {
    console.error('Upload error details:', error);
    
    // Clean up all files
    if (req.file) {
      safeDeleteFile(req.file.path);
    }
    
    if (compressedFilePath && compressedFilePath !== req.file.path) {
      safeDeleteFile(compressedFilePath);
    }
    
    // If Cloudinary upload was successful but we had an error after that,
    // try to remove the file from Cloudinary
    if (cloudinaryResult) {
      try {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id);
      } catch (cloudError) {
        console.error('Error removing file from Cloudinary:', cloudError);
      }
    }
    
    // Pass the error to the error handler
    return next(new ErrorResponse(`Photo upload failed: ${error.message}`, 500));
  }
});

/**
 * @desc    Delete photo from location
 * @route   DELETE /api/locations/:id/photos/:photoId
 * @access  Private
 */
exports.deleteLocationPhoto = asyncHandler(async (req, res, next) => {
  const location = await Location.findById(req.params.id);
  
  if (!location) {
    return next(new ErrorResponse(`Location not found with id of ${req.params.id}`, 404));
  }
  
  // Check user owns the location
  if (location.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this location`, 401));
  }
  
  // Find photo in the array
  const photoIndex = location.photos.findIndex(photo => photo._id.toString() === req.params.photoId);
  
  if (photoIndex === -1) {
    return next(new ErrorResponse(`Photo not found with id of ${req.params.photoId}`, 404));
  }
  
  // Delete from Cloudinary
  if (location.photos[photoIndex].url) {
    try {
      const publicId = location.photos[photoIndex].url.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting photo from Cloudinary:', error);
      // Continue with removal from database even if Cloudinary delete fails
    }
  }
  
  // Remove from array
  location.photos.splice(photoIndex, 1);
  await location.save();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get nearby locations
 * @route   GET /api/locations/nearby
 * @access  Private
 */
exports.getNearbyLocations = asyncHandler(async (req, res, next) => {
  const { lat, lng, distance = 10000 } = req.query; // distance in meters, default 10km
  
  // Check if coordinates are provided
  if (!lat || !lng) {
    return next(new ErrorResponse('Please provide latitude and longitude', 400));
  }
  
  // Find locations near the given coordinates
  const locations = await Location.find({
    user: req.user.id,
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: parseInt(distance)
      }
    }
  });
  
  res.status(200).json({
    success: true,
    count: locations.length,
    data: locations
  });
});
```

# backend\src\controllers\organizations.js

```js
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
```

# backend\src\middleware\async.js

```js
// # backend/src/middleware/async.js
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
  
  module.exports = asyncHandler;
  
```

# backend\src\middleware\auth.js

```js
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

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});
```

# backend\src\middleware\error.js

```js
// # backend/src/middleware/error.js
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.log(err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
```

# backend\src\middleware\fileUpload.js

```js
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
```

# backend\src\models\Job.js

```js
// # backend/src/models/Job.js
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,  // Duration in minutes
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate duration before saving
JobSchema.pre('save', function(next) {
  // Update duration if start and end times are available
  if (this.startTime && this.endTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  
  // Update the updatedAt timestamp
  this.updatedAt = Date.now();
  
  next();
});

module.exports = mongoose.model('Job', JobSchema);
```

# backend\src\models\Location.js

```js
// # backend/src/models/Location.js
const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      required: true
    }
  },
  photos: [{
    url: {
      type: String,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    },
    takenAt: {
      type: Date
    }
  }],
  notes: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index for location queries
LocationSchema.index({ coordinates: '2dsphere' });

LocationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Location', LocationSchema);
```

# backend\src\models\Organization.js

```js
// # backend/src/models/Organization.js
const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an organization name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true
  },
  contact: {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    phone: {
      type: String,
      trim: true
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
OrganizationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Organization', OrganizationSchema);
```

# backend\src\models\User.js

```js
// # backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updatedAt = Date.now();
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

# backend\src\routes\auth.js

```js
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
```

# backend\src\routes\index.js

```js
// # backend/src/routes/index.js
const express = require('express');
const router = express.Router();

router.use('/api/auth', require('./auth'));
router.use('/api/jobs', require('./jobs'));
router.use('/api/locations', require('./locations'));
router.use('/api/organizations', require('./organizations'));

module.exports = router;
```

# backend\src\routes\jobs.js

```js
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
  exportJobs // Add this new controller function
} = require('../controllers/jobs');

// Important: Statistics and export routes must be defined BEFORE any routes with params
router.get('/statistics', protect, getJobStatistics);
router.get('/export', protect, exportJobs); // Add this new route

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

module.exports = router;
```

# backend\src\routes\locations.js

```js
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
```

# backend\src\routes\organizations.js

```js
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
```

# backend\src\utils\errorResponse.js

```js
// # backend/src/utils/errorResponse.js
class ErrorResponse extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  
  module.exports = ErrorResponse;
```

# backend\src\utils\exifExtractor.js

```js
// # backend/src/utils/exifExtractor.js
const ExifParser = require('exif-parser');
const fs = require('fs');

/**
 * Extract GPS coordinates from image EXIF data
 * @param {string} filePath - Path to the image file
 * @returns {Object|null} Object containing latitude and longitude or null if no GPS data
 */
const extractGpsCoordinates = (filePath) => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File does not exist:', filePath);
      return null;
    }

    const buffer = fs.readFileSync(filePath);
    
    // Create the parser
    let parser;
    try {
      parser = ExifParser.create(buffer);
    } catch (err) {
      console.error('Error creating EXIF parser:', err);
      return null;
    }
    
    // Parse the buffer
    let result;
    try {
      result = parser.parse();
    } catch (err) {
      console.error('Error parsing EXIF data:', err);
      return null;
    }
    
    // Check if GPS data exists
    if (!result.tags || !result.tags.GPSLatitude || !result.tags.GPSLongitude) {
      console.log('No GPS data found in image');
      return null;
    }
    
    // Extract coordinates
    let latitude = result.tags.GPSLatitude;
    let longitude = result.tags.GPSLongitude;
    
    // SIMPLE FIX: For Dunedin, New Zealand - Force negative latitude (southern hemisphere)
    // Make latitude negative regardless of GPS reference tags
    latitude = -Math.abs(latitude);
    
    // For longitude, keep as positive (eastern hemisphere for NZ)
    longitude = Math.abs(longitude);
    
    console.log('Successfully extracted GPS data:', { latitude, longitude });
    
    return {
      latitude: latitude,
      longitude: longitude,
      // Return additional EXIF data that might be useful
      timestamp: result.tags.DateTimeOriginal || result.tags.DateTime,
      make: result.tags.Make,
      model: result.tags.Model
    };
  } catch (error) {
    console.error('Unexpected error extracting EXIF data:', error);
    return null;
  }
};

/**
 * Extract all available EXIF data from image
 * @param {string} filePath - Path to the image file
 * @returns {Object|null} Object containing all available EXIF data or null on error
 */
const extractAllExifData = (filePath) => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File does not exist:', filePath);
      return null;
    }

    const buffer = fs.readFileSync(filePath);
    
    try {
      const parser = ExifParser.create(buffer);
      const result = parser.parse();
      return result.tags;
    } catch (err) {
      console.error('Error parsing EXIF data:', err);
      return null;
    }
  } catch (error) {
    console.error('Unexpected error extracting EXIF data:', error);
    return null;
  }
};

/**
 * Process uploaded image to extract GPS coordinates
 * @param {Object} file - Uploaded file object from multer
 * @returns {Object|null} Object containing coordinates or null
 */
const processUploadedImage = (file) => {
  if (!file) {
    console.log('No file provided to processUploadedImage');
    return null;
  }
  
  try {
    console.log('Processing image:', file.path);
    return extractGpsCoordinates(file.path);
  } catch (error) {
    console.error('Error in processUploadedImage:', error);
    return null;
  }
};

module.exports = {
  extractGpsCoordinates,
  extractAllExifData,
  processUploadedImage
};
```

# backend\uploads\2e6adfbe30f3e4590e665d58f59ccdbe-1743561452135.jpg

This is a binary file of the type: Image

# backend\uploads\047b4ed0f9f35bbd9918a3a47fd464b4-1743635115567.jpg

This is a binary file of the type: Image

# backend\uploads\75c692f2315b95228488bc1160a00f65-1744846578734.jpg

This is a binary file of the type: Image

# backend\uploads\79a11704bbf708eef8ff68fb006673a9-1743563063523.jpg

This is a binary file of the type: Image

# backend\uploads\e52785fb0ad79ff62191bed67b8f2b64-1743563138146.jpg

This is a binary file of the type: Image

# backend\uploads\ed0adc3533a6333377380bda96b51bc1-1744763731310.jpg

This is a binary file of the type: Image

# frontend\package.json

```json
{
  "name": "tfg-job-tracker-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.4.0",
    "mapbox-gl": "^2.15.0",
    "react": "^18.2.0",
    "react-datepicker": "^4.16.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0",
    "react-scripts": "5.0.1",
    "react-toastify": "^9.1.3",
    "recharts": "^2.7.3",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}

```

# frontend\public\index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="TFG Job Tracker - Track your volunteer work efficiently"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>TFG Job Tracker</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

# frontend\public\manifest.json

```json
{
    "short_name": "TFG Tracker",
    "name": "Task Force Green Job Tracker",
    "icons": [
      {
        "src": "favicon.ico",
        "sizes": "64x64 32x32 24x24 16x16",
        "type": "image/x-icon"
      }
    ],
    "start_url": ".",
    "display": "standalone",
    "theme_color": "#4caf50",
    "background_color": "#f8f9fa"
  }
```

# frontend\src\App.css

```css
/* # frontend/src/App.css */
:root {
    --primary-color: #4caf50;
    --primary-dark: #388e3c;
    --primary-light: #81c784;
    --secondary-color: #2196f3;
    --secondary-dark: #1976d2;
    --secondary-light: #64b5f6;
    --bg-color: #f8f9fa;
    --text-color: #333;
    --light-gray: #e0e0e0;
    --dark-gray: #757575;
    --success: #4caf50;
    --error: #f44336;
    --warning: #ff9800;
    --info: #2196f3;
    --border-radius: 4px;
    --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Roboto', Arial, sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
    line-height: 1.6;
  }
  
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  .main-content {
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  a {
    color: var(--secondary-color);
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
    color: var(--secondary-dark);
  }
  
  .btn-primary {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-size: 1rem;
    text-align: center;
    display: inline-block;
    text-decoration: none;
    transition: background-color 0.3s;
  }
  
  .btn-primary:hover {
    background-color: var(--primary-dark);
    text-decoration: none;
    color: white;
  }
  
  .btn-secondary {
    background-color: var(--secondary-color);
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-size: 1rem;
    text-align: center;
    display: inline-block;
    text-decoration: none;
    transition: background-color 0.3s;
  }
  
  .btn-secondary:hover {
    background-color: var(--secondary-dark);
    text-decoration: none;
    color: white;
  }
  
  .btn-text {
    background: none;
    border: none;
    color: var(--secondary-color);
    padding: 0.3rem 0.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    text-decoration: none;
  }
  
  .btn-text:hover {
    text-decoration: underline;
    color: var(--secondary-dark);
  }
  
  .error-container {
    background-color: #ffebee;
    color: var(--error);
    padding: 1rem;
    border-radius: var(--border-radius);
    margin-bottom: 1rem;
    border-left: 4px solid var(--error);
  }
  
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    font-size: 1.2rem;
    color: var(--dark-gray);
  }
  
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    font-weight: bold;
  }
  
  .error-message {
    background-color: #ffebee;
    color: var(--error);
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius);
    margin-bottom: 1rem;
    border-left: 4px solid var(--error);
    font-size: 0.9rem;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 1rem;
    color: #2e7d32;
  }

  .mapboxgl-map {
    position: relative !important;
  }
```

# frontend\src\App.jsx

```jsx
// # frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/routing/PrivateRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import JobsList from './pages/jobs/JobsList';
import JobDetails from './pages/jobs/JobDetails';
import LocationsList from './pages/locations/LocationsList';
import LocationDetails from './pages/locations/LocationDetails';
import OrganizationsList from './pages/organizations/OrganizationsList';
import JobForm from './components/jobs/JobForm';
import LocationForm from './components/locations/LocationForm';
import OrganizationForm from './components/organizations/OrganizationForm';
import Dashboard from './components/dashboard/Dashboard';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<PrivateRoute />}>
            <Route index element={<Dashboard />} />
            
            {/* Jobs routes */}
            <Route path="jobs" element={<JobsList />} />
            <Route path="jobs/new" element={<JobForm />} />
            <Route path="jobs/edit/:id" element={<JobForm isEditing />} />
            <Route path="jobs/:id" element={<JobDetails />} />
            
            {/* Locations routes */}
            <Route path="locations" element={<LocationsList />} />
            <Route path="locations/new" element={<LocationForm />} />
            <Route path="locations/edit/:id" element={<LocationForm isEditing />} />
            <Route path="locations/:id" element={<LocationDetails />} />
            
            {/* Organizations routes */}
            <Route path="organizations" element={<OrganizationsList />} />
            <Route path="organizations/new" element={<OrganizationForm />} />
            <Route path="organizations/edit/:id" element={<OrganizationForm isEditing />} />
          </Route>
        </Routes>
      </main>
      <Footer />
      
      {/* Toast notifications container */}
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;
```

# frontend\src\components\dashboard\Dashboard.css

```css
/* # frontend/src/components/dashboard/Dashboard.css */
.dashboard-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .dashboard-actions {
    display: flex;
    gap: 1rem;
  }
  
  .dashboard-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .summary-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    text-align: center;
  }
  
  .summary-value {
    font-size: 2.5rem;
    font-weight: bold;
    color: var(--primary-color);
    margin: 0.5rem 0;
  }
  
  .dashboard-charts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }
  
  .chart-container {
    background-color: white;
    padding: 1.5rem;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
  }
  
  .dashboard-map {
    margin-bottom: 2rem;
    background-color: white;
    padding: 1.5rem;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
  }
  
  .dashboard-recent {
    background-color: white;
    padding: 1.5rem;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
  }
  
  .recent-jobs-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .recent-job-card {
    background-color: #f9f9f9;
    padding: 1rem;
    border-radius: var(--border-radius);
    border-left: 4px solid var(--primary-color);
  }
  
  .job-date, .job-location, .job-duration {
    font-size: 0.9rem;
    color: var(--dark-gray);
    margin-bottom: 0.3rem;
  }
```

# frontend\src\components\dashboard\Dashboard.jsx

```jsx

// # frontend/src/components/dashboard/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchJobStatistics } from '../../services/jobService';
import { fetchLocations } from '../../services/locationService';
import LocationMap from '../map/LocationMap';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';
import { formatNZDate } from '../../utils/dateUtils';
import ExportDialog from '../jobs/ExportDialog';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Use a callback to fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch job statistics and locations in parallel
      const [statsData, locationsData] = await Promise.all([
        fetchJobStatistics(),
        fetchLocations()
      ]);
      
      setStats(statsData);
      setLocations(locationsData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data: ' + (err.message || 'Unknown error'));
      setLoading(false);
      console.error('Error fetching dashboard data:', err);
    }
  }, []);

  // Fetch data on initial load and when navigating back to dashboard
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, location.pathname]);

  useEffect(() => {
    if (stats) {
      console.log('Dashboard stats received:', stats);
      console.log('Unique days value:', stats.uniqueDays);
    }
  }, [stats]);

  // Add a refresh button function
  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  // Format data for charts
  const formatLocationData = () => {
    if (!stats || !stats.hoursByLocation || stats.hoursByLocation.length === 0) return [];
    
    return stats.hoursByLocation.map(item => ({
      name: locations.find(loc => loc._id === item.locationId)?.name || 'Unknown',
      hours: parseFloat(item.hours.toFixed(1))
    }));
  };

  const formatTagData = () => {
    if (!stats || !stats.hoursByTag || stats.hoursByTag.length === 0) return [];
    
    return stats.hoursByTag.map(item => ({
      name: item.tag || 'Untagged',
      hours: parseFloat(item.hours.toFixed(1))
    }));
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Job Tracker Dashboard</h1>
        <div className="dashboard-actions">
          <button 
            onClick={handleRefresh} 
            className="btn-secondary" 
            style={{ 
              backgroundColor: '#2196f3',
              minWidth: '150px',
              height: '55px',
              margin: '0 8px'
            }}
          >
            Refresh Data
          </button>
          <button 
            onClick={() => setShowExportDialog(true)} 
            className="btn-secondary"
            style={{ 
              backgroundColor: '#4a148c', 
              minWidth: '150px',
              height: '55px',
              margin: '0 8px'
            }}
          >
            Export Data
          </button>
          <Link 
            to="/jobs/new" 
            className="btn-primary" 
            style={{ 
              backgroundColor: '#4caf50', 
              minWidth: '150px',
              height: '55px',
              margin: '0 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Add New Job
          </Link>
          <Link 
            to="/locations/new" 
            className="btn-secondary" 
            style={{ 
              backgroundColor: '#2196f3', 
              minWidth: '150px',
              height: '55px',
              margin: '0 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Add New Location
          </Link>
          <Link 
            to="/organizations/new" 
            className="btn-secondary" 
            style={{ 
              backgroundColor: '#fb8c00', 
              minWidth: '150px',
              height: '55px',
              margin: '0 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Add New Organization
          </Link>
        </div>
      </div>

      {showExportDialog && (
        <ExportDialog onClose={() => setShowExportDialog(false)} />
      )}
      
      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Total Hours</h3>
          <div className="summary-value">{stats && typeof stats.totalHours === 'number' ? stats.totalHours.toFixed(1) : "0.0"}</div>
          <span>hours tracked</span>
        </div>
        <div className="summary-card">
          <h3>Total Jobs</h3>
          <div className="summary-value">{stats?.totalJobs || 0}</div>
          <span>separate tasks</span>
        </div>
        <div className="summary-card">
          <h3>Locations</h3>
          <div className="summary-value">{locations.length}</div>
          <span>different places</span>
        </div>
        <div className="summary-card">
          <h3>Number of Days</h3>
          <div className="summary-value">
            {stats && typeof stats.uniqueDays === 'number' ? stats.uniqueDays : "0"}
          </div>
          <span>days volunteered</span>
        </div>
      </div>
      
      <div className="chart-container">
        <h3>Hours by Location</h3>
        {formatLocationData().length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formatLocationData()}
                dataKey="hours"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {formatLocationData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} hours`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data-message">No location data available yet</div>
        )}
      </div>
      
      <div className="chart-container">
        <h3>Hours by Activity Type</h3>
        {formatTagData().length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formatTagData()}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} hours`} />
              <Legend />
              <Bar dataKey="hours" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data-message">No activity data available yet</div>
        )}
      </div>
      
      <div className="dashboard-map">
        <h3>Job Locations</h3>
        <LocationMap />
      </div>
      
      <div className="dashboard-recent">
        <h3>Recent Jobs</h3>
        {stats?.recentJobs && stats.recentJobs.length > 0 ? (
          <div className="recent-jobs-list">
            {stats.recentJobs.map(job => (
              <div key={job._id} className="recent-job-card">
                <h4>{job.title}</h4>
                <p className="job-date">
                  {formatNZDate(job.date)}
                </p>
                <p className="job-location">
                  {job.location?.name || 'Unknown location'}
                </p>
                <p className="job-duration">{job.duration} minutes</p>
                <Link to={`/jobs/${job._id}`} className="btn-text">View Details</Link>
              </div>
            ))}
          </div>
        ) : (
          <p>No recent jobs to display.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

```

# frontend\src\components\jobs\ExportDialog.jsx

```jsx
// # frontend/src/components/jobs/ExportDialog.jsx
import React, { useState, useEffect } from 'react';
import { fetchLocations } from '../../services/locationService';
import { exportJobsData } from '../../services/jobService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// CSS for this component
const exportDialogStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    width: '500px',
    maxWidth: '90%',
    maxHeight: '90%',
    overflow: 'auto',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2e7d32',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#666'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  dateContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px'
  }
};

const ExportDialog = ({ onClose }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [locationId, setLocationId] = useState('');
  const [tags, setTags] = useState('');
  
  // Load locations when component mounts
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locationData = await fetchLocations();
        setLocations(locationData);
      } catch (error) {
        console.error('Error loading locations for export:', error);
      }
    };
    
    loadLocations();
  }, []);
  
  const handleExport = async () => {
    try {
      setLoading(true);
      
      // Format dates to YYYY-MM-DD
      const formatDate = (date) => {
        if (!date) return null;
        return date.toISOString().split('T')[0];
      };
      
      // Prepare filter parameters
      const filters = {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        locationId: locationId || undefined,
        tags: tags || undefined
      };
      
      // Call export service
      await exportJobsData(filters);
      
      // Close dialog after successful export
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      setLoading(false);
    }
  };
  
  return (
    <div style={exportDialogStyles.overlay} onClick={onClose}>
      <div style={exportDialogStyles.dialog} onClick={(e) => e.stopPropagation()}>
        <div style={exportDialogStyles.header}>
          <h2 style={exportDialogStyles.title}>Export Job Data</h2>
          <button style={exportDialogStyles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div style={exportDialogStyles.formGroup}>
          <label style={exportDialogStyles.label}>Date Range</label>
          <div style={exportDialogStyles.dateContainer}>
            <div>
              <label style={{ fontSize: '14px' }}>Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="Select start date"
                className="date-picker"
                maxDate={new Date()}
              />
            </div>
            <div>
              <label style={{ fontSize: '14px' }}>End Date</label>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="Select end date"
                className="date-picker"
                maxDate={new Date()}
                minDate={startDate}
              />
            </div>
          </div>
        </div>
        
        <div style={exportDialogStyles.formGroup}>
          <label style={exportDialogStyles.label}>Location (Optional)</label>
          <select
            style={exportDialogStyles.input}
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location._id} value={location._id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        
        <div style={exportDialogStyles.formGroup}>
          <label style={exportDialogStyles.label}>Tags (Optional, comma-separated)</label>
          <input
            type="text"
            style={exportDialogStyles.input}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. gardening, planting, cleanup"
          />
        </div>
        
        <div style={exportDialogStyles.actions}>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Exporting...' : 'Export Excel File'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;
```

# frontend\src\components\jobs\JobForm.css

```css
/* # frontend/src/components/jobs/JobForm.css */
.job-form-container {
    background-color: white;
    padding: 2rem;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    max-width: 800px;
    margin: 0 auto;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  input, textarea, select {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid var(--light-gray);
    border-radius: var(--border-radius);
    font-size: 1rem;
    background-color: #f9f9f9;
  }
  
  textarea {
    min-height: 100px;
    resize: vertical;
  }
  
  .form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .form-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
  }
  
  .date-picker, .time-picker {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid var(--light-gray);
    border-radius: var(--border-radius);
    font-size: 1rem;
    background-color: #f9f9f9;
  }
```

# frontend\src\components\jobs\JobForm.jsx

```jsx
// # frontend/src/components/jobs/JobForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchLocations } from '../../services/locationService';
import { getOrganizations } from '../../services/organizationService';
import { createJob, updateJob, getJob } from '../../services/jobService';
import './JobForm.css';

const JobForm = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    location: '',
    organization: '',
    tags: '',
    notes: ''
  });
  const [locations, setLocations] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch locations and organizations in parallel
        const [locationData, organizationData] = await Promise.all([
          fetchLocations(),
          getOrganizations()
        ]);
        
        setLocations(locationData);
        setOrganizations(organizationData);

        // If editing, fetch job data
        if (isEditing && id) {
          const jobData = await getJob(id);
          
          console.log("Job data received:", jobData);
          
          // Format date and times for form inputs
          const date = new Date(jobData.date).toISOString().split('T')[0];
          
          // Format start and end times
          const formatTime = (timeStr) => {
            const time = new Date(timeStr);
            return time.toTimeString().slice(0, 5); // Get HH:MM format
          };
          
          const startTime = formatTime(jobData.startTime);
          const endTime = formatTime(jobData.endTime);
          
          // Handle location and organization IDs safely
          // Check if location and organization are objects with _id or strings
          const locationId = jobData.location?._id || jobData.location || '';
          const organizationId = jobData.organization?._id || jobData.organization || '';
          
          setFormData({
            title: jobData.title || '',
            description: jobData.description || '',
            date,
            startTime,
            endTime,
            location: locationId,
            organization: organizationId,
            tags: jobData.tags ? jobData.tags.join(', ') : '',
            notes: jobData.notes || ''
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading form data:', err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Create a copy of the form data for submission
      const jobData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      // Convert date and times to proper datetime format
      const combineDateTime = (date, time) => {
        const [hours, minutes] = time.split(':');
        const dateTime = new Date(date);
        dateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        return dateTime.toISOString();
      };

      jobData.startTime = combineDateTime(formData.date, formData.startTime);
      jobData.endTime = combineDateTime(formData.date, formData.endTime);

      // Submit the job data
      if (isEditing) {
        await updateJob(id, jobData);
      } else {
        await createJob(jobData);
      }

      // Redirect back to jobs list
      navigate('/jobs');
    } catch (err) {
      console.error('Error saving job:', err);
      setError('Failed to save job. Please check your inputs and try again.');
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <div className="loading">Loading job data...</div>;
  }

  return (
    <div className="job-form-container">
      <h2>{isEditing ? 'Edit Job' : 'Add New Job'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-group">
          <label htmlFor="title">Job Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="startTime">Start Time</label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endTime">End Time</label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="organization">Organization</label>
          <select
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            required
          >
            <option value="">Select an organization</option>
            {organizations.map(org => (
              <option key={org._id} value={org._id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          >
            <option value="">Select a location</option>
            {locations.map(location => (
              <option key={location._id} value={location._id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. gardening, planting, cleanup"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/jobs')} 
            className="btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Job' : 'Create Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;
```

# frontend\src\components\layout\Footer.css

```css
/* # frontend/src/components/layout/Footer.css */
.footer {
    background-color: #333;
    color: white;
    padding: 2rem;
    margin-top: 3rem;
  }
  
  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    max-width: 1200px;
    margin: 0 auto;
    flex-wrap: wrap;
    gap: 2rem;
  }
  
  .footer-logo h3 {
    color: white;
    margin-bottom: 0.5rem;
  }
  
  .footer-links ul {
    list-style: none;
  }
  
  .footer-links li {
    margin-bottom: 0.5rem;
  }
  
  .footer-links a {
    color: #ddd;
    text-decoration: none;
  }
  
  .footer-links a:hover {
    color: white;
    text-decoration: underline;
  }
  
  .footer-legal {
    opacity: 0.7;
    font-size: 0.9rem;
  }
  
  /* Responsive styles */
  @media (max-width: 768px) {
    .main-content {
      padding: 1rem;
    }
    
    .dashboard-summary,
    .dashboard-charts {
      grid-template-columns: 1fr;
    }
    
    .header {
      flex-direction: column;
      padding: 1rem;
    }
    
    .nav-menu {
      margin-top: 1rem;
      width: 100%;
      justify-content: space-between;
    }
    
    .user-menu {
      margin-left: 0;
      margin-top: 1rem;
    }
    
    .footer-content {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }
```

# frontend\src\components\layout\Footer.jsx

```jsx
// # frontend/src/components/layout/Footer.jsx
import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <h3>Volunteer Job Tracker</h3>
          <p>Track your volunteer work efficiently</p>
        </div>
        
        <div className="footer-links">
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/jobs">Jobs</a></li>
            <li><a href="/locations">Locations</a></li>
          </ul>
        </div>
        
        <div className="footer-legal">
          <p>&copy; {currentYear} Volunteer Job Tracker</p>
          <p>Dunedin, New Zealand</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

```

# frontend\src\components\layout\Header.css

```css
/* # frontend/src/components/layout/Header.css */
.header {
    background-color: white;
    padding: 1rem 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .logo a {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary-color);
    text-decoration: none;
  }
  
  .nav-menu {
    display: flex;
    align-items: center;
  }
  
  .nav-menu ul {
    display: flex;
    list-style: none;
    gap: 1.5rem;
  }
  
  .nav-menu a {
    color: var(--text-color);
    text-decoration: none;
    padding: 0.5rem;
    border-radius: var(--border-radius);
    transition: background-color 0.3s;
  }
  
  .nav-menu a:hover {
    background-color: #f5f5f5;
    text-decoration: none;
  }
  
  .user-menu {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-left: 2rem;
  }
  
  .username {
    font-weight: 500;
  }
  
  .logout-btn {
    background: none;
    border: none;
    color: var(--error);
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  .logout-btn:hover {
    text-decoration: underline;
  }
```

# frontend\src\components\layout\Header.jsx

```jsx
// # frontend/src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const pages = [
    { name: 'Dashboard', path: '/' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Locations', path: '/locations' },
    { name: 'Organizations', path: '/organizations' }
  ];

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AppBar position="static" className="header">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              '&:hover': {
                color: 'white',  // Keep text white on hover
                textDecoration: 'none'  // Prevent underline on hover
              }
            }}
          >
            Volunteer Job Tracker
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {user && pages.map((page) => (
                <MenuItem 
                  key={page.name}
                  onClick={handleCloseNavMenu}
                  component={Link}
                  to={page.path}
                >
                  <Typography textAlign="center">{page.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            TFG
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {user && pages.map((page) => (
              <Button
                key={page.name}
                component={Link}
                to={page.path}
                sx={{ 
                  my: 2, 
                  color: 'white', 
                  display: 'block',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'  // Keep text white on hover
                  }
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <Button 
                color="inherit" 
                onClick={handleLogout}
                sx={{ 
                  ml: 2,
                  ...(isMobile && { fontSize: '0.875rem' })
                }}
              >
                Logout
              </Button>
            ) : (
              <Button 
                color="inherit" 
                component={Link} 
                to="/login"
                sx={{ 
                  ml: 2,
                  ...(isMobile && { fontSize: '0.875rem' })
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
```

# frontend\src\components\locations\LocationForm.css

```css
/* # frontend/src/components/locations/LocationForm.css */
.location-form-container {
    background-color: white;
    padding: 2rem;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    max-width: 800px;
    margin: 0 auto;
  }
```

# frontend\src\components\locations\LocationForm.jsx

```jsx
// # frontend/src/components/locations/LocationForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createLocation, getLocation, updateLocation, uploadLocationPhoto } from '../../services/locationService';
import './LocationForm.css';

const LocationForm = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    coordinates: {
      type: 'Point',
      coordinates: [0, 0]
    },
    notes: ''
  });
  const [photo, setPhoto] = useState(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLocation = async () => {
      if (!isEditing || !id) return;
      
      try {
        setLoading(true);
        const locationData = await getLocation(id);
        setFormData(locationData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load location data');
        setLoading(false);
        console.error('Error loading location:', err);
      }
    };

    loadLocation();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'longitude') {
      // Update longitude (first element in coordinates array)
      setFormData(prev => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          coordinates: [
            parseFloat(value) || 0,
            prev.coordinates.coordinates[1]
          ]
        }
      }));
    } else if (name === 'latitude') {
      // Update latitude (second element in coordinates array)
      setFormData(prev => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          coordinates: [
            prev.coordinates.coordinates[0],
            parseFloat(value) || 0
          ]
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      let locationId;
      
      if (isEditing) {
        const updatedLocation = await updateLocation(id, formData);
        locationId = updatedLocation._id;
      } else {
        const newLocation = await createLocation(formData);
        locationId = newLocation._id;
      }
      
      // If a photo was selected, upload it
      if (photo) {
        const formDataObj = new FormData();
        formDataObj.append('photo', photo);
        
        if (photoCaption) {
          formDataObj.append('caption', photoCaption);
        }
        
        await uploadLocationPhoto(locationId, formDataObj);
      }
      
      navigate(`/locations/${locationId}`);
    } catch (err) {
      setError('Failed to save location');
      setLoading(false);
      console.error('Error saving location:', err);
    }
  };

  if (loading && isEditing) {
    return <div className="loading">Loading location data...</div>;
  }

  return (
    <div className="location-form-container">
      <h2>{isEditing ? 'Edit Location' : 'Add New Location'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Location Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="longitude">Longitude</label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.coordinates.coordinates[0]}
              onChange={handleChange}
              step="0.000001"
            />
            <small>Decimal degrees (e.g., 170.5036 for Dunedin, NZ)</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="latitude">Latitude</label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.coordinates.coordinates[1]}
              onChange={handleChange}
              step="0.000001"
            />
            <small>Decimal degrees (e.g., -45.8788 for Dunedin, NZ)</small>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>
        
        {/* Photo upload - only shown when first creating a location or for locations with no photos */}
        {(!isEditing || (formData.photos && formData.photos.length === 0)) && (
          <div className="form-group">
            <label htmlFor="photo">Upload Photo</label>
            <input
              type="file"
              id="photo"
              name="photo"
              accept="image/*"
              onChange={handlePhotoChange}
            />
            <small>* Photos with GPS data will automatically update location coordinates</small>
            
            <div className="form-group">
              <label htmlFor="photoCaption">Photo Caption</label>
              <input
                type="text"
                id="photoCaption"
                name="photoCaption"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
              />
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/locations')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Location' : 'Create Location'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationForm;
```

# frontend\src\components\map\LocationMap.css

```css
/* # frontend/src/components/map/LocationMap.css */
.map-container {
    position: relative;
    width: 100%;
    height: 600px;
    border-radius: var(--border-radius);
    overflow: hidden;
  }
  
  .map {
    width: 100%;
    height: 100%;
  }
  
  .map-info {
    background-color: rgba(255, 255, 255, 0.8);
    padding: 0.5rem;
    border-radius: var(--border-radius);
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1;
    font-size: 0.9rem;
  }
  
  .location-marker {
    width: 20px;
    height: 20px;
    background-color: var(--primary-color);
    border-radius: 50%;
    border: 2px solid white;
    cursor: pointer;
  }

  .mapboxgl-map {
    position: relative !important;
  }
  
```

# frontend\src\components\map\LocationMap.jsx

```jsx
// # frontend/src/components/map/LocationMap.jsx
import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { fetchLocations } from '../../services/locationService';
import './LocationMap.css';

// Set your Mapbox token in .env file
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const LocationMap = ({ singleLocation = null }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [locations, setLocations] = useState(singleLocation ? [singleLocation] : []);
  const [loading, setLoading] = useState(!singleLocation);
  const [error, setError] = useState(null);
  const [viewport, setViewport] = useState({
    lng: 170.5036, // Default coordinates for Dunedin, NZ
    lat: -45.8788,
    zoom: 11
  });

  // Load locations data if not provided as prop
  useEffect(() => {
    const getLocations = async () => {
      if (singleLocation) return; // Skip if single location is provided
      
      try {
        setLoading(true);
        const data = await fetchLocations();
        console.log('Fetched locations:', data.length);
        setLocations(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load location data');
        setLoading(false);
        console.error('Error fetching locations:', err);
      }
    };

    getLocations();
  }, [singleLocation]);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Skip if map already initialized
    
    if (mapContainer.current) {
      console.log('Initializing map...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [viewport.lng, viewport.lat],
        zoom: viewport.zoom
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Update viewport on map move
      map.current.on('move', () => {
        setViewport({
          lng: parseFloat(map.current.getCenter().lng.toFixed(4)),
          lat: parseFloat(map.current.getCenter().lat.toFixed(4)),
          zoom: parseFloat(map.current.getZoom().toFixed(2))
        });
      });
      
      // Wait for map to load fully before adding markers
      map.current.on('load', () => {
        console.log('Map loaded, ready to add markers');
      });
    }
  }, [viewport.lng, viewport.lat, viewport.zoom]);

  // Add location markers when locations data loads and fit map to them
  useEffect(() => {
    if (!map.current || loading || locations.length === 0) return;

    console.log('Adding markers for', locations.length, 'locations');
    
    // Wait for map to be loaded before adding markers
    const addMarkersWhenReady = () => {
      if (!map.current.loaded()) {
        console.log('Map not loaded yet, waiting...');
        setTimeout(addMarkersWhenReady, 100);
        return;
      }
      
      // Remove existing markers
      const existingMarkers = document.getElementsByClassName('location-marker');
      while (existingMarkers[0]) {
        existingMarkers[0].parentNode.removeChild(existingMarkers[0]);
      }

      // Create a bounds object to fit the map to all markers
      const bounds = new mapboxgl.LngLatBounds();
      let markersAdded = 0;

      // Add markers for each location
      locations.forEach(location => {
        if (!location.coordinates || !location.coordinates.coordinates) {
          console.log('Location missing coordinates:', location.name);
          return;
        }
        
        // GeoJSON format in MongoDB stores as [longitude, latitude]
        // We need to ensure we're using them correctly
        const [lng, lat] = location.coordinates.coordinates;
        
        // Debug log to verify coordinates
        console.log(`Adding marker for location "${location.name}" at coordinates:`, { lng, lat });
        
        // Skip if invalid coordinates
        if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
          console.log('Invalid coordinates for location:', location.name);
          return;
        }
        
        // Validate coordinates are within reasonable bounds
        if (Math.abs(lng) > 180 || Math.abs(lat) > 90) {
          console.log('Out of range coordinates for location:', location.name, lng, lat);
          return;
        }
        
        // Add location to bounds
        bounds.extend([lng, lat]);
        markersAdded++;

        // Create marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'location-marker';
        
        // Create popup with location info
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <h3>${location.name}</h3>
            <p>${location.address || ''}</p>
            ${location.photos && location.photos.length > 0 
              ? `<img src="${location.photos[0].url}" alt="${location.name}" style="width:100%;max-width:200px;" />` 
              : ''}
            <p><a href="/locations/${location._id}">View Details</a></p>
          `);

        // Add marker to map - make sure to use [lng, lat] order for Mapbox
        new mapboxgl.Marker(markerEl)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map.current);
      });

      // Fit map to markers if any were added
      if (markersAdded > 0) {
        console.log('Fitting map to', markersAdded, 'markers');
        if (!bounds.isEmpty()) {
          try {
            // Add padding and fit bounds
            map.current.fitBounds(bounds, {
              padding: { top: 50, bottom: 50, left: 50, right: 50 },
              maxZoom: 15
            });
          } catch (err) {
            console.error('Error fitting bounds:', err);
          }
        } else {
          console.log('No valid bounds to fit');
        }
      } else {
        console.log('No markers added to fit');
      }
    };

    // Start the marker adding process
    addMarkersWhenReady();
  }, [locations, loading]);

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="map-container">
      <div className="map-info">
        <h3>Your Task Force Green Locations</h3>
        <p>
          Longitude: {viewport.lng} | Latitude: {viewport.lat} | Zoom: {viewport.zoom}
        </p>
      </div>
      <div ref={mapContainer} className="map" />
      {loading && <div className="loading-overlay">Loading map data...</div>}
    </div>
  );
};

export default LocationMap;
```

# frontend\src\components\organizations\OrganizationForm.css

```css
/* # frontend/src/components/organizations/OrganizationForm.css */
.organization-form-container {
  background-color: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  max-width: 800px;
  margin: 0 auto;
}

.organization-form h3 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #2e7d32;
}

/* Reusing form styles from JobForm.css */
.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input, textarea, select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  font-size: 1rem;
  background-color: #f9f9f9;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}
```

# frontend\src\components\organizations\OrganizationForm.jsx

```jsx
// # frontend/src/components/organizations/OrganizationForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createOrganization, getOrganization, updateOrganization } from '../../services/organizationService';
import './OrganizationForm.css';

const OrganizationForm = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contact: {
      name: '',
      email: '',
      phone: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrganization = async () => {
      if (!isEditing || !id) return;
      
      try {
        setLoading(true);
        const organizationData = await getOrganization(id);
        setFormData({
          name: organizationData.name || '',
          description: organizationData.description || '',
          contact: {
            name: organizationData.contact?.name || '',
            email: organizationData.contact?.email || '',
            phone: organizationData.contact?.phone || ''
          }
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load organization data');
        setLoading(false);
        console.error('Error loading organization:', err);
      }
    };

    loadOrganization();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested contact fields
    if (name.startsWith('contact.')) {
      const contactField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [contactField]: value
        }
      }));
    } else {
      // Handle top-level fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      if (isEditing) {
        await updateOrganization(id, formData);
      } else {
        await createOrganization(formData);
      }
      
      navigate('/organizations');
    } catch (err) {
      setError('Failed to save organization');
      setLoading(false);
      console.error('Error saving organization:', err);
    }
  };

  if (loading && isEditing) {
    return <div className="loading">Loading organization data...</div>;
  }

  return (
    <div className="organization-form-container">
      <h2>{isEditing ? 'Edit Organization' : 'Add New Organization'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Organization Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        
        <h3>Contact Information</h3>
        
        <div className="form-group">
          <label htmlFor="contact.name">Contact Name</label>
          <input
            type="text"
            id="contact.name"
            name="contact.name"
            value={formData.contact.name}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="contact.email">Contact Email</label>
          <input
            type="email"
            id="contact.email"
            name="contact.email"
            value={formData.contact.email}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="contact.phone">Contact Phone</label>
          <input
            type="text"
            id="contact.phone"
            name="contact.phone"
            value={formData.contact.phone}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/organizations')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Organization' : 'Create Organization'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganizationForm;
```

# frontend\src\components\routing\PrivateRoute.jsx

```jsx
// # frontend/src/components/routing/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading indicator while checking authentication
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // If not authenticated, redirect to login
  // Otherwise, render the child routes using Outlet
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
```

# frontend\src\context\AuthContext.js

```js
// # frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as loginApi, register as registerApi, getCurrentUser } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('token');
          setToken(null);
          setError('Session expired. Please login again.');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await loginApi(email, password);
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      setLoading(false);
      
      return data.user;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await registerApi(name, email, password);
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      setLoading(false);
      
      return data.user;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

# frontend\src\index.css

```css

```

# frontend\src\index.js

```js
// # frontend/src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Make sure this DOM element exists in public/index.html
const rootElement = document.getElementById('root');

// Check if the element exists before trying to render
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  console.error('Could not find element with id "root". Make sure it exists in your HTML file.');
}
```

# frontend\src\pages\jobs\JobDetails.jsx

```jsx
// # frontend/src/pages/jobs/JobDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJob, deleteJob } from '../../services/jobService';
import LocationMap from '../../components/map/LocationMap';
import { formatNZDate } from '../../utils/dateUtils';

// CSS for this component
const jobDetailsStyles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto'
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  title: {
    color: '#2e7d32',
    marginBottom: '0.5rem'
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#757575',
    textDecoration: 'none',
    marginBottom: '1rem'
  },
  card: {
    background: 'white',
    borderRadius: '4px',
    padding: '2rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    marginBottom: '2rem'
  },
  infoItem: {
    marginBottom: '1rem'
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#757575',
    marginBottom: '0.3rem'
  },
  infoValue: {
    fontSize: '1.1rem'
  },
  notes: {
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6'
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '2rem'
  },
  tagContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem'
  },
  tag: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '0.3rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.9rem'
  },
  mapContainer: {
    marginTop: '2rem'
  }
};

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        const jobData = await getJob(id);
        setJob(jobData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load job details');
        setLoading(false);
        console.error('Error loading job:', err);
      }
    };
    
    loadJob();
  }, [id]);
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(id);
        navigate('/jobs');
      } catch (err) {
        console.error('Error deleting job:', err);
      }
    }
  };
  
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  if (loading) {
    return <div className="loading">Loading job details...</div>;
  }
  
  if (error) {
    return <div className="error-container">{error}</div>;
  }
  
  if (!job) {
    return <div className="error-container">Job not found</div>;
  }
  
  return (
    <div style={jobDetailsStyles.container}>
      <Link to="/jobs" style={jobDetailsStyles.backLink}>
        &larr; Back to Jobs
      </Link>
      
      <div style={jobDetailsStyles.headerBar}>
        <h1 style={jobDetailsStyles.title}>{job.title}</h1>
        
        <div style={jobDetailsStyles.actions}>
          <Link to={`/jobs/edit/${id}`} className="btn-secondary">
            Edit Job
          </Link>
          <button onClick={handleDelete} className="btn-primary" style={{ backgroundColor: '#f44336' }}>
            Delete Job
          </button>
        </div>
      </div>
      
      <div style={jobDetailsStyles.grid}>
        <div style={jobDetailsStyles.card}>
          <h2>Job Details</h2>
          
          <div style={jobDetailsStyles.infoItem}>
            <div style={jobDetailsStyles.infoLabel}>Date</div>
            <div style={jobDetailsStyles.infoValue}>
              {formatNZDate(job.date)}
            </div>
          </div>
          
          <div style={jobDetailsStyles.infoItem}>
            <div style={jobDetailsStyles.infoLabel}>Time</div>
            <div style={jobDetailsStyles.infoValue}>
              {new Date(job.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
              {new Date(job.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          
          <div style={jobDetailsStyles.infoItem}>
            <div style={jobDetailsStyles.infoLabel}>Duration</div>
            <div style={jobDetailsStyles.infoValue}>
              {formatDuration(job.duration)}
            </div>
          </div>
          
          {job.tags && job.tags.length > 0 && (
            <div style={jobDetailsStyles.infoItem}>
              <div style={jobDetailsStyles.infoLabel}>Tags</div>
              <div style={jobDetailsStyles.tagContainer}>
                {job.tags.map((tag, index) => (
                  <span key={index} style={jobDetailsStyles.tag}>{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div style={jobDetailsStyles.card}>
          <h2>Organization & Location</h2>
          
          {job.organization && (
            <div style={jobDetailsStyles.infoItem}>
              <div style={jobDetailsStyles.infoLabel}>Organization</div>
              <div style={jobDetailsStyles.infoValue}>
                {job.organization.name}
              </div>
              {job.organization.description && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  {job.organization.description}
                </div>
              )}
            </div>
          )}
          
          <div style={jobDetailsStyles.infoItem}>
            <div style={jobDetailsStyles.infoLabel}>Location</div>
            <div style={jobDetailsStyles.infoValue}>
              {job.location.name}
            </div>
            {job.location.address && (
              <div style={{ fontSize: '0.9rem' }}>
                {job.location.address}
              </div>
            )}
          </div>
          
          <div>
            <Link to={`/locations/${job.location._id}`} className="btn-text">
              View Location Details
            </Link>
          </div>
        </div>
      </div>
      
      {job.description && (
        <div style={jobDetailsStyles.card}>
          <h2>Description</h2>
          <p style={jobDetailsStyles.notes}>
            {job.description}
          </p>
        </div>
      )}
      
      {job.notes && (
        <div style={jobDetailsStyles.card}>
          <h2>Notes</h2>
          <p style={jobDetailsStyles.notes}>
            {job.notes}
          </p>
        </div>
      )}
      
      {job.location && job.location.coordinates && (
        <div style={jobDetailsStyles.mapContainer}>
          <h2>Location Map</h2>
          <LocationMap singleLocation={job.location} />
        </div>
      )}
    </div>
  );
};

export default JobDetails;
```

# frontend\src\pages\jobs\JobsList.jsx

```jsx
// # frontend/src/pages/jobs/JobsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchJobs, deleteJob } from '../../services/jobService';
import { fetchLocations } from '../../services/locationService';
import { formatNZDate } from '../../utils/dateUtils';
import ExportDialog from '../../components/jobs/ExportDialog';

// CSS for this component
const jobsListStyles = {
  container: {
    marginBottom: '2rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  filterContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  searchInput: {
    padding: '0.7rem',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    marginRight: '1rem',
    width: '400px'
  },
  filterSelect: {
    padding: '0.7rem',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    width: '300px',
    fontSize: '14px'
  },
  filterLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',  // Increased space between search and location dropdown
    flex: '1'       // Take more space on the left side
  },
  filterRight: {
    display: 'flex',
    alignItems: 'center',
    flex: '1'       // Take less space on the right side
  },
  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem'
  },
  jobCard: {
    background: 'white',
    borderRadius: '4px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column'
  },
  jobTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#2e7d32'
  },
  jobMeta: {
    color: '#757575',
    fontSize: '0.9rem',
    marginBottom: '0.5rem'
  },
  jobDescription: {
    marginBottom: '1rem'
  },
  jobActions: {
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '1rem',
    borderTop: '1px solid #e0e0e0'
  },
  tagContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem'
  },
  tag: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '0.2rem 0.5rem',
    borderRadius: '20px',
    fontSize: '0.8rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    background: 'white',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
};

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  const [showExportDialog, setShowExportDialog] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load jobs and locations in parallel
        const [jobsData, locationsData] = await Promise.all([
          fetchJobs(),
          fetchLocations()
        ]);
        
        setJobs(jobsData);
        setLocations(locationsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load jobs');
        setLoading(false);
        console.error('Error loading jobs:', err);
      }
    };
    
    loadData();
  }, []);
  
  const handleDeleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(id);
        // Remove job from state
        setJobs(jobs.filter(job => job._id !== id));
      } catch (err) {
        console.error('Error deleting job:', err);
      }
    }
  };
  
  // Apply filters and sorting
  const filteredJobs = jobs
    .filter(job => {
      // Apply search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        job.title.toLowerCase().includes(searchLower) ||
        (job.description && job.description.toLowerCase().includes(searchLower)) ||
        (job.tags && job.tags.some(tag => tag.toLowerCase().includes(searchLower)));
      
      // Apply location filter
      const matchesLocation = locationFilter ? job.location._id === locationFilter : true;
      
      return matchesSearch && matchesLocation;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'duration-desc':
          return b.duration - a.duration;
        case 'duration-asc':
          return a.duration - b.duration;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'date-desc':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });
  
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  if (loading) {
    return <div className="loading">Loading jobs...</div>;
  }
  
  if (error) {
    return <div className="error-container">{error}</div>;
  }
  
  return (
    <div style={jobsListStyles.container}>
      <div style={jobsListStyles.header}>
        <h1>Jobs List</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setShowExportDialog(true)}
            className="btn-secondary"
            style={{ backgroundColor: '#4a148c' }}
          >
            Export Data
          </button>
          <Link to="/jobs/new" className="btn-primary">Add New Job</Link>
        </div>
      </div>
      
      {/* Add the export dialog component */}
      {showExportDialog && (
        <ExportDialog onClose={() => setShowExportDialog(false)} />
      )}
      
    {/* Filters and search */}
    <div style={jobsListStyles.filterContainer}>
        <div style={jobsListStyles.filterLeft}>
            <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={jobsListStyles.searchInput}
            />
            <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            style={jobsListStyles.filterSelect}
            >
            <option value="">All Locations</option>
            {locations.map(location => (
                <option key={location._id} value={location._id}>
                {location.name}
                </option>
            ))}
            </select>
        </div>

        <div style={jobsListStyles.filterRight}>
            <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={jobsListStyles.filterSelect}
            >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="duration-desc">Longest Duration</option>
            <option value="duration-asc">Shortest Duration</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            </select>
        </div>
    </div>

      
      {filteredJobs.length > 0 ? (
        <div style={jobsListStyles.jobsGrid}>
          {filteredJobs.map(job => (
            <div key={job._id} style={jobsListStyles.jobCard}>
              <div style={jobsListStyles.jobTitle}>{job.title}</div>
              
              <div style={jobsListStyles.jobMeta}>
                <div>
                  <strong>Date:</strong> {formatNZDate(job.date)}
                </div>
                <div>
                  <strong>Location:</strong> {job.location.name}
                </div>
                <div>
                  <strong>Duration:</strong> {formatDuration(job.duration)}
                </div>
              </div>
              
              {job.description && (
                <div style={jobsListStyles.jobDescription}>
                  {job.description.length > 150 
                    ? `${job.description.substring(0, 150)}...` 
                    : job.description}
                </div>
              )}
              
              {job.tags && job.tags.length > 0 && (
                <div style={jobsListStyles.tagContainer}>
                  {job.tags.map((tag, index) => (
                    <span key={index} style={jobsListStyles.tag}>{tag}</span>
                  ))}
                </div>
              )}
              
              <div style={jobsListStyles.jobActions}>
                <Link to={`/jobs/${job._id}`} className="btn-text">
                  View Details
                </Link>
                <div>
                  <Link to={`/jobs/edit/${job._id}`} className="btn-text" style={{ marginRight: '0.5rem' }}>
                    Edit
                  </Link>
                  <button 
                    className="btn-text" 
                    style={{ color: '#f44336' }}
                    onClick={() => handleDeleteJob(job._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={jobsListStyles.emptyState}>
          <h3>No jobs found</h3>
          <p>Try adjusting your search or filters, or add a new job.</p>
          <Link to="/jobs/new" className="btn-primary" style={{ marginTop: '1rem' }}>
            Add Your First Job
          </Link>
        </div>
      )}
    </div>
  );
};

export default JobsList;
```

# frontend\src\pages\locations\LocationDetails.jsx

```jsx
// # frontend/src/pages/locations/LocationDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getLocation, deleteLocation, uploadLocationPhoto, deleteLocationPhoto } from '../../services/locationService';
import { getJobsByLocation } from '../../services/jobService';
import LocationMap from '../../components/map/LocationMap';

// CSS for this component
const locationDetailsStyles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto'
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  title: {
    color: '#2e7d32',
    marginBottom: '0.5rem'
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#757575',
    textDecoration: 'none',
    marginBottom: '1rem'
  },
  card: {
    background: 'white',
    borderRadius: '4px',
    padding: '2rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem'
  },
  address: {
    fontSize: '1.1rem',
    marginBottom: '1rem'
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end'
  },
  mapContainer: {
    height: '400px',
    marginBottom: '2rem'
  },
  photosSection: {
    marginBottom: '2rem'
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem'
  },
  photoCard: {
    position: 'relative',
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  photo: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    display: 'block'
  },
  photoCaption: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '0.5rem',
    fontSize: '0.9rem'
  },
  photoActions: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem'
  },
  deletePhotoBtn: {
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  uploadSection: {
    marginTop: '1rem',
    padding: '1rem',
    background: '#f5f5f5',
    borderRadius: '4px'
  },
  jobsSection: {
    marginBottom: '2rem'
  },
  jobsList: {
    marginTop: '1rem'
  },
  jobItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: '#f9f9f9',
    borderRadius: '4px',
    marginBottom: '0.5rem'
  },
  notes: {
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6'
  },
  emptyMessage: {
    padding: '1rem',
    background: '#f9f9f9',
    borderRadius: '4px',
    textAlign: 'center'
  }
};

const LocationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load location and associated jobs in parallel
        const [locationData, jobsData] = await Promise.all([
          getLocation(id),
          getJobsByLocation(id)
        ]);
        
        setLocation(locationData);
        setJobs(jobsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load location details');
        setLoading(false);
        console.error('Error loading location details:', err);
      }
    };
    
    loadData();
  }, [id]);
  
  const handleDeleteLocation = async () => {
    if (jobs.length > 0) {
      alert('This location has associated jobs. Please reassign or delete those jobs first.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteLocation(id);
        navigate('/locations');
      } catch (err) {
        console.error('Error deleting location:', err);
      }
    }
  };
  
  const handlePhotoFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };
  
  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    
    if (!photoFile) {
      alert('Please select a photo to upload');
      return;
    }
    
    try {
      setPhotoUploading(true);
      
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      if (photoCaption) {
        formData.append('caption', photoCaption);
      }
      
      const updatedLocation = await uploadLocationPhoto(id, formData);
      
      // Update location state with new photo
      setLocation(prevLocation => ({
        ...prevLocation,
        photos: [...prevLocation.photos, updatedLocation]
      }));
      
      // Reset form
      setPhotoFile(null);
      setPhotoCaption('');
      document.getElementById('photo-upload').value = '';
      
      setPhotoUploading(false);
    } catch (err) {
      setPhotoUploading(false);
      console.error('Error uploading photo:', err);
    }
  };
  
  const handleDeletePhoto = async (photoId) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        await deleteLocationPhoto(id, photoId);
        
        // Remove photo from state
        setLocation(prevLocation => ({
          ...prevLocation,
          photos: prevLocation.photos.filter(photo => photo._id !== photoId)
        }));
      } catch (err) {
        console.error('Error deleting photo:', err);
      }
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  if (loading) {
    return <div className="loading">Loading location details...</div>;
  }
  
  if (error) {
    return <div className="error-container">{error}</div>;
  }
  
  if (!location) {
    return <div className="error-container">Location not found</div>;
  }
  
  return (
    <div style={locationDetailsStyles.container}>
      <Link to="/locations" style={locationDetailsStyles.backLink}>
        &larr; Back to Locations
      </Link>
      
      <div style={locationDetailsStyles.headerBar}>
        <h1 style={locationDetailsStyles.title}>{location.name}</h1>
        
        <div style={locationDetailsStyles.actions}>
          <Link to={`/locations/${id}/edit`} className="btn-secondary">
            Edit Location
          </Link>
          <button 
            onClick={handleDeleteLocation} 
            className="btn-primary" 
            style={{ backgroundColor: '#f44336' }}
            disabled={jobs.length > 0}
          >
            Delete Location
          </button>
        </div>
      </div>
      
      {location.address && (
        <p style={locationDetailsStyles.address}>{location.address}</p>
      )}
      
      {/* Map */}
      <div style={locationDetailsStyles.mapContainer}>
        <LocationMap singleLocation={location} />
      </div>
      
      {/* Location details card */}
      <div style={locationDetailsStyles.card}>
        <h2>Location Details</h2>
        
        {location.coordinates && location.coordinates.coordinates && (
          <div>
            <strong>Coordinates:</strong> Latitude: {location.coordinates.coordinates[1]}, 
            Longitude: {location.coordinates.coordinates[0]}
          </div>
        )}
        
        {location.notes && (
          <div style={{ marginTop: '1rem' }}>
            <h3>Notes</h3>
            <p style={locationDetailsStyles.notes}>{location.notes}</p>
          </div>
        )}
      </div>
      
      {/* Photos section */}
      <div style={locationDetailsStyles.photosSection}>
        <h2>Photos</h2>
        
        {location.photos && location.photos.length > 0 ? (
          <div style={locationDetailsStyles.photoGrid}>
            {location.photos.map(photo => (
              <div key={photo._id} style={locationDetailsStyles.photoCard}>
                <img src={photo.url} alt={photo.caption || 'Location'} style={locationDetailsStyles.photo} />
                
                {photo.caption && (
                  <div style={locationDetailsStyles.photoCaption}>{photo.caption}</div>
                )}
                
                <div style={locationDetailsStyles.photoActions}>
                  <button 
                    style={locationDetailsStyles.deletePhotoBtn}
                    onClick={() => handleDeletePhoto(photo._id)}
                    title="Delete photo"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={locationDetailsStyles.emptyMessage}>
            No photos available for this location.
          </div>
        )}
        
        {/* Photo upload form */}
        <div style={locationDetailsStyles.uploadSection}>
          <h3>Upload New Photo</h3>
          <form onSubmit={handlePhotoUpload}>
            <div className="form-group">
              <label htmlFor="photo-upload">Select Photo</label>
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handlePhotoFileChange}
                required
              />
              <small>* Photos with GPS data will automatically update location coordinates</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="photo-caption">Caption (optional)</label>
              <input
                type="text"
                id="photo-caption"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
              />
            </div>
            
            <button type="submit" className="btn-primary" disabled={photoUploading}>
              {photoUploading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Related jobs section */}
      <div style={locationDetailsStyles.jobsSection}>
        <div style={locationDetailsStyles.headerBar}>
          <h2>Jobs at this Location</h2>
          <Link to="/jobs/new" className="btn-secondary">Add New Job</Link>
        </div>
        
        {jobs.length > 0 ? (
          <div style={locationDetailsStyles.jobsList}>
            {jobs.map(job => (
              <div key={job._id} style={locationDetailsStyles.jobItem}>
                <div>
                  <h3>{job.title}</h3>
                  <div>{formatDate(job.date)} - {formatDuration(job.duration)}</div>
                </div>
                <Link to={`/jobs/${job._id}`} className="btn-text">View Details</Link>
              </div>
            ))}
          </div>
        ) : (
          <div style={locationDetailsStyles.emptyMessage}>
            No jobs recorded at this location yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationDetails;
```

# frontend\src\pages\locations\LocationsList.jsx

```jsx
// # frontend/src/pages/locations/LocationsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchLocations, deleteLocation } from '../../services/locationService';
import LocationMap from '../../components/map/LocationMap';

// CSS for this component
const locationsListStyles = {
  container: {
    maxWidth: '1200px', // New max-width for a wider layout
    margin: '0 auto 2rem auto' // Centered with bottom margin
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  searchContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  searchInput: {
    padding: '0.5rem',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    width: '300px'
  },
  mapContainer: {
    position: 'relative',
    height: '400px',
    marginBottom: '2rem', // adds extra spacing below
    zIndex: 0
  },
  locationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)', // Fixed 3 columns
    gap: '1.5rem',
    marginTop: '2rem' // Additional space between the map and the grid
  },
  locationCard: {
    background: 'white',
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column'
  },
  locationImage: {
    marginTop: '2rem',
    height: '160px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative'
  },
  locationImagePlaceholder: {
    height: '160px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    color: '#757575',
    fontSize: '0.9rem'
  },
  locationContent: {
    padding: '1.5rem'
  },
  locationTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#2e7d32'
  },
  locationAddress: {
    color: '#757575',
    fontSize: '0.9rem',
    marginBottom: '1rem'
  },
  locationActions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e0e0e0',
    marginTop: 'auto'
  },
  photoCount: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    background: 'white',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  }
};

const LocationsList = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true);
        const data = await fetchLocations();
        setLocations(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load locations');
        setLoading(false);
        console.error('Error loading locations:', err);
      }
    };
    
    loadLocations();
  }, []);
  
  const handleDeleteLocation = async (id) => {
    if (window.confirm('Are you sure you want to delete this location? All associated job data will remain but will no longer be linked to this location.')) {
      try {
        await deleteLocation(id);
        // Remove location from state
        setLocations(locations.filter(location => location._id !== id));
      } catch (err) {
        console.error('Error deleting location:', err);
      }
    }
  };
  
  // Filter locations based on search term
  const filteredLocations = locations.filter(location => {
    const searchLower = searchTerm.toLowerCase();
    return (
      location.name.toLowerCase().includes(searchLower) ||
      (location.address && location.address.toLowerCase().includes(searchLower)) ||
      (location.notes && location.notes.toLowerCase().includes(searchLower))
    );
  });
  
  if (loading) {
    return <div className="loading">Loading locations...</div>;
  }
  
  if (error) {
    return <div className="error-container">{error}</div>;
  }
  
  return (
    <div style={locationsListStyles.container}>
      <div style={locationsListStyles.header}>
        <h1>Locations</h1>
        <Link to="/locations/new" className="btn-primary">Add New Location</Link>
      </div>
      
      {/* Search bar */}
      <div style={locationsListStyles.searchContainer}>
        <input
          type="text"
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={locationsListStyles.searchInput}
        />
      </div>
      
      {/* Map view of all locations */}
      <div style={locationsListStyles.mapContainer}>
        <LocationMap />
      </div>
      
      {/* Locations grid */}
      {filteredLocations.length > 0 ? (
        <div style={locationsListStyles.locationsGrid}>
          {filteredLocations.map(location => (
            <div key={location._id} style={locationsListStyles.locationCard}>
              {/* Location image */}
              {location.photos && location.photos.length > 0 ? (
                <div 
                  style={{
                    ...locationsListStyles.locationImage,
                    backgroundImage: `url(${location.photos[0].url})`
                  }}
                >
                  {location.photos.length > 1 && (
                    <div style={locationsListStyles.photoCount}>
                      +{location.photos.length - 1} more
                    </div>
                  )}
                </div>
              ) : (
                <div style={locationsListStyles.locationImagePlaceholder}>
                  No photos available
                </div>
              )}
              
              {/* Location details */}
              <div style={locationsListStyles.locationContent}>
                <h3 style={locationsListStyles.locationTitle}>{location.name}</h3>
                
                {location.address && (
                  <p style={locationsListStyles.locationAddress}>{location.address}</p>
                )}
                
                {location.notes && (
                  <p>
                    {location.notes.length > 100 
                      ? `${location.notes.substring(0, 100)}...` 
                      : location.notes}
                  </p>
                )}
              </div>
              
              {/* Actions */}
              <div style={locationsListStyles.locationActions}>
                <Link to={`/locations/${location._id}`} className="btn-text">
                  View Details
                </Link>
                <div>
                  <Link to={`/locations/${location._id}/edit`} className="btn-text" style={{ marginRight: '0.5rem' }}>
                    Edit
                  </Link>
                  <button 
                    className="btn-text" 
                    style={{ color: '#f44336' }}
                    onClick={() => handleDeleteLocation(location._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={locationsListStyles.emptyState}>
          <h3>No locations found</h3>
          <p>Try adjusting your search, or add a new location.</p>
          <Link to="/locations/new" className="btn-primary" style={{ marginTop: '1rem' }}>
            Add Your First Location
          </Link>
        </div>
      )}
    </div>
  );
};

export default LocationsList;
```

# frontend\src\pages\Login.jsx

```jsx
// # frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../components/jobs/JobForm.css'; // Reusing form styles

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      setLoading(true);
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="job-form-container">
      <h2>Login to TFG Job Tracker</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>Don't have an account? <Link to="/register">Register here</Link></p>
      </div>
    </div>
  );
};

export default Login;
```

# frontend\src\pages\organizations\OrganizationsList.jsx

```jsx
// # frontend/src/pages/organizations/OrganizationsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrganizations, deleteOrganization } from '../../services/organizationService';

// CSS for this component
const organizationsListStyles = {
  container: {
    marginBottom: '2rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  searchContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  searchInput: {
    padding: '0.7rem',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    width: '300px'
  },
  organizationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem'
  },
  organizationCard: {
    background: 'white',
    borderRadius: '4px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  organizationTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#2e7d32'
  },
  organizationDescription: {
    marginBottom: '1rem',
    flex: '1'
  },
  organizationContact: {
    fontSize: '0.9rem',
    color: '#757575',
    marginBottom: '1rem'
  },
  organizationActions: {
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '1rem',
    borderTop: '1px solid #e0e0e0'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    background: 'white',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  }
};

const OrganizationsList = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoading(true);
        const data = await getOrganizations();
        setOrganizations(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load organizations');
        setLoading(false);
        console.error('Error loading organizations:', err);
      }
    };
    
    loadOrganizations();
  }, []);
  
  const handleDeleteOrganization = async (id) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        await deleteOrganization(id);
        // Remove organization from state
        setOrganizations(organizations.filter(org => org._id !== id));
      } catch (err) {
        console.error('Error deleting organization:', err);
      }
    }
  };
  
  // Filter organizations based on search term
  const filteredOrganizations = organizations.filter(organization => {
    const searchLower = searchTerm.toLowerCase();
    return (
      organization.name.toLowerCase().includes(searchLower) ||
      (organization.description && organization.description.toLowerCase().includes(searchLower)) ||
      (organization.contact && organization.contact.name && organization.contact.name.toLowerCase().includes(searchLower))
    );
  });
  
  if (loading) {
    return <div className="loading">Loading organizations...</div>;
  }
  
  if (error) {
    return <div className="error-container">{error}</div>;
  }
  
  return (
    <div style={organizationsListStyles.container}>
      <div style={organizationsListStyles.header}>
        <h1>Organizations</h1>
        <Link to="/organizations/new" className="btn-primary">Add New Organization</Link>
      </div>
      
      {/* Search bar */}
      <div style={organizationsListStyles.searchContainer}>
        <input
          type="text"
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={organizationsListStyles.searchInput}
        />
      </div>
      
      {/* Organizations grid */}
      {filteredOrganizations.length > 0 ? (
        <div style={organizationsListStyles.organizationsGrid}>
          {filteredOrganizations.map(organization => (
            <div key={organization._id} style={organizationsListStyles.organizationCard}>
              <h3 style={organizationsListStyles.organizationTitle}>{organization.name}</h3>
              
              {organization.description && (
                <p style={organizationsListStyles.organizationDescription}>
                  {organization.description.length > 150 
                    ? `${organization.description.substring(0, 150)}...` 
                    : organization.description}
                </p>
              )}
              
              {organization.contact && (
                <div style={organizationsListStyles.organizationContact}>
                  {organization.contact.name && <div><strong>Contact:</strong> {organization.contact.name}</div>}
                  {organization.contact.email && <div><strong>Email:</strong> {organization.contact.email}</div>}
                  {organization.contact.phone && <div><strong>Phone:</strong> {organization.contact.phone}</div>}
                </div>
              )}
              
              <div style={organizationsListStyles.organizationActions}>
                <div>
                  <Link to={`/organizations/edit/${organization._id}`} className="btn-text" style={{ marginRight: '0.5rem' }}>
                    Edit
                  </Link>
                  <button 
                    className="btn-text" 
                    style={{ color: '#f44336' }}
                    onClick={() => handleDeleteOrganization(organization._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={organizationsListStyles.emptyState}>
          <h3>No organizations found</h3>
          <p>Try adjusting your search, or add a new organization.</p>
          <Link to="/organizations/new" className="btn-primary" style={{ marginTop: '1rem' }}>
            Add Your First Organization
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrganizationsList;
```

# frontend\src\pages\Register.jsx

```jsx
// # frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../components/jobs/JobForm.css'; // Reusing form styles

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      await register(formData.name, formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="job-form-container">
      <h2>Register for TFG Job Tracker</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />
          <small>Password must be at least 6 characters</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </div>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
};

export default Register;
```

# frontend\src\services\api.js

```js
// # frontend/src/services/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Create axios instance with default configuration
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Add authorization header to requests
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Handle response errors globally
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (e.g., token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      
      // Show toast notification
      toast.error('Session expired. Please log in again.');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    
    // Handle server errors
    if (error.response && error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

# frontend\src\services\authService.js

```js
// # frontend/src/services/authService.js
import api from './api';
import { toast } from 'react-toastify';

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data and token
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    // Show success message
    toast.success('Logged in successfully');
    
    return response.data;
  } catch (error) {
    // Show error message
    const errorMessage = error.response?.data?.error || 'Login failed';
    toast.error(errorMessage);
    
    throw error;
  }
};

/**
 * Register new user
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data and token
 */
export const register = async (name, email, password) => {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    
    // Show success message
    toast.success('Registration successful');
    
    return response.data;
  } catch (error) {
    // Show error message
    const errorMessage = error.response?.data?.error || 'Registration failed';
    toast.error(errorMessage);
    
    throw error;
  }
};

/**
 * Get current logged in user
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} Updated user data
 */
export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/auth/profile', userData);
    
    // Show success message
    toast.success('Profile updated successfully');
    
    return response.data.data;
  } catch (error) {
    // Show error message
    const errorMessage = error.response?.data?.error || 'Failed to update profile';
    toast.error(errorMessage);
    
    throw error;
  }
};
```

# frontend\src\services\jobService.js

```js
// # frontend/src/services/jobService.js
import api from './api';
import { toast } from 'react-toastify';

/**
 * Get all jobs
 * @returns {Promise<Array>} List of jobs
 */
export const fetchJobs = async () => {
  try {
    const response = await api.get('/jobs');
    return response.data.data;
  } catch (error) {
    toast.error('Failed to fetch jobs');
    throw error;
  }
};

/**
 * Get single job by ID
 * @param {string} id - Job ID
 * @returns {Promise<Object>} Job data
 */
export const getJob = async (id) => {
  try {
    const response = await api.get(`/jobs/${id}`);
    console.log('Job response data:', response.data);
    
    // Make sure we're returning the correct structure
    if (!response.data.data) {
      toast.error('Invalid job data returned from server');
      throw new Error('Invalid job data structure');
    }
    
    return response.data.data;
  } catch (error) {
    toast.error('Failed to fetch job details: ' + (error.message || 'Unknown error'));
    console.error('Error in getJob service:', error);
    throw error;
  }
};

/**
 * Create new job
 * @param {Object} jobData - Job data
 * @returns {Promise<Object>} Created job
 */
export const createJob = async (jobData) => {
  try {
    console.log('Creating new job with data:', jobData);
    
    // Clean up any potentially undefined values
    const cleanJobData = { ...jobData };
    
    // Make sure location and organization are valid IDs
    if (typeof cleanJobData.location === 'object' && cleanJobData.location?._id) {
      cleanJobData.location = cleanJobData.location._id;
    }
    
    if (typeof cleanJobData.organization === 'object' && cleanJobData.organization?._id) {
      cleanJobData.organization = cleanJobData.organization._id;
    }
    
    const response = await api.post('/jobs', cleanJobData);
    console.log('Create job response:', response.data);
    toast.success('Job created successfully');
    return response.data.data;
  } catch (error) {
    console.error('Error creating job:', error);
    console.error('Error response:', error.response?.data);
    const errorMessage = error.response?.data?.error || 'Failed to create job';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Update existing job
 * @param {string} id - Job ID
 * @param {Object} jobData - Job data
 * @returns {Promise<Object>} Updated job
 */
export const updateJob = async (id, jobData) => {
  try {
    console.log('Updating job with ID:', id);
    console.log('Job data being sent:', jobData);
    
    // Clean up any potentially undefined values that might be causing issues
    const cleanJobData = { ...jobData };
    
    // Make sure location and organization are valid IDs
    if (typeof cleanJobData.location === 'object' && cleanJobData.location?._id) {
      cleanJobData.location = cleanJobData.location._id;
    }
    
    if (typeof cleanJobData.organization === 'object' && cleanJobData.organization?._id) {
      cleanJobData.organization = cleanJobData.organization._id;
    }
    
    const response = await api.put(`/jobs/${id}`, cleanJobData);
    console.log('Update job response:', response.data);
    toast.success('Job updated successfully');
    return response.data.data;
  } catch (error) {
    console.error('Error updating job:', error);
    console.error('Error response:', error.response?.data);
    const errorMessage = error.response?.data?.error || 'Failed to update job';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Delete job
 * @param {string} id - Job ID
 * @returns {Promise<void>}
 */
export const deleteJob = async (id) => {
  try {
    await api.delete(`/jobs/${id}`);
    toast.success('Job deleted successfully');
  } catch (error) {
    toast.error('Failed to delete job');
    throw error;
  }
};

/**
 * Get jobs by location
 * @param {string} locationId - Location ID
 * @returns {Promise<Array>} List of jobs at location
 */
export const getJobsByLocation = async (locationId) => {
  try {
    const response = await api.get(`/jobs/location/${locationId}`);
    return response.data.data;
  } catch (error) {
    toast.error('Failed to fetch jobs for location');
    throw error;
  }
};

/**
 * Get job statistics for dashboard
 * @returns {Promise<Object>} Job statistics
 */
export const fetchJobStatistics = async () => {
  try {
    const response = await api.get('/jobs/statistics?recentCount=8');
    
    // Add this detailed logging
    console.log('Raw statistics API response:', response);
    console.log('Statistics data structure:', response.data);
    console.log('Unique days from API:', response.data.data.uniqueDays);
    
    // Make sure we return response.data.data, not just response.data
    return response.data.data;
  } catch (error) {
    toast.error('Failed to fetch job statistics');
    throw error;
  }
};

// # frontend/src/services/jobService.js - Add this new function to the existing file

/**
 * Export jobs data as Excel file
 * @param {Object} filters - Filter criteria
 * @param {string} filters.startDate - Start date (YYYY-MM-DD)
 * @param {string} filters.endDate - End date (YYYY-MM-DD)
 * @param {string} filters.locationId - Location ID
 * @param {string} filters.tags - Comma-separated tags
 * @returns {Promise<Blob>} Excel file as blob
 */
export const exportJobsData = async (filters = {}) => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.locationId) params.append('locationId', filters.locationId);
    if (filters.tags) params.append('tags', filters.tags);
    
    // Make request with responseType 'blob' to handle file download
    const response = await api.get(`/jobs/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    // Create a URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    
    // Set filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'TFG_Job_Tracker_Export.xlsx';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    window.URL.revokeObjectURL(url);
    
    toast.success('Export successful');
    return response.data;
  } catch (error) {
    toast.error('Failed to export data');
    throw error;
  }
};
```

# frontend\src\services\locationService.js

```js
// # frontend/src/services/locationService.js
import api from './api';
import { toast } from 'react-toastify';

/**
 * Get all locations
 * @returns {Promise<Array>} List of locations
 */
export const fetchLocations = async () => {
  try {
    const response = await api.get('/locations');
    return response.data.data;
  } catch (error) {
    toast.error('Failed to fetch locations');
    throw error;
  }
};

/**
 * Get single location by ID
 * @param {string} id - Location ID
 * @returns {Promise<Object>} Location data
 */
export const getLocation = async (id) => {
  try {
    const response = await api.get(`/locations/${id}`);
    return response.data.data;
  } catch (error) {
    toast.error('Failed to fetch location details');
    throw error;
  }
};

/**
 * Create new location
 * @param {Object} locationData - Location data
 * @returns {Promise<Object>} Created location
 */
export const createLocation = async (locationData) => {
  try {
    const response = await api.post('/locations', locationData);
    toast.success('Location created successfully');
    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to create location';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Update existing location
 * @param {string} id - Location ID
 * @param {Object} locationData - Location data
 * @returns {Promise<Object>} Updated location
 */
export const updateLocation = async (id, locationData) => {
  try {
    const response = await api.put(`/locations/${id}`, locationData);
    toast.success('Location updated successfully');
    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to update location';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Delete location
 * @param {string} id - Location ID
 * @returns {Promise<void>}
 */
export const deleteLocation = async (id) => {
  try {
    await api.delete(`/locations/${id}`);
    toast.success('Location deleted successfully');
  } catch (error) {
    toast.error('Failed to delete location');
    throw error;
  }
};

/**
 * Upload photo to location
 * @param {string} id - Location ID
 * @param {FormData} formData - Form data with photo and caption
 * @returns {Promise<Object>} Updated location with new photo
 */
export const uploadLocationPhoto = async (id, formData) => {
  try {
    const response = await api.post(`/locations/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    toast.success('Photo uploaded successfully');
    return response.data.data;
  } catch (error) {
    toast.error('Failed to upload photo');
    throw error;
  }
};

/**
 * Delete photo from location
 * @param {string} locationId - Location ID
 * @param {string} photoId - Photo ID
 * @returns {Promise<void>}
 */
export const deleteLocationPhoto = async (locationId, photoId) => {
  try {
    await api.delete(`/locations/${locationId}/photos/${photoId}`);
    toast.success('Photo deleted successfully');
  } catch (error) {
    toast.error('Failed to delete photo');
    throw error;
  }
};

/**
 * Get nearby locations
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} distance - Distance in meters (default: 10000)
 * @returns {Promise<Array>} List of nearby locations
 */
export const getNearbyLocations = async (lat, lng, distance = 10000) => {
  try {
    const response = await api.get('/locations/nearby', {
      params: { lat, lng, distance }
    });
    return response.data.data;
  } catch (error) {
    toast.error('Failed to fetch nearby locations');
    throw error;
  }
};

/**
 * Extract GPS coordinates from uploaded image
 * @param {File} imageFile - Image file
 * @returns {Promise<Object>} GPS coordinates from image
 */
export const extractGpsFromImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('photo', imageFile);
    
    const response = await api.post('/locations/extract-gps', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  } catch (error) {
    toast.error('Failed to extract GPS data from image');
    throw error;
  }
};
```

# frontend\src\services\organizationService.js

```js
// # frontend/src/services/organizationService.js
import api from './api';
import { toast } from 'react-toastify';

/**
 * Get all organizations
 * @returns {Promise<Array>} List of organizations
 */
export const getOrganizations = async () => {
  try {
    const response = await api.get('/organizations');
    return response.data.data;
  } catch (error) {
    toast.error('Failed to fetch organizations');
    throw error;
  }
};

/**
 * Get single organization by ID
 * @param {string} id - Organization ID
 * @returns {Promise<Object>} Organization data
 */
export const getOrganization = async (id) => {
  try {
    const response = await api.get(`/organizations/${id}`);
    return response.data.data;
  } catch (error) {
    toast.error('Failed to fetch organization details');
    throw error;
  }
};

/**
 * Create new organization
 * @param {Object} organizationData - Organization data
 * @returns {Promise<Object>} Created organization
 */
export const createOrganization = async (organizationData) => {
  try {
    const response = await api.post('/organizations', organizationData);
    toast.success('Organization created successfully');
    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to create organization';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Update existing organization
 * @param {string} id - Organization ID
 * @param {Object} organizationData - Organization data
 * @returns {Promise<Object>} Updated organization
 */
export const updateOrganization = async (id, organizationData) => {
  try {
    const response = await api.put(`/organizations/${id}`, organizationData);
    toast.success('Organization updated successfully');
    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to update organization';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Delete organization
 * @param {string} id - Organization ID
 * @returns {Promise<void>}
 */
export const deleteOrganization = async (id) => {
  try {
    await api.delete(`/organizations/${id}`);
    toast.success('Organization deleted successfully');
  } catch (error) {
    toast.error('Failed to delete organization');
    throw error;
  }
};
```

# frontend\src\utils\dateUtils.js

```js
// # frontend/src/utils/dateUtils.js
/**
 * Format a date string to New Zealand format (dd/mm/yyyy)
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted date string
 */
export const formatNZDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;
    
    // Format as dd/mm/yyyy
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };
```

# Implementation_Plan.md

```md
# TFG Job Tracker: Rapid Implementation Plan

## Phase 1: Project Setup & Structure

1. **Development Environment**
   - Set up GitHub repository
   - Initialize folder structure for frontend and backend
   - Install required dependencies
   - Configure environment variables

2. **Database Configuration**
   - Set up MongoDB connection
   - Create initial database schemas
   - Configure database authentication

3. **Authentication System**
   - Implement User model
   - Create JWT authentication
   - Set up protected routes middleware
   - Implement login/register endpoints

## Phase 2: Core Functionality

1. **Data Models Implementation**
   - Complete Job model
   - Complete Location model
   - Create relationships between models

2. **API Endpoints**
   - Job CRUD operations
   - Location CRUD operations
   - Statistics and reporting endpoints
   - File upload endpoints

3. **EXIF Functionality**
   - Set up file upload handling
   - Implement EXIF data extraction
   - Configure Cloudinary integration
   - Create GPS coordinate extraction utility

## Phase 3: Frontend Development

1. **React Application Structure**
   - Set up React router
   - Create authentication context
   - Build layout components
   - Implement protected routes

2. **Core Components**
   - Build authentication pages
   - Create job entry forms
   - Implement location management
   - Develop dashboard components

3. **API Integration**
   - Configure API service with Axios
   - Connect frontend to backend endpoints
   - Handle authentication tokens
   - Implement error handling

## Phase 4: Map & Visualization

1. **Mapbox Integration**
   - Configure Mapbox component
   - Implement location marker display
   - Create info popups for locations
   - Build map controls

2. **Photo & GPS Features**
   - Implement photo upload
   - Create location photo gallery
   - Extract and display GPS data
   - Connect photo locations to map

3. **Dashboard & Reporting**
   - Create statistics visualizations
   - Implement time tracking displays
   - Build activity breakdown charts
   - Develop location analysis features

## Phase 5: Testing & Deployment

1. **Testing & Refinement**
   - Test all API endpoints
   - Verify frontend functionality
   - Check form validations
   - Ensure responsive design

2. **Deployment**
   - Deploy backend API
   - Deploy frontend application
   - Configure production environment variables
   - Verify deployed application

## Implementation Priorities

### Must-Have Features
- User authentication
- Job entry and tracking
- Location management with map
- Photo upload with GPS extraction
- Basic time reporting

### Nice-to-Have Features
- Advanced analytics
- Tag-based filtering
- CSV export functionality
- Mobile responsiveness
- Multi-user support
```

# start-tfg-tracker.bat

```bat
@echo off
echo =======================================
echo      TFG Job Tracker Starter
echo =======================================
echo.

echo Checking Node.js and npm installation...
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Node.js is not installed or not in PATH! Please install Node.js.
  pause
  exit /b
)

echo MongoDB service is running...

echo.
echo Starting backend server...
start cmd /k "cd backend && npm run dev"

echo Waiting for backend to initialize...
timeout /t 5 >nul

echo.
echo Starting frontend application...
echo (This might take a moment. If the browser doesn't open automatically, go to http://localhost:3000)
cd frontend

echo Checking for node_modules...
if not exist node_modules\ (
  echo node_modules not found. Installing dependencies...
  call npm install
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies! Check the error message above.
    cd ..
    pause
    exit /b
  )
)

echo Starting frontend...
start cmd /k "npm start"
cd ..

echo.
echo TFG Job Tracker is starting!
echo Backend API: http://localhost:5000/api
echo Frontend: http://localhost:3000
echo.
echo If the browser doesn't open automatically, manually navigate to http://localhost:3000
echo.
echo Close this window when you're done using the application.
echo (Don't forget to close the other command windows too)
```

