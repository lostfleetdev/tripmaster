/**
 * IndexedDB Service for Trip Management
 * Vanilla JavaScript implementation
 */

import { generateId } from '../utils/helpers.js';

export class IndexedDBService {
    constructor() {
        this.db = null;
        this.DB_NAME = 'TripiDB';
        this.DB_VERSION = 1;
    }

    /**
     * Get or initialize database connection
     */
    async getDB() {
        if (this.db) {
            return this.db;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => {
                reject(new Error('Failed to open database'));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create trips store if it doesn't exist
                if (!db.objectStoreNames.contains('trips')) {
                    db.createObjectStore('trips', { keyPath: 'id' });
                }
            };
        });
    }

    /**
     * Get all trips from database
     */
    async getAllTrips() {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(['trips'], 'readonly');
            const store = transaction.objectStore('trips');
            const request = store.getAll();

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    const trips = request.result.map(trip => ({
                        ...trip,
                        destinations: trip.destinations || []
                    }));
                    resolve(trips);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting all trips from IndexedDB:', error);
            return [];
        }
    }

    /**
     * Get trip by ID
     */
    async getTripById(id) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(['trips'], 'readonly');
            const store = transaction.objectStore('trips');
            const request = store.get(id);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    const trip = request.result;
                    if (trip) {
                        resolve({
                            ...trip,
                            destinations: trip.destinations || []
                        });
                    } else {
                        resolve(undefined);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting trip by ID from IndexedDB:', error);
            return undefined;
        }
    }

    /**
     * Create new trip
     */
    async createTrip(tripData) {
        const trip = {
            id: generateId(),
            ...tripData,
            destinations: []
        };

        try {
            const db = await this.getDB();
            const transaction = db.transaction(['trips'], 'readwrite');
            const store = transaction.objectStore('trips');
            const request = store.put(trip);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(trip);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error creating trip in IndexedDB:', error);
            throw error;
        }
    }

    /**
     * Update existing trip
     */
    async updateTrip(id, tripData) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(['trips'], 'readwrite');
            const store = transaction.objectStore('trips');
            
            // Get existing trip
            const getRequest = store.get(id);
            
            return new Promise((resolve, reject) => {
                getRequest.onsuccess = () => {
                    const existingTrip = getRequest.result;
                    if (!existingTrip) {
                        resolve(null);
                        return;
                    }

                    const updatedTrip = { ...existingTrip, ...tripData };
                    const putRequest = store.put(updatedTrip);
                    
                    putRequest.onsuccess = () => resolve(updatedTrip);
                    putRequest.onerror = () => reject(putRequest.error);
                };
                getRequest.onerror = () => reject(getRequest.error);
            });
        } catch (error) {
            console.error('Error updating trip in IndexedDB:', error);
            return null;
        }
    }

    /**
     * Delete trip
     */
    async deleteTrip(id) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(['trips'], 'readwrite');
            const store = transaction.objectStore('trips');
            const request = store.delete(id);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(true);
                request.onerror = () => {
                    console.error('Error deleting trip:', request.error);
                    resolve(false);
                };
            });
        } catch (error) {
            console.error('Error deleting trip from IndexedDB:', error);
            return false;
        }
    }

    /**
     * Add destination to trip
     */
    async addDestination(tripId, destinationData) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(['trips'], 'readwrite');
            const store = transaction.objectStore('trips');
            
            const getRequest = store.get(tripId);
            
            return new Promise((resolve, reject) => {
                getRequest.onsuccess = () => {
                    const trip = getRequest.result;
                    if (!trip) {
                        resolve(null);
                        return;
                    }

                    const destination = {
                        id: generateId(),
                        tripId,
                        ...destinationData,
                        sequence: trip.destinations.length + 1,
                        hotels: []
                    };

                    trip.destinations.push(destination);
                    
                    const putRequest = store.put(trip);
                    putRequest.onsuccess = () => resolve(destination);
                    putRequest.onerror = () => reject(putRequest.error);
                };
                getRequest.onerror = () => reject(getRequest.error);
            });
        } catch (error) {
            console.error('Error adding destination to IndexedDB:', error);
            return null;
        }
    }

    /**
     * Update destination
     */
    async updateDestination(tripId, destinationId, destinationData) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(['trips'], 'readwrite');
            const store = transaction.objectStore('trips');
            
            const getRequest = store.get(tripId);
            
            return new Promise((resolve, reject) => {
                getRequest.onsuccess = () => {
                    const trip = getRequest.result;
                    if (!trip) {
                        resolve(null);
                        return;
                    }

                    const destinationIndex = trip.destinations.findIndex(d => d.id === destinationId);
                    if (destinationIndex === -1) {
                        resolve(null);
                        return;
                    }

                    trip.destinations[destinationIndex] = { 
                        ...trip.destinations[destinationIndex], 
                        ...destinationData 
                    };
                    
                    const putRequest = store.put(trip);
                    putRequest.onsuccess = () => resolve(trip.destinations[destinationIndex]);
                    putRequest.onerror = () => reject(putRequest.error);
                };
                getRequest.onerror = () => reject(getRequest.error);
            });
        } catch (error) {
            console.error('Error updating destination in IndexedDB:', error);
            return null;
        }
    }

    /**
     * Delete destination
     */
    async deleteDestination(tripId, destinationId) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(['trips'], 'readwrite');
            const store = transaction.objectStore('trips');
            
            const getRequest = store.get(tripId);
            
            return new Promise((resolve, reject) => {
                getRequest.onsuccess = () => {
                    const trip = getRequest.result;
                    if (!trip) {
                        resolve(false);
                        return;
                    }

                    const destinationIndex = trip.destinations.findIndex(d => d.id === destinationId);
                    if (destinationIndex === -1) {
                        resolve(false);
                        return;
                    }

                    trip.destinations.splice(destinationIndex, 1);
                    
                    // Update sequence numbers
                    trip.destinations.forEach((dest, index) => {
                        dest.sequence = index + 1;
                    });
                    
                    const putRequest = store.put(trip);
                    putRequest.onsuccess = () => resolve(true);
                    putRequest.onerror = () => reject(putRequest.error);
                };
                getRequest.onerror = () => reject(getRequest.error);
            });
        } catch (error) {
            console.error('Error deleting destination from IndexedDB:', error);
            return false;
        }
    }

    /**
     * Add hotel to destination
     */
    async addHotel(tripId, destinationId, hotelData) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(['trips'], 'readwrite');
            const store = transaction.objectStore('trips');
            
            const getRequest = store.get(tripId);
            
            return new Promise((resolve, reject) => {
                getRequest.onsuccess = () => {
                    const trip = getRequest.result;
                    if (!trip) {
                        resolve(null);
                        return;
                    }

                    const destination = trip.destinations.find(d => d.id === destinationId);
                    if (!destination) {
                        resolve(null);
                        return;
                    }

                    const hotel = {
                        id: generateId(),
                        destinationId,
                        ...hotelData
                    };

                    destination.hotels.push(hotel);
                    
                    const putRequest = store.put(trip);
                    putRequest.onsuccess = () => resolve(hotel);
                    putRequest.onerror = () => reject(putRequest.error);
                };
                getRequest.onerror = () => reject(getRequest.error);
            });
        } catch (error) {
            console.error('Error adding hotel to IndexedDB:', error);
            return null;
        }
    }

    /**
     * Update hotel
     */
    async updateHotel(tripId, destinationId, hotelId, hotelData) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(['trips'], 'readwrite');
            const store = transaction.objectStore('trips');
            
            const getRequest = store.get(tripId);
            
            return new Promise((resolve, reject) => {
                getRequest.onsuccess = () => {
                    const trip = getRequest.result;
                    if (!trip) {
                        resolve(null);
                        return;
                    }

                    const destination = trip.destinations.find(d => d.id === destinationId);
                    if (!destination) {
                        resolve(null);
                        return;
                    }

                    const hotelIndex = destination.hotels.findIndex(h => h.id === hotelId);
                    if (hotelIndex === -1) {
                        resolve(null);
                        return;
                    }

                    destination.hotels[hotelIndex] = { 
                        ...destination.hotels[hotelIndex], 
                        ...hotelData 
                    };
                    
                    const putRequest = store.put(trip);
                    putRequest.onsuccess = () => resolve(destination.hotels[hotelIndex]);
                    putRequest.onerror = () => reject(putRequest.error);
                };
                getRequest.onerror = () => reject(getRequest.error);
            });
        } catch (error) {
            console.error('Error updating hotel in IndexedDB:', error);
            return null;
        }
    }

    /**
     * Delete hotel
     */
    async deleteHotel(tripId, destinationId, hotelId) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(['trips'], 'readwrite');
            const store = transaction.objectStore('trips');
            
            const getRequest = store.get(tripId);
            
            return new Promise((resolve, reject) => {
                getRequest.onsuccess = () => {
                    const trip = getRequest.result;
                    if (!trip) {
                        resolve(false);
                        return;
                    }

                    const destination = trip.destinations.find(d => d.id === destinationId);
                    if (!destination) {
                        resolve(false);
                        return;
                    }

                    const hotelIndex = destination.hotels.findIndex(h => h.id === hotelId);
                    if (hotelIndex === -1) {
                        resolve(false);
                        return;
                    }

                    destination.hotels.splice(hotelIndex, 1);
                    
                    const putRequest = store.put(trip);
                    putRequest.onsuccess = () => resolve(true);
                    putRequest.onerror = () => reject(putRequest.error);
                };
                getRequest.onerror = () => reject(getRequest.error);
            });
        } catch (error) {
            console.error('Error deleting hotel from IndexedDB:', error);
            return false;
        }
    }

    /**
     * Initialize sample data
     */
    async initializeSampleData() {
        try {
            const existingTrips = await this.getAllTrips();
            if (existingTrips.length > 0) {
                console.log('Sample data already exists, skipping initialization');
                return;
            }

            const sampleTrips = [
                {
                    name: 'European Adventure',
                    startDate: '2024-06-01',
                    endDate: '2024-06-15',
                    status: 'planned'
                },
                {
                    name: 'Tokyo Business Trip',
                    startDate: '2024-03-10',
                    endDate: '2024-03-17',
                    status: 'completed'
                },
                {
                    name: 'California Road Trip',
                    startDate: '2024-08-01',
                    endDate: '2024-08-10',
                    status: 'in-progress'
                }
            ];

            for (const tripData of sampleTrips) {
                const trip = await this.createTrip(tripData);
                
                // Add sample destinations
                if (trip.name === 'European Adventure') {
                    await this.addDestination(trip.id, {
                        name: 'Paris',
                        location: 'Paris, France',
                        latitude: 48.8566,
                        longitude: 2.3522
                    });
                    await this.addDestination(trip.id, {
                        name: 'Rome',
                        location: 'Rome, Italy',
                        latitude: 41.9028,
                        longitude: 12.4964
                    });
                } else if (trip.name === 'Tokyo Business Trip') {
                    const destination = await this.addDestination(trip.id, {
                        name: 'Tokyo',
                        location: 'Tokyo, Japan',
                        latitude: 35.6762,
                        longitude: 139.6503
                    });
                    
                    if (destination) {
                        await this.addHotel(trip.id, destination.id, {
                            name: 'Park Hyatt Tokyo',
                            address: '3 Chome-7-1-2 Nishishinjuku, Shinjuku City, Tokyo'
                        });
                    }
                }
            }

            console.log('Sample data initialized successfully');
        } catch (error) {
            console.error('Error initializing sample data in IndexedDB:', error);
        }
    }

    /**
     * Save AI generated trip
     */
    async saveAIGeneratedTrip(tripData) {
        try {
            const trip = await this.createTrip({
                name: tripData.name,
                startDate: tripData.startDate,
                endDate: tripData.endDate,
                status: tripData.status || 'planned'
            });

            if (tripData.destinations && Array.isArray(tripData.destinations)) {
                for (const destData of tripData.destinations) {
                    await this.addDestination(trip.id, destData);
                }
            }

            return trip;
        } catch (error) {
            console.error('Error saving AI generated trip:', error);
            throw error;
        }
    }

    /**
     * Get database statistics
     */
    async getStats() {
        try {
            const trips = await this.getAllTrips();
            const destinations = trips.reduce((count, trip) => count + trip.destinations.length, 0);
            const hotels = trips.reduce((count, trip) => 
                count + trip.destinations.reduce((hotelCount, dest) => hotelCount + dest.hotels.length, 0), 0);

            return {
                trips: trips.length,
                destinations,
                hotels,
                plannedTrips: trips.filter(t => t.status === 'planned').length,
                inProgressTrips: trips.filter(t => t.status === 'in-progress').length,
                completedTrips: trips.filter(t => t.status === 'completed').length
            };
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
     * Clear all data (for testing)
     */
    async clearAllData() {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(['trips'], 'readwrite');
            const store = transaction.objectStore('trips');
            const request = store.clear();

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }
}

// Create singleton instance
export const indexedDBService = new IndexedDBService();