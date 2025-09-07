/**
 * Trip Service - Main business logic for trip management
 * Vanilla JavaScript implementation
 */

import { indexedDBService } from './IndexedDBService.js';
import { validateForm, showToast } from '../utils/helpers.js';

export class TripService {
    constructor() {
        this.dbService = indexedDBService;
    }

    /**
     * Get all trips
     */
    async getAllTrips() {
        try {
            return await this.dbService.getAllTrips();
        } catch (error) {
            console.error('Error getting all trips:', error);
            showToast('Failed to load trips', 'error');
            return [];
        }
    }

    /**
     * Get trip by ID
     */
    async getTripById(id) {
        try {
            return await this.dbService.getTripById(id);
        } catch (error) {
            console.error('Error getting trip by ID:', error);
            showToast('Failed to load trip details', 'error');
            return null;
        }
    }

    /**
     * Create new trip with validation
     */
    async createTrip(tripData) {
        // Validate trip data
        const validation = this.validateTripData(tripData);
        if (!validation.isValid) {
            const errorMessage = Object.values(validation.errors)[0];
            showToast(errorMessage, 'error');
            throw new Error(errorMessage);
        }

        try {
            const trip = await this.dbService.createTrip(tripData);
            showToast(`Trip "${trip.name}" created successfully`, 'success');
            return trip;
        } catch (error) {
            console.error('Error creating trip:', error);
            showToast('Failed to create trip', 'error');
            throw error;
        }
    }

    /**
     * Update existing trip
     */
    async updateTrip(id, tripData) {
        // Validate trip data
        const validation = this.validateTripData(tripData, true);
        if (!validation.isValid) {
            const errorMessage = Object.values(validation.errors)[0];
            showToast(errorMessage, 'error');
            throw new Error(errorMessage);
        }

        try {
            const updatedTrip = await this.dbService.updateTrip(id, tripData);
            if (updatedTrip) {
                showToast(`Trip "${updatedTrip.name}" updated successfully`, 'success');
                return updatedTrip;
            } else {
                throw new Error('Trip not found');
            }
        } catch (error) {
            console.error('Error updating trip:', error);
            showToast('Failed to update trip', 'error');
            throw error;
        }
    }

    /**
     * Delete trip
     */
    async deleteTrip(id) {
        try {
            const success = await this.dbService.deleteTrip(id);
            if (success) {
                showToast('Trip deleted successfully', 'success');
                return true;
            } else {
                throw new Error('Failed to delete trip');
            }
        } catch (error) {
            console.error('Error deleting trip:', error);
            showToast('Failed to delete trip', 'error');
            throw error;
        }
    }

    /**
     * Add destination to trip
     */
    async addDestination(tripId, destinationData) {
        // Validate destination data
        const validation = this.validateDestinationData(destinationData);
        if (!validation.isValid) {
            const errorMessage = Object.values(validation.errors)[0];
            showToast(errorMessage, 'error');
            throw new Error(errorMessage);
        }

        try {
            const destination = await this.dbService.addDestination(tripId, destinationData);
            if (destination) {
                showToast(`Destination "${destination.name}" added successfully`, 'success');
                return destination;
            } else {
                throw new Error('Trip not found');
            }
        } catch (error) {
            console.error('Error adding destination:', error);
            showToast('Failed to add destination', 'error');
            throw error;
        }
    }

    /**
     * Update destination
     */
    async updateDestination(tripId, destinationId, destinationData) {
        // Validate destination data
        const validation = this.validateDestinationData(destinationData, true);
        if (!validation.isValid) {
            const errorMessage = Object.values(validation.errors)[0];
            showToast(errorMessage, 'error');
            throw new Error(errorMessage);
        }

        try {
            const destination = await this.dbService.updateDestination(tripId, destinationId, destinationData);
            if (destination) {
                showToast(`Destination "${destination.name}" updated successfully`, 'success');
                return destination;
            } else {
                throw new Error('Destination not found');
            }
        } catch (error) {
            console.error('Error updating destination:', error);
            showToast('Failed to update destination', 'error');
            throw error;
        }
    }

    /**
     * Delete destination
     */
    async deleteDestination(tripId, destinationId) {
        try {
            const success = await this.dbService.deleteDestination(tripId, destinationId);
            if (success) {
                showToast('Destination deleted successfully', 'success');
                return true;
            } else {
                throw new Error('Failed to delete destination');
            }
        } catch (error) {
            console.error('Error deleting destination:', error);
            showToast('Failed to delete destination', 'error');
            throw error;
        }
    }

    /**
     * Add hotel to destination
     */
    async addHotel(tripId, destinationId, hotelData) {
        // Validate hotel data
        const validation = this.validateHotelData(hotelData);
        if (!validation.isValid) {
            const errorMessage = Object.values(validation.errors)[0];
            showToast(errorMessage, 'error');
            throw new Error(errorMessage);
        }

        try {
            const hotel = await this.dbService.addHotel(tripId, destinationId, hotelData);
            if (hotel) {
                showToast(`Hotel "${hotel.name}" added successfully`, 'success');
                return hotel;
            } else {
                throw new Error('Destination not found');
            }
        } catch (error) {
            console.error('Error adding hotel:', error);
            showToast('Failed to add hotel', 'error');
            throw error;
        }
    }

