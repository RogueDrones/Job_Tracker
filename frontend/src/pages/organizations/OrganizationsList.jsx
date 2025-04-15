// # frontend/src/pages/organizations/OrganizationsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrganizations, deleteOrganization } from '../../services/organizationService';

// CSS for this component
const organizationsListStyles = {
  container: {
    marginBottom: '2rem'
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
    padding: '0.7rem',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    width: '300px'
  },
  organizationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem'
  },
  organizationCard: {
    background: 'white',
    borderRadius: '4px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  organizationTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#2e7d32'
  },
  organizationDescription: {
    marginBottom: '1rem',
    flex: '1'
  },
  organizationContact: {
    fontSize: '0.9rem',
    color: '#757575',
    marginBottom: '1rem'
  },
  organizationActions: {
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '1rem',
    borderTop: '1px solid #e0e0e0'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    background: 'white',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  }
};

const OrganizationsList = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoading(true);
        const data = await getOrganizations();
        setOrganizations(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load organizations');
        setLoading(false);
        console.error('Error loading organizations:', err);
      }
    };
    
    loadOrganizations();
  }, []);
  
  const handleDeleteOrganization = async (id) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        await deleteOrganization(id);
        // Remove organization from state
        setOrganizations(organizations.filter(org => org._id !== id));
      } catch (err) {
        console.error('Error deleting organization:', err);
      }
    }
  };
  
  // Filter organizations based on search term
  const filteredOrganizations = organizations.filter(organization => {
    const searchLower = searchTerm.toLowerCase();
    return (
      organization.name.toLowerCase().includes(searchLower) ||
      (organization.description && organization.description.toLowerCase().includes(searchLower)) ||
      (organization.contact && organization.contact.name && organization.contact.name.toLowerCase().includes(searchLower))
    );
  });
  
  if (loading) {
    return <div className="loading">Loading organizations...</div>;
  }
  
  if (error) {
    return <div className="error-container">{error}</div>;
  }
  
  return (
    <div style={organizationsListStyles.container}>
      <div style={organizationsListStyles.header}>
        <h1>Organizations</h1>
        <Link to="/organizations/new" className="btn-primary">Add New Organization</Link>
      </div>
      
      {/* Search bar */}
      <div style={organizationsListStyles.searchContainer}>
        <input
          type="text"
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={organizationsListStyles.searchInput}
        />
      </div>
      
      {/* Organizations grid */}
      {filteredOrganizations.length > 0 ? (
        <div style={organizationsListStyles.organizationsGrid}>
          {filteredOrganizations.map(organization => (
            <div key={organization._id} style={organizationsListStyles.organizationCard}>
              <h3 style={organizationsListStyles.organizationTitle}>{organization.name}</h3>
              
              {organization.description && (
                <p style={organizationsListStyles.organizationDescription}>
                  {organization.description.length > 150 
                    ? `${organization.description.substring(0, 150)}...` 
                    : organization.description}
                </p>
              )}
              
              {organization.contact && (
                <div style={organizationsListStyles.organizationContact}>
                  {organization.contact.name && <div><strong>Contact:</strong> {organization.contact.name}</div>}
                  {organization.contact.email && <div><strong>Email:</strong> {organization.contact.email}</div>}
                  {organization.contact.phone && <div><strong>Phone:</strong> {organization.contact.phone}</div>}
                </div>
              )}
              
              <div style={organizationsListStyles.organizationActions}>
                <div>
                  <Link to={`/organizations/edit/${organization._id}`} className="btn-text" style={{ marginRight: '0.5rem' }}>
                    Edit
                  </Link>
                  <button 
                    className="btn-text" 
                    style={{ color: '#f44336' }}
                    onClick={() => handleDeleteOrganization(organization._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={organizationsListStyles.emptyState}>
          <h3>No organizations found</h3>
          <p>Try adjusting your search, or add a new organization.</p>
          <Link to="/organizations/new" className="btn-primary" style={{ marginTop: '1rem' }}>
            Add Your First Organization
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrganizationsList;