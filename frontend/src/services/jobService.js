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
    return response.data.data;
  } catch (error) {
    toast.error('Failed to fetch job details');
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
    const response = await api.post('/jobs', jobData);
    toast.success('Job created successfully');
    return response.data.data;
  } catch (error) {
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
    const response = await api.put(`/jobs/${id}`, jobData);
    toast.success('Job updated successfully');
    return response.data.data;
  } catch (error) {
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
    const response = await api.get('/jobs/statistics');
    
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