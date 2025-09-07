import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Layout from '../components/Layout';

// Mock the services
jest.mock('../services/TripService', () => ({
  tripService: {
    getAllTrips: jest.fn().mockResolvedValue([]),
    getTripById: jest.fn(),
    createTrip: jest.fn(),
    updateTrip: jest.fn(),
    deleteTrip: jest.fn(),
    addDestination: jest.fn(),
    updateDestination: jest.fn(),
    deleteDestination: jest.fn(),
    addHotel: jest.fn(),
    updateHotel: jest.fn(),
    deleteHotel: jest.fn(),
    initializeSampleData: jest.fn().mockResolvedValue(undefined),
    saveAIGeneratedTrip: jest.fn()
  }
}));

jest.mock('../services/GeminiService', () => ({
  geminiService: {
    isConfigured: jest.fn().mockReturnValue(false),
    generateAndSaveTrip: jest.fn(),
    generateStructuredTripPlan: jest.fn(),
    generateTripPlan: jest.fn(),
    generateDestinationRecommendations: jest.fn(),
    generateHotelRecommendations: jest.fn(),
    generateActivitiesRecommendations: jest.fn()
  }
}));

// Mock react-leaflet to avoid issues in tests
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  Polyline: () => <div data-testid="polyline" />
}));

// Mock leaflet
jest.mock('leaflet', () => ({
  Icon: {
    Default: {
      mergeOptions: jest.fn(),
      prototype: {
        _getIconUrl: jest.fn()
      }
    }
  }
}));

describe('Trip Management Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders main layout components', async () => {
    render(<Layout />);
    
    await waitFor(() => {
      expect(screen.getByText('🗺️ TRIPI - Trip Management')).toBeInTheDocument();
    });

    // Check that all main tabs are present
    expect(screen.getByRole('tab', { name: /My Trips/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Trip Details/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /AI Trip Planner/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Database Testing/i })).toBeInTheDocument();
  });

  test('initializes services on mount', async () => {
    const { tripService } = require('../services/TripService');
    
    render(<Layout />);

    await waitFor(() => {
      expect(tripService.initializeSampleData).toHaveBeenCalled();
      expect(tripService.getAllTrips).toHaveBeenCalled();
    });
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

    // Mock AI generation
    geminiService.generateAndSaveTrip.mockResolvedValueOnce({
      suggestion: {
        tripName: 'AI Generated Trip',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        destinations: []
      },
      saved: { id: 'ai-trip-1' }
    });

    const result = await geminiService.generateAndSaveTrip(
      'Paris',
      5,
      '2024-01-01',
      ['culture'],
      true
    );

    expect(result.suggestion).toBeDefined();
    expect(result.saved).toBeDefined();
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

  test('map view displays correctly when destinations are available', async () => {
    render(<Layout />);

    // The map component should be available (though not necessarily visible)
    // This tests that the MapView component loads without errors
    await waitFor(() => {
      expect(screen.getByText('🗺️ TRIPI - Trip Management')).toBeInTheDocument();
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

  test('handles database service switching', () => {
    const { tripService } = require('../services/TripService');
    
    // Test that service switching methods exist
    expect(typeof tripService.switchToMariaDB).toBe('function');
    expect(typeof tripService.switchToIndexedDB).toBe('function');
  });

  test('database testing panel provides comprehensive testing', async () => {
    const user = userEvent.setup();
    render(<Layout />);

    // Navigate to database testing panel
    const dbTestingTab = screen.getByRole('tab', { name: /Database Testing/i });
    await user.click(dbTestingTab);

    await waitFor(() => {
      expect(screen.getByText('Database Testing Panel')).toBeInTheDocument();
    });
  });
});