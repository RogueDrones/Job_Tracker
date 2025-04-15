
// # frontend/src/components/dashboard/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchJobStatistics } from '../../services/jobService';
import { fetchLocations } from '../../services/locationService';
import LocationMap from '../map/LocationMap';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';
import { formatNZDate } from '../../utils/dateUtils';
import ExportDialog from '../jobs/ExportDialog';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Use a callback to fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch job statistics and locations in parallel
      const [statsData, locationsData] = await Promise.all([
        fetchJobStatistics(),
        fetchLocations()
      ]);
      
      setStats(statsData);
      setLocations(locationsData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data: ' + (err.message || 'Unknown error'));
      setLoading(false);
      console.error('Error fetching dashboard data:', err);
    }
  }, []);

  // Fetch data on initial load and when navigating back to dashboard
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, location.pathname]);

  useEffect(() => {
    if (stats) {
      console.log('Dashboard stats received:', stats);
      console.log('Unique days value:', stats.uniqueDays);
    }
  }, [stats]);

  // Add a refresh button function
  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  // Format data for charts
  const formatLocationData = () => {
    if (!stats || !stats.hoursByLocation || stats.hoursByLocation.length === 0) return [];
    
    return stats.hoursByLocation.map(item => ({
      name: locations.find(loc => loc._id === item.locationId)?.name || 'Unknown',
      hours: parseFloat(item.hours.toFixed(1))
    }));
  };

  const formatTagData = () => {
    if (!stats || !stats.hoursByTag || stats.hoursByTag.length === 0) return [];
    
    return stats.hoursByTag.map(item => ({
      name: item.tag || 'Untagged',
      hours: parseFloat(item.hours.toFixed(1))
    }));
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Job Tracker Dashboard</h1>
        <div className="dashboard-actions">
          <button 
            onClick={handleRefresh} 
            className="btn-secondary" 
            style={{ 
              backgroundColor: '#2196f3',
              minWidth: '150px',
              height: '55px',
              margin: '0 8px'
            }}
          >
            Refresh Data
          </button>
          <button 
            onClick={() => setShowExportDialog(true)} 
            className="btn-secondary"
            style={{ 
              backgroundColor: '#4a148c', 
              minWidth: '150px',
              height: '55px',
              margin: '0 8px'
            }}
          >
            Export Data
          </button>
          <Link 
            to="/jobs/new" 
            className="btn-primary" 
            style={{ 
              backgroundColor: '#4caf50', 
              minWidth: '150px',
              height: '55px',
              margin: '0 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Add New Job
          </Link>
          <Link 
            to="/locations/new" 
            className="btn-secondary" 
            style={{ 
              backgroundColor: '#2196f3', 
              minWidth: '150px',
              height: '55px',
              margin: '0 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Add New Location
          </Link>
          <Link 
            to="/organizations/new" 
            className="btn-secondary" 
            style={{ 
              backgroundColor: '#fb8c00', 
              minWidth: '150px',
              height: '55px',
              margin: '0 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Add New Organization
          </Link>
        </div>
      </div>

      {showExportDialog && (
        <ExportDialog onClose={() => setShowExportDialog(false)} />
      )}
      
      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Total Hours</h3>
          <div className="summary-value">{stats && typeof stats.totalHours === 'number' ? stats.totalHours.toFixed(1) : "0.0"}</div>
          <span>hours tracked</span>
        </div>
        <div className="summary-card">
          <h3>Total Jobs</h3>
          <div className="summary-value">{stats?.totalJobs || 0}</div>
          <span>separate tasks</span>
        </div>
        <div className="summary-card">
          <h3>Locations</h3>
          <div className="summary-value">{locations.length}</div>
          <span>different places</span>
        </div>
        <div className="summary-card">
          <h3>Number of Days</h3>
          <div className="summary-value">
            {stats && typeof stats.uniqueDays === 'number' ? stats.uniqueDays : "0"}
          </div>
          <span>days volunteered</span>
        </div>
      </div>
      
      <div className="chart-container">
        <h3>Hours by Location</h3>
        {formatLocationData().length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formatLocationData()}
                dataKey="hours"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {formatLocationData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} hours`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data-message">No location data available yet</div>
        )}
      </div>
      
      <div className="chart-container">
        <h3>Hours by Activity Type</h3>
        {formatTagData().length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formatTagData()}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} hours`} />
              <Legend />
              <Bar dataKey="hours" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data-message">No activity data available yet</div>
        )}
      </div>
      
      <div className="dashboard-map">
        <h3>Job Locations</h3>
        <LocationMap />
      </div>
      
      <div className="dashboard-recent">
        <h3>Recent Jobs</h3>
        {stats?.recentJobs && stats.recentJobs.length > 0 ? (
          <div className="recent-jobs-list">
            {stats.recentJobs.map(job => (
              <div key={job._id} className="recent-job-card">
                <h4>{job.title}</h4>
                <p className="job-date">
                  {formatNZDate(job.date)}
                </p>
                <p className="job-location">
                  {job.location?.name || 'Unknown location'}
                </p>
                <p className="job-duration">{job.duration} minutes</p>
                <Link to={`/jobs/${job._id}`} className="btn-text">View Details</Link>
              </div>
            ))}
          </div>
        ) : (
          <p>No recent jobs to display.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
