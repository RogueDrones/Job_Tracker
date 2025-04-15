// # frontend/src/components/map/LocationMap.jsx
import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { fetchLocations } from '../../services/locationService';
import './LocationMap.css';

// Set your Mapbox token in .env file
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const LocationMap = ({ singleLocation = null }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [locations, setLocations] = useState(singleLocation ? [singleLocation] : []);
  const [loading, setLoading] = useState(!singleLocation);
  const [error, setError] = useState(null);
  const [viewport, setViewport] = useState({
    lng: 170.5036, // Default coordinates for Dunedin, NZ
    lat: -45.8788,
    zoom: 11
  });

  // Load locations data if not provided as prop
  useEffect(() => {
    const getLocations = async () => {
      if (singleLocation) return; // Skip if single location is provided
      
      try {
        setLoading(true);
        const data = await fetchLocations();
        console.log('Fetched locations:', data.length);
        setLocations(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load location data');
        setLoading(false);
        console.error('Error fetching locations:', err);
      }
    };

    getLocations();
  }, [singleLocation]);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Skip if map already initialized
    
    if (mapContainer.current) {
      console.log('Initializing map...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [viewport.lng, viewport.lat],
        zoom: viewport.zoom
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Update viewport on map move
      map.current.on('move', () => {
        setViewport({
          lng: parseFloat(map.current.getCenter().lng.toFixed(4)),
          lat: parseFloat(map.current.getCenter().lat.toFixed(4)),
          zoom: parseFloat(map.current.getZoom().toFixed(2))
        });
      });
      
      // Wait for map to load fully before adding markers
      map.current.on('load', () => {
        console.log('Map loaded, ready to add markers');
      });
    }
  }, [viewport.lng, viewport.lat, viewport.zoom]);

  // Add location markers when locations data loads and fit map to them
  useEffect(() => {
    if (!map.current || loading || locations.length === 0) return;

    console.log('Adding markers for', locations.length, 'locations');
    
    // Wait for map to be loaded before adding markers
    const addMarkersWhenReady = () => {
      if (!map.current.loaded()) {
        console.log('Map not loaded yet, waiting...');
        setTimeout(addMarkersWhenReady, 100);
        return;
      }
      
      // Remove existing markers
      const existingMarkers = document.getElementsByClassName('location-marker');
      while (existingMarkers[0]) {
        existingMarkers[0].parentNode.removeChild(existingMarkers[0]);
      }

      // Create a bounds object to fit the map to all markers
      const bounds = new mapboxgl.LngLatBounds();
      let markersAdded = 0;

      // Add markers for each location
      locations.forEach(location => {
        if (!location.coordinates || !location.coordinates.coordinates) {
          console.log('Location missing coordinates:', location.name);
          return;
        }
        
        // GeoJSON format in MongoDB stores as [longitude, latitude]
        // We need to ensure we're using them correctly
        const [lng, lat] = location.coordinates.coordinates;
        
        // Debug log to verify coordinates
        console.log(`Adding marker for location "${location.name}" at coordinates:`, { lng, lat });
        
        // Skip if invalid coordinates
        if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
          console.log('Invalid coordinates for location:', location.name);
          return;
        }
        
        // Validate coordinates are within reasonable bounds
        if (Math.abs(lng) > 180 || Math.abs(lat) > 90) {
          console.log('Out of range coordinates for location:', location.name, lng, lat);
          return;
        }
        
        // Add location to bounds
        bounds.extend([lng, lat]);
        markersAdded++;

        // Create marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'location-marker';
        
        // Create popup with location info
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <h3>${location.name}</h3>
            <p>${location.address || ''}</p>
            ${location.photos && location.photos.length > 0 
              ? `<img src="${location.photos[0].url}" alt="${location.name}" style="width:100%;max-width:200px;" />` 
              : ''}
            <p><a href="/locations/${location._id}">View Details</a></p>
          `);

        // Add marker to map - make sure to use [lng, lat] order for Mapbox
        new mapboxgl.Marker(markerEl)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map.current);
      });

      // Fit map to markers if any were added
      if (markersAdded > 0) {
        console.log('Fitting map to', markersAdded, 'markers');
        if (!bounds.isEmpty()) {
          try {
            // Add padding and fit bounds
            map.current.fitBounds(bounds, {
              padding: { top: 50, bottom: 50, left: 50, right: 50 },
              maxZoom: 15
            });
          } catch (err) {
            console.error('Error fitting bounds:', err);
          }
        } else {
          console.log('No valid bounds to fit');
        }
      } else {
        console.log('No markers added to fit');
      }
    };

    // Start the marker adding process
    addMarkersWhenReady();
  }, [locations, loading]);

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="map-container">
      <div className="map-info">
        <h3>Your Task Force Green Locations</h3>
        <p>
          Longitude: {viewport.lng} | Latitude: {viewport.lat} | Zoom: {viewport.zoom}
        </p>
      </div>
      <div ref={mapContainer} className="map" />
      {loading && <div className="loading-overlay">Loading map data...</div>}
    </div>
  );
};

export default LocationMap;