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
import { TRIP_STATUS, createEmptyDestinationFormData, createEmptyHotelFormData } from '../types';
import { tripService } from '../services/TripService';
import MapView from './MapView';

/**
 * TabPanel component for organizing tab content in trip details
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Tab content
 * @param {number} props.index - Tab index
 * @param {number} props.value - Current active tab value
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
 * TripDetail component for displaying and managing detailed trip information
 * @param {Object} props - Component props
 * @param {Object|null} props.trip - Trip object to display
 * @param {Function} props.onTripUpdate - Callback when trip data needs to be refreshed
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
  const [destinationForm, setDestinationForm] = useState(createEmptyDestinationFormData());
  const [hotelForm, setHotelForm] = useState(createEmptyHotelFormData());

  /**
   * Handle tab change events
   * @param {Object} event - React synthetic event
   * @param {number} newValue - New tab index
   */
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

  /**
   * Handle adding a new destination to the trip
   */
  const handleAddDestination = async () => {
    if (!trip || !destinationForm.name || !destinationForm.location) return;
    
    setLoading(true);
    try {
      await tripService.addDestination(trip.id, destinationForm);
      setAddDestinationOpen(false);
      setDestinationForm(createEmptyDestinationFormData());
      onTripUpdate();
    } catch (error) {
      console.error('Error adding destination:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle editing an existing destination
   */
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

  /**
   * Handle deleting a destination
   */
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

  /**
   * Handle adding a new hotel to a destination
   */
  const handleAddHotel = async () => {
    if (!trip || !selectedDestination || !hotelForm.name || !hotelForm.address) return;
    
    setLoading(true);
    try {
      await tripService.addHotel(trip.id, selectedDestination.id, hotelForm);
      setAddHotelOpen(false);
      setHotelForm(createEmptyHotelFormData());
      onTripUpdate();
    } catch (error) {
      console.error('Error adding hotel:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle editing an existing hotel
   */
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

  /**
   * Handle deleting a hotel
   */
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

  /**
   * Open the edit dialog for a destination
   * @param {Object} destination - Destination object to edit
   */
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

  /**
   * Open the delete confirmation dialog for a destination
   * @param {Object} destination - Destination object to delete
   */
  const openDeleteDestination = (destination) => {
    setSelectedDestination(destination);
    setDeleteDestinationOpen(true);
  };

  /**
   * Open the add hotel dialog for a destination
   * @param {Object} destination - Destination to add hotel to
   */
  const openAddHotel = (destination) => {
    setSelectedDestination(destination);
    setHotelForm(createEmptyHotelFormData());
    setAddHotelOpen(true);
  };

  /**
   * Open the edit hotel dialog
   * @param {Object} destination - Destination containing the hotel
   * @param {Object} hotel - Hotel object to edit
   */
  const openEditHotel = (destination, hotel) => {
    setSelectedDestination(destination);
    setSelectedHotel(hotel);
    setHotelForm({
      name: hotel.name,
      address: hotel.address
    });
    setEditHotelOpen(true);
  };

  /**
   * Open the delete hotel confirmation dialog
   * @param {Object} destination - Destination containing the hotel
   * @param {Object} hotel - Hotel object to delete
   */
  const openDeleteHotel = (destination, hotel) => {
    setSelectedDestination(destination);
    setSelectedHotel(hotel);
    setDeleteHotelOpen(true);
  };

  /**
   * Get the appropriate color for a trip status chip
   * @param {string} status - Trip status
   * @returns {string} MUI chip color
   */
  const getStatusColor = (status) => {
    switch (status) {
      case TRIP_STATUS.PLANNED: return 'info';
      case TRIP_STATUS.IN_PROGRESS: return 'warning';
      case TRIP_STATUS.COMPLETED: return 'success';
      default: return 'default';
    }
  };

  /**
   * Format a date string for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Calculate the duration between two dates
   * @param {string} startDate - Start date string
   * @param {string} endDate - End date string
   * @returns {number} Duration in days
   */
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
              {trip.destinations?.length || 0} destination{(trip.destinations?.length || 0) !== 1 ? 's' : ''} planned
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Destinations Section */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab 
            icon={<LocationIcon />} 
            label="Destinations" 
            id="trip-tab-0"
            aria-controls="trip-tabpanel-0"
          />
          <Tab 
            icon={<MapIcon />} 
            label="Trip Map" 
            id="trip-tab-1"
            aria-controls="trip-tabpanel-1"
          />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">Destinations</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddDestinationOpen(true)}
              >
                Add Destination
              </Button>
            </Box>

            {(trip.destinations?.length || 0) === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                <LocationIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No destinations added yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Start planning your trip by adding destinations
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddDestinationOpen(true)}
                >
                  Add First Destination
                </Button>
              </Paper>
            ) : (
              <Box>
                {trip.destinations?.map((destination) => (
                  <Accordion key={destination.id} defaultExpanded>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`destination-${destination.id}-content`}
                      id={`destination-${destination.id}-header`}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          bgcolor: 'primary.main', 
                          color: 'white', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          mr: 2,
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}>
                          {destination.sequence}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6">{destination.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {destination.location}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {destination.hotels?.length || 0} hotel{(destination.hotels?.length || 0) !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => openEditDestination(destination)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => openDeleteDestination(destination)}
                          >
                            Delete
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<MapIcon />}
                            onClick={() => setActiveTab(1)}
                          >
                            View on Map
                          </Button>
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                              <HotelIcon sx={{ mr: 1 }} />
                              Hotels
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() => openAddHotel(destination)}
                            >
                              Add Hotel
                            </Button>
                          </Box>

                          {(destination.hotels?.length || 0) === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                              No hotels added for this destination yet.
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
                                      edge="end"
                                      aria-label="edit"
                                      onClick={() => openEditHotel(destination, hotel)}
                                      sx={{ mr: 1 }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton
                                      edge="end"
                                      aria-label="delete"
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
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Trip Map</Typography>
            {trip.destinations && trip.destinations.length > 0 ? (
              <MapView destinations={trip.destinations} />
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                Add destinations to see them on the map.
              </Alert>
            )}
          </Box>
        </TabPanel>
      </Paper>

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
            Are you sure you want to delete "{selectedDestination?.name}"? This will also delete all associated hotels. This action cannot be undone.
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
              rows={2}
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
              rows={2}
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
            Are you sure you want to delete "{selectedHotel?.name}"? This action cannot be undone.
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