// # frontend/src/pages/jobs/JobDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJob, deleteJob } from '../../services/jobService';
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
  }
};

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
  
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  const formatDateTime = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
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
          <Link to={`/jobs/${id}/edit`} className="btn-secondary">
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
          <h2>Location Information</h2>
          
          <div style={jobDetailsStyles.infoItem}>
            <div style={jobDetailsStyles.infoLabel}>Location Name</div>
            <div style={jobDetailsStyles.infoValue}>
              {job.location.name}
            </div>
          </div>
          
          {job.location.address && (
            <div style={jobDetailsStyles.infoItem}>
              <div style={jobDetailsStyles.infoLabel}>Address</div>
              <div style={jobDetailsStyles.infoValue}>
                {job.location.address}
              </div>
            </div>
          )}
          
          <div>
            <Link to={`/locations/${job.location._id}`} className="btn-text">
              View Location Details
            </Link>
          </div>
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