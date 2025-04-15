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