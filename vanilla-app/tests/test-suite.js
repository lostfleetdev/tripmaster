/**
 * Comprehensive Test Suite for Trip Management App
 * Vanilla JavaScript implementation
 */

// Mock IndexedDB for testing
class MockIndexedDB {
    constructor() {
        this.data = new Map();
        this.nextId = 1;
    }

    async getAllTrips() {
        return Array.from(this.data.values());
    }

    async getTripById(id) {
        return this.data.get(id) || null;
    }

    async createTrip(tripData) {
        const trip = {
            id: `trip_${this.nextId++}`,
            ...tripData,
            destinations: []
        };
        this.data.set(trip.id, trip);
        return trip;
    }

    async updateTrip(id, tripData) {
        const trip = this.data.get(id);
        if (!trip) return null;
        const updatedTrip = { ...trip, ...tripData };
        this.data.set(id, updatedTrip);
        return updatedTrip;
    }

    async deleteTrip(id) {
        return this.data.delete(id);
    }

    async clearAllData() {
        this.data.clear();
        return true;
    }
}

class TestSuite {
    constructor() {
        this.tests = [];
        this.results = [];
        this.mockDB = new MockIndexedDB();
        this.setupMocks();
    }

    setupMocks() {
        // Mock DOM elements for testing
        if (typeof document === 'undefined') {
            global.document = {
                getElementById: (id) => ({ id, innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} } }),
                createElement: (tag) => ({ tagName: tag, innerHTML: '', appendChild: () => {}, remove: () => {} }),
                querySelector: () => null,
                querySelectorAll: () => [],
                addEventListener: () => {}
            };
        }

        if (typeof window === 'undefined') {
            global.window = {
                localStorage: {
                    getItem: () => null,
                    setItem: () => {},
                    removeItem: () => {}
                },
                indexedDB: {},
                navigator: { userAgent: 'test' }
            };
        }
    }

    /**
     * Add a test case
     */
    test(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🧪 Starting Test Suite...\n');
        this.results = [];

        for (const test of this.tests) {
            await this.runTest(test);
        }

        this.printResults();
    }

    /**
     * Run a single test
     */
    async runTest(test) {
        try {
            console.log(`Running: ${test.name}`);
            const startTime = performance.now();
            await test.testFunction();
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);
            
            this.results.push({
                name: test.name,
                status: 'PASS',
                duration,
                error: null
            });
            console.log(`✅ PASS: ${test.name} (${duration}ms)`);
        } catch (error) {
            this.results.push({
                name: test.name,
                status: 'FAIL',
                duration: 0,
                error: error.message
            });
            console.log(`❌ FAIL: ${test.name} - ${error.message}`);
        }
    }

    /**
     * Print test results summary
     */
    printResults() {
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        const total = this.results.length;

        console.log('\n📊 Test Results Summary:');
        console.log(`Total: ${total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);

        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.results
                .filter(r => r.status === 'FAIL')
                .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
        }
    }

    /**
     * Assert helper functions
     */
    assert(condition, message = 'Assertion failed') {
        if (!condition) {
            throw new Error(message);
        }
    }

    assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message} - Expected: ${expected}, Actual: ${actual}`);
        }
    }

    assertNotEqual(actual, expected, message = '') {
        if (actual === expected) {
            throw new Error(`${message} - Expected not to equal: ${expected}`);
        }
    }

    assertNull(value, message = '') {
        if (value !== null) {
            throw new Error(`${message} - Expected null, got: ${value}`);
        }
    }

    assertNotNull(value, message = '') {
        if (value === null || value === undefined) {
            throw new Error(`${message} - Expected non-null value`);
        }
    }

    assertThrows(fn, message = '') {
        try {
            fn();
            throw new Error(`${message} - Expected function to throw`);
        } catch (error) {
            // Expected
        }
    }

    async assertThrowsAsync(fn, message = '') {
        try {
            await fn();
            throw new Error(`${message} - Expected async function to throw`);
        } catch (error) {
            // Expected
        }
    }
}

