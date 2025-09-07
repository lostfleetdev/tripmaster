import { Trip, Destination, Hotel, TripFormData, DestinationFormData, HotelFormData } from '../types';
import { IDatabaseService } from './DatabaseService';
import { IndexedDBService } from './IndexedDBService';
import { MariaDBService } from './MariaDBService';

/**
 * Trip service that acts as a facade over database operations
 * Uses IndexedDB by default with fallback capability
 */
class TripService {
  private databaseService: IDatabaseService;

  constructor() {
    // Use MariaDB by default when enabled, otherwise fall back to IndexedDB
    if (process.env.REACT_APP_USE_MARIADB === 'true') {
      this.databaseService = new MariaDBService();
    } else {
      this.databaseService = new IndexedDBService();
    }
  }

  // Delegate all operations to the underlying database service
  async getAllTrips(): Promise<Trip[]> {
    return this.databaseService.getAllTrips();
  }

  async getTripById(id: string): Promise<Trip | undefined> {
    return this.databaseService.getTripById(id);
  }

  async createTrip(tripData: TripFormData): Promise<Trip> {
    return this.databaseService.createTrip(tripData);
  }

  async updateTrip(id: string, tripData: Partial<TripFormData>): Promise<Trip | null> {
    return this.databaseService.updateTrip(id, tripData);
  }

  async deleteTrip(id: string): Promise<boolean> {
    return this.databaseService.deleteTrip(id);
  }

  async addDestination(tripId: string, destinationData: DestinationFormData): Promise<Destination | null> {
    return this.databaseService.addDestination(tripId, destinationData);
  }

  async updateDestination(tripId: string, destinationId: string, destinationData: Partial<DestinationFormData>): Promise<Destination | null> {
    return this.databaseService.updateDestination(tripId, destinationId, destinationData);
  }

  async deleteDestination(tripId: string, destinationId: string): Promise<boolean> {
    return this.databaseService.deleteDestination(tripId, destinationId);
  }

  async addHotel(tripId: string, destinationId: string, hotelData: HotelFormData): Promise<Hotel | null> {
    return this.databaseService.addHotel(tripId, destinationId, hotelData);
  }

  async updateHotel(tripId: string, destinationId: string, hotelId: string, hotelData: Partial<HotelFormData>): Promise<Hotel | null> {
    return this.databaseService.updateHotel(tripId, destinationId, hotelId, hotelData);
  }

  async deleteHotel(tripId: string, destinationId: string, hotelId: string): Promise<boolean> {
    return this.databaseService.deleteHotel(tripId, destinationId, hotelId);
  }

  async initializeSampleData(): Promise<void> {
    return this.databaseService.initializeSampleData();
  }

  async saveAIGeneratedTrip(tripData: TripFormData & { destinations?: DestinationFormData[] }): Promise<Trip> {
    return this.databaseService.saveAIGeneratedTrip(tripData);
  }

  // Utility method to switch database implementations
  switchToMariaDB(): void {
    this.databaseService = new MariaDBService();
  }

  switchToIndexedDB(): void {
    this.databaseService = new IndexedDBService();
  }
}

export const tripService = new TripService();