/**
 * Main Application - Trip Management App
 * Vanilla JavaScript implementation
 */

import { tripService } from './services/TripService.js';
import { TripList } from './components/TripList.js';
import { TripDetail } from './components/TripDetail.js';
import { TripPlanner } from './components/TripPlanner.js';
import { DatabaseTesting } from './components/DatabaseTesting.js';
import { showToast, hideLoading, eventBus } from './utils/helpers.js';

class TripManagementApp {
    constructor() {
        this.activeTab = 0;
        this.selectedTrip = null;
        this.components = {};
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Show loading
            this.showInitialLoading();
            
            // Initialize database and sample data
            await this.initializeData();
            
            // Initialize UI components
            this.initializeComponents();
            
            // Bind global events
            this.bindGlobalEvents();
            
            // Set up tab navigation
            this.setupTabNavigation();
            
            // Hide loading
            hideLoading();
            
            console.log('Trip Management App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showInitializationError(error);
        }
    }

    /**
     * Show initial loading state
     */
    showInitialLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
            loadingOverlay.querySelector('p').textContent = 'Initializing Trip Manager...';
        }
    }

    /**
     * Initialize database and sample data
     */
    async initializeData() {
        try {
            // Initialize sample data if database is empty
            await tripService.initializeSampleData();
            console.log('Database initialized');
        } catch (error) {
            console.error('Error initializing database:', error);
            throw new Error('Failed to initialize database');
        }
    }

    /**
     * Initialize UI components
     */
    initializeComponents() {
        try {
            // Initialize TripList component
            this.components.tripList = new TripList('trip-list-container');
            
            // Initialize TripDetail component
            this.components.tripDetail = new TripDetail('trip-detail-container');
            
            // Initialize TripPlanner component
            this.components.tripPlanner = new TripPlanner('trip-planner-container');
            
            // Initialize DatabaseTesting component
            this.components.databaseTesting = new DatabaseTesting('database-testing-container');
            
            console.log('All components initialized');
        } catch (error) {
            console.error('Error initializing components:', error);
            throw new Error('Failed to initialize UI components');
        }
    }

    /**
     * Bind global event listeners
     */
    bindGlobalEvents() {
        // Listen for trip selection from TripList
        eventBus.on('tripSelected', (trip) => {
            this.selectTrip(trip);
        });

        // Listen for trip updates
        eventBus.on('tripUpdated', () => {
            this.refreshData();
        });

        // Listen for trip creation
        eventBus.on('tripCreated', () => {
            this.refreshData();
        });

        // Listen for trip deletion
        eventBus.on('tripDeleted', () => {
            this.clearSelectedTrip();
            this.refreshData();
        });

        // Global error handling
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            showToast('An unexpected error occurred', 'error');
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleGlobalKeyboard(event);
        });

        // Window resize handling for map
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });

        // Before unload warning if there are unsaved changes
        window.addEventListener('beforeunload', (event) => {
            // Could implement unsaved changes check here
        });
    }

    /**
     * Set up tab navigation
     */
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                this.switchTab(index);
            });
        });

        // Initial tab setup
        this.updateTabStates();
    }

    /**
     * Switch to a different tab
     */
    switchTab(tabIndex) {
        if (this.activeTab === tabIndex) return;

        // Validate tab index
        if (tabIndex < 0 || tabIndex >= 4) return;

        // Check if trip details tab requires a selected trip
        if (tabIndex === 1 && !this.selectedTrip) {
            showToast('Please select a trip first', 'warning');
            return;
        }

        this.activeTab = tabIndex;
        this.updateTabStates();

        // Handle tab-specific logic
        this.handleTabSwitch(tabIndex);
    }

    /**
     * Update tab button and panel states
     */
    updateTabStates() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach((button, index) => {
            button.classList.toggle('active', index === this.activeTab);
            
            // Update disabled state for trip details tab
            if (index === 1) {
                button.disabled = !this.selectedTrip;
            }
        });

        tabPanels.forEach((panel, index) => {
            panel.classList.toggle('active', index === this.activeTab);
        });
    }

    /**
     * Handle tab switch logic
     */
    handleTabSwitch(tabIndex) {
        switch (tabIndex) {
            case 0: // My Trips
                if (this.components.tripList) {
                    this.components.tripList.refresh();
                }
                break;
                
            case 1: // Trip Details
                // Trip detail component handles its own updates
                break;
                
            case 2: // AI Trip Planner
                // Trip planner component handles its own state
                break;
                
            case 3: // Database Testing
                if (this.components.databaseTesting) {
                    this.components.databaseTesting.loadStats();
                }
                break;
        }
    }

    /**
     * Select a trip and switch to details tab
     */
    selectTrip(trip) {
        this.selectedTrip = trip;
        
        // Enable trip details tab
        this.updateTabStates();
        
        // Switch to trip details tab
        this.switchTab(1);
        
        console.log('Trip selected:', trip.name);
    }

    /**
     * Clear selected trip
     */
    clearSelectedTrip() {
        this.selectedTrip = null;
        
        // If currently on trip details tab, switch to trips list
        if (this.activeTab === 1) {
            this.switchTab(0);
        }
        
        this.updateTabStates();
    }

    /**
     * Refresh data across components
     */
    async refreshData() {
        try {
            // Refresh trip list
            if (this.components.tripList) {
                this.components.tripList.refresh();
            }
            
            // Refresh trip detail if a trip is selected
            if (this.selectedTrip && this.components.tripDetail) {
                this.components.tripDetail.refreshTrip();
            }
            
            // Refresh database testing stats
            if (this.components.databaseTesting) {
                this.components.databaseTesting.loadStats();
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
            showToast('Failed to refresh data', 'error');
        }
    }

    /**
     * Handle global keyboard shortcuts
     */
    handleGlobalKeyboard(event) {
        // Only handle shortcuts when not typing in input fields
        if (event.target.tagName === 'INPUT' || 
            event.target.tagName === 'TEXTAREA' || 
            event.target.tagName === 'SELECT') {
            return;
        }

        // Handle shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case '1':
                    event.preventDefault();
                    this.switchTab(0);
                    break;
                case '2':
                    event.preventDefault();
                    this.switchTab(1);
                    break;
                case '3':
                    event.preventDefault();
                    this.switchTab(2);
                    break;
                case '4':
                    event.preventDefault();
                    this.switchTab(3);
                    break;
                case 'n':
                    event.preventDefault();
                    if (this.activeTab === 0) {
                        // Trigger new trip creation
                        const addTripBtn = document.getElementById('add-trip-btn');
                        if (addTripBtn) addTripBtn.click();
                    }
                    break;
            }
        }

        // Escape key to close modals
        if (event.key === 'Escape') {
            const modal = document.querySelector('.dialog-overlay');
            if (modal) {
                modal.remove();
            }
        }
    }

    /**
     * Handle window resize
     */
    handleWindowResize() {
        // Notify map components to resize if visible
        if (this.activeTab === 1 && this.components.tripDetail) {
            // Trip detail map resize is handled internally
        }
    }

    /**
     * Show initialization error
     */
    showInitializationError(error) {
        hideLoading();
        
        document.body.innerHTML = `
            <div class="error-container">
                <div class="error-content">
                    <div class="error-icon">
                        <span class="material-icons">error_outline</span>
                    </div>
                    <h2>Failed to Initialize Application</h2>
                    <p>There was an error starting the Trip Management application:</p>
                    <div class="error-details">
                        <code>${error.message}</code>
                    </div>
                    <div class="error-actions">
                        <button class="btn btn-primary" onclick="location.reload()">
                            <span class="material-icons">refresh</span>
                            Reload Application
                        </button>
                        <button class="btn btn-outlined" onclick="this.showDebugInfo()">
                            <span class="material-icons">bug_report</span>
                            Show Debug Info
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add error styles
        const style = document.createElement('style');
        style.textContent = `
            .error-container {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f5f5f5;
                padding: 2rem;
            }
            .error-content {
                background: white;
                padding: 3rem;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 500px;
            }
            .error-icon {
                font-size: 4rem;
                color: #f44336;
                margin-bottom: 1rem;
            }
            .error-details {
                background: #f5f5f5;
                padding: 1rem;
                border-radius: 4px;
                margin: 1rem 0;
                font-family: monospace;
                text-align: left;
            }
            .error-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin-top: 2rem;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Show debug information
     */
    showDebugInfo() {
        const debugInfo = {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            localStorage: !!window.localStorage,
            indexedDB: !!window.indexedDB,
            serviceWorker: !!navigator.serviceWorker
        };

        alert(`Debug Information:\n${JSON.stringify(debugInfo, null, 2)}`);
    }

    /**
     * Get current app state
     */
    getState() {
        return {
            activeTab: this.activeTab,
            selectedTrip: this.selectedTrip,
            components: Object.keys(this.components)
        };
    }

    /**
     * Export app data
     */
    async exportAppData() {
        try {
            const trips = await tripService.getAllTrips();
            const stats = await tripService.getStats();
            
            const exportData = {
                trips,
                stats,
                appState: this.getState(),
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `tripmaster_full_export_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            showToast('App data exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting app data:', error);
            showToast('Failed to export app data', 'error');
        }
    }

    /**
     * Destroy the application
     */
    destroy() {
        // Clean up event listeners
        eventBus.off('tripSelected');
        eventBus.off('tripUpdated');
        eventBus.off('tripCreated');
        eventBus.off('tripDeleted');

        // Destroy components
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });

        // Clear references
        this.components = {};
        this.selectedTrip = null;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tripApp = new TripManagementApp();
});

// Export for global access
window.TripManagementApp = TripManagementApp;