// Create test suite instance
const testSuite = new TestSuite();

// Helper function tests
testSuite.test('generateId should create unique IDs', () => {
    // Mock implementation
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    const id1 = generateId();
    const id2 = generateId();
    
    testSuite.assertNotEqual(id1, id2, 'IDs should be unique');
    testSuite.assert(id1.length > 0, 'ID should not be empty');
    testSuite.assert(typeof id1 === 'string', 'ID should be a string');
});

testSuite.test('formatDate should format dates correctly', () => {
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    const formatted = formatDate('2024-06-01');
    testSuite.assert(formatted.includes('2024'), 'Should include year');
    testSuite.assert(formatted.includes('June'), 'Should include month name');
    testSuite.assert(formatted.includes('1'), 'Should include day');
});

testSuite.test('isValidEmail should validate email addresses', () => {
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    testSuite.assert(isValidEmail('test@example.com'), 'Valid email should pass');
    testSuite.assert(!isValidEmail('invalid-email'), 'Invalid email should fail');
    testSuite.assert(!isValidEmail(''), 'Empty email should fail');
    testSuite.assert(!isValidEmail('test@'), 'Incomplete email should fail');
});

testSuite.test('isValidCoordinate should validate coordinates', () => {
    function isValidCoordinate(lat, lng) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        return !isNaN(latitude) && !isNaN(longitude) && 
               latitude >= -90 && latitude <= 90 && 
               longitude >= -180 && longitude <= 180;
    }

    testSuite.assert(isValidCoordinate(40.7128, -74.0060), 'Valid coordinates should pass');
    testSuite.assert(!isValidCoordinate(91, 0), 'Invalid latitude should fail');
    testSuite.assert(!isValidCoordinate(0, 181), 'Invalid longitude should fail');
    testSuite.assert(!isValidCoordinate('invalid', 'coordinates'), 'Non-numeric coordinates should fail');
});

