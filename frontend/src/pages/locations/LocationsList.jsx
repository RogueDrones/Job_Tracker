// # frontend/src/pages/locations/LocationsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchLocations, deleteLocation } from '../../services/locationService';
import LocationMap from '../../components/map/LocationMap';

// CSS for this component
const locationsListStyles = {
  container: {
    maxWidth: '1200px', // New max-width for a wider layout
    margin: '0 auto 2rem auto' // Centered with bottom margin
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  searchContainer: {
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
    padding: '0.5rem',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    width: '300px'
  },
  mapContainer: {
    position: 'relative',
    height: '400px',
    marginBottom: '2rem', // adds extra spacing below
    zIndex: 0
  },
  locationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)', // Fixed 3 columns
    gap: '1.5rem',
    marginTop: '2rem' // Additional space between the map and the grid
  },
  locationCard: {
    background: 'white',
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column'
  },
  locationImage: {
    marginTop: '2rem',
    height: '160px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative'
  },
  locationImagePlaceholder: {
    height: '160px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    color: '#757575',
    fontSize: '0.9rem'
  },
  locationContent: {
    padding: '1.5rem'
  },
  locationTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#2e7d32'
  },
  locationAddress: {
    color: '#757575',
    fontSize: '0.9rem',
    marginBottom: '1rem'
  },
  locationActions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e0e0e0',
    marginTop: 'auto'
  },
  photoCount: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    background: 'white',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  }
};

const LocationsList = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true);
        const data = await fetchLocations();
        setLocations(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load locations');
        setLoading(false);
        console.error('Error loading locations:', err);
      }
    };
    
    loadLocations();
  }, []);
  
  const handleDeleteLocation = async (id) => {
    if (window.confirm('Are you sure you want to delete this location? All associated job data will remain but will no longer be linked to this location.')) {
      try {
        await deleteLocation(id);
        // Remove location from state
        setLocations(locations.filter(location => location._id !== id));
      } catch (err) {
        console.error('Error deleting location:', err);
      }
    }
  };
  
  // Filter locations based on search term
  const filteredLocations = locations.filter(location => {
    const searchLower = searchTerm.toLowerCase();
    return (
      location.name.toLowerCase().includes(searchLower) ||
      (location.address && location.address.toLowerCase().includes(searchLower)) ||
      (location.notes && location.notes.toLowerCase().includes(searchLower))
    );
  });
  
  if (loading) {
    return <div className="loading">Loading locations...</div>;
  }
  
  if (error) {
    return <div className="error-container">{error}</div>;
  }
  
  return (
    <div style={locationsListStyles.container}>
      <div style={locationsListStyles.header}>
        <h1>Locations</h1>
        <Link to="/locations/new" className="btn-primary">Add New Location</Link>
      </div>
      
      {/* Search bar */}
      <div style={locationsListStyles.searchContainer}>
        <input
          type="text"
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={locationsListStyles.searchInput}
        />
      </div>
      
      {/* Map view of all locations */}
      <div style={locationsListStyles.mapContainer}>
        <LocationMap />
      </div>
      
      {/* Locations grid */}
      {filteredLocations.length > 0 ? (
        <div style={locationsListStyles.locationsGrid}>
          {filteredLocations.map(location => (
            <div key={location._id} style={locationsListStyles.locationCard}>
              {/* Location image */}
              {location.photos && location.photos.length > 0 ? (
                <div 
                  style={{
                    ...locationsListStyles.locationImage,
                    backgroundImage: `url(${location.photos[0].url})`
                  }}
                >
                  {location.photos.length > 1 && (
                    <div style={locationsListStyles.photoCount}>
                      +{location.photos.length - 1} more
                    </div>
                  )}
                </div>
              ) : (
                <div style={locationsListStyles.locationImagePlaceholder}>
                  No photos available
                </div>
              )}
              
              {/* Location details */}
              <div style={locationsListStyles.locationContent}>
                <h3 style={locationsListStyles.locationTitle}>{location.name}</h3>
                
                {location.address && (
                  <p style={locationsListStyles.locationAddress}>{location.address}</p>
                )}
                
                {location.notes && (
                  <p>
                    {location.notes.length > 100 
                      ? `${location.notes.substring(0, 100)}...` 
                      : location.notes}
                  </p>
                )}
              </div>
              
              {/* Actions */}
              <div style={locationsListStyles.locationActions}>
                <Link to={`/locations/${location._id}`} className="btn-text">
                  View Details
                </Link>
                <div>
                  <Link to={`/locations/${location._id}/edit`} className="btn-text" style={{ marginRight: '0.5rem' }}>
                    Edit
                  </Link>
                  <button 
                    className="btn-text" 
                    style={{ color: '#f44336' }}
                    onClick={() => handleDeleteLocation(location._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={locationsListStyles.emptyState}>
          <h3>No locations found</h3>
          <p>Try adjusting your search, or add a new location.</p>
          <Link to="/locations/new" className="btn-primary" style={{ marginTop: '1rem' }}>
            Add Your First Location
          </Link>
        </div>
      )}
    </div>
  );
};

export default LocationsList;