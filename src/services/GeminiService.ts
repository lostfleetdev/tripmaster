import { GoogleGenerativeAI } from '@google/generative-ai';
import { TripFormData, DestinationFormData } from '../types';
import { tripService } from './TripService';

interface AITripSuggestion {
  tripName: string;
  startDate: string;
  endDate: string;
  destinations: {
    name: string;
    location: string;
    latitude?: number;
    longitude?: number;
  }[];
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      } catch (error) {
        console.error('Failed to initialize Gemini API:', error);
      }
    }
  }

  isConfigured(): boolean {
    return this.model !== null;
  }

  async generateTripPlan(prompt: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API is not configured. Please set REACT_APP_GEMINI_API_KEY in your .env file.');
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating trip plan:', error);
      throw new Error('Failed to generate trip plan. Please try again.');
    }
  }

  async generateDestinationRecommendations(
    destination: string,
    duration: number,
    interests: string[] = []
  ): Promise<string> {
    const interestsText = interests.length > 0 ? ` with interests in ${interests.join(', ')}` : '';
    const prompt = `Plan a ${duration}-day trip to ${destination}${interestsText}. Include:
    1. Top attractions and must-see places
    2. Recommended hotels or accommodation areas
    3. Local cuisine and restaurants to try
    4. Transportation tips
    5. Daily itinerary suggestions
    
    Please format the response in a clear, organized manner.`;

    return this.generateTripPlan(prompt);
  }

  async generateHotelRecommendations(destination: string, budget: string = 'mid-range'): Promise<string> {
    const prompt = `Recommend ${budget} hotels in ${destination}. Include:
    1. Hotel names and brief descriptions
    2. Location advantages
    3. Key amenities
    4. Approximate price range
    5. Best booking tips
    
    Focus on well-reviewed properties with good locations.`;

    return this.generateTripPlan(prompt);
  }

  async generateActivitiesRecommendations(destination: string, interests: string[]): Promise<string> {
    const prompt = `Suggest activities and experiences in ${destination} for someone interested in ${interests.join(', ')}. Include:
    1. Specific activities and attractions
    2. Unique local experiences
    3. Seasonal considerations
    4. Booking requirements
    5. Estimated time needed for each activity
    
    Prioritize authentic and memorable experiences.`;

    return this.generateTripPlan(prompt);
  }

  /**
   * Generate a structured trip plan that can be saved to the database
   */
  async generateStructuredTripPlan(
    destination: string,
    duration: number,
    startDate: string,
    interests: string[] = []
  ): Promise<AITripSuggestion> {
    const interestsText = interests.length > 0 ? ` with interests in ${interests.join(', ')}` : '';
    
    const prompt = `Create a structured trip plan for a ${duration}-day trip to ${destination}${interestsText} starting on ${startDate}. 
    
    Please respond in the following JSON format:
    {
      "tripName": "A catchy name for the trip",
      "destinations": [
        {
          "name": "Destination name",
          "location": "Full location description (e.g., Paris, France)",
          "latitude": 48.8566,
          "longitude": 2.3522
        }
      ]
    }
    
    Include the main destination and any nearby places worth visiting during the ${duration} days. Only respond with valid JSON.`;

    if (!this.model) {
      // Fallback for when API is not configured
      return this.generateFallbackTripPlan(destination, duration, startDate);
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up the response to ensure it's valid JSON
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      const jsonString = text.slice(jsonStart, jsonEnd);
      
      const parsed = JSON.parse(jsonString);
      
      // Calculate end date
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + duration - 1);
      
      return {
        tripName: parsed.tripName || `Trip to ${destination}`,
        startDate,
        endDate: end.toISOString().split('T')[0],
        destinations: parsed.destinations || [{
          name: destination,
          location: destination,
          latitude: 0,
          longitude: 0
        }]
      };
    } catch (error) {
      console.error('Error parsing AI response, using fallback:', error);
      return this.generateFallbackTripPlan(destination, duration, startDate);
    }
  }

  /**
   * Fallback trip plan generation when AI is not available
   */
  private generateFallbackTripPlan(destination: string, duration: number, startDate: string): AITripSuggestion {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);

    return {
      tripName: `${duration}-Day Adventure in ${destination}`,
      startDate,
      endDate: end.toISOString().split('T')[0],
      destinations: [{
        name: destination,
        location: destination,
        latitude: 0,
        longitude: 0
      }]
    };
  }

  /**
   * Generate and save an AI trip plan to the database when approved by user
   */
  async generateAndSaveTrip(
    destination: string,
    duration: number,
    startDate: string,
    interests: string[] = [],
    approved: boolean = false
  ): Promise<{ suggestion: AITripSuggestion; saved?: any }> {
    const suggestion = await this.generateStructuredTripPlan(destination, duration, startDate, interests);
    
    if (approved) {
      try {
        // Convert AI suggestion to trip data format
        const tripData: TripFormData & { destinations?: DestinationFormData[] } = {
          name: suggestion.tripName,
          startDate: suggestion.startDate,
          endDate: suggestion.endDate,
          status: 'planned' as const,
          destinations: suggestion.destinations.map(dest => ({
            name: dest.name,
            location: dest.location,
            latitude: dest.latitude || 0,
            longitude: dest.longitude || 0
          }))
        };

        const savedTrip = await tripService.saveAIGeneratedTrip(tripData);
        return { suggestion, saved: savedTrip };
      } catch (error) {
        console.error('Error saving AI-generated trip:', error);
        return { suggestion };
      }
    }

    return { suggestion };
  }
}

export const geminiService = new GeminiService();