// Form validation tests
testSuite.test('validateForm should validate trip data correctly', () => {
    function validateForm(formData, rules) {
        const errors = {};
        
        for (const [field, value] of Object.entries(formData)) {
            const fieldRules = rules[field];
            if (!fieldRules) continue;

            for (const rule of fieldRules) {
                if (rule.required && (!value || value.toString().trim() === '')) {
                    errors[field] = rule.message || `${field} is required`;
                    break;
                }
                
                if (rule.minLength && value && value.length < rule.minLength) {
                    errors[field] = rule.message || `${field} must be at least ${rule.minLength} characters`;
                    break;
                }
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    const validTripData = {
        name: 'Test Trip',
        startDate: '2024-06-01',
        endDate: '2024-06-10',
        status: 'planned'
    };

    const rules = {
        name: [
            { required: true, message: 'Trip name is required' },
            { minLength: 2, message: 'Trip name must be at least 2 characters' }
        ],
        startDate: [
            { required: true, message: 'Start date is required' }
        ]
    };

    const validResult = validateForm(validTripData, rules);
    testSuite.assert(validResult.isValid, 'Valid trip data should pass validation');

    const invalidTripData = { name: '', startDate: '2024-06-01' };
    const invalidResult = validateForm(invalidTripData, rules);
    testSuite.assert(!invalidResult.isValid, 'Invalid trip data should fail validation');
    testSuite.assert(invalidResult.errors.name, 'Should have error for empty name');
});

// Database service tests
testSuite.test('Database - Create trip should work correctly', async () => {
    const tripData = {
        name: 'Test Trip',
        startDate: '2024-06-01',
        endDate: '2024-06-10',
        status: 'planned'
    };

    const trip = await testSuite.mockDB.createTrip(tripData);
    
    testSuite.assertNotNull(trip, 'Created trip should not be null');
    testSuite.assert(trip.id, 'Created trip should have an ID');
    testSuite.assertEqual(trip.name, tripData.name, 'Trip name should match');
    testSuite.assert(Array.isArray(trip.destinations), 'Trip should have destinations array');
});

testSuite.test('Database - Read trips should work correctly', async () => {
    // Create test trips
    await testSuite.mockDB.createTrip({ name: 'Trip 1', startDate: '2024-06-01', endDate: '2024-06-10', status: 'planned' });
    await testSuite.mockDB.createTrip({ name: 'Trip 2', startDate: '2024-07-01', endDate: '2024-07-10', status: 'planned' });

    const trips = await testSuite.mockDB.getAllTrips();
    
    testSuite.assert(Array.isArray(trips), 'Should return an array');
    testSuite.assert(trips.length >= 2, 'Should have at least 2 trips');
});

testSuite.test('Database - Update trip should work correctly', async () => {
    const tripData = {
        name: 'Original Trip',
        startDate: '2024-06-01',
        endDate: '2024-06-10',
        status: 'planned'
    };

    const trip = await testSuite.mockDB.createTrip(tripData);
    const updateData = { name: 'Updated Trip', status: 'in-progress' };
    
    const updatedTrip = await testSuite.mockDB.updateTrip(trip.id, updateData);
    
    testSuite.assertNotNull(updatedTrip, 'Updated trip should not be null');
    testSuite.assertEqual(updatedTrip.name, 'Updated Trip', 'Trip name should be updated');
    testSuite.assertEqual(updatedTrip.status, 'in-progress', 'Trip status should be updated');
    testSuite.assertEqual(updatedTrip.startDate, tripData.startDate, 'Unchanged fields should remain');
});

testSuite.test('Database - Delete trip should work correctly', async () => {
    const tripData = {
        name: 'Delete Test Trip',
        startDate: '2024-06-01',
        endDate: '2024-06-10',
        status: 'planned'
    };

    const trip = await testSuite.mockDB.createTrip(tripData);
    const deleted = await testSuite.mockDB.deleteTrip(trip.id);
    
    testSuite.assert(deleted, 'Delete operation should return true');
    
    const retrievedTrip = await testSuite.mockDB.getTripById(trip.id);
    testSuite.assertNull(retrievedTrip, 'Deleted trip should not be retrievable');
});

testSuite.test('Database - Get non-existent trip should return null', async () => {
    const trip = await testSuite.mockDB.getTripById('non-existent-id');
    testSuite.assertNull(trip, 'Non-existent trip should return null');
});

// UI component tests
testSuite.test('TripList - Should handle empty state', () => {
    // Mock TripList class
    class MockTripList {
        constructor() {
            this.trips = [];
        }
        
        getFilteredTrips() {
            return this.trips;
        }
        
        hasTrips() {
            return this.trips.length > 0;
        }
    }

    const tripList = new MockTripList();
    testSuite.assert(!tripList.hasTrips(), 'Empty trip list should return false for hasTrips');
    testSuite.assertEqual(tripList.getFilteredTrips().length, 0, 'Empty trip list should return empty array');
});

testSuite.test('MapView - Should validate coordinates', () => {
    // Mock MapView validation
    function validateMapCoordinates(destinations) {
        return destinations.filter(dest => 
            dest.latitude && dest.longitude && 
            !isNaN(dest.latitude) && !isNaN(dest.longitude) &&
            dest.latitude >= -90 && dest.latitude <= 90 &&
            dest.longitude >= -180 && dest.longitude <= 180
        );
    }

    const destinations = [
        { name: 'Valid Dest', latitude: 40.7128, longitude: -74.0060 },
        { name: 'Invalid Dest', latitude: 100, longitude: 200 },
        { name: 'No Coords', latitude: null, longitude: null }
    ];

    const validDestinations = validateMapCoordinates(destinations);
    testSuite.assertEqual(validDestinations.length, 1, 'Should filter out invalid coordinates');
    testSuite.assertEqual(validDestinations[0].name, 'Valid Dest', 'Should keep valid destination');
});

// Gemini Service tests
testSuite.test('GeminiService - Should handle API key configuration', () => {
    // Mock GeminiService
    class MockGeminiService {
        constructor() {
            this.apiKey = null;
        }
        
        setApiKey(key) {
            this.apiKey = key;
        }
        
        isConfigured() {
            return this.apiKey !== null && this.apiKey !== '';
        }
    }

    const service = new MockGeminiService();
    testSuite.assert(!service.isConfigured(), 'Service should not be configured initially');
    
    service.setApiKey('test-key');
    testSuite.assert(service.isConfigured(), 'Service should be configured after setting key');
    
    service.setApiKey('');
    testSuite.assert(!service.isConfigured(), 'Service should not be configured with empty key');
});

testSuite.test('GeminiService - Should generate fallback responses', async () => {
    // Mock fallback response generation
    function generateFallbackTripPlan(destination, duration, startDate) {
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

    const fallbackPlan = generateFallbackTripPlan('Paris', 5, '2024-06-01');
    
    testSuite.assert(fallbackPlan.tripName.includes('Paris'), 'Should include destination in trip name');
    testSuite.assert(fallbackPlan.tripName.includes('5-Day'), 'Should include duration in trip name');
    testSuite.assertEqual(fallbackPlan.startDate, '2024-06-01', 'Should use provided start date');
    testSuite.assert(Array.isArray(fallbackPlan.destinations), 'Should have destinations array');
    testSuite.assert(fallbackPlan.destinations.length > 0, 'Should have at least one destination');
});

// Performance tests
testSuite.test('Performance - Bulk trip creation should be efficient', async () => {
    const startTime = performance.now();
    
    // Create 100 trips
    const promises = [];
    for (let i = 0; i < 100; i++) {
        promises.push(testSuite.mockDB.createTrip({
            name: `Bulk Trip ${i}`,
            startDate: '2024-06-01',
            endDate: '2024-06-10',
            status: 'planned'
        }));
    }
    
    await Promise.all(promises);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    testSuite.assert(duration < 1000, `Bulk creation should take less than 1 second, took ${duration}ms`);
    
    const trips = await testSuite.mockDB.getAllTrips();
    testSuite.assert(trips.length >= 100, 'Should have created at least 100 trips');
});

testSuite.test('Performance - Search operations should be fast', async () => {
    // Create test data
    for (let i = 0; i < 50; i++) {
        await testSuite.mockDB.createTrip({
            name: `Search Test Trip ${i}`,
            startDate: '2024-06-01',
            endDate: '2024-06-10',
            status: i % 3 === 0 ? 'planned' : 'completed'
        });
    }

    // Mock search function
    async function searchTrips(searchTerm, status) {
        const allTrips = await testSuite.mockDB.getAllTrips();
        
        let filtered = allTrips;
        
        if (status && status !== 'all') {
            filtered = filtered.filter(trip => trip.status === status);
        }
        
        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(trip => 
                trip.name.toLowerCase().includes(term)
            );
        }
        
        return filtered;
    }

    const startTime = performance.now();
    
    // Perform multiple searches
    await searchTrips('Test', 'all');
    await searchTrips('Trip', 'planned');
    await searchTrips('', 'completed');
    await searchTrips('Search', 'all');
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    testSuite.assert(duration < 100, `Search operations should take less than 100ms, took ${duration}ms`);
});

// Edge case tests
testSuite.test('Edge Cases - Handle null and undefined values', async () => {
    // Test null ID handling
    const nullTrip = await testSuite.mockDB.getTripById(null);
    testSuite.assertNull(nullTrip, 'Should handle null ID gracefully');
    
    const undefinedTrip = await testSuite.mockDB.getTripById(undefined);
    testSuite.assertNull(undefinedTrip, 'Should handle undefined ID gracefully');
    
    // Test empty string ID
    const emptyTrip = await testSuite.mockDB.getTripById('');
    testSuite.assertNull(emptyTrip, 'Should handle empty string ID gracefully');
});

testSuite.test('Edge Cases - Handle malformed date strings', () => {
    function formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleDateString('en-US');
        } catch (error) {
            return 'Invalid Date';
        }
    }

    testSuite.assertEqual(formatDate(''), '', 'Should handle empty string');
    testSuite.assertEqual(formatDate(null), '', 'Should handle null');
    testSuite.assertEqual(formatDate('invalid-date'), 'Invalid Date', 'Should handle invalid date string');
    testSuite.assertNotEqual(formatDate('2024-06-01'), 'Invalid Date', 'Should handle valid date string');
});

testSuite.test('Edge Cases - Handle extreme coordinate values', () => {
    function isValidCoordinate(lat, lng) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        return !isNaN(latitude) && !isNaN(longitude) && 
               latitude >= -90 && latitude <= 90 && 
               longitude >= -180 && longitude <= 180;
    }

    // Test boundary values
    testSuite.assert(isValidCoordinate(90, 180), 'Should accept maximum valid coordinates');
    testSuite.assert(isValidCoordinate(-90, -180), 'Should accept minimum valid coordinates');
    testSuite.assert(!isValidCoordinate(90.1, 180), 'Should reject slightly over-maximum latitude');
    testSuite.assert(!isValidCoordinate(90, 180.1), 'Should reject slightly over-maximum longitude');
    
    // Test extreme values
    testSuite.assert(!isValidCoordinate(Infinity, 0), 'Should reject infinite values');
    testSuite.assert(!isValidCoordinate(0, -Infinity), 'Should reject negative infinite values');
    testSuite.assert(!isValidCoordinate(NaN, 0), 'Should reject NaN values');
});

