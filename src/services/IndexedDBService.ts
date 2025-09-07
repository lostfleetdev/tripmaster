import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Trip, Destination, Hotel, TripFormData, DestinationFormData, HotelFormData } from '../types';
import { BaseDatabaseService } from './DatabaseService';

interface TripDB extends DBSchema {
  trips: {
    key: string;
    value: Trip;
  };
}

export class IndexedDBService extends BaseDatabaseService {
  private db: IDBPDatabase<TripDB> | null = null;
  private readonly DB_NAME = 'TripiDB';
  private readonly DB_VERSION = 1;

  private async getDB(): Promise<IDBPDatabase<TripDB>> {
    if (!this.db) {
      this.db = await openDB<TripDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Create trips store
          if (!db.objectStoreNames.contains('trips')) {
            db.createObjectStore('trips', { keyPath: 'id' });
          }
        },
      });
    }
    return this.db;
  }

  async getAllTrips(): Promise<Trip[]> {
    try {
      const db = await this.getDB();
      const trips = await db.getAll('trips');
      // Ensure all trips have destinations array initialized
      return trips.map(trip => ({
        ...trip,
        destinations: trip.destinations || []
      }));
    } catch (error) {
      console.error('Error getting all trips from IndexedDB:', error);
      return [];
    }
  }

  async getTripById(id: string): Promise<Trip | undefined> {
    try {
      const db = await this.getDB();
      const trip = await db.get('trips', id);
      if (trip) {
        // Ensure destinations array is initialized
        return {
          ...trip,
          destinations: trip.destinations || []
        };
      }
      return trip;
    } catch (error) {
      console.error('Error getting trip by ID from IndexedDB:', error);
      return undefined;
    }
  }

  async createTrip(tripData: TripFormData): Promise<Trip> {
    const trip: Trip = {
      id: this.generateId(),
      ...tripData,
      destinations: []
    };

    try {
      const db = await this.getDB();
      await db.put('trips', trip);
      return trip;
    } catch (error) {
      console.error('Error creating trip in IndexedDB:', error);
      throw error;
    }
  }

  async updateTrip(id: string, tripData: Partial<TripFormData>): Promise<Trip | null> {
    try {
      const db = await this.getDB();
      const existingTrip = await db.get('trips', id);
      
      if (!existingTrip) return null;

      const updatedTrip = { ...existingTrip, ...tripData };
      await db.put('trips', updatedTrip);
      return updatedTrip;
    } catch (error) {
      console.error('Error updating trip in IndexedDB:', error);
      return null;
    }
  }

  async deleteTrip(id: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      await db.delete('trips', id);
      return true;
    } catch (error) {
      console.error('Error deleting trip from IndexedDB:', error);
      return false;
    }
  }

  async addDestination(tripId: string, destinationData: DestinationFormData): Promise<Destination | null> {
    try {
      const db = await this.getDB();
      const trip = await db.get('trips', tripId);
      
      if (!trip) return null;

      const destination: Destination = {
        id: this.generateId(),
        tripId,
        ...destinationData,
        sequence: trip.destinations.length + 1,
        hotels: []
      };

      trip.destinations.push(destination);
      await db.put('trips', trip);
      return destination;
    } catch (error) {
      console.error('Error adding destination to IndexedDB:', error);
      return null;
    }
  }

  async updateDestination(tripId: string, destinationId: string, destinationData: Partial<DestinationFormData>): Promise<Destination | null> {
    try {
      const db = await this.getDB();
      const trip = await db.get('trips', tripId);
      
      if (!trip) return null;

      const destinationIndex = trip.destinations.findIndex(d => d.id === destinationId);
      if (destinationIndex === -1) return null;

      trip.destinations[destinationIndex] = { ...trip.destinations[destinationIndex], ...destinationData };
      await db.put('trips', trip);
      return trip.destinations[destinationIndex];
    } catch (error) {
      console.error('Error updating destination in IndexedDB:', error);
      return null;
    }
  }

  async deleteDestination(tripId: string, destinationId: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      const trip = await db.get('trips', tripId);
      
      if (!trip) return false;

      const destinationIndex = trip.destinations.findIndex(d => d.id === destinationId);
      if (destinationIndex === -1) return false;

      trip.destinations.splice(destinationIndex, 1);
      
      // Update sequence numbers
      trip.destinations.forEach((dest, index) => {
        dest.sequence = index + 1;
      });

      await db.put('trips', trip);
      return true;
    } catch (error) {
      console.error('Error deleting destination from IndexedDB:', error);
      return false;
    }
  }

  async addHotel(tripId: string, destinationId: string, hotelData: HotelFormData): Promise<Hotel | null> {
    try {
      const db = await this.getDB();
      const trip = await db.get('trips', tripId);
      
      if (!trip) return null;

      const destination = trip.destinations.find(d => d.id === destinationId);
      if (!destination) return null;

      const hotel: Hotel = {
        id: this.generateId(),
        destinationId,
        ...hotelData
      };

      destination.hotels.push(hotel);
      await db.put('trips', trip);
      return hotel;
    } catch (error) {
      console.error('Error adding hotel to IndexedDB:', error);
      return null;
    }
  }

  async updateHotel(tripId: string, destinationId: string, hotelId: string, hotelData: Partial<HotelFormData>): Promise<Hotel | null> {
    try {
      const db = await this.getDB();
      const trip = await db.get('trips', tripId);
      
      if (!trip) return null;

      const destination = trip.destinations.find(d => d.id === destinationId);
      if (!destination) return null;

      const hotelIndex = destination.hotels.findIndex(h => h.id === hotelId);
      if (hotelIndex === -1) return null;

      destination.hotels[hotelIndex] = { ...destination.hotels[hotelIndex], ...hotelData };
      await db.put('trips', trip);
      return destination.hotels[hotelIndex];
    } catch (error) {
      console.error('Error updating hotel in IndexedDB:', error);
      return null;
    }
  }

  async deleteHotel(tripId: string, destinationId: string, hotelId: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      const trip = await db.get('trips', tripId);
      
      if (!trip) return false;

      const destination = trip.destinations.find(d => d.id === destinationId);
      if (!destination) return false;

      const hotelIndex = destination.hotels.findIndex(h => h.id === hotelId);
      if (hotelIndex === -1) return false;

      destination.hotels.splice(hotelIndex, 1);
      await db.put('trips', trip);
      return true;
    } catch (error) {
      console.error('Error deleting hotel from IndexedDB:', error);
      return false;
    }
  }

  async initializeSampleData(): Promise<void> {
    try {
      const existingTrips = await this.getAllTrips();
      if (existingTrips.length === 0) {
        const sampleTrips: Trip[] = [
          {
            id: this.generateId(),
            name: "European Adventure",
            startDate: "2024-06-01",
            endDate: "2024-06-15",
            status: "planned",
            destinations: [
              {
                id: this.generateId(),
                tripId: "",
                name: "Paris",
                location: "Paris, France",
                latitude: 48.8566,
                longitude: 2.3522,
                sequence: 1,
                hotels: [
                  {
                    id: this.generateId(),
                    name: "Hotel de la Paix",
                    address: "123 Rue de Rivoli, Paris",
                    destinationId: ""
                  }
                ]
              },
              {
                id: this.generateId(),
                tripId: "",
                name: "Rome",
                location: "Rome, Italy",
                latitude: 41.9028,
                longitude: 12.4964,
                sequence: 2,
                hotels: [
                  {
                    id: this.generateId(),
                    name: "Hotel Artemide",
                    address: "Via Nazionale, 22, Rome",
                    destinationId: ""
                  }
                ]
              }
            ]
          }
        ];

        // Fix the IDs to match the relationships
        for (const trip of sampleTrips) {
          for (const destination of trip.destinations) {
            destination.tripId = trip.id;
            for (const hotel of destination.hotels) {
              hotel.destinationId = destination.id;
            }
          }
          
          const db = await this.getDB();
          await db.put('trips', trip);
        }
      }
    } catch (error) {
      console.error('Error initializing sample data in IndexedDB:', error);
    }
  }

  async saveAIGeneratedTrip(tripData: TripFormData & { destinations?: DestinationFormData[] }): Promise<Trip> {
    const { destinations, ...basicTripData } = tripData;
    
    const trip: Trip = {
      id: this.generateId(),
      ...basicTripData,
      destinations: []
    };

    // Add destinations if provided
    if (destinations) {
      trip.destinations = destinations.map((destData, index) => ({
        id: this.generateId(),
        tripId: trip.id,
        ...destData,
        sequence: index + 1,
        hotels: []
      }));
    }

    try {
      const db = await this.getDB();
      await db.put('trips', trip);
      return trip;
    } catch (error) {
      console.error('Error saving AI generated trip to IndexedDB:', error);
      throw error;
    }
  }
}