    /**
     * Update hotel
     */
    async updateHotel(tripId, destinationId, hotelId, hotelData) {
        // Validate hotel data
        const validation = this.validateHotelData(hotelData, true);
        if (!validation.isValid) {
            const errorMessage = Object.values(validation.errors)[0];
            showToast(errorMessage, 'error');
            throw new Error(errorMessage);
        }

        try {
            const hotel = await this.dbService.updateHotel(tripId, destinationId, hotelId, hotelData);
            if (hotel) {
                showToast(`Hotel "${hotel.name}" updated successfully`, 'success');
                return hotel;
            } else {
                throw new Error('Hotel not found');
            }
        } catch (error) {
            console.error('Error updating hotel:', error);
            showToast('Failed to update hotel', 'error');
            throw error;
        }
    }

    /**
     * Delete hotel
     */
    async deleteHotel(tripId, destinationId, hotelId) {
        try {
            const success = await this.dbService.deleteHotel(tripId, destinationId, hotelId);
            if (success) {
                showToast('Hotel deleted successfully', 'success');
                return true;
            } else {
                throw new Error('Failed to delete hotel');
            }
        } catch (error) {
            console.error('Error deleting hotel:', error);
            showToast('Failed to delete hotel', 'error');
            throw error;
        }
    }

    /**
     * Save AI generated trip
     */
    async saveAIGeneratedTrip(tripData) {
        try {
            const trip = await this.dbService.saveAIGeneratedTrip(tripData);
            showToast(`AI trip "${trip.name}" saved successfully`, 'success');
            return trip;
        } catch (error) {
            console.error('Error saving AI generated trip:', error);
            showToast('Failed to save AI generated trip', 'error');
            throw error;
        }
    }

    /**
     * Initialize sample data
     */
    async initializeSampleData() {
        try {
            await this.dbService.initializeSampleData();
        } catch (error) {
            console.error('Error initializing sample data:', error);
            showToast('Failed to initialize sample data', 'error');
        }
    }

    /**
     * Get database statistics
     */
    async getStats() {
        try {
            return await this.dbService.getStats();
        } catch (error) {
            console.error('Error getting database stats:', error);
            return {
                trips: 0,
                destinations: 0,
                hotels: 0,
                plannedTrips: 0,
                inProgressTrips: 0,
                completedTrips: 0
            };
        }
    }

    /**
     * Clear all data
     */
    async clearAllData() {
        try {
            const success = await this.dbService.clearAllData();
            if (success) {
                showToast('All data cleared successfully', 'success');
                return true;
            } else {
                throw new Error('Failed to clear data');
            }
        } catch (error) {
            console.error('Error clearing data:', error);
            showToast('Failed to clear data', 'error');
            throw error;
        }
    }

    /**
     * Validate trip data
     */
    validateTripData(tripData, isUpdate = false) {
        const rules = {
            name: [
                { required: !isUpdate, message: 'Trip name is required' },
                { minLength: 2, message: 'Trip name must be at least 2 characters' },
                { maxLength: 100, message: 'Trip name must be less than 100 characters' }
            ],
            startDate: [
                { required: !isUpdate, message: 'Start date is required' },
                { 
                    custom: (value) => {
                        if (!value) return true; // Skip if not provided for updates
                        const date = new Date(value);
                        return !isNaN(date.getTime());
                    }, 
                    message: 'Invalid start date format' 
                }
            ],
            endDate: [
                { required: !isUpdate, message: 'End date is required' },
                { 
                    custom: (value, formData) => {
                        if (!value || !formData.startDate) return true;
                        const startDate = new Date(formData.startDate);
                        const endDate = new Date(value);
                        return endDate >= startDate;
                    }, 
                    message: 'End date must be after start date' 
                }
            ],
            status: [
                { required: !isUpdate, message: 'Trip status is required' },
                { 
                    custom: (value) => {
                        if (!value) return true;
                        return ['planned', 'in-progress', 'completed'].includes(value);
                    }, 
                    message: 'Invalid trip status' 
                }
            ]
        };

        return validateForm(tripData, rules);
    }

    /**
     * Validate destination data
     */
    validateDestinationData(destinationData, isUpdate = false) {
        const rules = {
            name: [
                { required: !isUpdate, message: 'Destination name is required' },
                { minLength: 2, message: 'Destination name must be at least 2 characters' },
                { maxLength: 100, message: 'Destination name must be less than 100 characters' }
            ],
            location: [
                { required: !isUpdate, message: 'Location is required' },
                { minLength: 2, message: 'Location must be at least 2 characters' },
                { maxLength: 200, message: 'Location must be less than 200 characters' }
            ],
            latitude: [
                { 
                    custom: (value) => {
                        if (value === undefined || value === null || value === '') return true;
                        const lat = parseFloat(value);
                        return !isNaN(lat) && lat >= -90 && lat <= 90;
                    }, 
                    message: 'Latitude must be between -90 and 90 degrees' 
                }
            ],
            longitude: [
                { 
                    custom: (value) => {
                        if (value === undefined || value === null || value === '') return true;
                        const lng = parseFloat(value);
                        return !isNaN(lng) && lng >= -180 && lng <= 180;
                    }, 
                    message: 'Longitude must be between -180 and 180 degrees' 
                }
            ]
        };

        return validateForm(destinationData, rules);
    }

