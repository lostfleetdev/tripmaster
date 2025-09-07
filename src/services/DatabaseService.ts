import { Trip, Destination, Hotel, TripFormData, DestinationFormData, HotelFormData } from '../types';

/**
 * Abstract interface for database operations
 * This allows switching between different database implementations (IndexedDB, MariaDB, etc.)
 */
export interface IDatabaseService {
  // Trip operations
  getAllTrips(): Promise<Trip[]>;
  getTripById(id: string): Promise<Trip | undefined>;
  createTrip(tripData: TripFormData): Promise<Trip>;
  updateTrip(id: string, tripData: Partial<TripFormData>): Promise<Trip | null>;
  deleteTrip(id: string): Promise<boolean>;

  // Destination operations
  addDestination(tripId: string, destinationData: DestinationFormData): Promise<Destination | null>;
  updateDestination(tripId: string, destinationId: string, destinationData: Partial<DestinationFormData>): Promise<Destination | null>;
  deleteDestination(tripId: string, destinationId: string): Promise<boolean>;

  // Hotel operations
  addHotel(tripId: string, destinationId: string, hotelData: HotelFormData): Promise<Hotel | null>;
  updateHotel(tripId: string, destinationId: string, hotelId: string, hotelData: Partial<HotelFormData>): Promise<Hotel | null>;
  deleteHotel(tripId: string, destinationId: string, hotelId: string): Promise<boolean>;

  // Initialization
  initializeSampleData(): Promise<void>;
  
  // AI-generated trip saving
  saveAIGeneratedTrip(tripData: TripFormData & { destinations?: DestinationFormData[] }): Promise<Trip>;
}

/**
 * Abstract base class with common utility methods
 */
export abstract class BaseDatabaseService implements IDatabaseService {
  protected generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  abstract getAllTrips(): Promise<Trip[]>;
  abstract getTripById(id: string): Promise<Trip | undefined>;
  abstract createTrip(tripData: TripFormData): Promise<Trip>;
  abstract updateTrip(id: string, tripData: Partial<TripFormData>): Promise<Trip | null>;
  abstract deleteTrip(id: string): Promise<boolean>;
  abstract addDestination(tripId: string, destinationData: DestinationFormData): Promise<Destination | null>;
  abstract updateDestination(tripId: string, destinationId: string, destinationData: Partial<DestinationFormData>): Promise<Destination | null>;
  abstract deleteDestination(tripId: string, destinationId: string): Promise<boolean>;
  abstract addHotel(tripId: string, destinationId: string, hotelData: HotelFormData): Promise<Hotel | null>;
  abstract updateHotel(tripId: string, destinationId: string, hotelId: string, hotelData: Partial<HotelFormData>): Promise<Hotel | null>;
  abstract deleteHotel(tripId: string, destinationId: string, hotelId: string): Promise<boolean>;
  abstract initializeSampleData(): Promise<void>;
  abstract saveAIGeneratedTrip(tripData: TripFormData & { destinations?: DestinationFormData[] }): Promise<Trip>;
}