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