// # frontend/src/components/jobs/JobForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchLocations } from '../../services/locationService';
import { getOrganizations } from '../../services/organizationService';
import { createJob, updateJob, getJob, uploadJobPhoto, deleteJobPhoto } from '../../services/jobService';
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
    notes: '',
    photos: []
  });
  
  const [photo, setPhoto] = useState(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
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
          
          // Format date for form in local timezone
          const dt = new Date(jobData.date);
          const year  = dt.getFullYear();
          const month = String(dt.getMonth() + 1).padStart(2, '0');
          const day   = String(dt.getDate()).padStart(2, '0');
          const date  = `${year}-${month}-${day}`;
          
          // Format start and end times
          const formatTime = (timeStr) => {
            const time = new Date(timeStr);
            return time.toTimeString().slice(0, 5); // Get HH:MM format
          };
          
          const startTime = formatTime(jobData.startTime);
          const endTime = formatTime(jobData.endTime);
          
          // Handle location and organization IDs safely
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
            notes: jobData.notes || '',
            photos: jobData.photos || []
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

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    
    if (!photo) {
      alert('Please select a photo to upload');
      return;
    }
    
    try {
      setPhotoUploading(true);
      
      const formDataObj = new FormData();
      formDataObj.append('photo', photo);
      
      if (photoCaption) {
        formDataObj.append('caption', photoCaption);
      }
      
      const updatedPhoto = await uploadJobPhoto(id, formDataObj);
      
      // Update form data with new photo
      setFormData(prev => ({
        ...prev,
        photos: [...(prev.photos || []), updatedPhoto]
      }));
      
      // Reset photo form
      setPhoto(null);
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
        await deleteJobPhoto(id, photoId);
        
        // Remove photo from state
        setFormData(prev => ({
          ...prev,
          photos: prev.photos.filter(photo => photo._id !== photoId)
        }));
      } catch (err) {
        console.error('Error deleting photo:', err);
      }
    }
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
      jobData.date = new Date(formData.date).toISOString();

      let savedJob;
      // Submit the job data
      if (isEditing) {
        savedJob = await updateJob(id, jobData);
      } else {
        savedJob = await createJob(jobData);
        
        // If a photo was selected for a new job, upload it
        if (photo) {
          const formDataObj = new FormData();
          formDataObj.append('photo', photo);
          
          if (photoCaption) {
            formDataObj.append('caption', photoCaption);
          }
          
          await uploadJobPhoto(savedJob._id, formDataObj);
        }
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
        
        {isEditing && (
          <div className="photo-management">
            <h3>Photos</h3>
            {formData.photos && formData.photos.length > 0 ? (
              <div className="photo-grid">
                {formData.photos.map(photo => (
                  <div key={photo._id} className="photo-card">
                    <img src={photo.url} alt={photo.caption || 'Job'} className="photo" />
                    
                    {photo.caption && (
                      <div className="photo-caption">{photo.caption}</div>
                    )}
                    
                    <div className="photo-actions">
                      <button 
                        type="button"
                        className="delete-photo-btn"
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
              <p>No photos available for this job.</p>
            )}
            
            <div className="upload-section">
              <h4>Upload New Photo</h4>
              <div className="form-group">
                <label htmlFor="photo-upload">Select Photo</label>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                
                <div className="form-group">
                  <label htmlFor="photo-caption">Caption (optional)</label>
                  <input
                    type="text"
                    id="photo-caption"
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                  />
                </div>
                
                <button 
                  type="button" 
                  onClick={handlePhotoUpload}
                  className="btn-secondary"
                  disabled={photoUploading || !photo}
                >
                  {photoUploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {!isEditing && (
          <div className="form-group">
            <label htmlFor="photo">Upload Photo (optional)</label>
            <input
              type="file"
              id="photo"
              name="photo"
              accept="image/*"
              onChange={handlePhotoChange}
            />
            
            <div className="form-group">
              <label htmlFor="photoCaption">Photo Caption (optional)</label>
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