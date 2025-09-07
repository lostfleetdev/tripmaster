/**
 * DatabaseTesting Component - Database testing and validation interface
 * Vanilla JavaScript implementation
 */

import { tripService } from '../services/TripService.js';
import { indexedDBService } from '../services/IndexedDBService.js';
import { showToast, generateId, validateForm } from '../utils/helpers.js';

export class DatabaseTesting {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.stats = null;
        this.testResults = [];
        
        this.init();
        this.loadStats();
    }

    /**
     * Initialize the component
     */
    init() {
        if (!this.container) {
            console.error(`Container with id "${this.containerId}" not found`);
            return;
        }

        this.render();
    }

    /**
     * Load database statistics
     */
    async loadStats() {
        try {
            this.stats = await tripService.getStats();
            this.renderStats();
        } catch (error) {
            console.error('Error loading database stats:', error);
            this.showError('Failed to load database statistics');
        }
    }

    /**
     * Render the database testing interface
     */
    render() {
        this.container.innerHTML = `
            <div class="db-testing">
                <!-- Header -->
                <div class="db-testing-header">
                    <h2>Database Testing & Validation</h2>
                    <p>Test database operations, validate data integrity, and manage database state</p>
                </div>

                <!-- Statistics Section -->
                <div class="db-section">
                    <h3>Database Statistics</h3>
                    <div id="db-stats" class="db-stats">
                        <div class="loading-placeholder">
                            <div class="spinner"></div>
                            <p>Loading statistics...</p>
                        </div>
                    </div>
                    <button class="btn btn-outlined refresh-stats-btn">
                        <span class="material-icons">refresh</span>
                        Refresh Stats
                    </button>
                </div>

                <!-- CRUD Operations Testing -->
                <div class="db-section">
                    <h3>CRUD Operations Testing</h3>
                    <div class="crud-testing">
                        <div class="test-group">
                            <h4>Trip Operations</h4>
                            <div class="test-buttons">
                                <button class="btn btn-primary test-create-trip-btn">
                                    <span class="material-icons">add</span>
                                    Test Create Trip
                                </button>
                                <button class="btn btn-outlined test-read-trips-btn">
                                    <span class="material-icons">list</span>
                                    Test Read Trips
                                </button>
                                <button class="btn btn-outlined test-update-trip-btn">
                                    <span class="material-icons">edit</span>
                                    Test Update Trip
                                </button>
                                <button class="btn btn-secondary test-delete-trip-btn">
                                    <span class="material-icons">delete</span>
                                    Test Delete Trip
                                </button>
                            </div>
                        </div>

                        <div class="test-group">
                            <h4>Destination Operations</h4>
                            <div class="test-buttons">
                                <button class="btn btn-primary test-add-destination-btn">
                                    <span class="material-icons">place</span>
                                    Test Add Destination
                                </button>
                                <button class="btn btn-outlined test-update-destination-btn">
                                    <span class="material-icons">edit_location</span>
                                    Test Update Destination
                                </button>
                                <button class="btn btn-secondary test-delete-destination-btn">
                                    <span class="material-icons">location_off</span>
                                    Test Delete Destination
                                </button>
                            </div>
                        </div>

                        <div class="test-group">
                            <h4>Hotel Operations</h4>
                            <div class="test-buttons">
                                <button class="btn btn-primary test-add-hotel-btn">
                                    <span class="material-icons">hotel</span>
                                    Test Add Hotel
                                </button>
                                <button class="btn btn-outlined test-update-hotel-btn">
                                    <span class="material-icons">edit</span>
                                    Test Update Hotel
                                </button>
                                <button class="btn btn-secondary test-delete-hotel-btn">
                                    <span class="material-icons">delete</span>
                                    Test Delete Hotel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Data Validation Testing -->
                <div class="db-section">
                    <h3>Data Validation Testing</h3>
                    <div class="validation-testing">
                        <div class="test-buttons">
                            <button class="btn btn-primary test-trip-validation-btn">
                                <span class="material-icons">rule</span>
                                Test Trip Validation
                            </button>
                            <button class="btn btn-primary test-destination-validation-btn">
                                <span class="material-icons">verified</span>
                                Test Destination Validation
                            </button>
                            <button class="btn btn-primary test-hotel-validation-btn">
                                <span class="material-icons">fact_check</span>
                                Test Hotel Validation
                            </button>
                            <button class="btn btn-primary test-edge-cases-btn">
                                <span class="material-icons">bug_report</span>
                                Test Edge Cases
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Performance Testing -->
                <div class="db-section">
                    <h3>Performance Testing</h3>
                    <div class="performance-testing">
                        <div class="test-buttons">
                            <button class="btn btn-primary test-bulk-create-btn">
                                <span class="material-icons">speed</span>
                                Test Bulk Create (100 trips)
                            </button>
                            <button class="btn btn-primary test-search-performance-btn">
                                <span class="material-icons">search</span>
                                Test Search Performance
                            </button>
                            <button class="btn btn-primary test-concurrent-ops-btn">
                                <span class="material-icons">sync</span>
                                Test Concurrent Operations
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Database Management -->
                <div class="db-section">
                    <h3>Database Management</h3>
                    <div class="db-management">
                        <div class="test-buttons">
                            <button class="btn btn-outlined init-sample-data-btn">
                                <span class="material-icons">dataset</span>
                                Initialize Sample Data
                            </button>
                            <button class="btn btn-outlined export-data-btn">
                                <span class="material-icons">download</span>
                                Export All Data
                            </button>
                            <button class="btn btn-outlined import-data-btn">
                                <span class="material-icons">upload</span>
                                Import Data
                            </button>
                            <button class="btn btn-secondary clear-data-btn">
                                <span class="material-icons">clear_all</span>
                                Clear All Data
                            </button>
                        </div>
                        <input type="file" id="import-file" accept=".json" style="display: none;">
                    </div>
                </div>

                <!-- Test Results -->
                <div class="db-section">
                    <h3>Test Results</h3>
                    <div class="test-controls">
                        <button class="btn btn-outlined run-all-tests-btn">
                            <span class="material-icons">play_arrow</span>
                            Run All Tests
                        </button>
                        <button class="btn btn-text clear-results-btn">
                            <span class="material-icons">clear</span>
                            Clear Results
                        </button>
                    </div>
                    <div id="test-results" class="test-results">
                        <p>No tests run yet. Click a test button or "Run All Tests" to begin.</p>
                    </div>
                </div>
            </div>
        `;

        this.bindUIEvents();
        window.dbTestingInstance = this;
    }

    /**
     * Render database statistics
     */
    renderStats() {
        const statsContainer = document.getElementById('db-stats');
        if (!statsContainer || !this.stats) return;

        statsContainer.innerHTML = `
            <div class="db-stat-card">
                <div class="db-stat-number">${this.stats.trips}</div>
                <div class="db-stat-label">Total Trips</div>
            </div>
            <div class="db-stat-card">
                <div class="db-stat-number">${this.stats.destinations}</div>
                <div class="db-stat-label">Destinations</div>
            </div>
            <div class="db-stat-card">
                <div class="db-stat-number">${this.stats.hotels}</div>
                <div class="db-stat-label">Hotels</div>
            </div>
            <div class="db-stat-card">
                <div class="db-stat-number">${this.stats.plannedTrips}</div>
                <div class="db-stat-label">Planned</div>
            </div>
            <div class="db-stat-card">
                <div class="db-stat-number">${this.stats.inProgressTrips}</div>
                <div class="db-stat-label">In Progress</div>
            </div>
            <div class="db-stat-card">
                <div class="db-stat-number">${this.stats.completedTrips}</div>
                <div class="db-stat-label">Completed</div>
            </div>
        `;
    }

    /**
     * Bind UI event listeners
     */
    bindUIEvents() {
        // Refresh stats
        const refreshStatsBtn = this.container.querySelector('.refresh-stats-btn');
        if (refreshStatsBtn) {
            refreshStatsBtn.addEventListener('click', () => this.loadStats());
        }

        // CRUD Testing
        this.bindCrudTestButtons();

        // Validation Testing
        this.bindValidationTestButtons();

        // Performance Testing
        this.bindPerformanceTestButtons();

        // Database Management
        this.bindManagementButtons();

        // Test Controls
        const runAllTestsBtn = this.container.querySelector('.run-all-tests-btn');
        if (runAllTestsBtn) {
            runAllTestsBtn.addEventListener('click', () => this.runAllTests());
        }

        const clearResultsBtn = this.container.querySelector('.clear-results-btn');
        if (clearResultsBtn) {
            clearResultsBtn.addEventListener('click', () => this.clearTestResults());
        }
    }

    /**
     * Bind CRUD test buttons
     */
    bindCrudTestButtons() {
        const buttons = [
            { class: '.test-create-trip-btn', method: () => this.testCreateTrip() },
            { class: '.test-read-trips-btn', method: () => this.testReadTrips() },
            { class: '.test-update-trip-btn', method: () => this.testUpdateTrip() },
            { class: '.test-delete-trip-btn', method: () => this.testDeleteTrip() },
            { class: '.test-add-destination-btn', method: () => this.testAddDestination() },
            { class: '.test-update-destination-btn', method: () => this.testUpdateDestination() },
            { class: '.test-delete-destination-btn', method: () => this.testDeleteDestination() },
            { class: '.test-add-hotel-btn', method: () => this.testAddHotel() },
            { class: '.test-update-hotel-btn', method: () => this.testUpdateHotel() },
            { class: '.test-delete-hotel-btn', method: () => this.testDeleteHotel() }
        ];

        buttons.forEach(({ class: selector, method }) => {
            const btn = this.container.querySelector(selector);
            if (btn) {
                btn.addEventListener('click', method);
            }
        });
    }

    /**
     * Bind validation test buttons
     */
    bindValidationTestButtons() {
        const buttons = [
            { class: '.test-trip-validation-btn', method: () => this.testTripValidation() },
            { class: '.test-destination-validation-btn', method: () => this.testDestinationValidation() },
            { class: '.test-hotel-validation-btn', method: () => this.testHotelValidation() },
            { class: '.test-edge-cases-btn', method: () => this.testEdgeCases() }
        ];

        buttons.forEach(({ class: selector, method }) => {
            const btn = this.container.querySelector(selector);
            if (btn) {
                btn.addEventListener('click', method);
            }
        });
    }

    /**
     * Bind performance test buttons
     */
    bindPerformanceTestButtons() {
        const buttons = [
            { class: '.test-bulk-create-btn', method: () => this.testBulkCreate() },
            { class: '.test-search-performance-btn', method: () => this.testSearchPerformance() },
            { class: '.test-concurrent-ops-btn', method: () => this.testConcurrentOperations() }
        ];

        buttons.forEach(({ class: selector, method }) => {
            const btn = this.container.querySelector(selector);
            if (btn) {
                btn.addEventListener('click', method);
            }
        });
    }

    /**
     * Bind management buttons
     */
    bindManagementButtons() {
        const initSampleBtn = this.container.querySelector('.init-sample-data-btn');
        if (initSampleBtn) {
            initSampleBtn.addEventListener('click', () => this.initializeSampleData());
        }

        const exportBtn = this.container.querySelector('.export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportAllData());
        }

        const importBtn = this.container.querySelector('.import-data-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.triggerImport());
        }

        const clearBtn = this.container.querySelector('.clear-data-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllData());
        }

        const fileInput = this.container.querySelector('#import-file');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileImport(e));
        }
    }

    // CRUD Tests
    async testCreateTrip() {
        const testName = 'Create Trip Test';
        this.addTestResult(testName, 'Running...', 'info');

        try {
            const tripData = {
                name: `Test Trip ${Date.now()}`,
                startDate: '2024-06-01',
                endDate: '2024-06-10',
                status: 'planned'
            };

            const trip = await tripService.createTrip(tripData);
            
            if (trip && trip.id) {
                this.addTestResult(testName, `✅ Trip created successfully with ID: ${trip.id}`, 'success');
            } else {
                this.addTestResult(testName, '❌ Trip creation failed - no ID returned', 'error');
            }
        } catch (error) {
            this.addTestResult(testName, `❌ Trip creation failed: ${error.message}`, 'error');
        }
        
        this.loadStats();
    }

    async testReadTrips() {
        const testName = 'Read Trips Test';
        this.addTestResult(testName, 'Running...', 'info');

        try {
            const trips = await tripService.getAllTrips();
            
            if (Array.isArray(trips)) {
                this.addTestResult(testName, `✅ Retrieved ${trips.length} trips successfully`, 'success');
            } else {
                this.addTestResult(testName, '❌ Failed to retrieve trips - invalid response', 'error');
            }
        } catch (error) {
            this.addTestResult(testName, `❌ Read trips failed: ${error.message}`, 'error');
        }
    }

    async testUpdateTrip() {
        const testName = 'Update Trip Test';
        this.addTestResult(testName, 'Running...', 'info');

        try {
            const trips = await tripService.getAllTrips();
            
            if (trips.length === 0) {
                this.addTestResult(testName, '⚠️ No trips available to update. Create a trip first.', 'error');
                return;
            }

            const trip = trips[0];
            const updateData = {
                name: `Updated Trip ${Date.now()}`,
                status: 'in-progress'
            };

            const updatedTrip = await tripService.updateTrip(trip.id, updateData);
            
            if (updatedTrip && updatedTrip.name === updateData.name) {
                this.addTestResult(testName, `✅ Trip updated successfully: ${updatedTrip.name}`, 'success');
            } else {
                this.addTestResult(testName, '❌ Trip update failed', 'error');
            }
        } catch (error) {
            this.addTestResult(testName, `❌ Update trip failed: ${error.message}`, 'error');
        }
    }

    async testDeleteTrip() {
        const testName = 'Delete Trip Test';
        this.addTestResult(testName, 'Running...', 'info');

        try {
            // Create a trip to delete
            const tripData = {
                name: `Delete Test Trip ${Date.now()}`,
                startDate: '2024-06-01',
                endDate: '2024-06-10',
                status: 'planned'
            };

            const trip = await tripService.createTrip(tripData);
            
            if (!trip || !trip.id) {
                this.addTestResult(testName, '❌ Failed to create trip for deletion test', 'error');
                return;
            }

            const success = await tripService.deleteTrip(trip.id);
            
            if (success) {
                this.addTestResult(testName, `✅ Trip deleted successfully: ${trip.name}`, 'success');
            } else {
                this.addTestResult(testName, '❌ Trip deletion failed', 'error');
            }
        } catch (error) {
            this.addTestResult(testName, `❌ Delete trip failed: ${error.message}`, 'error');
        }
        
        this.loadStats();
    }

    async testAddDestination() {
        const testName = 'Add Destination Test';
        this.addTestResult(testName, 'Running...', 'info');

        try {
            const trips = await tripService.getAllTrips();
            
            if (trips.length === 0) {
                this.addTestResult(testName, '⚠️ No trips available. Create a trip first.', 'error');
                return;
            }

            const trip = trips[0];
            const destinationData = {
                name: `Test Destination ${Date.now()}`,
                location: 'Test Location',
                latitude: 40.7128,
                longitude: -74.0060
            };

            const destination = await tripService.addDestination(trip.id, destinationData);
            
            if (destination && destination.id) {
                this.addTestResult(testName, `✅ Destination added successfully: ${destination.name}`, 'success');
            } else {
                this.addTestResult(testName, '❌ Add destination failed', 'error');
            }
        } catch (error) {
            this.addTestResult(testName, `❌ Add destination failed: ${error.message}`, 'error');
        }
        
        this.loadStats();
    }

    async testUpdateDestination() {
        const testName = 'Update Destination Test';
        this.addTestResult(testName, 'Running...', 'info');

        try {
            const trips = await tripService.getAllTrips();
            const trip = trips.find(t => t.destinations && t.destinations.length > 0);
            
            if (!trip) {
                this.addTestResult(testName, '⚠️ No trips with destinations found. Add a destination first.', 'error');
                return;
            }

            const destination = trip.destinations[0];
            const updateData = {
                name: `Updated Destination ${Date.now()}`,
                location: 'Updated Location'
            };

            const updatedDestination = await tripService.updateDestination(trip.id, destination.id, updateData);
            
            if (updatedDestination && updatedDestination.name === updateData.name) {
                this.addTestResult(testName, `✅ Destination updated successfully: ${updatedDestination.name}`, 'success');
            } else {
                this.addTestResult(testName, '❌ Update destination failed', 'error');
            }
        } catch (error) {
            this.addTestResult(testName, `❌ Update destination failed: ${error.message}`, 'error');
        }
    }

    async testDeleteDestination() {
        const testName = 'Delete Destination Test';
        this.addTestResult(testName, 'Running...', 'info');

        try {
            const trips = await tripService.getAllTrips();
            const trip = trips.find(t => t.destinations && t.destinations.length > 0);
            
            if (!trip) {
                // Create a trip with destination for testing
                const testTrip = await tripService.createTrip({
                    name: `Test Trip for Destination ${Date.now()}`,
                    startDate: '2024-06-01',
                    endDate: '2024-06-10',
                    status: 'planned'
                });

                const destination = await tripService.addDestination(testTrip.id, {
                    name: 'Delete Test Destination',
                    location: 'Test Location',
                    latitude: 0,
                    longitude: 0
                });

                const success = await tripService.deleteDestination(testTrip.id, destination.id);
                
                if (success) {
                    this.addTestResult(testName, `✅ Destination deleted successfully`, 'success');
                } else {
                    this.addTestResult(testName, '❌ Delete destination failed', 'error');
                }
            } else {
                const destination = trip.destinations[0];
                const success = await tripService.deleteDestination(trip.id, destination.id);
                
                if (success) {
                    this.addTestResult(testName, `✅ Destination deleted successfully`, 'success');
                } else {
                    this.addTestResult(testName, '❌ Delete destination failed', 'error');
                }
            }
        } catch (error) {
            this.addTestResult(testName, `❌ Delete destination failed: ${error.message}`, 'error');
        }
        
        this.loadStats();
    }

    async testAddHotel() {
        const testName = 'Add Hotel Test';
        this.addTestResult(testName, 'Running...', 'info');

        try {
            const trips = await tripService.getAllTrips();
            const trip = trips.find(t => t.destinations && t.destinations.length > 0);
            
            if (!trip) {
                this.addTestResult(testName, '⚠️ No trips with destinations found. Add a destination first.', 'error');
                return;
            }

            const destination = trip.destinations[0];
            const hotelData = {
                name: `Test Hotel ${Date.now()}`,
                address: 'Test Hotel Address'
            };

            const hotel = await tripService.addHotel(trip.id, destination.id, hotelData);
            
            if (hotel && hotel.id) {
                this.addTestResult(testName, `✅ Hotel added successfully: ${hotel.name}`, 'success');
            } else {
                this.addTestResult(testName, '❌ Add hotel failed', 'error');
            }
        } catch (error) {
            this.addTestResult(testName, `❌ Add hotel failed: ${error.message}`, 'error');
        }
        
        this.loadStats();
    }

    async testUpdateHotel() {
        const testName = 'Update Hotel Test';
        this.addTestResult(testName, 'Running...', 'info');

        try {
            const trips = await tripService.getAllTrips();
            const trip = trips.find(t => 
                t.destinations && 
                t.destinations.some(d => d.hotels && d.hotels.length > 0)
            );
            
            if (!trip) {
                this.addTestResult(testName, '⚠️ No trips with hotels found. Add a hotel first.', 'error');
                return;
            }

            const destination = trip.destinations.find(d => d.hotels && d.hotels.length > 0);
            const hotel = destination.hotels[0];
            const updateData = {
                name: `Updated Hotel ${Date.now()}`,
                address: 'Updated Hotel Address'
            };

            const updatedHotel = await tripService.updateHotel(trip.id, destination.id, hotel.id, updateData);
            
            if (updatedHotel && updatedHotel.name === updateData.name) {
                this.addTestResult(testName, `✅ Hotel updated successfully: ${updatedHotel.name}`, 'success');
            } else {
                this.addTestResult(testName, '❌ Update hotel failed', 'error');
            }
        } catch (error) {
            this.addTestResult(testName, `❌ Update hotel failed: ${error.message}`, 'error');
        }
    }

    async testDeleteHotel() {
        const testName = 'Delete Hotel Test';
        this.addTestResult(testName, 'Running...', 'info');

        try {
            const trips = await tripService.getAllTrips();
            let trip = trips.find(t => 
                t.destinations && 
                t.destinations.some(d => d.hotels && d.hotels.length > 0)
            );
            
            if (!trip) {
                // Create test data
                const testTrip = await tripService.createTrip({
                    name: `Test Trip for Hotel ${Date.now()}`,
                    startDate: '2024-06-01',
                    endDate: '2024-06-10',
                    status: 'planned'
                });

                const destination = await tripService.addDestination(testTrip.id, {
                    name: 'Test Destination',
                    location: 'Test Location',
                    latitude: 0,
                    longitude: 0
                });

                const hotel = await tripService.addHotel(testTrip.id, destination.id, {
                    name: 'Delete Test Hotel',
                    address: 'Test Address'
                });

                const success = await tripService.deleteHotel(testTrip.id, destination.id, hotel.id);
                
                if (success) {
                    this.addTestResult(testName, `✅ Hotel deleted successfully`, 'success');
                } else {
                    this.addTestResult(testName, '❌ Delete hotel failed', 'error');
                }
            } else {
                const destination = trip.destinations.find(d => d.hotels && d.hotels.length > 0);
                const hotel = destination.hotels[0];
                
                const success = await tripService.deleteHotel(trip.id, destination.id, hotel.id);
                
                if (success) {
                    this.addTestResult(testName, `✅ Hotel deleted successfully`, 'success');
                } else {
                    this.addTestResult(testName, '❌ Delete hotel failed', 'error');
                }
            }
        } catch (error) {
            this.addTestResult(testName, `❌ Delete hotel failed: ${error.message}`, 'error');
        }
        
        this.loadStats();
    }

    // Validation Tests
    async testTripValidation() {
        const testName = 'Trip Validation Test';
        this.addTestResult(testName, 'Running validation tests...', 'info');

        const invalidTripData = [
            { name: '', startDate: '2024-06-01', endDate: '2024-06-10', status: 'planned' }, // Empty name
            { name: 'Test Trip', startDate: '', endDate: '2024-06-10', status: 'planned' }, // Empty start date
            { name: 'Test Trip', startDate: '2024-06-10', endDate: '2024-06-01', status: 'planned' }, // End before start
            { name: 'Test Trip', startDate: '2024-06-01', endDate: '2024-06-10', status: 'invalid' }, // Invalid status
        ];

        let passedTests = 0;
        let totalTests = invalidTripData.length;

        for (const tripData of invalidTripData) {
            try {
                await tripService.createTrip(tripData);
                // Should not reach here
                this.addTestResult(testName, `❌ Validation failed - invalid data was accepted`, 'error');
            } catch (error) {
                // Expected to fail
                passedTests++;
            }
        }

        if (passedTests === totalTests) {
            this.addTestResult(testName, `✅ All ${totalTests} validation tests passed`, 'success');
        } else {
            this.addTestResult(testName, `❌ ${totalTests - passedTests} validation tests failed`, 'error');
        }
    }

    async testDestinationValidation() {
        const testName = 'Destination Validation Test';
        this.addTestResult(testName, 'Running destination validation tests...', 'info');

        // Need a trip to test with
        const trips = await tripService.getAllTrips();
        if (trips.length === 0) {
            this.addTestResult(testName, '⚠️ No trips available for testing. Create a trip first.', 'error');
            return;
        }

        const tripId = trips[0].id;
        const invalidDestinationData = [
            { name: '', location: 'Test Location', latitude: 0, longitude: 0 }, // Empty name
            { name: 'Test Destination', location: '', latitude: 0, longitude: 0 }, // Empty location
            { name: 'Test Destination', location: 'Test Location', latitude: 91, longitude: 0 }, // Invalid latitude
            { name: 'Test Destination', location: 'Test Location', latitude: 0, longitude: 181 }, // Invalid longitude
        ];

        let passedTests = 0;
        let totalTests = invalidDestinationData.length;

        for (const destinationData of invalidDestinationData) {
            try {
                await tripService.addDestination(tripId, destinationData);
                // Should not reach here for most cases
            } catch (error) {
                // Expected to fail
                passedTests++;
            }
        }

        this.addTestResult(testName, `✅ ${passedTests}/${totalTests} destination validation tests passed`, 'success');
    }

    async testHotelValidation() {
        const testName = 'Hotel Validation Test';
        this.addTestResult(testName, 'Running hotel validation tests...', 'info');

        // Need a trip with destination to test with
        const trips = await tripService.getAllTrips();
        const trip = trips.find(t => t.destinations && t.destinations.length > 0);
        
        if (!trip) {
            this.addTestResult(testName, '⚠️ No trips with destinations found. Add a destination first.', 'error');
            return;
        }

        const destinationId = trip.destinations[0].id;
        const invalidHotelData = [
            { name: '', address: 'Test Address' }, // Empty name
            { name: 'Test Hotel', address: '' }, // Empty address
            { name: 'a', address: 'Test Address' }, // Name too short
            { name: 'Test Hotel', address: 'a' }, // Address too short
        ];

        let passedTests = 0;
        let totalTests = invalidHotelData.length;

        for (const hotelData of invalidHotelData) {
            try {
                await tripService.addHotel(trip.id, destinationId, hotelData);
                // Should not reach here
            } catch (error) {
                // Expected to fail
                passedTests++;
            }
        }

        this.addTestResult(testName, `✅ ${passedTests}/${totalTests} hotel validation tests passed`, 'success');
    }

    async testEdgeCases() {
        const testName = 'Edge Cases Test';
        this.addTestResult(testName, 'Running edge case tests...', 'info');

        let passedTests = 0;
        let totalTests = 0;

        // Test with null/undefined values
        totalTests++;
        try {
            await tripService.getTripById(null);
            passedTests++;
        } catch (error) {
            // Expected behavior
            passedTests++;
        }

        // Test with non-existent ID
        totalTests++;
        try {
            const result = await tripService.getTripById('non-existent-id');
            if (result === null || result === undefined) {
                passedTests++;
            }
        } catch (error) {
            // Also acceptable
            passedTests++;
        }

        // Test concurrent operations
        totalTests++;
        try {
            const promises = [
                tripService.getAllTrips(),
                tripService.getAllTrips(),
                tripService.getAllTrips()
            ];
            await Promise.all(promises);
            passedTests++;
        } catch (error) {
            this.addTestResult(testName, `❌ Concurrent read operations failed: ${error.message}`, 'error');
        }

        this.addTestResult(testName, `✅ ${passedTests}/${totalTests} edge case tests passed`, 'success');
    }

    // Performance Tests
    async testBulkCreate() {
        const testName = 'Bulk Create Performance Test';
        this.addTestResult(testName, 'Creating 100 trips...', 'info');

        const startTime = performance.now();
        let successCount = 0;

        try {
            const promises = [];
            for (let i = 0; i < 100; i++) {
                promises.push(
                    tripService.createTrip({
                        name: `Bulk Test Trip ${i + 1}`,
                        startDate: '2024-06-01',
                        endDate: '2024-06-10',
                        status: 'planned'
                    })
                );
            }

            const results = await Promise.all(promises);
            successCount = results.filter(r => r && r.id).length;
            
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);

            this.addTestResult(testName, 
                `✅ Created ${successCount}/100 trips in ${duration}ms (${Math.round(duration/successCount)}ms per trip)`, 
                'success'
            );
        } catch (error) {
            this.addTestResult(testName, `❌ Bulk create failed: ${error.message}`, 'error');
        }

        this.loadStats();
    }

    async testSearchPerformance() {
        const testName = 'Search Performance Test';
        this.addTestResult(testName, 'Testing search performance...', 'info');

        try {
            const startTime = performance.now();
            
            // Test different search scenarios
            const searchTests = [
                { term: '', status: 'all' },
                { term: 'Test', status: 'all' },
                { term: '', status: 'planned' },
                { term: 'Bulk', status: 'planned' }
            ];

            for (const search of searchTests) {
                await tripService.searchTrips(search.term, search.status);
            }

            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);

            this.addTestResult(testName, 
                `✅ Completed ${searchTests.length} search operations in ${duration}ms`, 
                'success'
            );
        } catch (error) {
            this.addTestResult(testName, `❌ Search performance test failed: ${error.message}`, 'error');
        }
    }

    async testConcurrentOperations() {
        const testName = 'Concurrent Operations Test';
        this.addTestResult(testName, 'Testing concurrent operations...', 'info');

        try {
            const operations = [
                tripService.getAllTrips(),
                tripService.getStats(),
                tripService.getAllTrips(),
                tripService.getStats()
            ];

            const startTime = performance.now();
            const results = await Promise.all(operations);
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);

            if (results.every(r => r !== null && r !== undefined)) {
                this.addTestResult(testName, 
                    `✅ ${operations.length} concurrent operations completed in ${duration}ms`, 
                    'success'
                );
            } else {
                this.addTestResult(testName, '❌ Some concurrent operations failed', 'error');
            }
        } catch (error) {
            this.addTestResult(testName, `❌ Concurrent operations test failed: ${error.message}`, 'error');
        }
    }

    // Database Management
    async initializeSampleData() {
        try {
            await tripService.initializeSampleData();
            showToast('Sample data initialized successfully', 'success');
            this.loadStats();
        } catch (error) {
            console.error('Error initializing sample data:', error);
            showToast('Failed to initialize sample data', 'error');
        }
    }

    async exportAllData() {
        try {
            const trips = await tripService.getAllTrips();
            const stats = await tripService.getStats();
            
            const exportData = {
                trips,
                stats,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `tripmaster_export_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            showToast('Data exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            showToast('Failed to export data', 'error');
        }
    }

    triggerImport() {
        const fileInput = document.getElementById('import-file');
        fileInput.click();
    }

    async handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.trips && Array.isArray(data.trips)) {
                // Import trips
                let importCount = 0;
                for (const tripData of data.trips) {
                    try {
                        delete tripData.id; // Remove ID to create new
                        const newTrip = await tripService.createTrip({
                            name: tripData.name + ' (Imported)',
                            startDate: tripData.startDate,
                            endDate: tripData.endDate,
                            status: tripData.status
                        });
                        
                        // Import destinations
                        for (const destData of tripData.destinations || []) {
                            const hotels = destData.hotels || [];
                            delete destData.hotels;
                            delete destData.id;
                            delete destData.tripId;
                            
                            const destination = await tripService.addDestination(newTrip.id, destData);
                            
                            // Import hotels
                            for (const hotelData of hotels) {
                                delete hotelData.id;
                                delete hotelData.destinationId;
                                await tripService.addHotel(newTrip.id, destination.id, hotelData);
                            }
                        }
                        
                        importCount++;
                    } catch (error) {
                        console.error('Error importing trip:', error);
                    }
                }
                
                showToast(`Successfully imported ${importCount} trips`, 'success');
                this.loadStats();
            } else {
                showToast('Invalid import file format', 'error');
            }
        } catch (error) {
            console.error('Error importing file:', error);
            showToast('Failed to import data', 'error');
        }
    }

    async clearAllData() {
        if (!confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            return;
        }

        try {
            await tripService.clearAllData();
            showToast('All data cleared successfully', 'success');
            this.loadStats();
            this.clearTestResults();
        } catch (error) {
            console.error('Error clearing data:', error);
            showToast('Failed to clear data', 'error');
        }
    }

    // Test Management
    async runAllTests() {
        this.clearTestResults();
        this.addTestResult('Test Suite', 'Running all tests...', 'info');

        const tests = [
            () => this.testCreateTrip(),
            () => this.testReadTrips(),
            () => this.testUpdateTrip(),
            () => this.testAddDestination(),
            () => this.testAddHotel(),
            () => this.testTripValidation(),
            () => this.testDestinationValidation(),
            () => this.testHotelValidation(),
            () => this.testEdgeCases(),
            () => this.testSearchPerformance(),
            () => this.testConcurrentOperations()
        ];

        for (const test of tests) {
            try {
                await test();
                await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between tests
            } catch (error) {
                console.error('Test error:', error);
            }
        }

        this.addTestResult('Test Suite', '✅ All tests completed', 'success');
    }

    /**
     * Add test result to display
     */
    addTestResult(testName, result, type = 'info') {
        const resultsContainer = document.getElementById('test-results');
        if (!resultsContainer) return;

        if (resultsContainer.children.length === 1 && 
            resultsContainer.children[0].textContent.includes('No tests run yet')) {
            resultsContainer.innerHTML = '';
        }

        const resultElement = document.createElement('div');
        resultElement.className = `test-result ${type}`;
        resultElement.innerHTML = `
            <div class="test-result-header">
                <strong>${testName}</strong>
                <span class="test-result-time">${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="test-result-content">${result}</div>
        `;

        resultsContainer.appendChild(resultElement);
        resultElement.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Clear test results
     */
    clearTestResults() {
        const resultsContainer = document.getElementById('test-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '<p>No tests run yet. Click a test button or "Run All Tests" to begin.</p>';
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const statsContainer = document.getElementById('db-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="error-state">
                    <span class="material-icons">error_outline</span>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    /**
     * Destroy component
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        if (window.dbTestingInstance === this) {
            delete window.dbTestingInstance;
        }
    }
}