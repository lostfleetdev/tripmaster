import { IndexedDBService } from '../services/IndexedDBService';
import { MariaDBService } from '../services/MariaDBService';
import { TRIP_STATUS, createEmptyTripFormData, createEmptyDestinationFormData, createEmptyHotelFormData } from '../types';

describe('IndexedDBService', () => {
  let service;

  beforeEach(async () => {
    service = new IndexedDBService();
    // Clear any existing data
    const trips = await service.getAllTrips();
    for (const trip of trips) {
      await service.deleteTrip(trip.id);
    }
  });

  describe('Service Interface', () => {
    test('implements all required methods', () => {
      // Check that all required methods exist
      expect(typeof service.getAllTrips).toBe('function');
      expect(typeof service.getTripById).toBe('function');
      expect(typeof service.createTrip).toBe('function');
      expect(typeof service.updateTrip).toBe('function');
      expect(typeof service.deleteTrip).toBe('function');
      expect(typeof service.addDestination).toBe('function');
      expect(typeof service.updateDestination).toBe('function');
      expect(typeof service.deleteDestination).toBe('function');
      expect(typeof service.addHotel).toBe('function');
      expect(typeof service.updateHotel).toBe('function');
      expect(typeof service.deleteHotel).toBe('function');
      expect(typeof service.initializeSampleData).toBe('function');
      expect(typeof service.saveAIGeneratedTrip).toBe('function');
    });
  });

  describe('Trip Operations', () => {
    test('can create a trip', async () => {
      const tripData = {
        name: 'Test Trip',
        startDate: '2024-06-01',
        endDate: '2024-06-15',
        status: TRIP_STATUS.PLANNED
      };

      const result = await service.createTrip(tripData);

      expect(result).toMatchObject({
        name: 'Test Trip',
        startDate: '2024-06-01',
        endDate: '2024-06-15',
        status: TRIP_STATUS.PLANNED,
        destinations: []
      });
      expect(result.id).toBeDefined();
    });

    test('can get all trips', async () => {
      const trips = await service.getAllTrips();
      expect(Array.isArray(trips)).toBe(true);
    });

    test('can get trip by ID', async () => {
      const tripId = 'test-id';
      const result = await service.getTripById(tripId);
      // Since we're using real IDB, this will return undefined for non-existent trip
      expect(result).toBeUndefined();
    });

    test('can update a trip', async () => {
      // First create a trip
      const tripData = createEmptyTripFormData();
      tripData.name = 'Original Trip';
      tripData.startDate = '2024-01-01';
      tripData.endDate = '2024-01-07';
      
      const createdTrip = await service.createTrip(tripData);
      
      // Then update it
      const updateData = { name: 'Updated Trip Name' };
      const result = await service.updateTrip(createdTrip.id, updateData);
      
      expect(result).toMatchObject({
        id: createdTrip.id,
        name: 'Updated Trip Name',
        startDate: '2024-01-01',
        endDate: '2024-01-07'
      });
    });

    test('can delete a trip', async () => {
      // First create a trip
      const tripData = createEmptyTripFormData();
      tripData.name = 'Trip to Delete';
      tripData.startDate = '2024-01-01';
      tripData.endDate = '2024-01-07';
      
      const createdTrip = await service.createTrip(tripData);
      
      // Then delete it
      const result = await service.deleteTrip(createdTrip.id);
      expect(result).toBe(true);
      
      // Verify it's gone
      const retrievedTrip = await service.getTripById(createdTrip.id);
      expect(retrievedTrip).toBeUndefined();
    });
  });

  describe('Destination Operations', () => {
    test('can add destination to trip', async () => {
      // First create a trip
      const tripData = createEmptyTripFormData();
      tripData.name = 'Trip with Destination';
      tripData.startDate = '2024-01-01';
      tripData.endDate = '2024-01-07';
      
      const trip = await service.createTrip(tripData);
      
      // Add destination
      const destinationData = createEmptyDestinationFormData();
      destinationData.name = 'Paris';
      destinationData.location = 'Paris, France';
      destinationData.latitude = 48.8566;
      destinationData.longitude = 2.3522;
      
      const result = await service.addDestination(trip.id, destinationData);
      
      expect(result).toMatchObject({
        name: 'Paris',
        location: 'Paris, France',
        latitude: 48.8566,
        longitude: 2.3522,
        tripId: trip.id,
        sequence: 1,
        hotels: []
      });
      expect(result.id).toBeDefined();
    });
  });

  describe('Hotel Operations', () => {
    test('can add hotel to destination', async () => {
      // Create trip and destination first
      const tripData = createEmptyTripFormData();
      tripData.name = 'Trip with Hotel';
      tripData.startDate = '2024-01-01';
      tripData.endDate = '2024-01-07';
      
      const trip = await service.createTrip(tripData);
      
      const destinationData = createEmptyDestinationFormData();
      destinationData.name = 'Paris';
      destinationData.location = 'Paris, France';
      
      const destination = await service.addDestination(trip.id, destinationData);
      
      // Add hotel
      const hotelData = createEmptyHotelFormData();
      hotelData.name = 'Test Hotel';
      hotelData.address = '123 Test Street';
      
      const result = await service.addHotel(trip.id, destination.id, hotelData);
      
      expect(result).toMatchObject({
        name: 'Test Hotel',
        address: '123 Test Street',
        destinationId: destination.id
      });
      expect(result.id).toBeDefined();
    });
  });

  describe('Sample Data Initialization', () => {
    test('can initialize sample data', async () => {
      await service.initializeSampleData();
      
      const trips = await service.getAllTrips();
      expect(trips.length).toBeGreaterThan(0);
      
      // Check that sample trip has proper structure
      const sampleTrip = trips[0];
      expect(sampleTrip.name).toBeDefined();
      expect(sampleTrip.startDate).toBeDefined();
      expect(sampleTrip.endDate).toBeDefined();
      expect(Array.isArray(sampleTrip.destinations)).toBe(true);
    });
  });
});

describe('MariaDBService', () => {
  let service;

  beforeEach(() => {
    service = new MariaDBService();
  });

  test('implements all required methods', () => {
    // Check that all required methods exist
    expect(typeof service.getAllTrips).toBe('function');
    expect(typeof service.getTripById).toBe('function');
    expect(typeof service.createTrip).toBe('function');
    expect(typeof service.updateTrip).toBe('function');
    expect(typeof service.deleteTrip).toBe('function');
    expect(typeof service.addDestination).toBe('function');
    expect(typeof service.updateDestination).toBe('function');
    expect(typeof service.deleteDestination).toBe('function');
    expect(typeof service.addHotel).toBe('function');
    expect(typeof service.updateHotel).toBe('function');
    expect(typeof service.deleteHotel).toBe('function');
    expect(typeof service.initializeSampleData).toBe('function');
    expect(typeof service.saveAIGeneratedTrip).toBe('function');
  });

  test('handles API unavailability gracefully', async () => {
    // Since there's no backend running, these should handle errors gracefully
    const trips = await service.getAllTrips();
    expect(Array.isArray(trips)).toBe(true);
    expect(trips.length).toBe(0); // Should return empty array when API unavailable
  });

  test('provides database schema', () => {
    const schema = MariaDBService.getDatabaseSchema();
    expect(typeof schema).toBe('string');
    expect(schema).toContain('CREATE DATABASE');
    expect(schema).toContain('CREATE TABLE trips');
    expect(schema).toContain('CREATE TABLE destinations');
    expect(schema).toContain('CREATE TABLE hotels');
  });
});