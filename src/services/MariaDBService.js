import { IDatabaseService } from './DatabaseService';

/**
 * MariaDB service implementation
 * Connects to local backend API that interfaces with MariaDB directly
 */
export class MariaDBService extends IDatabaseService {
  constructor() {
    super();
    this.apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  }

  /**
   * Make an HTTP request to the backend API
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request body data
   * @returns {Promise<Object>} Response data
   */
  async makeRequest(endpoint, method = 'GET', data = null) {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  async getAllTrips() {
    try {
      const trips = await this.makeRequest('/trips');
      // Ensure all trips have destinations array initialized
      return trips.map((trip) => ({
        ...trip,
        destinations: trip.destinations || []
      }));
    } catch (error) {
      console.warn('MariaDB service not available, returning empty array');
      return [];
    }
  }

  async getTripById(id) {
    try {
      const trip = await this.makeRequest(`/trips/${id}`);
      if (trip) {
        // Ensure destinations array is initialized
        return {
          ...trip,
          destinations: trip.destinations || []
        };
      }
      return trip;
    } catch (error) {
      console.warn('MariaDB service not available');
      return undefined;
    }
  }

  async createTrip(tripData) {
    try {
      return await this.makeRequest('/trips', 'POST', tripData);
    } catch (error) {
      console.error('MariaDB service not available');
      throw new Error('Database service unavailable');
    }
  }

  async updateTrip(id, tripData) {
    try {
      return await this.makeRequest(`/trips/${id}`, 'PUT', tripData);
    } catch (error) {
      console.warn('MariaDB service not available');
      return null;
    }
  }

  async deleteTrip(id) {
    try {
      await this.makeRequest(`/trips/${id}`, 'DELETE');
      return true;
    } catch (error) {
      console.warn('MariaDB service not available');
      return false;
    }
  }

  async addDestination(tripId, destinationData) {
    try {
      return await this.makeRequest(`/trips/${tripId}/destinations`, 'POST', destinationData);
    } catch (error) {
      console.warn('MariaDB service not available');
      return null;
    }
  }

  async updateDestination(tripId, destinationId, destinationData) {
    try {
      return await this.makeRequest(`/trips/${tripId}/destinations/${destinationId}`, 'PUT', destinationData);
    } catch (error) {
      console.warn('MariaDB service not available');
      return null;
    }
  }

  async deleteDestination(tripId, destinationId) {
    try {
      await this.makeRequest(`/trips/${tripId}/destinations/${destinationId}`, 'DELETE');
      return true;
    } catch (error) {
      console.warn('MariaDB service not available');
      return false;
    }
  }

  async addHotel(tripId, destinationId, hotelData) {
    try {
      return await this.makeRequest(`/trips/${tripId}/destinations/${destinationId}/hotels`, 'POST', hotelData);
    } catch (error) {
      console.warn('MariaDB service not available');
      return null;
    }
  }

  async updateHotel(tripId, destinationId, hotelId, hotelData) {
    try {
      return await this.makeRequest(`/trips/${tripId}/destinations/${destinationId}/hotels/${hotelId}`, 'PUT', hotelData);
    } catch (error) {
      console.warn('MariaDB service not available');
      return null;
    }
  }

  async deleteHotel(tripId, destinationId, hotelId) {
    try {
      await this.makeRequest(`/trips/${tripId}/destinations/${destinationId}/hotels/${hotelId}`, 'DELETE');
      return true;
    } catch (error) {
      console.warn('MariaDB service not available');
      return false;
    }
  }

  async initializeSampleData() {
    // Sample data initialization is handled by the backend
    console.log('Sample data initialization would be handled by backend migrations');
  }

  async saveAIGeneratedTrip(tripData) {
    try {
      return await this.makeRequest('/trips/ai-generated', 'POST', tripData);
    } catch (error) {
      console.error('MariaDB service not available');
      throw new Error('Database service unavailable');
    }
  }

  /**
   * Database schema creation SQL for reference
   * This would be executed on the backend
   * @returns {string} SQL schema creation script
   */
  static getDatabaseSchema() {
    return `
      CREATE DATABASE IF NOT EXISTS trip_manager;
      USE trip_manager;

      CREATE TABLE trips (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status ENUM('planned', 'in-progress', 'completed') NOT NULL DEFAULT 'planned',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      CREATE TABLE destinations (
        id VARCHAR(255) PRIMARY KEY,
        trip_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        sequence INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
      );

      CREATE TABLE hotels (
        id VARCHAR(255) PRIMARY KEY,
        destination_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_destinations_trip_id ON destinations(trip_id);
      CREATE INDEX idx_hotels_destination_id ON hotels(destination_id);
    `;
  }
}