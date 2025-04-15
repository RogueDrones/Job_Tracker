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