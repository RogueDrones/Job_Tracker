// # frontend/src/pages/jobs/JobDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJob, deleteJob, uploadJobPhoto, deleteJobPhoto } from '../../services/jobService';
import LocationMap from '../../components/map/LocationMap';
import { formatNZDate } from '../../utils/dateUtils';

// CSS for this component
const jobDetailsStyles = {
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
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    marginBottom: '2rem'
  },
  infoItem: {
    marginBottom: '1rem'
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#757575',
    marginBottom: '0.3rem'
  },
  infoValue: {
    fontSize: '1.1rem'
  },
  notes: {
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6'
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '2rem'
  },
  tagContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem'
  },
  tag: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '0.3rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.9rem'
  },
  mapContainer: {
    marginTop: '2rem'
  },
  photosSection: {
    marginBottom: '2rem'
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
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
  }
};

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        const jobData = await getJob(id);
        setJob(jobData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load job details');
        setLoading(false);
        console.error('Error loading job:', err);
      }
    };
    
    loadJob();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(id);
        navigate('/jobs');
      } catch (err) {
        console.error('Error deleting job:', err);
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
      
      const updatedPhoto = await uploadJobPhoto(id, formData);
      
      // Update job state with new photo
      setJob(prevJob => ({
        ...prevJob,
        photos: [...(prevJob.photos || []), updatedPhoto]
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
        await deleteJobPhoto(id, photoId);
        
        // Remove photo from state
        setJob(prevJob => ({
          ...prevJob,
          photos: prevJob.photos.filter(photo => photo._id !== photoId)
        }));
      } catch (err) {
        console.error('Error deleting photo:', err);
      }
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return <div className="loading">Loading job details...</div>;
  }
  
  if (error) {
    return <div className="error-container">{error}</div>;
  }
  
  if (!job) {
    return <div className="error-container">Job not found</div>;
  }
  
  return (
    <div style={jobDetailsStyles.container}>
      <Link to="/jobs" style={jobDetailsStyles.backLink}>
        &larr; Back to Jobs
      </Link>
      
      <div style={jobDetailsStyles.headerBar}>
        <h1 style={jobDetailsStyles.title}>{job.title}</h1>
        
        <div style={jobDetailsStyles.actions}>
          <Link to={`/jobs/edit/${id}`} className="btn-secondary">
            Edit Job
          </Link>
          <button onClick={handleDelete} className="btn-primary" style={{ backgroundColor: '#f44336' }}>
            Delete Job
          </button>
        </div>
      </div>
      
      <div style={jobDetailsStyles.grid}>
        <div style={jobDetailsStyles.card}>
          <h2>Job Details</h2>
          
          <div style={jobDetailsStyles.infoItem}>
            <div style={jobDetailsStyles.infoLabel}>Date</div>
            <div style={jobDetailsStyles.infoValue}>
              {formatNZDate(job.date)}
            </div>
          </div>
          
          <div style={jobDetailsStyles.infoItem}>
            <div style={jobDetailsStyles.infoLabel}>Time</div>
            <div style={jobDetailsStyles.infoValue}>
              {new Date(job.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
              {new Date(job.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          
          <div style={jobDetailsStyles.infoItem}>
            <div style={jobDetailsStyles.infoLabel}>Duration</div>
            <div style={jobDetailsStyles.infoValue}>
              {formatDuration(job.duration)}
            </div>
          </div>
          
          {job.tags && job.tags.length > 0 && (
            <div style={jobDetailsStyles.infoItem}>
              <div style={jobDetailsStyles.infoLabel}>Tags</div>
              <div style={jobDetailsStyles.tagContainer}>
                {job.tags.map((tag, index) => (
                  <span key={index} style={jobDetailsStyles.tag}>{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div style={jobDetailsStyles.card}>
          <h2>Organization & Location</h2>
          
          {job.organization && (
            <div style={jobDetailsStyles.infoItem}>
              <div style={jobDetailsStyles.infoLabel}>Organization</div>
              <div style={jobDetailsStyles.infoValue}>
                {job.organization.name}
              </div>
              {job.organization.description && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  {job.organization.description}
                </div>
              )}
            </div>
          )}
          
          <div style={jobDetailsStyles.infoItem}>
            <div style={jobDetailsStyles.infoLabel}>Location</div>
            <div style={jobDetailsStyles.infoValue}>
              {job.location.name}
            </div>
            {job.location.address && (
              <div style={{ fontSize: '0.9rem' }}>
                {job.location.address}
              </div>
            )}
          </div>
          
          <div>
            <Link to={`/locations/${job.location._id}`} className="btn-text">
              View Location Details
            </Link>
          </div>
        </div>
      </div>
      
      {/* Photos section */}
      <div style={jobDetailsStyles.photosSection}>
        <h2>Photos</h2>
        
        {job.photos && job.photos.length > 0 ? (
          <div style={jobDetailsStyles.photoGrid}>
            {job.photos.map(photo => (
              <div key={photo._id} style={jobDetailsStyles.photoCard}>
                <img src={photo.url} alt={photo.caption || 'Job'} style={jobDetailsStyles.photo} />
                
                {photo.caption && (
                  <div style={jobDetailsStyles.photoCaption}>{photo.caption}</div>
                )}
                
                <div style={jobDetailsStyles.photoActions}>
                  <button 
                    style={jobDetailsStyles.deletePhotoBtn}
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
          <div style={jobDetailsStyles.emptyMessage}>
            No photos available for this job.
          </div>
        )}
        
        {/* Photo upload form */}
        <div style={jobDetailsStyles.uploadSection}>
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
      
      {job.description && (
        <div style={jobDetailsStyles.card}>
          <h2>Description</h2>
          <p style={jobDetailsStyles.notes}>
            {job.description}
          </p>
        </div>
      )}
      
      {job.notes && (
        <div style={jobDetailsStyles.card}>
          <h2>Notes</h2>
          <p style={jobDetailsStyles.notes}>
            {job.notes}
          </p>
        </div>
      )}
      
      {job.location && job.location.coordinates && (
        <div style={jobDetailsStyles.mapContainer}>
          <h2>Location Map</h2>
          <LocationMap singleLocation={job.location} />
        </div>
      )}
    </div>
  );
};

export default JobDetails;