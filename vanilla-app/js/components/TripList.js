/**
 * TripList Component - Displays and manages list of trips
 * Vanilla JavaScript implementation
 */

import { tripService } from '../services/TripService.js';
import { formatDate, showToast, createModal, eventBus } from '../utils/helpers.js';

export class TripList {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.trips = [];
        this.selectedTrip = null;
        this.searchTerm = '';
        this.statusFilter = 'all';
        
        this.init();
        this.bindEvents();
        this.loadTrips();
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
     * Bind event listeners
     */
    bindEvents() {
        // Listen for trip updates
        eventBus.on('tripUpdated', () => {
            this.loadTrips();
        });

        eventBus.on('tripCreated', () => {
            this.loadTrips();
        });

        eventBus.on('tripDeleted', () => {
            this.loadTrips();
        });
    }

    /**
     * Load trips from service
     */
    async loadTrips() {
        try {
            this.showLoading();
            this.trips = await tripService.getAllTrips();
            this.renderTripsList();
        } catch (error) {
            console.error('Error loading trips:', error);
            this.showError('Failed to load trips');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Render the main component structure
     */
    render() {
        this.container.innerHTML = `
            <div class="trip-list">
                <!-- Header -->
                <div class="trip-list-header">
                    <div class="header-top">
                        <h2>My Trips</h2>
                        <button class="btn btn-primary" id="add-trip-btn">
                            <span class="material-icons">add</span>
                            Add Trip
                        </button>
                    </div>
                    
                    <!-- Search and Filter -->
                    <div class="trip-controls">
                        <div class="search-box">
                            <input type="text" 
                                   id="trip-search" 
                                   class="form-control" 
                                   placeholder="Search trips..."
                                   value="${this.searchTerm}">
                            <span class="material-icons search-icon">search</span>
                        </div>
                        
                        <div class="filter-box">
                            <select id="status-filter" class="form-control">
                                <option value="all">All Status</option>
                                <option value="planned">Planned</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Trip List Content -->
                <div id="trips-content" class="trips-content">
                    <div class="loading-placeholder">
                        <div class="spinner"></div>
                        <p>Loading trips...</p>
                    </div>
                </div>
            </div>
        `;

        this.bindUIEvents();
    }

    /**
     * Bind UI event listeners
     */
    bindUIEvents() {
        // Add trip button
        const addTripBtn = document.getElementById('add-trip-btn');
        if (addTripBtn) {
            addTripBtn.addEventListener('click', () => this.showAddTripModal());
        }

        // Search input
        const searchInput = document.getElementById('trip-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.filterTrips();
            });
        }

        // Status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.value = this.statusFilter;
            statusFilter.addEventListener('change', (e) => {
                this.statusFilter = e.target.value;
                this.filterTrips();
            });
        }
    }

    /**
     * Render trips list
     */
    renderTripsList() {
        const content = document.getElementById('trips-content');
        if (!content) return;

        if (this.trips.length === 0) {
            this.showEmptyState();
            return;
        }

        const filteredTrips = this.getFilteredTrips();

        if (filteredTrips.length === 0) {
            this.showNoResultsState();
            return;
        }

        content.innerHTML = `
            <div class="trips-grid">
                ${filteredTrips.map(trip => this.renderTripCard(trip)).join('')}
            </div>
        `;

        this.bindTripCardEvents();
    }

    /**
     * Render individual trip card
     */
    renderTripCard(trip) {
        const statusClass = trip.status.replace('-', '');
        const destinationCount = trip.destinations.length;
        const startDate = formatDate(trip.startDate);
        const endDate = formatDate(trip.endDate);

        return `
            <div class="card trip-card" data-trip-id="${trip.id}">
                <div class="card-content">
                    <div class="trip-header">
                        <h3 class="trip-title">${trip.name}</h3>
                        <span class="trip-status ${statusClass}">${trip.status}</span>
                    </div>
                    
                    <div class="trip-dates">
                        <span class="material-icons">calendar_today</span>
                        ${startDate} - ${endDate}
                    </div>
                    
                    <div class="trip-destinations">
                        <span class="material-icons">place</span>
                        ${destinationCount} destination${destinationCount !== 1 ? 's' : ''}
                        ${destinationCount > 0 ? 
                            `<div class="destination-chips">
                                ${trip.destinations.slice(0, 3).map(dest => 
                                    `<span class="chip">${dest.name}</span>`
                                ).join('')}
                                ${destinationCount > 3 ? 
                                    `<span class="chip">+${destinationCount - 3} more</span>` : ''
                                }
                            </div>` : ''
                        }
                    </div>
                    
                    <div class="trip-actions">
                        <button class="btn btn-outlined view-trip-btn" data-trip-id="${trip.id}">
                            <span class="material-icons">visibility</span>
                            View Details
                        </button>
                        <button class="btn btn-text edit-trip-btn" data-trip-id="${trip.id}">
                            <span class="material-icons">edit</span>
                            Edit
                        </button>
                        <button class="btn btn-text duplicate-trip-btn" data-trip-id="${trip.id}">
                            <span class="material-icons">content_copy</span>
                            Duplicate
                        </button>
                        <button class="btn btn-text delete-trip-btn" data-trip-id="${trip.id}">
                            <span class="material-icons">delete</span>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Bind trip card event listeners
     */
    bindTripCardEvents() {
        // View trip buttons
        document.querySelectorAll('.view-trip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tripId = btn.dataset.tripId;
                this.selectTrip(tripId);
            });
        });

        // Edit trip buttons
        document.querySelectorAll('.edit-trip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tripId = btn.dataset.tripId;
                this.editTrip(tripId);
            });
        });

        // Duplicate trip buttons
        document.querySelectorAll('.duplicate-trip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tripId = btn.dataset.tripId;
                this.duplicateTrip(tripId);
            });
        });

        // Delete trip buttons
        document.querySelectorAll('.delete-trip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tripId = btn.dataset.tripId;
                this.deleteTrip(tripId);
            });
        });

        // Trip card click to view details
        document.querySelectorAll('.trip-card').forEach(card => {
            card.addEventListener('click', () => {
                const tripId = card.dataset.tripId;
                this.selectTrip(tripId);
            });
        });
    }

    /**
     * Get filtered trips based on search and status
     */
    getFilteredTrips() {
        let filtered = [...this.trips];

        // Filter by search term
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(trip => {
                return trip.name.toLowerCase().includes(term) ||
                       trip.destinations.some(dest => 
                           dest.name.toLowerCase().includes(term) ||
                           dest.location.toLowerCase().includes(term)
                       );
            });
        }

        // Filter by status
        if (this.statusFilter !== 'all') {
            filtered = filtered.filter(trip => trip.status === this.statusFilter);
        }

        return filtered.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    }

    /**
     * Filter trips and re-render
     */
    filterTrips() {
        this.renderTripsList();
    }

    /**
     * Select a trip and notify listeners
     */
    selectTrip(tripId) {
        const trip = this.trips.find(t => t.id === tripId);
        if (trip) {
            this.selectedTrip = trip;
            eventBus.emit('tripSelected', trip);
            showToast(`Viewing "${trip.name}"`, 'info', 2000);
        }
    }

    /**
     * Show add trip modal
     */
    showAddTripModal() {
        const content = `
            <form id="add-trip-form" class="trip-form">
                <div class="form-group">
                    <label for="trip-name" class="form-label">Trip Name *</label>
                    <input type="text" id="trip-name" name="name" class="form-control" required
                           placeholder="Enter trip name">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="start-date" class="form-label">Start Date *</label>
                        <input type="date" id="start-date" name="startDate" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="end-date" class="form-label">End Date *</label>
                        <input type="date" id="end-date" name="endDate" class="form-control" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="trip-status" class="form-label">Status</label>
                    <select id="trip-status" name="status" class="form-control">
                        <option value="planned">Planned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </form>
        `;

        const actions = [
            {
                text: 'Cancel',
                class: 'btn-text',
                onclick: 'this.closest(".dialog-overlay").remove()'
            },
            {
                text: 'Create Trip',
                class: 'btn-primary',
                onclick: 'tripListInstance.handleAddTrip()'
            }
        ];

        // Store reference for access in onclick
        window.tripListInstance = this;

        createModal('Add New Trip', content, actions);

        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        document.getElementById('start-date').value = today;
        document.getElementById('end-date').value = tomorrow.toISOString().split('T')[0];
    }

    /**
     * Handle add trip form submission
     */
    async handleAddTrip() {
        const form = document.getElementById('add-trip-form');
        if (!form) return;

        const formData = new FormData(form);
        const tripData = Object.fromEntries(formData.entries());

        try {
            await tripService.createTrip(tripData);
            document.querySelector('.dialog-overlay').remove();
            this.loadTrips();
            eventBus.emit('tripCreated', tripData);
        } catch (error) {
            console.error('Error creating trip:', error);
            // Error handling is done in the service
        }
    }

    /**
     * Edit trip
     */
    editTrip(tripId) {
        const trip = this.trips.find(t => t.id === tripId);
        if (!trip) return;

        const content = `
            <form id="edit-trip-form" class="trip-form">
                <div class="form-group">
                    <label for="edit-trip-name" class="form-label">Trip Name *</label>
                    <input type="text" id="edit-trip-name" name="name" class="form-control" 
                           value="${trip.name}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-start-date" class="form-label">Start Date *</label>
                        <input type="date" id="edit-start-date" name="startDate" class="form-control" 
                               value="${trip.startDate}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-end-date" class="form-label">End Date *</label>
                        <input type="date" id="edit-end-date" name="endDate" class="form-control" 
                               value="${trip.endDate}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="edit-trip-status" class="form-label">Status</label>
                    <select id="edit-trip-status" name="status" class="form-control">
                        <option value="planned" ${trip.status === 'planned' ? 'selected' : ''}>Planned</option>
                        <option value="in-progress" ${trip.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${trip.status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
            </form>
        `;

        const actions = [
            {
                text: 'Cancel',
                class: 'btn-text',
                onclick: 'this.closest(".dialog-overlay").remove()'
            },
            {
                text: 'Update Trip',
                class: 'btn-primary',
                onclick: `tripListInstance.handleEditTrip('${tripId}')`
            }
        ];

        createModal('Edit Trip', content, actions);
    }

    /**
     * Handle edit trip form submission
     */
    async handleEditTrip(tripId) {
        const form = document.getElementById('edit-trip-form');
        if (!form) return;

        const formData = new FormData(form);
        const tripData = Object.fromEntries(formData.entries());

        try {
            await tripService.updateTrip(tripId, tripData);
            document.querySelector('.dialog-overlay').remove();
            this.loadTrips();
            eventBus.emit('tripUpdated', tripData);
        } catch (error) {
            console.error('Error updating trip:', error);
        }
    }

    /**
     * Duplicate trip
     */
    async duplicateTrip(tripId) {
        try {
            const duplicatedTrip = await tripService.duplicateTrip(tripId);
            this.loadTrips();
            eventBus.emit('tripCreated', duplicatedTrip);
        } catch (error) {
            console.error('Error duplicating trip:', error);
        }
    }

    /**
     * Delete trip with confirmation
     */
    deleteTrip(tripId) {
        const trip = this.trips.find(t => t.id === tripId);
        if (!trip) return;

        const content = `
            <div class="delete-confirmation">
                <p>Are you sure you want to delete the trip "<strong>${trip.name}</strong>"?</p>
                <p class="text-secondary">This action cannot be undone.</p>
            </div>
        `;

        const actions = [
            {
                text: 'Cancel',
                class: 'btn-text',
                onclick: 'this.closest(".dialog-overlay").remove()'
            },
            {
                text: 'Delete Trip',
                class: 'btn-secondary',
                onclick: `tripListInstance.handleDeleteTrip('${tripId}')`
            }
        ];

        createModal('Delete Trip', content, actions);
    }

    /**
     * Handle trip deletion
     */
    async handleDeleteTrip(tripId) {
        try {
            await tripService.deleteTrip(tripId);
            document.querySelector('.dialog-overlay').remove();
            this.loadTrips();
            eventBus.emit('tripDeleted', tripId);
        } catch (error) {
            console.error('Error deleting trip:', error);
        }
    }

    /**
     * Show empty state
     */
    showEmptyState() {
        const content = document.getElementById('trips-content');
        if (content) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <span class="material-icons">flight_takeoff</span>
                    </div>
                    <h3>No trips yet</h3>
                    <p>Create your first trip to start planning your adventure!</p>
                    <button class="btn btn-primary" onclick="document.getElementById('add-trip-btn').click()">
                        <span class="material-icons">add</span>
                        Add Your First Trip
                    </button>
                </div>
            `;
        }
    }

    /**
     * Show no search results state
     */
    showNoResultsState() {
        const content = document.getElementById('trips-content');
        if (content) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <span class="material-icons">search_off</span>
                    </div>
                    <h3>No trips found</h3>
                    <p>Try adjusting your search terms or filters</p>
                    <button class="btn btn-outlined" onclick="tripListInstance.clearFilters()">
                        Clear Filters
                    </button>
                </div>
            `;
        }
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.searchTerm = '';
        this.statusFilter = 'all';
        
        document.getElementById('trip-search').value = '';
        document.getElementById('status-filter').value = 'all';
        
        this.renderTripsList();
    }

    /**
     * Show loading state
     */
    showLoading() {
        const content = document.getElementById('trips-content');
        if (content) {
            content.innerHTML = `
                <div class="loading-placeholder">
                    <div class="spinner"></div>
                    <p>Loading trips...</p>
                </div>
            `;
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        // Loading is hidden when content is rendered
    }

    /**
     * Show error state
     */
    showError(message) {
        const content = document.getElementById('trips-content');
        if (content) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <span class="material-icons">error_outline</span>
                    </div>
                    <h3>Error Loading Trips</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="tripListInstance.loadTrips()">
                        <span class="material-icons">refresh</span>
                        Try Again
                    </button>
                </div>
            `;
        }
    }

    /**
     * Refresh trips list
     */
    refresh() {
        this.loadTrips();
    }

    /**
     * Get selected trip
     */
    getSelectedTrip() {
        return this.selectedTrip;
    }

    /**
     * Destroy component
     */
    destroy() {
        eventBus.off('tripUpdated');
        eventBus.off('tripCreated');
        eventBus.off('tripDeleted');
        
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}