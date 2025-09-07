/**
 * Gemini AI Service for Trip Planning
 * Vanilla JavaScript implementation
 */

export class GeminiService {
    constructor() {
        this.genAI = null;
        this.model = null;
        this.apiKey = null;
        
        // Try to get API key from environment or local storage
        this.apiKey = this.getApiKey();
        if (this.apiKey && this.apiKey !== 'your_gemini_api_key_here') {
            this.initializeAPI();
        }
    }

    /**
     * Get API key from various sources
     */
    getApiKey() {
        // Check localStorage first (for demo/testing)
        const storedKey = localStorage.getItem('GEMINI_API_KEY');
        if (storedKey) return storedKey;
        
        // Check if running in development with environment variables
        if (typeof process !== 'undefined' && process.env) {
            return process.env.REACT_APP_GEMINI_API_KEY;
        }
        
        return null;
    }

    /**
     * Set API key manually
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        localStorage.setItem('GEMINI_API_KEY', apiKey);
        this.initializeAPI();
    }

    /**
     * Initialize Google Generative AI
     */
    async initializeAPI() {
        try {
            // For vanilla JS, we'll use the CDN version or mock the API
            // In a real implementation, you'd load the Google AI SDK
            console.log('Gemini API initialized (mock mode)');
            this.model = { configured: true }; // Mock model
        } catch (error) {
            console.error('Failed to initialize Gemini API:', error);
            this.model = null;
        }
    }

    /**
     * Check if API is configured
     */
    isConfigured() {
        return this.model !== null && this.apiKey !== null;
    }

    /**
     * Generate trip plan using AI
     */
    async generateTripPlan(prompt) {
        if (!this.model) {
            throw new Error('Gemini API is not configured. Please set your API key first.');
        }

        try {
            // Mock implementation for demo
            // In production, this would call the actual Gemini API
            return this.generateMockResponse(prompt);
        } catch (error) {
            console.error('Error generating trip plan:', error);
            throw new Error('Failed to generate trip plan. Please try again.');
        }
    }

    /**
     * Generate destination recommendations
     */
    async generateDestinationRecommendations(destination, duration, interests = []) {
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

    /**
     * Generate hotel recommendations
     */
    async generateHotelRecommendations(destination, budget = 'mid-range') {
        const prompt = `Recommend ${budget} hotels in ${destination}. Include:
1. Hotel names and brief descriptions
2. Location advantages
3. Key amenities
4. Approximate price range
5. Best booking tips

Focus on well-reviewed properties with good locations.`;

        return this.generateTripPlan(prompt);
    }

    /**
     * Generate activities recommendations
     */
    async generateActivitiesRecommendations(destination, interests) {
        const interestsText = interests.length > 0 ? ` focusing on ${interests.join(', ')}` : '';
        const prompt = `Suggest activities and experiences in ${destination}${interestsText}. Include:
1. Must-do activities and attractions
2. Hidden gems and local favorites
3. Cultural experiences
4. Outdoor activities (if applicable)
5. Entertainment and nightlife options
6. Family-friendly activities
7. Estimated costs and time requirements

Provide practical tips for booking and timing.`;

        return this.generateTripPlan(prompt);
    }

    /**
     * Generate structured trip plan that can be saved to database
     */
    async generateStructuredTripPlan(destination, duration, startDate, interests = []) {
        const interestsText = interests.length > 0 ? ` with interests in ${interests.join(', ')}` : '';
        
        if (!this.model) {
            // Fallback for when API is not configured
            return this.generateFallbackTripPlan(destination, duration, startDate);
        }

        try {
            // Mock structured response
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + duration);

            return {
                tripName: `${duration}-Day Adventure in ${destination}`,
                startDate: startDate,
                endDate: endDate.toISOString().split('T')[0],
                destinations: [
                    {
                        name: destination,
                        location: destination,
                        latitude: this.getDefaultCoordinates(destination).lat,
                        longitude: this.getDefaultCoordinates(destination).lng
                    }
                ]
            };
        } catch (error) {
            console.error('Error generating structured trip plan:', error);
            return this.generateFallbackTripPlan(destination, duration, startDate);
        }
    }

