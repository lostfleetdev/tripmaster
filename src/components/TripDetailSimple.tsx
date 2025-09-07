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
import { Trip, Destination, Hotel, DestinationFormData, HotelFormData } from '../types';
import { tripService } from '../services/TripService';
import MapView from './MapView';

interface TripDetailProps {
  trip: Trip | null;
  onTripUpdate: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
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

const TripDetail: React.FC<TripDetailProps> = ({ trip, onTripUpdate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [addDestinationOpen, setAddDestinationOpen] = useState(false);
  const [editDestinationOpen, setEditDestinationOpen] = useState(false);
  const [deleteDestinationOpen, setDeleteDestinationOpen] = useState(false);
  const [addHotelOpen, setAddHotelOpen] = useState(false);
  const [editHotelOpen, setEditHotelOpen] = useState(false);
  const [deleteHotelOpen, setDeleteHotelOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(false);
  const [destinationForm, setDestinationForm] = useState<DestinationFormData>({
    name: '',
    location: '',
    latitude: 0,
    longitude: 0
  });
  const [hotelForm, setHotelForm] = useState<HotelFormData>({
    name: '',
    address: ''
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
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

  const openEditDestination = (destination: Destination) => {
    setSelectedDestination(destination);
    setDestinationForm({
      name: destination.name,
      location: destination.location,
      latitude: destination.latitude,
      longitude: destination.longitude
    });
    setEditDestinationOpen(true);
  };

  const openDeleteDestination = (destination: Destination) => {
    setSelectedDestination(destination);
    setDeleteDestinationOpen(true);
  };

  const openAddHotel = (destination: Destination) => {
    setSelectedDestination(destination);
    setHotelForm({ name: '', address: '' });
    setAddHotelOpen(true);
  };

  const openEditHotel = (destination: Destination, hotel: Hotel) => {
    setSelectedDestination(destination);
    setSelectedHotel(hotel);
    setHotelForm({
      name: hotel.name,
      address: hotel.address
    });
    setEditHotelOpen(true);
  };

  const openDeleteHotel = (destination: Destination, hotel: Hotel) => {
    setSelectedDestination(destination);
    setSelectedHotel(hotel);
    setDeleteHotelOpen(true);
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'planned': return 'info';
      case 'in-progress': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
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
                {trip.destinations
                  .sort((a, b) => a.sequence - b.sequence)
                  .map((destination, index) => (
                    <Accordion key={destination.id} defaultExpanded={index === 0}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Chip 
                            label={destination.sequence} 
                            color="primary" 
                            size="small" 
                            sx={{ mr: 2, minWidth: 32 }}
                          />
                          <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            {destination.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                            {destination.location}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {destination.hotels.length} hotel{destination.hotels.length !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ pl: 2 }}>
                          {/* Destination Actions */}
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => openEditDestination(destination)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              startIcon={<DeleteIcon />}
                              color="error"
                              onClick={() => openDeleteDestination(destination)}
                            >
                              Delete
                            </Button>
                            <Button
                              size="small"
                              startIcon={<MapIcon />}
                              variant="outlined"
                              onClick={() => setActiveTab(1)}
                            >
                              View on Map
                            </Button>
                          </Box>

                          {/* Hotels Section */}
                          <Box sx={{ mt: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                                <HotelIcon sx={{ mr: 1 }} />
                                Hotels
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => openAddHotel(destination)}
                              >
                                Add Hotel
                              </Button>
                            </Box>

                            {destination.hotels.length === 0 ? (
                              <Alert severity="info" sx={{ mb: 2 }}>
                                No hotels added for this destination yet.
                                <Button 
                                  size="small" 
                                  onClick={() => openAddHotel(destination)}
                                  sx={{ ml: 1 }}
                                >
                                  Add Hotel
                                </Button>
                              </Alert>
                            ) : (
                              <List dense>
                                {destination.hotels.map((hotel) => (
                                  <ListItem key={hotel.id} divider>
                                    <ListItemText
                                      primary={hotel.name}
                                      secondary={hotel.address}
                                    />
                                    <ListItemSecondaryAction>
                                      <IconButton 
                                        edge="end" 
                                        size="small"
                                        onClick={() => openEditHotel(destination, hotel)}
                                        sx={{ mr: 1 }}
                                      >
                                        <EditIcon />
                                      </IconButton>
                                      <IconButton 
                                        edge="end" 
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">Trip Map</Typography>
              {trip.destinations && trip.destinations.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {trip.destinations?.length || 0} destination{(trip.destinations?.length || 0) !== 1 ? 's' : ''} • Route shown
                </Typography>
              )}
            </Box>
            
            <MapView destinations={trip.destinations || []} height="500px" />
            
            {trip.destinations && trip.destinations.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  💡 Click on markers for destination details. The dashed line shows your planned route.
                </Typography>
              </Box>
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
              helperText="e.g., Paris, France"
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
            Are you sure you want to delete "{selectedDestination?.name}"? 
            This will also delete all hotels associated with this destination. 
            This action cannot be undone.
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
        <DialogTitle>Add Hotel to {selectedDestination?.name}</DialogTitle>
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