    /**
     * Validate hotel data
     */
    validateHotelData(hotelData, isUpdate = false) {
        const rules = {
            name: [
                { required: !isUpdate, message: 'Hotel name is required' },
                { minLength: 2, message: 'Hotel name must be at least 2 characters' },
                { maxLength: 100, message: 'Hotel name must be less than 100 characters' }
            ],
            address: [
                { required: !isUpdate, message: 'Hotel address is required' },
                { minLength: 5, message: 'Address must be at least 5 characters' },
                { maxLength: 200, message: 'Address must be less than 200 characters' }
            ]
        };

        return validateForm(hotelData, rules);
    }

    /**
     * Search trips by criteria
     */
    async searchTrips(searchTerm, status = null) {
        try {
            const allTrips = await this.getAllTrips();
            
            let filteredTrips = allTrips;

            // Filter by status if specified
            if (status && status !== 'all') {
                filteredTrips = filteredTrips.filter(trip => trip.status === status);
            }

            // Filter by search term
            if (searchTerm && searchTerm.trim()) {
                const term = searchTerm.toLowerCase().trim();
                filteredTrips = filteredTrips.filter(trip => {
                    return trip.name.toLowerCase().includes(term) ||
                           trip.destinations.some(dest => 
                               dest.name.toLowerCase().includes(term) ||
                               dest.location.toLowerCase().includes(term)
                           );
                });
            }

            return filteredTrips;
        } catch (error) {
            console.error('Error searching trips:', error);
            showToast('Failed to search trips', 'error');
            return [];
        }
    }

    /**
     * Export trip data
     */
    async exportTrip(tripId) {
        try {
            const trip = await this.getTripById(tripId);
            if (!trip) {
                throw new Error('Trip not found');
            }

            const exportData = {
                trip: trip,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${trip.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            showToast('Trip exported successfully', 'success');
            
            return true;
        } catch (error) {
            console.error('Error exporting trip:', error);
            showToast('Failed to export trip', 'error');
            throw error;
        }
    }

    /**
     * Import trip data
     */
    async importTrip(jsonData) {
        try {
            const importData = JSON.parse(jsonData);
            
            if (!importData.trip) {
                throw new Error('Invalid import format');
            }

            const trip = importData.trip;
            
            // Remove ID to create new trip
            delete trip.id;
            trip.destinations.forEach(dest => {
                delete dest.id;
                delete dest.tripId;
                dest.hotels.forEach(hotel => {
                    delete hotel.id;
                    delete hotel.destinationId;
                });
            });

            // Create new trip
            const newTrip = await this.createTrip({
                name: trip.name + ' (Imported)',
                startDate: trip.startDate,
                endDate: trip.endDate,
                status: trip.status
            });

            // Add destinations
            for (const destData of trip.destinations) {
                const hotels = destData.hotels || [];
                delete destData.hotels;
                
                const destination = await this.addDestination(newTrip.id, destData);
                
                // Add hotels
                for (const hotelData of hotels) {
                    await this.addHotel(newTrip.id, destination.id, hotelData);
                }
            }

            showToast('Trip imported successfully', 'success');
            return newTrip;
        } catch (error) {
            console.error('Error importing trip:', error);
            showToast('Failed to import trip', 'error');
            throw error;
        }
    }

    /**
     * Duplicate trip
     */
    async duplicateTrip(tripId) {
        try {
            const originalTrip = await this.getTripById(tripId);
            if (!originalTrip) {
                throw new Error('Trip not found');
            }

            // Create new trip with modified name
            const newTrip = await this.createTrip({
                name: `${originalTrip.name} (Copy)`,
                startDate: originalTrip.startDate,
                endDate: originalTrip.endDate,
                status: 'planned'
            });

            // Duplicate destinations
            for (const dest of originalTrip.destinations) {
                const newDest = await this.addDestination(newTrip.id, {
                    name: dest.name,
                    location: dest.location,
                    latitude: dest.latitude,
                    longitude: dest.longitude
                });

                // Duplicate hotels
                for (const hotel of dest.hotels) {
                    await this.addHotel(newTrip.id, newDest.id, {
                        name: hotel.name,
                        address: hotel.address
                    });
                }
            }

            showToast('Trip duplicated successfully', 'success');
            return newTrip;
        } catch (error) {
            console.error('Error duplicating trip:', error);
            showToast('Failed to duplicate trip', 'error');
            throw error;
        }
    }
}

// Create singleton instance
export const tripService = new TripService();