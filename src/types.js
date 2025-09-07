// Trip status constants
export const TRIP_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

// Trip status validation
export const isValidTripStatus = (status) => {
  return Object.values(TRIP_STATUS).includes(status);
};

// Default data structures for form validation and initialization

export const createEmptyTrip = () => ({
  id: '',
  name: '',
  startDate: '',
  endDate: '',
  status: TRIP_STATUS.PLANNED,
  destinations: []
});

export const createEmptyDestination = () => ({
  id: '',
  tripId: '',
  name: '',
  location: '',
  latitude: 0,
  longitude: 0,
  sequence: 0,
  hotels: []
});

export const createEmptyHotel = () => ({
  id: '',
  name: '',
  address: '',
  destinationId: ''
});

export const createEmptyTripFormData = () => ({
  name: '',
  startDate: '',
  endDate: '',
  status: TRIP_STATUS.PLANNED
});

export const createEmptyDestinationFormData = () => ({
  name: '',
  location: '',
  latitude: 0,
  longitude: 0
});

export const createEmptyHotelFormData = () => ({
  name: '',
  address: ''
});

// Validation functions
export const validateTrip = (trip) => {
  const errors = [];
  
  if (!trip.name || trip.name.trim() === '') {
    errors.push('Trip name is required');
  }
  
  if (!trip.startDate) {
    errors.push('Start date is required');
  }
  
  if (!trip.endDate) {
    errors.push('End date is required');
  }
  
  if (trip.startDate && trip.endDate && new Date(trip.startDate) > new Date(trip.endDate)) {
    errors.push('Start date must be before end date');
  }
  
  if (!isValidTripStatus(trip.status)) {
    errors.push('Invalid trip status');
  }
  
  return errors;
};

export const validateDestination = (destination) => {
  const errors = [];
  
  if (!destination.name || destination.name.trim() === '') {
    errors.push('Destination name is required');
  }
  
  if (!destination.location || destination.location.trim() === '') {
    errors.push('Location is required');
  }
  
  if (typeof destination.latitude !== 'number' || isNaN(destination.latitude)) {
    errors.push('Valid latitude is required');
  }
  
  if (typeof destination.longitude !== 'number' || isNaN(destination.longitude)) {
    errors.push('Valid longitude is required');
  }
  
  return errors;
};

export const validateHotel = (hotel) => {
  const errors = [];
  
  if (!hotel.name || hotel.name.trim() === '') {
    errors.push('Hotel name is required');
  }
  
  if (!hotel.address || hotel.address.trim() === '') {
    errors.push('Hotel address is required');
  }
  
  return errors;
};