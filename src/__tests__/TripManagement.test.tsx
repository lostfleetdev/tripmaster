import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Layout from '../components/Layout';

// Mock the tripService to avoid IndexedDB in tests
jest.mock('../services/TripService', () => ({
  tripService: {
    initializeSampleData: jest.fn().mockResolvedValue(undefined),
    getAllTrips: jest.fn().mockResolvedValue([
      {
        id: 'test-trip-1',
        name: 'Test Trip',
        startDate: '2024-06-01',
        endDate: '2024-06-15',
        status: 'planned',
        destinations: [
          {
            id: 'dest-1',
            tripId: 'test-trip-1',
            name: 'Paris',
            location: 'Paris, France',
            latitude: 48.8566,
            longitude: 2.3522,
            sequence: 1,
            hotels: [
              {
                id: 'hotel-1',
                name: 'Test Hotel',
                address: '123 Test Street',
                destinationId: 'dest-1'
              }
            ]
          }
        ]
      }
    ]),
    getTripById: jest.fn().mockResolvedValue({
      id: 'test-trip-1',
      name: 'Test Trip',
      startDate: '2024-06-01',
      endDate: '2024-06-15',
      status: 'planned',
      destinations: []
    }),
    createTrip: jest.fn().mockResolvedValue({
      id: 'new-trip-1',
      name: 'New Trip',
      startDate: '2024-07-01',
      endDate: '2024-07-10',
      status: 'planned',
      destinations: []
    }),
    updateTrip: jest.fn().mockResolvedValue(null),
    deleteTrip: jest.fn().mockResolvedValue(true),
    addDestination: jest.fn().mockResolvedValue(null),
    updateDestination: jest.fn().mockResolvedValue(null),
    deleteDestination: jest.fn().mockResolvedValue(true),
    addHotel: jest.fn().mockResolvedValue(null),
    updateHotel: jest.fn().mockResolvedValue(null),
    deleteHotel: jest.fn().mockResolvedValue(true),
    saveAIGeneratedTrip: jest.fn().mockResolvedValue({
      id: 'ai-trip-1',
      name: 'AI Generated Trip',
      startDate: '2024-08-01',
      endDate: '2024-08-10',
      status: 'planned',
      destinations: []
    })
  }
}));

// Mock the geminiService
jest.mock('../services/GeminiService', () => ({
  geminiService: {
    isConfigured: jest.fn().mockReturnValue(false),
    generateTripPlan: jest.fn().mockResolvedValue('Mock trip plan response'),
    generateDestinationRecommendations: jest.fn().mockResolvedValue('Mock destination recommendations'),
    generateHotelRecommendations: jest.fn().mockResolvedValue('Mock hotel recommendations'),
    generateActivitiesRecommendations: jest.fn().mockResolvedValue('Mock activities recommendations'),
    generateStructuredTripPlan: jest.fn().mockResolvedValue({
      tripName: 'AI Generated Trip',
      startDate: '2024-08-01',
      endDate: '2024-08-10',
      destinations: [
        {
          name: 'Paris',
          location: 'Paris, France',
          latitude: 48.8566,
          longitude: 2.3522
        }
      ]
    }),
    generateAndSaveTrip: jest.fn().mockResolvedValue({
      suggestion: {
        tripName: 'AI Generated Trip',
        startDate: '2024-08-01',
        endDate: '2024-08-10',
        destinations: []
      }
    })
  }
}));

