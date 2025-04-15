// # frontend/src/components/jobs/JobForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchLocations } from '../../services/locationService';
import { createJob, updateJob, getJob } from '../../services/jobService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './JobForm.css';

const JobForm = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // Default 1 hour
    location: '',
    tags: '',
    notes: ''
  });
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch locations and job data if editing
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load locations
        const locationData = await fetchLocations();
        setLocations(locationData);
        
        // If editing, load job data
        if (isEditing && id) {
          const jobData = await getJob(id);
          
          // Convert string dates to Date objects
          const job = {
            ...jobData,
            date: new Date(jobData.date),
            startTime: new Date(jobData.startTime),
            endTime: new Date(jobData.endTime),
            tags: jobData.tags ? jobData.tags.join(', ') : ''
          };
          
          setFormData(job);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
        console.error('Error loading form data:', err);
      }
    };

    loadData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Format data for API
      const jobData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      if (isEditing) {
        await updateJob(id, jobData);
      } else {
        await createJob(jobData);
      }
      
      navigate('/jobs');
    } catch (err) {
      setError('Failed to save job');
      setLoading(false);
      console.error('Error saving job:', err);
    }
  };

  if (loading && isEditing) {
    return <div className="loading">Loading job data...</div>;
  }

  return (
    <div className="job-form-container">
      <h2>{isEditing ? 'Edit Job' : 'Add New Job'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
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
            <DatePicker
              selected={formData.date}
              onChange={(date) => handleDateChange(date, 'date')}
              dateFormat="MMMM d, yyyy"
              className="date-picker"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="startTime">Start Time</label>
            <DatePicker
              selected={formData.startTime}
              onChange={(date) => handleDateChange(date, 'startTime')}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="h:mm aa"
              className="time-picker"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endTime">End Time</label>
            <DatePicker
              selected={formData.endTime}
              onChange={(date) => handleDateChange(date, 'endTime')}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="h:mm aa"
              className="time-picker"
            />
          </div>
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
          <label htmlFor="tags">Tags (comma separated)</label>
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
        
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/jobs')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Job' : 'Create Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;