import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Hotel as HotelIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon,
  Flight as FlightIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { tripService } from '../services/TripService.js';
import MapView from './MapView.jsx';

/**
 * Tab panel component for trip details
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {number} props.index
 * @param {number} props.value
 */
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trip-tabpanel-${index}`}
      aria-labelledby={`trip-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * Trip detail component
 * @param {Object} props
 * @param {Trip | null} props.trip
 * @param {function} props.onTripUpdate
 */
const TripDetail = ({ trip, onTripUpdate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [addDestinationOpen, setAddDestinationOpen] = useState(false);
  const [editDestinationOpen, setEditDestinationOpen] = useState(false);
  const [deleteDestinationOpen, setDeleteDestinationOpen] = useState(false);
  const [addHotelOpen, setAddHotelOpen] = useState(false);
  const [editHotelOpen, setEditHotelOpen] = useState(false);
  const [deleteHotelOpen, setDeleteHotelOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [destinationForm, setDestinationForm] = useState({
    name: '',
    location: '',
    latitude: 0,
    longitude: 0
  });
  const [hotelForm, setHotelForm] = useState({
    name: '',
    address: ''
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!trip) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <FlightIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No trip selected
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please select a trip from the "My Trips" tab to view details.
        </Typography>
      </Box>
    );
  }

  const handleAddDestination = async () => {
    if (!trip || !destinationForm.name || !destinationForm.location) return;
    
    setLoading(true);
    try {
      await tripService.addDestination(trip.id, destinationForm);
      setAddDestinationOpen(false);
      setDestinationForm({ name: '', location: '', latitude: 0, longitude: 0 });
      onTripUpdate();
    } catch (error) {
      console.error('Error adding destination:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDestination = async () => {
    if (!trip || !selectedDestination || !destinationForm.name || !destinationForm.location) return;
    
    setLoading(true);
    try {
      await tripService.updateDestination(trip.id, selectedDestination.id, destinationForm);
      setEditDestinationOpen(false);
      setSelectedDestination(null);
      onTripUpdate();
    } catch (error) {
      console.error('Error updating destination:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDestination = async () => {
    if (!trip || !selectedDestination) return;
    
    setLoading(true);
    try {
      await tripService.deleteDestination(trip.id, selectedDestination.id);
      setDeleteDestinationOpen(false);
      setSelectedDestination(null);
      onTripUpdate();
    } catch (error) {
      console.error('Error deleting destination:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHotel = async () => {
    if (!trip || !selectedDestination || !hotelForm.name || !hotelForm.address) return;
    
    setLoading(true);
    try {
      await tripService.addHotel(trip.id, selectedDestination.id, hotelForm);
      setAddHotelOpen(false);
      setHotelForm({ name: '', address: '' });
      onTripUpdate();
    } catch (error) {
      console.error('Error adding hotel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditHotel = async () => {
    if (!trip || !selectedDestination || !selectedHotel || !hotelForm.name || !hotelForm.address) return;
    
    setLoading(true);
    try {
      await tripService.updateHotel(trip.id, selectedDestination.id, selectedHotel.id, hotelForm);
      setEditHotelOpen(false);
      setSelectedHotel(null);
      onTripUpdate();
    } catch (error) {
      console.error('Error updating hotel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHotel = async () => {
    if (!trip || !selectedDestination || !selectedHotel) return;
    
    setLoading(true);
    try {
      await tripService.deleteHotel(trip.id, selectedDestination.id, selectedHotel.id);
      setDeleteHotelOpen(false);
      setSelectedHotel(null);
      onTripUpdate();
    } catch (error) {
      console.error('Error deleting hotel:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditDestination = (destination) => {
    setSelectedDestination(destination);
    setDestinationForm({
      name: destination.name,
      location: destination.location,
      latitude: destination.latitude,
      longitude: destination.longitude
    });
    setEditDestinationOpen(true);
  };

  const openDeleteDestination = (destination) => {
    setSelectedDestination(destination);
    setDeleteDestinationOpen(true);
  };

  const openAddHotel = (destination) => {
    setSelectedDestination(destination);
    setHotelForm({ name: '', address: '' });
    setAddHotelOpen(true);
  };

  const openEditHotel = (destination, hotel) => {
    setSelectedDestination(destination);
    setSelectedHotel(hotel);
    setHotelForm({
      name: hotel.name,
      address: hotel.address
    });
    setEditHotelOpen(true);
  };

  const openDeleteHotel = (destination, hotel) => {
    setSelectedDestination(destination);
    setSelectedHotel(hotel);
    setDeleteHotelOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planned': return 'info';
      case 'in-progress': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Box>
      {/* Trip Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h4" component="h1">
              {trip.name}
            </Typography>
            <Chip 
              label={trip.status} 
              color={getStatusColor(trip.status)}
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Duration: {calculateDuration(trip.startDate, trip.endDate)} days
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body1">
              {trip.destinations?.length || 0} destination{(trip.destinations?.length || 0) !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="trip detail tabs">
            <Tab icon={<LocationIcon />} label="Destinations" />
            <Tab icon={<MapIcon />} label="Map View" />
          </Tabs>
        </Box>

        {/* Destinations Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Destinations</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setAddDestinationOpen(true)}
              >
                Add Destination
              </Button>
            </Box>

            {trip.destinations?.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                No destinations added yet. Add your first destination to start planning your trip.
              </Alert>
            ) : (
              <Box sx={{ mb: 3 }}>
                {trip.destinations?.map((destination, index) => (
                  <Accordion key={destination.id} sx={{ mb: 1 }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`destination-${index}-content`}
                      id={`destination-${index}-header`}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <Chip 
                          label={destination.sequence}
                          color="primary"
                          size="small"
                          sx={{ mr: 2, minWidth: 30 }}
                        />
                        <Box>
                          <Typography variant="h6">{destination.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            📍 {destination.location}
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1">Hotels</Typography>
                          <Box>
                            <Button 
                              size="small" 
                              startIcon={<HotelIcon />}
                              onClick={() => openAddHotel(destination)}
                              sx={{ mr: 1 }}
                            >
                              Add Hotel
                            </Button>
                            <IconButton 
                              size="small"
                              onClick={() => openEditDestination(destination)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              size="small"
                              color="error"
                              onClick={() => openDeleteDestination(destination)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>

                        {destination.hotels?.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No hotels added yet.
                          </Typography>
                        ) : (
                          <List dense>
                            {destination.hotels?.map((hotel) => (
                              <ListItem key={hotel.id}>
                                <ListItemText
                                  primary={hotel.name}
                                  secondary={hotel.address}
                                />
                                <ListItemSecondaryAction>
                                  <IconButton 
                                    size="small"
                                    onClick={() => openEditHotel(destination, hotel)}
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton 
                                    size="small"
                                    color="error"
                                    onClick={() => openDeleteHotel(destination, hotel)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Map Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Trip Route</Typography>
            <MapView destinations={trip.destinations || []} height="500px" />
          </Box>
        </TabPanel>
      </Card>

      {/* Add Destination Dialog */}
      <Dialog open={addDestinationOpen} onClose={() => setAddDestinationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Destination</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Destination Name"
              value={destinationForm.name}
              onChange={(e) => setDestinationForm({ ...destinationForm, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Location"
              value={destinationForm.location}
              onChange={(e) => setDestinationForm({ ...destinationForm, location: e.target.value })}
              fullWidth
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Latitude"
                type="number"
                value={destinationForm.latitude}
                onChange={(e) => setDestinationForm({ ...destinationForm, latitude: parseFloat(e.target.value) || 0 })}
                fullWidth
                inputProps={{ step: "any" }}
              />
              <TextField
                label="Longitude"
                type="number"
                value={destinationForm.longitude}
                onChange={(e) => setDestinationForm({ ...destinationForm, longitude: parseFloat(e.target.value) || 0 })}
                fullWidth
                inputProps={{ step: "any" }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDestinationOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddDestination} 
            variant="contained"
            disabled={loading || !destinationForm.name || !destinationForm.location}
          >
            {loading ? 'Adding...' : 'Add Destination'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Destination Dialog */}
      <Dialog open={editDestinationOpen} onClose={() => setEditDestinationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Destination</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Destination Name"
              value={destinationForm.name}
              onChange={(e) => setDestinationForm({ ...destinationForm, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Location"
              value={destinationForm.location}
              onChange={(e) => setDestinationForm({ ...destinationForm, location: e.target.value })}
              fullWidth
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Latitude"
                type="number"
                value={destinationForm.latitude}
                onChange={(e) => setDestinationForm({ ...destinationForm, latitude: parseFloat(e.target.value) || 0 })}
                fullWidth
                inputProps={{ step: "any" }}
              />
              <TextField
                label="Longitude"
                type="number"
                value={destinationForm.longitude}
                onChange={(e) => setDestinationForm({ ...destinationForm, longitude: parseFloat(e.target.value) || 0 })}
                fullWidth
                inputProps={{ step: "any" }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDestinationOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleEditDestination} 
            variant="contained"
            disabled={loading || !destinationForm.name || !destinationForm.location}
          >
            {loading ? 'Updating...' : 'Update Destination'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Destination Dialog */}
      <Dialog open={deleteDestinationOpen} onClose={() => setDeleteDestinationOpen(false)}>
        <DialogTitle>Delete Destination</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedDestination?.name}"? This will also delete all associated hotels.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDestinationOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteDestination} 
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Hotel Dialog */}
      <Dialog open={addHotelOpen} onClose={() => setAddHotelOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Hotel</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Hotel Name"
              value={hotelForm.name}
              onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Address"
              value={hotelForm.address}
              onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
              fullWidth
              required
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddHotelOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddHotel} 
            variant="contained"
            disabled={loading || !hotelForm.name || !hotelForm.address}
          >
            {loading ? 'Adding...' : 'Add Hotel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Hotel Dialog */}
      <Dialog open={editHotelOpen} onClose={() => setEditHotelOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Hotel</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Hotel Name"
              value={hotelForm.name}
              onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Address"
              value={hotelForm.address}
              onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
              fullWidth
              required
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditHotelOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleEditHotel} 
            variant="contained"
            disabled={loading || !hotelForm.name || !hotelForm.address}
          >
            {loading ? 'Updating...' : 'Update Hotel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Hotel Dialog */}
      <Dialog open={deleteHotelOpen} onClose={() => setDeleteHotelOpen(false)}>
        <DialogTitle>Delete Hotel</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedHotel?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteHotelOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteHotel} 
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TripDetail;