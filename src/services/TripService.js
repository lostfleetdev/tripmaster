import { IndexedDBService } from './IndexedDBService.js';
import { MariaDBService } from './MariaDBService.js';

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
   * Get all trips
   * @returns {Promise<Trip[]>}
   */
  async getAllTrips() {
    return this.databaseService.getAllTrips();
  }

  /**
   * Get trip by ID
   * @param {string} id
   * @returns {Promise<Trip | undefined>}
   */
  async getTripById(id) {
    return this.databaseService.getTripById(id);
  }

  /**
   * Create a new trip
   * @param {TripFormData} tripData
   * @returns {Promise<Trip>}
   */
  async createTrip(tripData) {
    return this.databaseService.createTrip(tripData);
  }

  /**
   * Update a trip
   * @param {string} id
   * @param {Partial<TripFormData>} tripData
   * @returns {Promise<Trip | null>}
   */
  async updateTrip(id, tripData) {
    return this.databaseService.updateTrip(id, tripData);
  }

  /**
   * Delete a trip
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deleteTrip(id) {
    return this.databaseService.deleteTrip(id);
  }

  /**
   * Add destination to trip
   * @param {string} tripId
   * @param {DestinationFormData} destinationData
   * @returns {Promise<Destination | null>}
   */
  async addDestination(tripId, destinationData) {
    return this.databaseService.addDestination(tripId, destinationData);
  }

  /**
   * Update destination
   * @param {string} tripId
   * @param {string} destinationId
   * @param {Partial<DestinationFormData>} destinationData
   * @returns {Promise<Destination | null>}
   */
  async updateDestination(tripId, destinationId, destinationData) {
    return this.databaseService.updateDestination(tripId, destinationId, destinationData);
  }

  /**
   * Delete destination
   * @param {string} tripId
   * @param {string} destinationId
   * @returns {Promise<boolean>}
   */
  async deleteDestination(tripId, destinationId) {
    return this.databaseService.deleteDestination(tripId, destinationId);
  }

  /**
   * Add hotel to destination
   * @param {string} tripId
   * @param {string} destinationId
   * @param {HotelFormData} hotelData
   * @returns {Promise<Hotel | null>}
   */
  async addHotel(tripId, destinationId, hotelData) {
    return this.databaseService.addHotel(tripId, destinationId, hotelData);
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
    return this.databaseService.updateHotel(tripId, destinationId, hotelId, hotelData);
  }

  /**
   * Delete hotel
   * @param {string} tripId
   * @param {string} destinationId
   * @param {string} hotelId
   * @returns {Promise<boolean>}
   */
  async deleteHotel(tripId, destinationId, hotelId) {
    return this.databaseService.deleteHotel(tripId, destinationId, hotelId);
  }

  /**
   * Initialize sample data
   * @returns {Promise<void>}
   */
  async initializeSampleData() {
    return this.databaseService.initializeSampleData();
  }

  /**
   * Save AI-generated trip
   * @param {TripFormData & { destinations?: DestinationFormData[] }} tripData
   * @returns {Promise<Trip>}
   */
  async saveAIGeneratedTrip(tripData) {
    return this.databaseService.saveAIGeneratedTrip(tripData);
  }

  // Utility method to switch database implementations
  
  /**
   * Switch to MariaDB service
   */
  switchToMariaDB() {
    this.databaseService = new MariaDBService();
  }

  /**
   * Switch to IndexedDB service
   */
  switchToIndexedDB() {
    this.databaseService = new IndexedDBService();
  }
}

export const tripService = new TripService();