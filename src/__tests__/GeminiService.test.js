import { geminiService } from '../services/GeminiService';

// Mock the Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => 'Mock AI response'
        }
      })
    })
  }))
}));

// Mock the trip service
jest.mock('../services/TripService', () => ({
  tripService: {
    saveAIGeneratedTrip: jest.fn().mockResolvedValue({
      id: 'mock-trip-id',
      name: 'Mock Trip',
      startDate: '2024-01-01',
      endDate: '2024-01-07',
      status: 'planned',
      destinations: []
    })
  }
}));

describe('GeminiService', () => {
  beforeEach(() => {
    // Mock environment variable
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
        ['culture', 'food']
      );
      
      expect(result).toBe('Mock AI response');
    });
  });

  describe('Structured Trip Planning', () => {
    test('can generate structured trip plan', async () => {
      const result = await geminiService.generateStructuredTripPlan(
        'Paris',
        5,
        '2024-08-01',
        ['culture', 'food']
      );

      expect(result).toMatchObject({
        tripName: expect.any(String),
        startDate: '2024-08-01',
        endDate: expect.any(String),
        destinations: expect.any(Array)
      });
    });

    test('uses fallback when AI is not configured', async () => {
      // Temporarily remove API key
      delete process.env.REACT_APP_GEMINI_API_KEY;
      
      const result = await geminiService.generateStructuredTripPlan(
        'Tokyo',
        7,
        '2024-10-01',
        ['technology', 'anime']
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
  });

  describe('Error Handling', () => {
    test('throws error when API is not configured', async () => {
      delete process.env.REACT_APP_GEMINI_API_KEY;
      
      await expect(
        geminiService.generateTripPlan('Test prompt')
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
});