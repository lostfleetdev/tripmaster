import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Box, Typography, Chip } from '@mui/material';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

/**
 * Map view component for displaying destinations
 * @param {Object} props
 * @param {Destination[]} props.destinations
 * @param {string} [props.height='400px']
 */
const MapView = ({ destinations, height = '400px' }) => {
  // Filter out destinations with invalid coordinates
  const validDestinations = destinations.filter(dest => 
    !isNaN(dest.latitude) && !isNaN(dest.longitude) && 
    dest.latitude !== 0 && dest.longitude !== 0
  );

  // Calculate center point from destinations
  const getMapCenter = () => {
    if (validDestinations.length === 0) {
      return [48.8566, 2.3522]; // Default to Paris
    }

    const totalLat = validDestinations.reduce((sum, dest) => sum + dest.latitude, 0);
    const totalLng = validDestinations.reduce((sum, dest) => sum + dest.longitude, 0);
    
    return [
      totalLat / validDestinations.length,
      totalLng / validDestinations.length
    ];
  };

  // Calculate zoom level based on destinations spread
  const getMapZoom = () => {
    if (validDestinations.length <= 1) return 10;

    const lats = validDestinations.map(d => d.latitude);
    const lngs = validDestinations.map(d => d.longitude);
    
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    
    const maxRange = Math.max(latRange, lngRange);
    
    if (maxRange > 50) return 3;
    if (maxRange > 20) return 4;
    if (maxRange > 10) return 5;
    if (maxRange > 5) return 6;
    if (maxRange > 2) return 7;
    if (maxRange > 1) return 8;
    return 9;
  };

  // Create polyline connecting destinations in sequence order
  const getRoutePolyline = () => {
    return validDestinations
      .sort((a, b) => a.sequence - b.sequence)
      .map(dest => [dest.latitude, dest.longitude]);
  };

  // Create custom icon for numbered markers
  const createNumberedIcon = (number) => {
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="#3388ff"/>
          <circle cx="12.5" cy="12.5" r="8" fill="white"/>
          <text x="12.5" y="17" text-anchor="middle" font-size="10" font-weight="bold" fill="#3388ff">${number}</text>
        </svg>
      `)}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  };

  if (validDestinations.length === 0) {
    return (
      <Box 
        sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: 1
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No destinations to display on map
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height, border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
      <MapContainer
        center={getMapCenter()}
        zoom={getMapZoom()}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Route polyline */}
        {validDestinations.length > 1 && (
          <Polyline
            positions={getRoutePolyline()}
            color="#3388ff"
            weight={3}
            opacity={0.7}
            dashArray="5, 10"
          />
        )}

        {/* Destination markers */}
        {validDestinations.map((destination) => (
          <Marker
            key={destination.id}
            position={[destination.latitude, destination.longitude]}
            icon={createNumberedIcon(destination.sequence)}
          >
            <Popup>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="h6" gutterBottom>
                  {destination.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  📍 {destination.location}
                </Typography>
                <Chip 
                  label={`Stop ${destination.sequence}`}
                  size="small"
                  color="primary"
                  sx={{ mt: 1 }}
                />
                {destination.hotels.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" display="block" gutterBottom>
                      Hotels ({destination.hotels.length}):
                    </Typography>
                    {destination.hotels.slice(0, 3).map(hotel => (
                      <Typography key={hotel.id} variant="caption" display="block">
                        🏨 {hotel.name}
                      </Typography>
                    ))}
                    {destination.hotels.length > 3 && (
                      <Typography variant="caption" display="block">
                        + {destination.hotels.length - 3} more...
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default MapView;