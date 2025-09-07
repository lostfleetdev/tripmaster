import { IndexedDBService } from './IndexedDBService';
import { MariaDBService } from './MariaDBService';

/**
 * Trip service that acts as a facade over database operations
 * Uses IndexedDB by default with fallback capability
 */
class TripService {
  constructor() {
    // Use MariaDB by default when enabled, otherwise fall back to IndexedDB
    if (process.env.REACT_APP_USE_MARIADB === 'true') {
      this.databaseService = new MariaDBService();
    } else {
      this.databaseService = new IndexedDBService();
    }
  }

  // Delegate all operations to the underlying database service

  /**
   * Get all trips from the database
   * @returns {Promise<Array>} Array of trip objects
   */
  async getAllTrips() {
    return this.databaseService.getAllTrips();
  }

  /**
   * Get a trip by its ID
   * @param {string} id - Trip ID
   * @returns {Promise<Object|undefined>} Trip object or undefined if not found
   */
  async getTripById(id) {
    return this.databaseService.getTripById(id);
  }

  /**
   * Create a new trip
   * @param {Object} tripData - Trip form data
   * @returns {Promise<Object>} Created trip object
   */
  async createTrip(tripData) {
    return this.databaseService.createTrip(tripData);
  }

  /**
   * Update an existing trip
   * @param {string} id - Trip ID
   * @param {Object} tripData - Partial trip data to update
   * @returns {Promise<Object|null>} Updated trip object or null if not found
   */
  async updateTrip(id, tripData) {
    return this.databaseService.updateTrip(id, tripData);
  }

  /**
   * Delete a trip
   * @param {string} id - Trip ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteTrip(id) {
    return this.databaseService.deleteTrip(id);
  }

  /**
   * Add a destination to a trip
   * @param {string} tripId - Trip ID
   * @param {Object} destinationData - Destination form data
   * @returns {Promise<Object|null>} Created destination object or null if trip not found
   */
  async addDestination(tripId, destinationData) {
    return this.databaseService.addDestination(tripId, destinationData);
  }

  /**
   * Update a destination in a trip
   * @param {string} tripId - Trip ID
   * @param {string} destinationId - Destination ID
   * @param {Object} destinationData - Partial destination data to update
   * @returns {Promise<Object|null>} Updated destination object or null if not found
   */
  async updateDestination(tripId, destinationId, destinationData) {
    return this.databaseService.updateDestination(tripId, destinationId, destinationData);
  }

  /**
   * Delete a destination from a trip
   * @param {string} tripId - Trip ID
   * @param {string} destinationId - Destination ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteDestination(tripId, destinationId) {
    return this.databaseService.deleteDestination(tripId, destinationId);
  }

  /**
   * Add a hotel to a destination
   * @param {string} tripId - Trip ID
   * @param {string} destinationId - Destination ID
   * @param {Object} hotelData - Hotel form data
   * @returns {Promise<Object|null>} Created hotel object or null if destination not found
   */
  async addHotel(tripId, destinationId, hotelData) {
    return this.databaseService.addHotel(tripId, destinationId, hotelData);
  }

  /**
   * Update a hotel in a destination
   * @param {string} tripId - Trip ID
   * @param {string} destinationId - Destination ID
   * @param {string} hotelId - Hotel ID
   * @param {Object} hotelData - Partial hotel data to update
   * @returns {Promise<Object|null>} Updated hotel object or null if not found
   */
  async updateHotel(tripId, destinationId, hotelId, hotelData) {
    return this.databaseService.updateHotel(tripId, destinationId, hotelId, hotelData);
  }

  /**
   * Delete a hotel from a destination
   * @param {string} tripId - Trip ID
   * @param {string} destinationId - Destination ID
   * @param {string} hotelId - Hotel ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteHotel(tripId, destinationId, hotelId) {
    return this.databaseService.deleteHotel(tripId, destinationId, hotelId);
  }

  /**
   * Initialize sample data in the database
   * @returns {Promise<void>}
   */
  async initializeSampleData() {
    return this.databaseService.initializeSampleData();
  }

  /**
   * Save an AI-generated trip to the database
   * @param {Object} tripData - Trip data with optional destinations array
   * @returns {Promise<Object>} Saved trip object
   */
  async saveAIGeneratedTrip(tripData) {
    return this.databaseService.saveAIGeneratedTrip(tripData);
  }

  /**
   * Utility method to switch database implementations
   */
  switchToMariaDB() {
    this.databaseService = new MariaDBService();
  }

  /**
   * Utility method to switch to IndexedDB
   */
  switchToIndexedDB() {
    this.databaseService = new IndexedDBService();
  }
}

// Export a singleton instance
export const tripService = new TripService();