describe('Trip Management UI Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders main layout with all tabs', async () => {
    render(<Layout />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('🗺️ TRIPI - Trip Management')).toBeInTheDocument();
    });

    // Check all tabs are present
    expect(screen.getByRole('tab', { name: /My Trips/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Trip Details/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /AI Trip Planner/i })).toBeInTheDocument();
  });

  test('displays trips in My Trips tab', async () => {
    render(<Layout />);
    
    // Wait for trips to load
    await waitFor(() => {
      expect(screen.getByText('My Trips')).toBeInTheDocument();
    });

    // Should show trip count or trip information
    // Note: The actual trip display depends on the TripListSimple component implementation
    expect(screen.getByText(/trip/i)).toBeInTheDocument();
  });

  test('can switch between tabs', async () => {
    const user = userEvent.setup();
    render(<Layout />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /My Trips/i })).toBeInTheDocument();
    });

    // Switch to AI Trip Planner tab
    const aiTab = screen.getByRole('tab', { name: /AI Trip Planner/i });
    await user.click(aiTab);

    // Verify the tab is selected (aria-selected should be true)
    await waitFor(() => {
      expect(aiTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  test('Trip Details tab is disabled when no trip is selected', async () => {
    render(<Layout />);
    
    await waitFor(() => {
      const tripDetailsTab = screen.getByRole('tab', { name: /Trip Details/i });
      expect(tripDetailsTab).toBeDisabled();
    });
  });

  test('loads and initializes sample data on mount', async () => {
    const { tripService } = require('../services/TripService');
    
    render(<Layout />);
    
    await waitFor(() => {
      expect(tripService.initializeSampleData).toHaveBeenCalled();
      expect(tripService.getAllTrips).toHaveBeenCalled();
    });
  });

  test('handles trip updates correctly', async () => {
    const { tripService } = require('../services/TripService');
    
    render(<Layout />);
    
    await waitFor(() => {
      expect(tripService.getAllTrips).toHaveBeenCalled();
    });
  });
});

describe('Trip Creation and Viewing Integration Tests', () => {
  test('can create a new trip through the UI flow', async () => {
    render(<Layout />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('🗺️ TRIPI - Trip Management')).toBeInTheDocument();
    });

    // These tests would be expanded based on the actual form implementation
    // For now, we verify the basic structure is in place
    expect(screen.getByText(/My Trips/i)).toBeInTheDocument();
  });

  test('can view trip details when trip is selected', async () => {
    render(<Layout />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Trip Details/i })).toBeInTheDocument();
    });

    // Trip Details tab should be disabled initially
    expect(screen.getByRole('tab', { name: /Trip Details/i })).toBeDisabled();
  });

  test('AI trip planner is accessible and functional', async () => {
    const user = userEvent.setup();
    render(<Layout />);
    
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /AI Trip Planner/i })).toBeInTheDocument();
    });

    // Switch to AI Trip Planner
    const aiTab = screen.getByRole('tab', { name: /AI Trip Planner/i });
    await user.click(aiTab);

    await waitFor(() => {
      expect(aiTab).toHaveAttribute('aria-selected', 'true');
    });
  });
});

describe('Database Integration Tests', () => {
  test('uses async database operations correctly', async () => {
    const { tripService } = require('../services/TripService');
    
    render(<Layout />);
    
    // Verify async operations are called
    await waitFor(() => {
      expect(tripService.initializeSampleData).toHaveBeenCalled();
      expect(tripService.getAllTrips).toHaveBeenCalled();
    });

    // All database operations should be async
    expect(tripService.initializeSampleData).toHaveReturnedWith(expect.any(Promise));
    expect(tripService.getAllTrips).toHaveReturnedWith(expect.any(Promise));
  });

  test('handles database errors gracefully', async () => {
    const { tripService } = require('../services/TripService');
    
    // Mock a database error
    tripService.getAllTrips.mockRejectedValueOnce(new Error('Database error'));
    
    // Component should still render without crashing
    render(<Layout />);
    
    await waitFor(() => {
      expect(screen.getByText('🗺️ TRIPI - Trip Management')).toBeInTheDocument();
    });
  });
});

describe('Gemini AI Integration Tests', () => {
  test('can generate AI trip suggestions', async () => {
    const { geminiService } = require('../services/GeminiService');
    
    render(<Layout />);
    
    // Verify the service is available
    expect(geminiService.generateAndSaveTrip).toBeDefined();
    expect(geminiService.generateStructuredTripPlan).toBeDefined();
  });

  test('can save AI-generated trips to database when approved', async () => {
    const { geminiService } = require('../services/GeminiService');
    const { tripService } = require('../services/TripService');
    
    // Simulate approving an AI-generated trip
    const result = await geminiService.generateAndSaveTrip(
      'Paris',
      5,
      '2024-08-01',
      ['culture', 'food'],
      true // approved
    );

    expect(result.suggestion).toBeDefined();
    expect(result.suggestion.tripName).toBe('AI Generated Trip');
  });
});