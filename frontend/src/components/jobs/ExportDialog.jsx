// # frontend/src/components/jobs/ExportDialog.jsx
import React, { useState, useEffect } from 'react';
import { fetchLocations } from '../../services/locationService';
import { exportJobsData } from '../../services/jobService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// CSS for this component
const exportDialogStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    width: '500px',
    maxWidth: '90%',
    maxHeight: '90%',
    overflow: 'auto',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2e7d32',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#666'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  dateContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px'
  }
};

const ExportDialog = ({ onClose }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [locationId, setLocationId] = useState('');
  const [tags, setTags] = useState('');
  
  // Load locations when component mounts
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locationData = await fetchLocations();
        setLocations(locationData);
      } catch (error) {
        console.error('Error loading locations for export:', error);
      }
    };
    
    loadLocations();
  }, []);
  
  const handleExport = async () => {
    try {
      setLoading(true);
      
      // Format dates to YYYY-MM-DD
      const formatDate = (date) => {
        if (!date) return null;
        return date.toISOString().split('T')[0];
      };
      
      // Prepare filter parameters
      const filters = {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        locationId: locationId || undefined,
        tags: tags || undefined
      };
      
      // Call export service
      await exportJobsData(filters);
      
      // Close dialog after successful export
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      setLoading(false);
    }
  };
  
  return (
    <div style={exportDialogStyles.overlay} onClick={onClose}>
      <div style={exportDialogStyles.dialog} onClick={(e) => e.stopPropagation()}>
        <div style={exportDialogStyles.header}>
          <h2 style={exportDialogStyles.title}>Export Job Data</h2>
          <button style={exportDialogStyles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div style={exportDialogStyles.formGroup}>
          <label style={exportDialogStyles.label}>Date Range</label>
          <div style={exportDialogStyles.dateContainer}>
            <div>
              <label style={{ fontSize: '14px' }}>Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="Select start date"
                className="date-picker"
                maxDate={new Date()}
              />
            </div>
            <div>
              <label style={{ fontSize: '14px' }}>End Date</label>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="Select end date"
                className="date-picker"
                maxDate={new Date()}
                minDate={startDate}
              />
            </div>
          </div>
        </div>
        
        <div style={exportDialogStyles.formGroup}>
          <label style={exportDialogStyles.label}>Location (Optional)</label>
          <select
            style={exportDialogStyles.input}
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location._id} value={location._id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        
        <div style={exportDialogStyles.formGroup}>
          <label style={exportDialogStyles.label}>Tags (Optional, comma-separated)</label>
          <input
            type="text"
            style={exportDialogStyles.input}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. gardening, planting, cleanup"
          />
        </div>
        
        <div style={exportDialogStyles.actions}>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Exporting...' : 'Export Excel File'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;