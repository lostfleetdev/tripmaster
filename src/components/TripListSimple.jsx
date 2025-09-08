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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  MenuItem as MenuOptionItem,
  Fade
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Flight as FlightIcon
} from '@mui/icons-material';
import { tripService } from '../services/TripService.js';

/**
 * Trip list component
 * @param {Object} props
 * @param {Trip[]} props.trips
 * @param {function} props.onTripSelect
 * @param {function} props.onTripUpdate
 */
const TripList = ({ trips, onTripSelect, onTripUpdate }) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuTripId, setMenuTripId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'planned'
  });
  const [loading, setLoading] = useState(false);

  const handleMenuOpen = (event, tripId) => {
    setAnchorEl(event.currentTarget);
    setMenuTripId(tripId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuTripId(null);
  };

  const handleAddTrip = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) return;
    
    setLoading(true);
    try {
      await tripService.createTrip(formData);
      setAddDialogOpen(false);
      setFormData({ name: '', startDate: '', endDate: '', status: 'planned' });
      onTripUpdate();
    } catch (error) {
      console.error('Error creating trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTrip = async () => {
    if (!selectedTrip || !formData.name || !formData.startDate || !formData.endDate) return;
    
    setLoading(true);
    try {
      await tripService.updateTrip(selectedTrip.id, formData);
      setEditDialogOpen(false);
      setSelectedTrip(null);
      onTripUpdate();
    } catch (error) {
      console.error('Error updating trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!selectedTrip) return;
    
    setLoading(true);
    try {
      await tripService.deleteTrip(selectedTrip.id);
      setDeleteDialogOpen(false);
      setSelectedTrip(null);
      onTripUpdate();
    } catch (error) {
      console.error('Error deleting trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (trip) => {
    setSelectedTrip(trip);
    setFormData({
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      status: trip.status
    });
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const openDeleteDialog = (trip) => {
    setSelectedTrip(trip);
    setDeleteDialogOpen(true);
    handleMenuClose();
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
      month: 'short',
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Trips</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add New Trip
        </Button>
      </Box>

      {trips.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <FlightIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No trips planned yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start planning your next adventure by creating your first trip
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Create First Trip
          </Button>
        </Card>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)' 
          }, 
          gap: 3 
        }}>
          {trips.map((trip) => (
            <Box key={trip.id}>
              <Fade in timeout={300}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => onTripSelect(trip)}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h2" noWrap sx={{ flexGrow: 1, mr: 1 }}>
                        {trip.name}
                      </Typography>
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, trip.id);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>

                    <Chip 
                      label={trip.status} 
                      color={getStatusColor(trip.status)}
                      size="small"
                      sx={{ mb: 2, textTransform: 'capitalize' }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Duration: {calculateDuration(trip.startDate, trip.endDate)} days
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {trip.destinations?.length || 0} destination{(trip.destinations?.length || 0) !== 1 ? 's' : ''}
                      </Typography>
                    </Box>

                    {trip.destinations && trip.destinations.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Destinations:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {trip.destinations?.slice(0, 3).map((dest, index) => (
                            <Chip 
                              key={dest.id}
                              label={dest.name}
                              variant="outlined"
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                          {trip.destinations && trip.destinations.length > 3 && (
                            <Chip 
                              label={`+${(trip.destinations?.length || 0) - 3} more`}
                              variant="outlined"
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Box>
          ))}
        </Box>
      )}

      {/* Trip Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuOptionItem onClick={() => {
          const trip = trips.find(t => t.id === menuTripId);
          if (trip) openEditDialog(trip);
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Trip</ListItemText>
        </MenuOptionItem>
        <MenuOptionItem onClick={() => {
          const trip = trips.find(t => t.id === menuTripId);
          if (trip) openDeleteDialog(trip);
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Trip</ListItemText>
        </MenuOptionItem>
      </Menu>

      {/* Add Trip Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Trip</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Trip Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="planned">Planned</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddTrip} 
            variant="contained"
            disabled={loading || !formData.name || !formData.startDate || !formData.endDate}
          >
            {loading ? 'Creating...' : 'Create Trip'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Trip Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Trip</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Trip Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="planned">Planned</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleEditTrip} 
            variant="contained"
            disabled={loading || !formData.name || !formData.startDate || !formData.endDate}
          >
            {loading ? 'Updating...' : 'Update Trip'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Trip Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Trip</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedTrip?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteTrip} 
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

export default TripList;