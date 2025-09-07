import { geminiService } from '../services/GeminiService';

// Mock the Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockResolvedValue('Mock AI response')
        }
      })
    })
  }))
}));

// Mock the trip service
jest.mock('../services/TripService', () => ({
  tripService: {
    saveAIGeneratedTrip: jest.fn().mockResolvedValue({
      id: 'saved-trip-1',
      name: 'AI Generated Trip',
      startDate: '2024-08-01',
      endDate: '2024-08-10',
      status: 'planned',
      destinations: []
    })
  }
}));

describe('GeminiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.REACT_APP_GEMINI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.REACT_APP_GEMINI_API_KEY;
  });

  describe('Basic AI Operations', () => {
    test('can generate trip plan', async () => {
      const prompt = 'Plan a trip to Paris for 5 days';
      const result = await geminiService.generateTripPlan(prompt);
      
      expect(result).toBe('Mock AI response');
    });

    test('can generate destination recommendations', async () => {
      const result = await geminiService.generateDestinationRecommendations(
        'Paris',
        5,
        ['culture', 'food']
      );
      
      expect(result).toBe('Mock AI response');
    });

    test('can generate hotel recommendations', async () => {
      const result = await geminiService.generateHotelRecommendations('Paris', 'luxury');
      
      expect(result).toBe('Mock AI response');
    });

    test('can generate activities recommendations', async () => {
      const result = await geminiService.generateActivitiesRecommendations(
        'Paris',
        ['museums', 'art']
      );
      
      expect(result).toBe('Mock AI response');
    });
  });

  describe('Structured Trip Planning', () => {
    test('can generate structured trip plan', async () => {
      // Mock the AI response to return valid JSON
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockResolvedValue(JSON.stringify({
              tripName: 'Amazing Paris Adventure',
              destinations: [
                {
                  name: 'Paris',
                  location: 'Paris, France',
                  latitude: 48.8566,
                  longitude: 2.3522
                }
              ]
            }))
          }
        })
      };
      
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => mockModel
      }));

      const result = await geminiService.generateStructuredTripPlan(
        'Paris',
        5,
        '2024-08-01',
        ['culture']
      );

      expect(result).toMatchObject({
        tripName: 'Amazing Paris Adventure',
        startDate: '2024-08-01',
        endDate: '2024-08-05',
        destinations: [
          {
            name: 'Paris',
            location: 'Paris, France',
            latitude: 48.8566,
            longitude: 2.3522
          }
        ]
      });
    });

    test('uses fallback when AI response is invalid', async () => {
      // Mock the AI response to return invalid JSON
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockResolvedValue('Invalid JSON response')
          }
        })
      };
      
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => mockModel
      }));

      const result = await geminiService.generateStructuredTripPlan(
        'Rome',
        3,
        '2024-09-01',
        ['history']
      );

      expect(result).toMatchObject({
        tripName: '3-Day Adventure in Rome',
        startDate: '2024-09-01',
        endDate: '2024-09-03',
        destinations: [
          {
            name: 'Rome',
            location: 'Rome'
          }
        ]
      });
    });

    test('uses fallback when AI is not configured', async () => {
      // Temporarily remove API key
      delete process.env.REACT_APP_GEMINI_API_KEY;
      
      // Create new service instance without API key
      const { GeminiService } = require('../services/GeminiService');
      const unconfiguredService = new (class extends GeminiService {
        constructor() {
          super();
        }
      })();

      const result = await unconfiguredService.generateStructuredTripPlan(
        'Tokyo',
        7,
        '2024-10-01',
        ['technology']
      );

      expect(result).toMatchObject({
        tripName: '7-Day Adventure in Tokyo',
        startDate: '2024-10-01',
        endDate: '2024-10-07',
        destinations: [
          {
            name: 'Tokyo',
            location: 'Tokyo'
          }
        ]
      });
    });
  });

  describe('AI Trip Generation and Saving', () => {
    test('can generate and save trip when approved', async () => {
      const { tripService } = require('../services/TripService');
      
      const result = await geminiService.generateAndSaveTrip(
        'Barcelona',
        4,
        '2024-07-15',
        ['architecture', 'beaches'],
        true // approved
      );

      expect(result.suggestion).toBeDefined();
      expect(result.saved).toBeDefined();
      expect(tripService.saveAIGeneratedTrip).toHaveBeenCalled();
    });

    test('does not save trip when not approved', async () => {
      const { tripService } = require('../services/TripService');
      
      const result = await geminiService.generateAndSaveTrip(
        'Barcelona',
        4,
        '2024-07-15',
        ['architecture', 'beaches'],
        false // not approved
      );

      expect(result.suggestion).toBeDefined();
      expect(result.saved).toBeUndefined();
      expect(tripService.saveAIGeneratedTrip).not.toHaveBeenCalled();
    });

    test('handles save errors gracefully', async () => {
      const { tripService } = require('../services/TripService');
      
      // Mock save to throw an error
      tripService.saveAIGeneratedTrip.mockRejectedValueOnce(new Error('Save failed'));

      const result = await geminiService.generateAndSaveTrip(
        'Barcelona',
        4,
        '2024-07-15',
        ['architecture', 'beaches'],
        true // approved
      );

      expect(result.suggestion).toBeDefined();
      expect(result.saved).toBeUndefined();
    });
  });

  describe('Configuration and Error Handling', () => {
    test('isConfigured returns false when API key is not set', () => {
      delete process.env.REACT_APP_GEMINI_API_KEY;
      
      // Create new service instance without API key
      const { GeminiService } = require('../services/GeminiService');
      const unconfiguredService = new (class extends GeminiService {
        constructor() {
          super();
        }
      })();

      expect(unconfiguredService.isConfigured()).toBe(false);
    });

    test('isConfigured returns false when API key is placeholder', () => {
      process.env.REACT_APP_GEMINI_API_KEY = 'your_gemini_api_key_here';
      
      // Create new service instance with placeholder API key
      const { GeminiService } = require('../services/GeminiService');
      const unconfiguredService = new (class extends GeminiService {
        constructor() {
          super();
        }
      })();

      expect(unconfiguredService.isConfigured()).toBe(false);
    });

    test('throws error when generating trip plan without API key', async () => {
      delete process.env.REACT_APP_GEMINI_API_KEY;
      
      // Create new service instance without API key
      const { GeminiService } = require('../services/GeminiService');
      const unconfiguredService = new (class extends GeminiService {
        constructor() {
          super();
        }
      })();

      await expect(
        unconfiguredService.generateTripPlan('Test prompt')
      ).rejects.toThrow('Gemini API is not configured');
    });

    test('handles API errors gracefully', async () => {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockModel = {
        generateContent: jest.fn().mockRejectedValue(new Error('API Error'))
      };
      
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => mockModel
      }));

      await expect(
        geminiService.generateTripPlan('Test prompt')
      ).rejects.toThrow('Failed to generate trip plan');
    });
  });

  describe('Integration with Trip Service', () => {
    test('correctly formats trip data for saving', async () => {
      const { tripService } = require('../services/TripService');
      
      await geminiService.generateAndSaveTrip(
        'Madrid',
        6,
        '2024-11-01',
        ['art', 'food'],
        true
      );

      const callArgs = tripService.saveAIGeneratedTrip.mock.calls[0][0];
      
      expect(callArgs).toMatchObject({
        name: expect.any(String),
        startDate: '2024-11-01',
        endDate: expect.any(String),
        status: 'planned'
      });
      
      if (callArgs.destinations) {
        expect(Array.isArray(callArgs.destinations)).toBe(true);
      }
    });
  });
});