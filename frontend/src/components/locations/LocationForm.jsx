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
  const [photoRequired, setPhotoRequired] = useState(!isEditing);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    const loadLocation = async () => {
      if (!isEditing || !id) return;
      
      try {
        setLoading(true);
        const locationData = await getLocation(id);
        setFormData(locationData);
        
        // If the location already has photos, don't require a new one
        if (locationData.photos && locationData.photos.length > 0) {
          setPhotoRequired(false);
        }
        
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
      // Reset the error if it was photo-related
      if (error && error.includes('photo')) {
        setError(null);
      }
    }
  };

  const validateForm = () => {
    // Set submit attempted to true to show all validation errors
    setSubmitAttempted(true);
    
    // Check if name is provided
    if (!formData.name.trim()) {
      setError('Location name is required');
      return false;
    }
    
    // Check if photo is provided for new locations
    if (photoRequired && !photo) {
      setError('A photo is required for new locations');
      return false;
    }
    
    // Validate coordinates if manually entered
    if (
      isNaN(formData.coordinates.coordinates[0]) || 
      isNaN(formData.coordinates.coordinates[1])
    ) {
      setError('Valid coordinates are required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the form
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // For new locations with the photo requirement
      if (!isEditing) {
        if (!photo) {
          setError('A photo is required for new locations');
          setLoading(false);
          return;
        }
        
        // First create the location
        const newLocation = await createLocation(formData);
        const locationId = newLocation._id;
        
        // Then upload the photo
        const formDataObj = new FormData();
        formDataObj.append('photo', photo);
        
        if (photoCaption) {
          formDataObj.append('caption', photoCaption);
        }
        
        try {
          // Upload the photo
          await uploadLocationPhoto(locationId, formDataObj);
          
          // Navigate to the new location
          navigate(`/locations/${locationId}`);
        } catch (photoErr) {
          setError('Location was created but photo upload failed. Please try adding a photo from the location details page.');
          navigate(`/locations/${locationId}`);
        }
      } else {
        // For editing, update the location first
        const updatedLocation = await updateLocation(id, formData);
        const locationId = updatedLocation._id;
        
        // If a photo was selected, upload it
        if (photo) {
          const formDataObj = new FormData();
          formDataObj.append('photo', photo);
          
          if (photoCaption) {
            formDataObj.append('caption', photoCaption);
          }
          
          try {
            await uploadLocationPhoto(locationId, formDataObj);
          } catch (photoErr) {
            setError('Location was updated but photo upload failed.');
          }
        }
        
        navigate(`/locations/${locationId}`);
      }
    } catch (err) {
      console.error('Error saving location:', err);
      
      // Enhanced error handling
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to save location. Please check your inputs and try again.');
      }
      
      setLoading(false);
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
          <label htmlFor="name">Location Name*</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={submitAttempted && !formData.name.trim() ? 'input-error' : ''}
          />
          {submitAttempted && !formData.name.trim() && (
            <div className="field-error">Name is required</div>
          )}
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
              className={submitAttempted && isNaN(formData.coordinates.coordinates[0]) ? 'input-error' : ''}
            />
            <small>Decimal degrees (e.g., 170.5036 for Dunedin, NZ)</small>
            {submitAttempted && isNaN(formData.coordinates.coordinates[0]) && (
              <div className="field-error">Valid longitude is required</div>
            )}
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
              className={submitAttempted && isNaN(formData.coordinates.coordinates[1]) ? 'input-error' : ''}
            />
            <small>Decimal degrees (e.g., -45.8788 for Dunedin, NZ)</small>
            {submitAttempted && isNaN(formData.coordinates.coordinates[1]) && (
              <div className="field-error">Valid latitude is required</div>
            )}
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
        
        {/* Photo upload section - now required for new locations */}
        <div className="form-group">
          <label htmlFor="photo">
            Upload Photo {photoRequired ? '*' : ''}
          </label>
          <input
            type="file"
            id="photo"
            name="photo"
            accept="image/*"
            onChange={handlePhotoChange}
            className={submitAttempted && photoRequired && !photo ? 'input-error' : ''}
          />
          {photoRequired && (
            <small className="requirement-note">* A photo is required to create a new location</small>
          )}
          <small>* Photos with GPS data will automatically update location coordinates</small>
          
          {submitAttempted && photoRequired && !photo && (
            <div className="field-error">Photo is required for new locations</div>
          )}
          
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