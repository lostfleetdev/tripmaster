/**
 * Abstract interface for database operations
 * This allows switching between different database implementations (IndexedDB, MariaDB, etc.)
 */

/**
 * Abstract base class with common utility methods
 */
export class BaseDatabaseService {
  /**
   * Generate a unique ID
   * @returns {string} A unique identifier
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Abstract methods that must be implemented by subclasses
  
  /**
   * Get all trips
   * @returns {Promise<Trip[]>}
   */
  async getAllTrips() {
    throw new Error('Method must be implemented by subclass');
  }

  /**
   * Get trip by ID
   * @param {string} id
   * @returns {Promise<Trip | undefined>}
   */
  async getTripById(id) {
    throw new Error('Method must be implemented by subclass');
  }

  /**
   * Create a new trip
   * @param {TripFormData} tripData
   * @returns {Promise<Trip>}
   */
  async createTrip(tripData) {
    throw new Error('Method must be implemented by subclass');
  }

  /**
   * Update a trip
   * @param {string} id
   * @param {Partial<TripFormData>} tripData
   * @returns {Promise<Trip | null>}
   */
  async updateTrip(id, tripData) {
    throw new Error('Method must be implemented by subclass');
  }

  /**
   * Delete a trip
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deleteTrip(id) {
    throw new Error('Method must be implemented by subclass');
  }

  /**
   * Add destination to trip
   * @param {string} tripId
   * @param {DestinationFormData} destinationData
   * @returns {Promise<Destination | null>}
   */
  async addDestination(tripId, destinationData) {
    throw new Error('Method must be implemented by subclass');
  }

  /**
   * Update destination
   * @param {string} tripId
   * @param {string} destinationId
   * @param {Partial<DestinationFormData>} destinationData
   * @returns {Promise<Destination | null>}
   */
  async updateDestination(tripId, destinationId, destinationData) {
    throw new Error('Method must be implemented by subclass');
  }

  /**
   * Delete destination
   * @param {string} tripId
   * @param {string} destinationId
   * @returns {Promise<boolean>}
   */
  async deleteDestination(tripId, destinationId) {
    throw new Error('Method must be implemented by subclass');
  }

  /**
   * Add hotel to destination
   * @param {string} tripId
   * @param {string} destinationId
   * @param {HotelFormData} hotelData
   * @returns {Promise<Hotel | null>}
   */
  async addHotel(tripId, destinationId, hotelData) {
    throw new Error('Method must be implemented by subclass');
  }

  /**
   * Update hotel
   * @param {string} tripId
   * @param {string} destinationId
   * @param {string} hotelId
   * @param {Partial<HotelFormData>} hotelData
   * @returns {Promise<Hotel | null>}
   */
  async updateHotel(tripId, destinationId, hotelId, hotelData) {
    throw new Error('Method must be implemented by subclass');
  }

  /**
   * Delete hotel
   * @param {string} tripId
   * @param {string} destinationId
   * @param {string} hotelId
   * @returns {Promise<boolean>}
   */
  async deleteHotel(tripId, destinationId, hotelId) {
    throw new Error('Method must be implemented by subclass');
  }

  /**
   * Initialize sample data
   * @returns {Promise<void>}
   */
  async initializeSampleData() {
    throw new Error('Method must be implemented by subclass');
  }

  /**
   * Save AI-generated trip
   * @param {TripFormData & { destinations?: DestinationFormData[] }} tripData
   * @returns {Promise<Trip>}
   */
  async saveAIGeneratedTrip(tripData) {
    throw new Error('Method must be implemented by subclass');
  }
}