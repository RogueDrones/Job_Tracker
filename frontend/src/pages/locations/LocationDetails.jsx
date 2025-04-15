// # frontend/src/pages/locations/LocationDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getLocation, deleteLocation, uploadLocationPhoto, deleteLocationPhoto } from '../../services/locationService';
import { getJobsByLocation } from '../../services/jobService';
import LocationMap from '../../components/map/LocationMap';

// CSS for this component
const locationDetailsStyles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto'
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  title: {
    color: '#2e7d32',
    marginBottom: '0.5rem'
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#757575',
    textDecoration: 'none',
    marginBottom: '1rem'
  },
  card: {
    background: 'white',
    borderRadius: '4px',
    padding: '2rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem'
  },
  address: {
    fontSize: '1.1rem',
    marginBottom: '1rem'
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end'
  },
  mapContainer: {
    height: '400px',
    marginBottom: '2rem'
  },
  photosSection: {
    marginBottom: '2rem'
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem'
  },
  photoCard: {
    position: 'relative',
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  photo: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    display: 'block'
  },
  photoCaption: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '0.5rem',
    fontSize: '0.9rem'
  },
  photoActions: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem'
  },
  deletePhotoBtn: {
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  uploadSection: {
    marginTop: '1rem',
    padding: '1rem',
    background: '#f5f5f5',
    borderRadius: '4px'
  },
  jobsSection: {
    marginBottom: '2rem'
  },
  jobsList: {
    marginTop: '1rem'
  },
  jobItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: '#f9f9f9',
    borderRadius: '4px',
    marginBottom: '0.5rem'
  },
  notes: {
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6'
  },
  emptyMessage: {
    padding: '1rem',
    background: '#f9f9f9',
    borderRadius: '4px',
    textAlign: 'center'
  }
};

const LocationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load location and associated jobs in parallel
        const [locationData, jobsData] = await Promise.all([
          getLocation(id),
          getJobsByLocation(id)
        ]);
        
        setLocation(locationData);
        setJobs(jobsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load location details');
        setLoading(false);
        console.error('Error loading location details:', err);
      }
    };
    
    loadData();
  }, [id]);
  
  const handleDeleteLocation = async () => {
    if (jobs.length > 0) {
      alert('This location has associated jobs. Please reassign or delete those jobs first.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteLocation(id);
        navigate('/locations');
      } catch (err) {
        console.error('Error deleting location:', err);
      }
    }
  };
  
  const handlePhotoFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };
  
  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    
    if (!photoFile) {
      alert('Please select a photo to upload');
      return;
    }
    
    try {
      setPhotoUploading(true);
      
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      if (photoCaption) {
        formData.append('caption', photoCaption);
      }
      
      const updatedLocation = await uploadLocationPhoto(id, formData);
      
      // Update location state with new photo
      setLocation(prevLocation => ({
        ...prevLocation,
        photos: [...prevLocation.photos, updatedLocation]
      }));
      
      // Reset form
      setPhotoFile(null);
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
        await deleteLocationPhoto(id, photoId);
        
        // Remove photo from state
        setLocation(prevLocation => ({
          ...prevLocation,
          photos: prevLocation.photos.filter(photo => photo._id !== photoId)
        }));
      } catch (err) {
        console.error('Error deleting photo:', err);
      }
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  if (loading) {
    return <div className="loading">Loading location details...</div>;
  }
  
  if (error) {
    return <div className="error-container">{error}</div>;
  }
  
  if (!location) {
    return <div className="error-container">Location not found</div>;
  }
  
  return (
    <div style={locationDetailsStyles.container}>
      <Link to="/locations" style={locationDetailsStyles.backLink}>
        &larr; Back to Locations
      </Link>
      
      <div style={locationDetailsStyles.headerBar}>
        <h1 style={locationDetailsStyles.title}>{location.name}</h1>
        
        <div style={locationDetailsStyles.actions}>
          <Link to={`/locations/${id}/edit`} className="btn-secondary">
            Edit Location
          </Link>
          <button 
            onClick={handleDeleteLocation} 
            className="btn-primary" 
            style={{ backgroundColor: '#f44336' }}
            disabled={jobs.length > 0}
          >
            Delete Location
          </button>
        </div>
      </div>
      
      {location.address && (
        <p style={locationDetailsStyles.address}>{location.address}</p>
      )}
      
      {/* Map */}
      <div style={locationDetailsStyles.mapContainer}>
        <LocationMap singleLocation={location} />
      </div>
      
      {/* Location details card */}
      <div style={locationDetailsStyles.card}>
        <h2>Location Details</h2>
        
        {location.coordinates && location.coordinates.coordinates && (
          <div>
            <strong>Coordinates:</strong> Latitude: {location.coordinates.coordinates[1]}, 
            Longitude: {location.coordinates.coordinates[0]}
          </div>
        )}
        
        {location.notes && (
          <div style={{ marginTop: '1rem' }}>
            <h3>Notes</h3>
            <p style={locationDetailsStyles.notes}>{location.notes}</p>
          </div>
        )}
      </div>
      
      {/* Photos section */}
      <div style={locationDetailsStyles.photosSection}>
        <h2>Photos</h2>
        
        {location.photos && location.photos.length > 0 ? (
          <div style={locationDetailsStyles.photoGrid}>
            {location.photos.map(photo => (
              <div key={photo._id} style={locationDetailsStyles.photoCard}>
                <img src={photo.url} alt={photo.caption || 'Location'} style={locationDetailsStyles.photo} />
                
                {photo.caption && (
                  <div style={locationDetailsStyles.photoCaption}>{photo.caption}</div>
                )}
                
                <div style={locationDetailsStyles.photoActions}>
                  <button 
                    style={locationDetailsStyles.deletePhotoBtn}
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
          <div style={locationDetailsStyles.emptyMessage}>
            No photos available for this location.
          </div>
        )}
        
        {/* Photo upload form */}
        <div style={locationDetailsStyles.uploadSection}>
          <h3>Upload New Photo</h3>
          <form onSubmit={handlePhotoUpload}>
            <div className="form-group">
              <label htmlFor="photo-upload">Select Photo</label>
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handlePhotoFileChange}
                required
              />
              <small>* Photos with GPS data will automatically update location coordinates</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="photo-caption">Caption (optional)</label>
              <input
                type="text"
                id="photo-caption"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
              />
            </div>
            
            <button type="submit" className="btn-primary" disabled={photoUploading}>
              {photoUploading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Related jobs section */}
      <div style={locationDetailsStyles.jobsSection}>
        <div style={locationDetailsStyles.headerBar}>
          <h2>Jobs at this Location</h2>
          <Link to="/jobs/new" className="btn-secondary">Add New Job</Link>
        </div>
        
        {jobs.length > 0 ? (
          <div style={locationDetailsStyles.jobsList}>
            {jobs.map(job => (
              <div key={job._id} style={locationDetailsStyles.jobItem}>
                <div>
                  <h3>{job.title}</h3>
                  <div>{formatDate(job.date)} - {formatDuration(job.duration)}</div>
                </div>
                <Link to={`/jobs/${job._id}`} className="btn-text">View Details</Link>
              </div>
            ))}
          </div>
        ) : (
          <div style={locationDetailsStyles.emptyMessage}>
            No jobs recorded at this location yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationDetails;