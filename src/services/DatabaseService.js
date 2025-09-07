/**
 * Database service interface - defines the contract for all database implementations
 * This allows for easy switching between IndexedDB, MariaDB, or other database systems
 */

/**
 * Interface defining the contract for database services
 * All database implementations must implement these methods
 */
export class IDatabaseService {
  /**
   * Get all trips from the database
   * @returns {Promise<Array>} Array of trip objects
   */
  async getAllTrips() {
    throw new Error('Method not implemented');
  }

  /**
   * Get a trip by its ID
   * @param {string} id - Trip ID
   * @returns {Promise<Object|undefined>} Trip object or undefined if not found
   */
  async getTripById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Create a new trip
   * @param {Object} tripData - Trip form data
   * @returns {Promise<Object>} Created trip object
   */
  async createTrip(tripData) {
    throw new Error('Method not implemented');
  }

  /**
   * Update an existing trip
   * @param {string} id - Trip ID
   * @param {Object} tripData - Partial trip data to update
   * @returns {Promise<Object|null>} Updated trip object or null if not found
   */
  async updateTrip(id, tripData) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a trip
   * @param {string} id - Trip ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteTrip(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Add a destination to a trip
   * @param {string} tripId - Trip ID
   * @param {Object} destinationData - Destination form data
   * @returns {Promise<Object|null>} Created destination object or null if trip not found
   */
  async addDestination(tripId, destinationData) {
    throw new Error('Method not implemented');
  }

  /**
   * Update a destination in a trip
   * @param {string} tripId - Trip ID
   * @param {string} destinationId - Destination ID
   * @param {Object} destinationData - Partial destination data to update
   * @returns {Promise<Object|null>} Updated destination object or null if not found
   */
  async updateDestination(tripId, destinationId, destinationData) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a destination from a trip
   * @param {string} tripId - Trip ID
   * @param {string} destinationId - Destination ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteDestination(tripId, destinationId) {
    throw new Error('Method not implemented');
  }

  /**
   * Add a hotel to a destination
   * @param {string} tripId - Trip ID
   * @param {string} destinationId - Destination ID
   * @param {Object} hotelData - Hotel form data
   * @returns {Promise<Object|null>} Created hotel object or null if destination not found
   */
  async addHotel(tripId, destinationId, hotelData) {
    throw new Error('Method not implemented');
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
    throw new Error('Method not implemented');
  }

  /**
   * Delete a hotel from a destination
   * @param {string} tripId - Trip ID
   * @param {string} destinationId - Destination ID
   * @param {string} hotelId - Hotel ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteHotel(tripId, destinationId, hotelId) {
    throw new Error('Method not implemented');
  }

  /**
   * Initialize sample data in the database
   * @returns {Promise<void>}
   */
  async initializeSampleData() {
    throw new Error('Method not implemented');
  }

  /**
   * Save an AI-generated trip to the database
   * @param {Object} tripData - Trip data with optional destinations array
   * @returns {Promise<Object>} Saved trip object
   */
  async saveAIGeneratedTrip(tripData) {
    throw new Error('Method not implemented');
  }
}