// Integration tests
testSuite.test('Integration - Complete trip creation workflow', async () => {
    // Create trip
    const tripData = {
        name: 'Integration Test Trip',
        startDate: '2024-06-01',
        endDate: '2024-06-10',
        status: 'planned'
    };
    
    const trip = await testSuite.mockDB.createTrip(tripData);
    testSuite.assertNotNull(trip, 'Trip should be created');
    
    // Verify trip exists
    const retrievedTrip = await testSuite.mockDB.getTripById(trip.id);
    testSuite.assertNotNull(retrievedTrip, 'Trip should be retrievable');
    testSuite.assertEqual(retrievedTrip.name, tripData.name, 'Retrieved trip should match created trip');
    
    // Update trip
    const updateData = { status: 'in-progress' };
    const updatedTrip = await testSuite.mockDB.updateTrip(trip.id, updateData);
    testSuite.assertEqual(updatedTrip.status, 'in-progress', 'Trip status should be updated');
    
    // Verify in list
    const allTrips = await testSuite.mockDB.getAllTrips();
    const foundTrip = allTrips.find(t => t.id === trip.id);
    testSuite.assertNotNull(foundTrip, 'Updated trip should appear in list');
    testSuite.assertEqual(foundTrip.status, 'in-progress', 'Trip in list should have updated status');
});

// Export test suite for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestSuite, testSuite };
}

// Auto-run tests if in browser environment
if (typeof window !== 'undefined') {
    window.TestSuite = TestSuite;
    window.runTests = () => testSuite.runAllTests();
    
    // Add test runner UI
    document.addEventListener('DOMContentLoaded', () => {
        const testButton = document.createElement('button');
        testButton.textContent = 'Run Tests';
        testButton.style.position = 'fixed';
        testButton.style.top = '10px';
        testButton.style.right = '10px';
        testButton.style.zIndex = '10000';
        testButton.style.padding = '10px';
        testButton.style.background = '#007bff';
        testButton.style.color = 'white';
        testButton.style.border = 'none';
        testButton.style.borderRadius = '4px';
        testButton.style.cursor = 'pointer';
        
        testButton.addEventListener('click', () => {
            testSuite.runAllTests();
        });
        
        document.body.appendChild(testButton);
    });
}

console.log('✅ Test suite loaded. Run testSuite.runAllTests() to execute all tests.');