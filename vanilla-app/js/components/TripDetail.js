/**
 * TripDetail Component - Displays detailed trip information with destinations and hotels
 * Vanilla JavaScript implementation
 */

import { tripService } from '../services/TripService.js';
import { formatDate, showToast, createModal, eventBus } from '../utils/helpers.js';
import { createMap } from './MapView.js';

export class TripDetail {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.trip = null;
        this.mapView = null;
        this.activeTab = 0;
        
        this.init();
        this.bindEvents();
    }

    /**
     * Initialize the component
     */
    init() {
        if (!this.container) {
            console.error(`Container with id "${this.containerId}" not found`);
            return;
        }

        this.renderEmptyState();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Listen for trip selection
        eventBus.on('tripSelected', (trip) => {
            this.setTrip(trip);
        });

        // Listen for trip updates
        eventBus.on('tripUpdated', () => {
            if (this.trip) {
                this.refreshTrip();
            }
        });
    }

    /**
     * Set the trip to display
     */
    async setTrip(trip) {
        this.trip = trip;
        if (trip) {
            // Get fresh data from service
            await this.refreshTrip();
        } else {
            this.renderEmptyState();
        }
    }

    /**
     * Refresh trip data
     */
    async refreshTrip() {
        if (!this.trip) return;

        try {
            const updatedTrip = await tripService.getTripById(this.trip.id);
            if (updatedTrip) {
                this.trip = updatedTrip;
                this.render();
            } else {
                this.renderNotFound();
            }
        } catch (error) {
            console.error('Error refreshing trip:', error);
            this.renderError('Failed to load trip details');
        }
    }

    /**
     * Render the trip detail view
     */
    render() {
        if (!this.trip) {
            this.renderEmptyState();
            return;
        }

        this.container.innerHTML = `
            <div class="trip-detail">
                <!-- Trip Overview -->
                <div class="trip-overview">
                    <div class="trip-info">
                        <h2>${this.trip.name}</h2>
                        <div class="trip-meta">
                            <div class="trip-meta-item">
                                <span class="material-icons">calendar_today</span>
                                <span>${formatDate(this.trip.startDate)} - ${formatDate(this.trip.endDate)}</span>
                            </div>
                            <div class="trip-meta-item">
                                <span class="material-icons">place</span>
                                <span>${this.trip.destinations.length} destination${this.trip.destinations.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div class="trip-meta-item">
                                <span class="material-icons">hotel</span>
                                <span>${this.getTotalHotels()} hotel${this.getTotalHotels() !== 1 ? 's' : ''}</span>
                            </div>
                            <div class="trip-meta-item">
                                <span class="trip-status ${this.trip.status.replace('-', '')}">${this.trip.status}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="trip-actions">
                        <button class="btn btn-outlined edit-trip-btn">
                            <span class="material-icons">edit</span>
                            Edit Trip
                        </button>
                        <button class="btn btn-text export-trip-btn">
                            <span class="material-icons">download</span>
                            Export
                        </button>
                    </div>
                </div>

                <!-- Tab Navigation -->
                <div class="trip-detail-tabs">
                    <nav class="tabs" role="tablist">
                        <button class="tab-button ${this.activeTab === 0 ? 'active' : ''}" 
                                data-tab="0" role="tab">
                            <span class="material-icons">list</span>
                            Destinations & Hotels
                        </button>
                        <button class="tab-button ${this.activeTab === 1 ? 'active' : ''}" 
                                data-tab="1" role="tab">
                            <span class="material-icons">map</span>
                            Map View
                        </button>
                    </nav>

                    <!-- Tab Panels -->
                    <div class="tab-panels">
                        <!-- Destinations Tab -->
                        <div class="tab-panel ${this.activeTab === 0 ? 'active' : ''}" data-panel="0">
                            ${this.renderDestinationsTab()}
                        </div>

                        <!-- Map Tab -->
                        <div class="tab-panel ${this.activeTab === 1 ? 'active' : ''}" data-panel="1">
                            ${this.renderMapTab()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindUIEvents();
        this.initializeMap();
    }

    /**
     * Render destinations tab content
     */
    renderDestinationsTab() {
        const destinations = this.trip.destinations || [];

        if (destinations.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <span class="material-icons">place</span>
                    </div>
                    <h3>No destinations yet</h3>
                    <p>Add destinations to start planning your trip</p>
                    <button class="btn btn-primary add-destination-btn">
                        <span class="material-icons">add</span>
                        Add Destination
                    </button>
                </div>
            `;
        }

        return `
            <div class="destinations-section">
                <div class="section-header">
                    <h3>Destinations</h3>
                    <button class="btn btn-primary add-destination-btn">
                        <span class="material-icons">add</span>
                        Add Destination
                    </button>
                </div>
                
                <div class="destination-list">
                    ${destinations.map((dest, index) => this.renderDestinationItem(dest, index)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render individual destination item
     */
    renderDestinationItem(destination, index) {
        const hotels = destination.hotels || [];

        return `
            <div class="destination-item" data-destination-id="${destination.id}">
                <div class="destination-header">
                    <div class="destination-info">
                        <span class="destination-sequence">${index + 1}</span>
                        <div>
                            <h4 class="destination-name">${destination.name}</h4>
                            <p class="destination-location">
                                <span class="material-icons">place</span>
                                ${destination.location}
                            </p>
                        </div>
                    </div>
                    
                    <div class="destination-actions">
                        <button class="icon-btn add-hotel-btn" 
                                data-destination-id="${destination.id}"
                                title="Add Hotel">
                            <span class="material-icons">hotel</span>
                        </button>
                        <button class="icon-btn edit-destination-btn" 
                                data-destination-id="${destination.id}"
                                title="Edit Destination">
                            <span class="material-icons">edit</span>
                        </button>
                        <button class="icon-btn delete-destination-btn" 
                                data-destination-id="${destination.id}"
                                title="Delete Destination">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                </div>

                ${hotels.length > 0 ? `
                    <div class="hotel-list">
                        <h5>Hotels (${hotels.length})</h5>
                        ${hotels.map(hotel => this.renderHotelItem(hotel, destination.id)).join('')}
                    </div>
                ` : `
                    <div class="no-hotels">
                        <p>No hotels added yet</p>
                        <button class="btn btn-text add-hotel-btn" 
                                data-destination-id="${destination.id}">
                            <span class="material-icons">add</span>
                            Add Hotel
                        </button>
                    </div>
                `}
            </div>
        `;
    }

    /**
     * Render individual hotel item
     */
    renderHotelItem(hotel, destinationId) {
        return `
            <div class="hotel-item" data-hotel-id="${hotel.id}">
                <div class="hotel-info">
                    <h6 class="hotel-name">${hotel.name}</h6>
                    <p class="hotel-address">${hotel.address}</p>
                </div>
                
                <div class="hotel-actions">
                    <button class="icon-btn edit-hotel-btn" 
                            data-destination-id="${destinationId}"
                            data-hotel-id="${hotel.id}"
                            title="Edit Hotel">
                        <span class="material-icons">edit</span>
                    </button>
                    <button class="icon-btn delete-hotel-btn" 
                            data-destination-id="${destinationId}"
                            data-hotel-id="${hotel.id}"
                            title="Delete Hotel">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render map tab content
     */
    renderMapTab() {
        return `
            <div class="map-section">
                <div id="trip-map-container" class="map-container"></div>
            </div>
        `;
    }

    /**
     * Initialize map
     */
    initializeMap() {
        if (this.activeTab === 1) {
            setTimeout(() => {
                this.mapView = createMap('trip-map-container', {
                    height: '500px',
                    defaultZoom: 4
                });
                
                if (this.trip && this.trip.destinations) {
                    this.mapView.updateDestinations(this.trip.destinations);
                }
            }, 100);
        }
    }

    /**
     * Bind UI event listeners
     */
    bindUIEvents() {
        // Tab switching
        this.container.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabIndex = parseInt(btn.dataset.tab);
                this.switchTab(tabIndex);
            });
        });

        // Edit trip
        const editTripBtn = this.container.querySelector('.edit-trip-btn');
        if (editTripBtn) {
            editTripBtn.addEventListener('click', () => this.editTrip());
        }

        // Export trip
        const exportTripBtn = this.container.querySelector('.export-trip-btn');
        if (exportTripBtn) {
            exportTripBtn.addEventListener('click', () => this.exportTrip());
        }

        // Add destination
        this.container.querySelectorAll('.add-destination-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showAddDestinationModal());
        });

        // Destination actions
        this.container.querySelectorAll('.edit-destination-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const destinationId = btn.dataset.destinationId;
                this.editDestination(destinationId);
            });
        });

        this.container.querySelectorAll('.delete-destination-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const destinationId = btn.dataset.destinationId;
                this.deleteDestination(destinationId);
            });
        });

        // Add hotel
        this.container.querySelectorAll('.add-hotel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const destinationId = btn.dataset.destinationId;
                this.showAddHotelModal(destinationId);
            });
        });

        // Hotel actions
        this.container.querySelectorAll('.edit-hotel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const destinationId = btn.dataset.destinationId;
                const hotelId = btn.dataset.hotelId;
                this.editHotel(destinationId, hotelId);
            });
        });

        this.container.querySelectorAll('.delete-hotel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const destinationId = btn.dataset.destinationId;
                const hotelId = btn.dataset.hotelId;
                this.deleteHotel(destinationId, hotelId);
            });
        });
    }

    /**
     * Switch between tabs
     */
    switchTab(tabIndex) {
        if (this.activeTab === tabIndex) return;

        this.activeTab = tabIndex;

        // Update tab buttons
        this.container.querySelectorAll('.tab-button').forEach((btn, index) => {
            btn.classList.toggle('active', index === tabIndex);
        });

        // Update tab panels
        this.container.querySelectorAll('.tab-panel').forEach((panel, index) => {
            panel.classList.toggle('active', index === tabIndex);
        });

        // Initialize map if switching to map tab
        if (tabIndex === 1 && !this.mapView) {
            this.initializeMap();
        } else if (tabIndex === 1 && this.mapView) {
            // Refresh map size
            this.mapView.resize();
        }
    }

    /**
     * Edit trip information
     */
    editTrip() {
        const content = `
            <form id="edit-trip-form" class="trip-form">
                <div class="form-group">
                    <label for="edit-trip-name" class="form-label">Trip Name *</label>
                    <input type="text" id="edit-trip-name" name="name" class="form-control" 
                           value="${this.trip.name}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-start-date" class="form-label">Start Date *</label>
                        <input type="date" id="edit-start-date" name="startDate" class="form-control" 
                               value="${this.trip.startDate}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-end-date" class="form-label">End Date *</label>
                        <input type="date" id="edit-end-date" name="endDate" class="form-control" 
                               value="${this.trip.endDate}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="edit-trip-status" class="form-label">Status</label>
                    <select id="edit-trip-status" name="status" class="form-control">
                        <option value="planned" ${this.trip.status === 'planned' ? 'selected' : ''}>Planned</option>
                        <option value="in-progress" ${this.trip.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${this.trip.status === 'completed' ? 'selected' : ''}>Completed</option>
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
                onclick: 'tripDetailInstance.handleEditTrip()'
            }
        ];

        window.tripDetailInstance = this;
        createModal('Edit Trip', content, actions);
    }

    /**
     * Handle edit trip form submission
     */
    async handleEditTrip() {
        const form = document.getElementById('edit-trip-form');
        if (!form) return;

        const formData = new FormData(form);
        const tripData = Object.fromEntries(formData.entries());

        try {
            await tripService.updateTrip(this.trip.id, tripData);
            document.querySelector('.dialog-overlay').remove();
            await this.refreshTrip();
            eventBus.emit('tripUpdated', this.trip);
        } catch (error) {
            console.error('Error updating trip:', error);
        }
    }

    /**
     * Export trip data
     */
    async exportTrip() {
        try {
            await tripService.exportTrip(this.trip.id);
        } catch (error) {
            console.error('Error exporting trip:', error);
        }
    }

    /**
     * Show add destination modal
     */
    showAddDestinationModal() {
        const content = `
            <form id="add-destination-form" class="destination-form">
                <div class="form-group">
                    <label for="dest-name" class="form-label">Destination Name *</label>
                    <input type="text" id="dest-name" name="name" class="form-control" required
                           placeholder="Enter destination name">
                </div>
                
                <div class="form-group">
                    <label for="dest-location" class="form-label">Location *</label>
                    <input type="text" id="dest-location" name="location" class="form-control" required
                           placeholder="Enter full address or location">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="dest-lat" class="form-label">Latitude</label>
                        <input type="number" id="dest-lat" name="latitude" class="form-control" 
                               step="any" min="-90" max="90" placeholder="Optional">
                    </div>
                    
                    <div class="form-group">
                        <label for="dest-lng" class="form-label">Longitude</label>
                        <input type="number" id="dest-lng" name="longitude" class="form-control" 
                               step="any" min="-180" max="180" placeholder="Optional">
                    </div>
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
                text: 'Add Destination',
                class: 'btn-primary',
                onclick: 'tripDetailInstance.handleAddDestination()'
            }
        ];

        createModal('Add Destination', content, actions);
    }

    /**
     * Handle add destination form submission
     */
    async handleAddDestination() {
        const form = document.getElementById('add-destination-form');
        if (!form) return;

        const formData = new FormData(form);
        const destinationData = Object.fromEntries(formData.entries());

        // Convert latitude and longitude to numbers if provided
        if (destinationData.latitude) {
            destinationData.latitude = parseFloat(destinationData.latitude);
        }
        if (destinationData.longitude) {
            destinationData.longitude = parseFloat(destinationData.longitude);
        }

        try {
            await tripService.addDestination(this.trip.id, destinationData);
            document.querySelector('.dialog-overlay').remove();
            await this.refreshTrip();
            
            // Update map if visible
            if (this.mapView && this.activeTab === 1) {
                this.mapView.updateDestinations(this.trip.destinations);
            }
        } catch (error) {
            console.error('Error adding destination:', error);
        }
    }

    /**
     * Edit destination
     */
    editDestination(destinationId) {
        const destination = this.trip.destinations.find(d => d.id === destinationId);
        if (!destination) return;

        const content = `
            <form id="edit-destination-form" class="destination-form">
                <div class="form-group">
                    <label for="edit-dest-name" class="form-label">Destination Name *</label>
                    <input type="text" id="edit-dest-name" name="name" class="form-control" 
                           value="${destination.name}" required>
                </div>
                
                <div class="form-group">
                    <label for="edit-dest-location" class="form-label">Location *</label>
                    <input type="text" id="edit-dest-location" name="location" class="form-control" 
                           value="${destination.location}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-dest-lat" class="form-label">Latitude</label>
                        <input type="number" id="edit-dest-lat" name="latitude" class="form-control" 
                               step="any" min="-90" max="90" value="${destination.latitude || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-dest-lng" class="form-label">Longitude</label>
                        <input type="number" id="edit-dest-lng" name="longitude" class="form-control" 
                               step="any" min="-180" max="180" value="${destination.longitude || ''}">
                    </div>
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
                text: 'Update Destination',
                class: 'btn-primary',
                onclick: `tripDetailInstance.handleEditDestination('${destinationId}')`
            }
        ];

        createModal('Edit Destination', content, actions);
    }

    /**
     * Handle edit destination form submission
     */
    async handleEditDestination(destinationId) {
        const form = document.getElementById('edit-destination-form');
        if (!form) return;

        const formData = new FormData(form);
        const destinationData = Object.fromEntries(formData.entries());

        // Convert latitude and longitude to numbers if provided
        if (destinationData.latitude) {
            destinationData.latitude = parseFloat(destinationData.latitude);
        }
        if (destinationData.longitude) {
            destinationData.longitude = parseFloat(destinationData.longitude);
        }

        try {
            await tripService.updateDestination(this.trip.id, destinationId, destinationData);
            document.querySelector('.dialog-overlay').remove();
            await this.refreshTrip();
            
            // Update map if visible
            if (this.mapView && this.activeTab === 1) {
                this.mapView.updateDestinations(this.trip.destinations);
            }
        } catch (error) {
            console.error('Error updating destination:', error);
        }
    }

    /**
     * Delete destination with confirmation
     */
    deleteDestination(destinationId) {
        const destination = this.trip.destinations.find(d => d.id === destinationId);
        if (!destination) return;

        const content = `
            <div class="delete-confirmation">
                <p>Are you sure you want to delete the destination "<strong>${destination.name}</strong>"?</p>
                <p class="text-secondary">This will also delete all associated hotels.</p>
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
                text: 'Delete Destination',
                class: 'btn-secondary',
                onclick: `tripDetailInstance.handleDeleteDestination('${destinationId}')`
            }
        ];

        createModal('Delete Destination', content, actions);
    }

    /**
     * Handle destination deletion
     */
    async handleDeleteDestination(destinationId) {
        try {
            await tripService.deleteDestination(this.trip.id, destinationId);
            document.querySelector('.dialog-overlay').remove();
            await this.refreshTrip();
            
            // Update map if visible
            if (this.mapView && this.activeTab === 1) {
                this.mapView.updateDestinations(this.trip.destinations);
            }
        } catch (error) {
            console.error('Error deleting destination:', error);
        }
    }

    /**
     * Show add hotel modal
     */
    showAddHotelModal(destinationId) {
        const destination = this.trip.destinations.find(d => d.id === destinationId);
        if (!destination) return;

        const content = `
            <form id="add-hotel-form" class="hotel-form">
                <div class="form-group">
                    <label class="form-label">Adding hotel to: <strong>${destination.name}</strong></label>
                </div>
                
                <div class="form-group">
                    <label for="hotel-name" class="form-label">Hotel Name *</label>
                    <input type="text" id="hotel-name" name="name" class="form-control" required
                           placeholder="Enter hotel name">
                </div>
                
                <div class="form-group">
                    <label for="hotel-address" class="form-label">Address *</label>
                    <textarea id="hotel-address" name="address" class="form-control" rows="3" required
                              placeholder="Enter hotel address"></textarea>
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
                text: 'Add Hotel',
                class: 'btn-primary',
                onclick: `tripDetailInstance.handleAddHotel('${destinationId}')`
            }
        ];

        createModal('Add Hotel', content, actions);
    }

    /**
     * Handle add hotel form submission
     */
    async handleAddHotel(destinationId) {
        const form = document.getElementById('add-hotel-form');
        if (!form) return;

        const formData = new FormData(form);
        const hotelData = Object.fromEntries(formData.entries());

        try {
            await tripService.addHotel(this.trip.id, destinationId, hotelData);
            document.querySelector('.dialog-overlay').remove();
            await this.refreshTrip();
        } catch (error) {
            console.error('Error adding hotel:', error);
        }
    }

    /**
     * Edit hotel
     */
    editHotel(destinationId, hotelId) {
        const destination = this.trip.destinations.find(d => d.id === destinationId);
        if (!destination) return;

        const hotel = destination.hotels.find(h => h.id === hotelId);
        if (!hotel) return;

        const content = `
            <form id="edit-hotel-form" class="hotel-form">
                <div class="form-group">
                    <label class="form-label">Editing hotel in: <strong>${destination.name}</strong></label>
                </div>
                
                <div class="form-group">
                    <label for="edit-hotel-name" class="form-label">Hotel Name *</label>
                    <input type="text" id="edit-hotel-name" name="name" class="form-control" 
                           value="${hotel.name}" required>
                </div>
                
                <div class="form-group">
                    <label for="edit-hotel-address" class="form-label">Address *</label>
                    <textarea id="edit-hotel-address" name="address" class="form-control" rows="3" required>${hotel.address}</textarea>
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
                text: 'Update Hotel',
                class: 'btn-primary',
                onclick: `tripDetailInstance.handleEditHotel('${destinationId}', '${hotelId}')`
            }
        ];

        createModal('Edit Hotel', content, actions);
    }

    /**
     * Handle edit hotel form submission
     */
    async handleEditHotel(destinationId, hotelId) {
        const form = document.getElementById('edit-hotel-form');
        if (!form) return;

        const formData = new FormData(form);
        const hotelData = Object.fromEntries(formData.entries());

        try {
            await tripService.updateHotel(this.trip.id, destinationId, hotelId, hotelData);
            document.querySelector('.dialog-overlay').remove();
            await this.refreshTrip();
        } catch (error) {
            console.error('Error updating hotel:', error);
        }
    }

    /**
     * Delete hotel with confirmation
     */
    deleteHotel(destinationId, hotelId) {
        const destination = this.trip.destinations.find(d => d.id === destinationId);
        if (!destination) return;

        const hotel = destination.hotels.find(h => h.id === hotelId);
        if (!hotel) return;

        const content = `
            <div class="delete-confirmation">
                <p>Are you sure you want to delete the hotel "<strong>${hotel.name}</strong>"?</p>
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
                text: 'Delete Hotel',
                class: 'btn-secondary',
                onclick: `tripDetailInstance.handleDeleteHotel('${destinationId}', '${hotelId}')`
            }
        ];

        createModal('Delete Hotel', content, actions);
    }

    /**
     * Handle hotel deletion
     */
    async handleDeleteHotel(destinationId, hotelId) {
        try {
            await tripService.deleteHotel(this.trip.id, destinationId, hotelId);
            document.querySelector('.dialog-overlay').remove();
            await this.refreshTrip();
        } catch (error) {
            console.error('Error deleting hotel:', error);
        }
    }

    /**
     * Get total number of hotels
     */
    getTotalHotels() {
        if (!this.trip || !this.trip.destinations) return 0;
        return this.trip.destinations.reduce((total, dest) => total + (dest.hotels?.length || 0), 0);
    }

    /**
     * Render empty state
     */
    renderEmptyState() {
        this.container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <span class="material-icons">flight</span>
                </div>
                <h3>No trip selected</h3>
                <p>Please select a trip from the "My Trips" tab to view details.</p>
            </div>
        `;
    }

    /**
     * Render not found state
     */
    renderNotFound() {
        this.container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <span class="material-icons">error_outline</span>
                </div>
                <h3>Trip not found</h3>
                <p>The selected trip could not be found.</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <span class="material-icons">refresh</span>
                    Refresh
                </button>
            </div>
        `;
    }

    /**
     * Render error state
     */
    renderError(message) {
        this.container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <span class="material-icons">error_outline</span>
                </div>
                <h3>Error Loading Trip</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="tripDetailInstance.refreshTrip()">
                    <span class="material-icons">refresh</span>
                    Try Again
                </button>
            </div>
        `;
    }

    /**
     * Destroy component
     */
    destroy() {
        if (this.mapView) {
            this.mapView.destroy();
            this.mapView = null;
        }
        
        eventBus.off('tripSelected');
        eventBus.off('tripUpdated');
        
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}