    /**
     * Generate fallback trip plan when AI is not available
     */
    generateFallbackTripPlan(destination, duration, startDate) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration);

        return {
            tripName: `${duration}-Day Adventure in ${destination}`,
            startDate: startDate,
            endDate: endDate.toISOString().split('T')[0],
            destinations: [
                {
                    name: destination,
                    location: destination,
                    latitude: 0,
                    longitude: 0
                }
            ]
        };
    }

    /**
     * Generate and save trip to database
     */
    async generateAndSaveTrip(destination, duration, startDate, interests = [], saveToDatabase = true) {
        try {
            const tripPlan = await this.generateStructuredTripPlan(destination, duration, startDate, interests);
            
            if (saveToDatabase) {
                // This would be handled by the TripService
                const { tripService } = await import('./TripService.js');
                const savedTrip = await tripService.saveAIGeneratedTrip(tripPlan);
                return savedTrip;
            }
            
            return tripPlan;
        } catch (error) {
            console.error('Error generating and saving trip:', error);
            throw error;
        }
    }

    /**
     * Mock response generator for demo purposes
     */
    generateMockResponse(prompt) {
        // Simulate API delay
        return new Promise((resolve) => {
            setTimeout(() => {
                if (prompt.includes('hotel')) {
                    resolve(this.getMockHotelResponse());
                } else if (prompt.includes('activities')) {
                    resolve(this.getMockActivitiesResponse());
                } else {
                    resolve(this.getMockDestinationResponse());
                }
            }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
        });
    }

    /**
     * Mock destination response
     */
    getMockDestinationResponse() {
        return `🗺️ **Amazing Destination Guide**

**Top Attractions:**
• Historic Old Town - Explore centuries-old architecture and cobblestone streets
• Central Museum - World-class art collection and cultural exhibitions
• Scenic Waterfront - Beautiful views and walking paths along the harbor
• Local Markets - Experience authentic culture and taste local specialties

**Recommended Hotels:**
• Grand Hotel Downtown - Luxury accommodation in the heart of the city
• Boutique Garden Inn - Charming mid-range option with excellent service
• Budget Traveler Lodge - Clean, safe, and affordable near public transport

**Local Cuisine:**
• Traditional Restaurant Row - Authentic dishes and family recipes
• Street Food District - Diverse options and local favorites
• Rooftop Dining - Fine dining with panoramic city views

**Transportation Tips:**
• Metro system covers all major attractions
• Walking is best for the historic district
• Bike rentals available throughout the city
• Taxi apps work reliably

**Daily Itinerary:**
Day 1: Arrival + Old Town exploration
Day 2: Museums and cultural sites
Day 3: Waterfront and outdoor activities
Day 4: Shopping and local experiences
Day 5: Day trip to nearby attractions

*Have an amazing trip! 🌟*`;
    }

    /**
     * Mock hotel response
     */
    getMockHotelResponse() {
        return `🏨 **Hotel Recommendations**

**Luxury Options:**
• The Grand Palace Hotel - $200-300/night
  - Prime downtown location
  - Spa and fitness center
  - Michelin-starred restaurant

**Mid-Range Choices:**
• City Center Inn - $80-120/night
  - Walking distance to attractions
  - Free breakfast included
  - Modern amenities

**Budget-Friendly:**
• Traveler's Rest - $40-60/night
  - Clean and safe
  - Near public transportation
  - Shared common areas

**Booking Tips:**
• Book 2-3 weeks in advance for best rates
• Check for package deals including attractions
• Read recent reviews for current conditions
• Consider location vs. price trade-offs`;
    }

    /**
     * Mock activities response
     */
    getMockActivitiesResponse() {
        return `🎯 **Activities & Experiences**

**Must-Do Activities:**
• City Walking Tour - 3 hours, $25/person
• Boat Harbor Cruise - 2 hours, $40/person
• Cooking Class Experience - 4 hours, $75/person

**Hidden Gems:**
• Secret Garden Café - Local favorite coffee spot
• Underground Art Gallery - Emerging artists showcase
• Night Market - Thursday-Saturday evenings

**Cultural Experiences:**
• Traditional Dance Performance - Friday evenings
• Artisan Workshop Visits - Pottery and textiles
• Historic District Audio Tour - Self-guided

**Outdoor Activities:**
• Hiking Trail Network - Free, various difficulties
• Bike Tours - $30/day rental, guided tours available
• Beach Access - 20 minutes by public transport

**Entertainment:**
• Live Music Venues - Check local listings
• Theater District - Various shows nightly
• Rooftop Bars - Great city views

*Book popular activities in advance! 🎉*`;
    }

    /**
     * Get default coordinates for common destinations
     */
    getDefaultCoordinates(destination) {
        const coords = {
            'paris': { lat: 48.8566, lng: 2.3522 },
            'rome': { lat: 41.9028, lng: 12.4964 },
            'tokyo': { lat: 35.6762, lng: 139.6503 },
            'london': { lat: 51.5074, lng: -0.1278 },
            'new york': { lat: 40.7128, lng: -74.0060 },
            'madrid': { lat: 40.4168, lng: -3.7038 },
            'berlin': { lat: 52.5200, lng: 13.4050 },
            'amsterdam': { lat: 52.3676, lng: 4.9041 },
            'barcelona': { lat: 41.3851, lng: 2.1734 },
            'vienna': { lat: 48.2082, lng: 16.3738 }
        };

        const key = destination.toLowerCase();
        return coords[key] || { lat: 0, lng: 0 };
    }

    /**
     * Test API connection
     */
    async testConnection() {
        try {
            if (!this.isConfigured()) {
                throw new Error('API not configured');
            }

            await this.generateTripPlan('Test prompt for API connectivity');
            return { success: true, message: 'API connection successful' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Get API usage statistics
     */
    getUsageStats() {
        // Mock usage stats
        return {
            requestsThisMonth: Math.floor(Math.random() * 1000),
            requestsRemaining: Math.floor(Math.random() * 5000),
            lastRequestTime: new Date().toISOString()
        };
    }
}

// Create singleton instance
export const geminiService = new GeminiService();