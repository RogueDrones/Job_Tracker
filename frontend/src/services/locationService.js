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