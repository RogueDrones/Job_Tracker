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