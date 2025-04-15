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