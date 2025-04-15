// # frontend/src/pages/jobs/JobsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchJobs, deleteJob } from '../../services/jobService';
import { fetchLocations } from '../../services/locationService';
import { formatNZDate } from '../../utils/dateUtils';
import ExportDialog from '../../components/jobs/ExportDialog';

// CSS for this component
const jobsListStyles = {
  container: {
    marginBottom: '2rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  filterContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  searchInput: {
    padding: '0.7rem',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    marginRight: '1rem',
    width: '400px'
  },
  filterSelect: {
    padding: '0.7rem',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    width: '300px',
    fontSize: '14px'
  },
  filterLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',  // Increased space between search and location dropdown
    flex: '1'       // Take more space on the left side
  },
  filterRight: {
    display: 'flex',
    alignItems: 'center',
    flex: '1'       // Take less space on the right side
  },
  jobsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem'
  },
  jobCard: {
    background: 'white',
    borderRadius: '4px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column'
  },
  jobTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#2e7d32'
  },
  jobMeta: {
    color: '#757575',
    fontSize: '0.9rem',
    marginBottom: '0.5rem'
  },
  jobDescription: {
    marginBottom: '1rem'
  },
  jobActions: {
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '1rem',
    borderTop: '1px solid #e0e0e0'
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
    padding: '0.2rem 0.5rem',
    borderRadius: '20px',
    fontSize: '0.8rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    background: 'white',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  filterLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  filterRight: {
    display: 'flex',
    alignItems: 'center',
  }
};

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  const [showExportDialog, setShowExportDialog] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load jobs and locations in parallel
        const [jobsData, locationsData] = await Promise.all([
          fetchJobs(),
          fetchLocations()
        ]);
        
        setJobs(jobsData);
        setLocations(locationsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load jobs');
        setLoading(false);
        console.error('Error loading jobs:', err);
      }
    };
    
    loadData();
  }, []);
  
  const handleDeleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(id);
        // Remove job from state
        setJobs(jobs.filter(job => job._id !== id));
      } catch (err) {
        console.error('Error deleting job:', err);
      }
    }
  };
  
  // Apply filters and sorting
  const filteredJobs = jobs
    .filter(job => {
      // Apply search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        job.title.toLowerCase().includes(searchLower) ||
        (job.description && job.description.toLowerCase().includes(searchLower)) ||
        (job.tags && job.tags.some(tag => tag.toLowerCase().includes(searchLower)));
      
      // Apply location filter
      const matchesLocation = locationFilter ? job.location._id === locationFilter : true;
      
      return matchesSearch && matchesLocation;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'duration-desc':
          return b.duration - a.duration;
        case 'duration-asc':
          return a.duration - b.duration;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'date-desc':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });
  
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  if (loading) {
    return <div className="loading">Loading jobs...</div>;
  }
  
  if (error) {
    return <div className="error-container">{error}</div>;
  }
  
  return (
    <div style={jobsListStyles.container}>
      <div style={jobsListStyles.header}>
        <h1>Jobs List</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setShowExportDialog(true)}
            className="btn-secondary"
            style={{ backgroundColor: '#4a148c' }}
          >
            Export Data
          </button>
          <Link to="/jobs/new" className="btn-primary">Add New Job</Link>
        </div>
      </div>
      
      {/* Add the export dialog component */}
      {showExportDialog && (
        <ExportDialog onClose={() => setShowExportDialog(false)} />
      )}
      
    {/* Filters and search */}
    <div style={jobsListStyles.filterContainer}>
        <div style={jobsListStyles.filterLeft}>
            <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={jobsListStyles.searchInput}
            />
            <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            style={jobsListStyles.filterSelect}
            >
            <option value="">All Locations</option>
            {locations.map(location => (
                <option key={location._id} value={location._id}>
                {location.name}
                </option>
            ))}
            </select>
        </div>

        <div style={jobsListStyles.filterRight}>
            <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={jobsListStyles.filterSelect}
            >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="duration-desc">Longest Duration</option>
            <option value="duration-asc">Shortest Duration</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            </select>
        </div>
    </div>

      
      {filteredJobs.length > 0 ? (
        <div style={jobsListStyles.jobsGrid}>
          {filteredJobs.map(job => (
            <div key={job._id} style={jobsListStyles.jobCard}>
              <div style={jobsListStyles.jobTitle}>{job.title}</div>
              
              <div style={jobsListStyles.jobMeta}>
                <div>
                  <strong>Date:</strong> {formatNZDate(job.date)}
                </div>
                <div>
                  <strong>Location:</strong> {job.location.name}
                </div>
                <div>
                  <strong>Duration:</strong> {formatDuration(job.duration)}
                </div>
              </div>
              
              {job.description && (
                <div style={jobsListStyles.jobDescription}>
                  {job.description.length > 150 
                    ? `${job.description.substring(0, 150)}...` 
                    : job.description}
                </div>
              )}
              
              {job.tags && job.tags.length > 0 && (
                <div style={jobsListStyles.tagContainer}>
                  {job.tags.map((tag, index) => (
                    <span key={index} style={jobsListStyles.tag}>{tag}</span>
                  ))}
                </div>
              )}
              
              <div style={jobsListStyles.jobActions}>
                <Link to={`/jobs/${job._id}`} className="btn-text">
                  View Details
                </Link>
                <div>
                  <Link to={`/jobs/${job._id}/edit`} className="btn-text" style={{ marginRight: '0.5rem' }}>
                    Edit
                  </Link>
                  <button 
                    className="btn-text" 
                    style={{ color: '#f44336' }}
                    onClick={() => handleDeleteJob(job._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={jobsListStyles.emptyState}>
          <h3>No jobs found</h3>
          <p>Try adjusting your search or filters, or add a new job.</p>
          <Link to="/jobs/new" className="btn-primary" style={{ marginTop: '1rem' }}>
            Add Your First Job
          </Link>
        </div>
      )}
    </div>
  );
};

export default JobsList;