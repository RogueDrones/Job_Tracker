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