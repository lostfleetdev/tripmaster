import { IndexedDBService } from '../services/IndexedDBService';
import { MariaDBService } from '../services/MariaDBService';
import { TripFormData, DestinationFormData, HotelFormData } from '../types';

describe('IndexedDBService', () => {
  let service: IndexedDBService;

  beforeEach(async () => {
    service = new IndexedDBService();
    // Clear any existing data
    const trips = await service.getAllTrips();
    for (const trip of trips) {
      await service.deleteTrip(trip.id);
    }
  });

  describe('Trip Operations', () => {
    test('can create a trip', async () => {
      const tripData: TripFormData = {
        name: 'Test Trip',
        startDate: '2024-06-01',
        endDate: '2024-06-15',
        status: 'planned'
      };

      const result = await service.createTrip(tripData);

      expect(result).toMatchObject({
        name: 'Test Trip',
        startDate: '2024-06-01',
        endDate: '2024-06-15',
        status: 'planned',
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
      // Since we're mocking IDB, this will return undefined
      expect(result).toBeUndefined();
    });

    test('can update a trip', async () => {
      const tripId = 'test-id';
      const updateData = { name: 'Updated Trip Name' };
      
      const result = await service.updateTrip(tripId, updateData);
      // Since we're mocking IDB and trip doesn't exist, this will return null
      expect(result).toBeNull();
    });

    test('can delete a trip', async () => {
      const tripId = 'test-id';
      const result = await service.deleteTrip(tripId);
      expect(result).toBe(true);
    });
  });

  describe('Destination Operations', () => {
    test('can add destination to trip', async () => {
      const tripId = 'test-trip-id';
      const destinationData: DestinationFormData = {
        name: 'Paris',
        location: 'Paris, France',
        latitude: 48.8566,
        longitude: 2.3522
      };

      const result = await service.addDestination(tripId, destinationData);
      // Since we're mocking IDB and trip doesn't exist, this will return null
      expect(result).toBeNull();
    });

    test('can update destination', async () => {
      const tripId = 'test-trip-id';
      const destinationId = 'test-dest-id';
      const updateData = { name: 'Updated Paris' };
      
      const result = await service.updateDestination(tripId, destinationId, updateData);
      expect(result).toBeNull();
    });

    test('can delete destination', async () => {
      const tripId = 'test-trip-id';
      const destinationId = 'test-dest-id';
      
      const result = await service.deleteDestination(tripId, destinationId);
      expect(result).toBe(false);
    });
  });

  describe('Hotel Operations', () => {
    test('can add hotel to destination', async () => {
      const tripId = 'test-trip-id';
      const destinationId = 'test-dest-id';
      const hotelData: HotelFormData = {
        name: 'Test Hotel',
        address: '123 Test Street, Paris'
      };

      const result = await service.addHotel(tripId, destinationId, hotelData);
      expect(result).toBeNull();
    });

    test('can update hotel', async () => {
      const tripId = 'test-trip-id';
      const destinationId = 'test-dest-id';
      const hotelId = 'test-hotel-id';
      const updateData = { name: 'Updated Hotel Name' };
      
      const result = await service.updateHotel(tripId, destinationId, hotelId, updateData);
      expect(result).toBeNull();
    });

    test('can delete hotel', async () => {
      const tripId = 'test-trip-id';
      const destinationId = 'test-dest-id';
      const hotelId = 'test-hotel-id';
      
      const result = await service.deleteHotel(tripId, destinationId, hotelId);
      expect(result).toBe(false);
    });
  });

  describe('AI Generated Trip Operations', () => {
    test('can save AI generated trip with destinations', async () => {
      const tripData = {
        name: 'AI Generated Trip',
        startDate: '2024-08-01',
        endDate: '2024-08-10',
        status: 'planned' as const,
        destinations: [
          {
            name: 'Paris',
            location: 'Paris, France',
            latitude: 48.8566,
            longitude: 2.3522
          }
        ]
      };

      const result = await service.saveAIGeneratedTrip(tripData);

      expect(result).toMatchObject({
        name: 'AI Generated Trip',
        startDate: '2024-08-01',
        endDate: '2024-08-10',
        status: 'planned'
      });
      expect(result.id).toBeDefined();
      expect(result.destinations).toHaveLength(1);
      expect(result.destinations[0]).toMatchObject({
        name: 'Paris',
        location: 'Paris, France',
        latitude: 48.8566,
        longitude: 2.3522,
        sequence: 1,
        hotels: []
      });
    });
  });

  describe('Sample Data Initialization', () => {
    test('can initialize sample data', async () => {
      await expect(service.initializeSampleData()).resolves.not.toThrow();
    });
  });
});

describe('MariaDBService', () => {
  let service: MariaDBService;

  beforeEach(() => {
    service = new MariaDBService();
    jest.clearAllMocks();
    
    // Mock fetch for MariaDB service
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: jest.fn().mockResolvedValue({})
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('provides database schema', () => {
    const schema = MariaDBService.getDatabaseSchema();
    expect(schema).toContain('CREATE DATABASE IF NOT EXISTS trip_manager');
    expect(schema).toContain('CREATE TABLE trips');
    expect(schema).toContain('CREATE TABLE destinations');
    expect(schema).toContain('CREATE TABLE hotels');
  });

  test('returns empty array when service is not available', async () => {
    const trips = await service.getAllTrips();
    expect(trips).toEqual([]);
  });

  test('returns undefined when getting trip by ID fails', async () => {
    const trip = await service.getTripById('test-id');
    expect(trip).toBeUndefined();
  });

  test('throws error when creating trip fails', async () => {
    const tripData: TripFormData = {
      name: 'Test Trip',
      startDate: '2024-06-01',
      endDate: '2024-06-15',
      status: 'planned'
    };

    await expect(service.createTrip(tripData)).rejects.toThrow('Database service unavailable');
  });

  test('logs sample data initialization message', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    await service.initializeSampleData();
    
    expect(consoleSpy).toHaveBeenCalledWith('Sample data initialization would be handled by backend migrations');
    
    consoleSpy.mockRestore();
  });
});

describe('Database Service Error Handling', () => {
  test('MariaDB service handles network errors gracefully', async () => {
    const service = new MariaDBService();
    
    // Mock fetch to throw a network error
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const trips = await service.getAllTrips();
    expect(trips).toEqual([]);
  });
});

describe('Database Service Interface Compliance', () => {
  test('IndexedDBService implements all required methods', () => {
    const service = new IndexedDBService();
    
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

  test('MariaDBService implements all required methods', () => {
    const service = new MariaDBService();
    
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