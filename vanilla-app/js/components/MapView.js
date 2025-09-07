/**
 * MapView Component - Displays trip destinations on an interactive map
 * Vanilla JavaScript implementation using Leaflet.js
 */

export class MapView {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.map = null;
        this.markers = [];
        this.options = {
            height: options.height || '400px',
            defaultCenter: options.defaultCenter || [40.7128, -74.0060], // New York
            defaultZoom: options.defaultZoom || 2,
            showControls: options.showControls !== false,
            ...options
        };
        
        this.init();
    }

    /**
     * Initialize the map component
     */
    init() {
        if (!this.container) {
            console.error(`Map container with id "${this.containerId}" not found`);
            return;
        }

        // Create map container
        this.container.innerHTML = `
            <div class="map-container" style="height: ${this.options.height}">
                <div id="${this.containerId}-map" class="map-leaflet" style="height: 100%; width: 100%;"></div>
            </div>
        `;

        // Initialize Leaflet map
        this.initMap();
    }

    /**
     * Initialize Leaflet map
     */
    initMap() {
        try {
            // Create map instance
            this.map = L.map(`${this.containerId}-map`, {
                center: this.options.defaultCenter,
                zoom: this.options.defaultZoom,
                zoomControl: this.options.showControls
            });

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(this.map);

            // Add scale control if enabled
            if (this.options.showControls) {
                L.control.scale().addTo(this.map);
            }

        } catch (error) {
            console.error('Error initializing map:', error);
            this.showMapError();
        }
    }

    /**
     * Show error message when map fails to load
     */
    showMapError() {
        this.container.innerHTML = `
            <div class="map-container" style="height: ${this.options.height}">
                <div class="map-placeholder">
                    <div class="map-error">
                        <span class="material-icons" style="font-size: 3rem; color: #ccc;">map</span>
                        <p>Unable to load map</p>
                        <button class="btn btn-outlined" onclick="window.location.reload()">Retry</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Update map with destinations
     */
    updateDestinations(destinations) {
        if (!this.map) {
            console.warn('Map not initialized');
            return;
        }

        // Clear existing markers
        this.clearMarkers();

        if (!destinations || destinations.length === 0) {
            this.showEmptyState();
            return;
        }

        // Add markers for each destination
        const validDestinations = destinations.filter(dest => 
            dest.latitude && dest.longitude && 
            !isNaN(dest.latitude) && !isNaN(dest.longitude)
        );

        if (validDestinations.length === 0) {
            this.showNoCoordinatesState();
            return;
        }

        validDestinations.forEach((destination, index) => {
            this.addDestinationMarker(destination, index);
        });

        // Fit map to show all markers
        this.fitBounds(validDestinations);

        // Add polyline if multiple destinations
        if (validDestinations.length > 1) {
            this.addTripRoute(validDestinations);
        }
    }

    /**
     * Add marker for a destination
     */
    addDestinationMarker(destination, index) {
        try {
            const marker = L.marker([destination.latitude, destination.longitude]);
            
            // Create popup content
            const popupContent = this.createPopupContent(destination, index);
            marker.bindPopup(popupContent);
            
            // Add to map and store reference
            marker.addTo(this.map);
            this.markers.push(marker);

            return marker;
        } catch (error) {
            console.error('Error adding marker:', error);
        }
    }

    /**
     * Create popup content for destination marker
     */
    createPopupContent(destination, index) {
        const hotels = destination.hotels || [];
        const hotelsList = hotels.length > 0 ? 
            `<div class="popup-hotels">
                <strong>Hotels:</strong>
                <ul>
                    ${hotels.map(hotel => `<li>${hotel.name}</li>`).join('')}
                </ul>
            </div>` : '';

        return `
            <div class="map-popup">
                <div class="popup-header">
                    <span class="popup-sequence">${index + 1}</span>
                    <h4>${destination.name}</h4>
                </div>
                <p class="popup-location">
                    <span class="material-icons">place</span>
                    ${destination.location}
                </p>
                ${hotelsList}
            </div>
        `;
    }

    /**
     * Add route line between destinations
     */
    addTripRoute(destinations) {
        try {
            const coordinates = destinations.map(dest => [dest.latitude, dest.longitude]);
            
            const polyline = L.polyline(coordinates, {
                color: '#1976d2',
                weight: 3,
                opacity: 0.7,
                dashArray: '10, 10'
            });

            polyline.addTo(this.map);
            this.markers.push(polyline);
        } catch (error) {
            console.error('Error adding route:', error);
        }
    }

    /**
     * Fit map bounds to show all destinations
     */
    fitBounds(destinations) {
        try {
            const group = new L.featureGroup(this.markers.filter(m => m instanceof L.Marker));
            
            if (group.getLayers().length > 0) {
                this.map.fitBounds(group.getBounds(), {
                    padding: [20, 20],
                    maxZoom: 12
                });
            }
        } catch (error) {
            console.error('Error fitting bounds:', error);
        }
    }

    /**
     * Clear all markers from map
     */
    clearMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }

    /**
     * Show empty state when no destinations
     */
    showEmptyState() {
        // Reset map view
        this.map.setView(this.options.defaultCenter, this.options.defaultZoom);
        
        // Add empty state marker
        const emptyMarker = L.marker(this.options.defaultCenter, {
            opacity: 0.5
        }).addTo(this.map);
        
        emptyMarker.bindPopup(`
            <div class="map-popup empty-state">
                <h4>No Destinations Yet</h4>
                <p>Add destinations to see them on the map</p>
            </div>
        `).openPopup();
        
        this.markers.push(emptyMarker);
    }

    /**
     * Show state when destinations have no coordinates
     */
    showNoCoordinatesState() {
        this.map.setView(this.options.defaultCenter, this.options.defaultZoom);
        
        const infoMarker = L.marker(this.options.defaultCenter, {
            opacity: 0.5
        }).addTo(this.map);
        
        infoMarker.bindPopup(`
            <div class="map-popup info-state">
                <h4>Location Data Missing</h4>
                <p>Destinations need latitude and longitude coordinates to display on the map</p>
            </div>
        `).openPopup();
        
        this.markers.push(infoMarker);
    }

    /**
     * Add custom marker at specific location
     */
    addCustomMarker(lat, lng, popupContent, options = {}) {
        try {
            const marker = L.marker([lat, lng], options);
            
            if (popupContent) {
                marker.bindPopup(popupContent);
            }
            
            marker.addTo(this.map);
            this.markers.push(marker);
            
            return marker;
        } catch (error) {
            console.error('Error adding custom marker:', error);
            return null;
        }
    }

    /**
     * Set map view to specific location
     */
    setView(lat, lng, zoom = 10) {
        if (this.map) {
            this.map.setView([lat, lng], zoom);
        }
    }

    /**
     * Get current map center
     */
    getCenter() {
        if (this.map) {
            const center = this.map.getCenter();
            return {
                latitude: center.lat,
                longitude: center.lng
            };
        }
        return null;
    }

    /**
     * Get current zoom level
     */
    getZoom() {
        return this.map ? this.map.getZoom() : 0;
    }

    /**
     * Resize map (call after container size changes)
     */
    resize() {
        if (this.map) {
            setTimeout(() => {
                this.map.invalidateSize();
            }, 100);
        }
    }

    /**
     * Destroy map instance
     */
    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.markers = [];
        
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    /**
     * Add click event listener
     */
    onMapClick(callback) {
        if (this.map) {
            this.map.on('click', (e) => {
                callback({
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng
                });
            });
        }
    }

    /**
     * Add marker click event listener
     */
    onMarkerClick(callback) {
        // This would be implemented when adding markers
        // by binding the callback to marker click events
    }

    /**
     * Enable/disable map interactions
     */
    setInteractive(interactive) {
        if (this.map) {
            if (interactive) {
                this.map.dragging.enable();
                this.map.touchZoom.enable();
                this.map.doubleClickZoom.enable();
                this.map.scrollWheelZoom.enable();
                this.map.keyboard.enable();
            } else {
                this.map.dragging.disable();
                this.map.touchZoom.disable();
                this.map.doubleClickZoom.disable();
                this.map.scrollWheelZoom.disable();
                this.map.keyboard.disable();
            }
        }
    }

    /**
     * Take screenshot of map (if supported)
     */
    async takeScreenshot() {
        try {
            // This would require additional libraries like leaflet-image
            // For now, just return a placeholder
            return null;
        } catch (error) {
            console.error('Error taking map screenshot:', error);
            return null;
        }
    }

    /**
     * Get map bounds
     */
    getBounds() {
        if (this.map) {
            const bounds = this.map.getBounds();
            return {
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest()
            };
        }
        return null;
    }

    /**
     * Show loading state
     */
    showLoading() {
        if (this.container) {
            const overlay = document.createElement('div');
            overlay.id = `${this.containerId}-loading`;
            overlay.className = 'map-loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading map...</p>
                </div>
            `;
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            `;
            
            this.container.style.position = 'relative';
            this.container.appendChild(overlay);
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        const loadingOverlay = document.getElementById(`${this.containerId}-loading`);
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }
}

// Helper function to create a map instance
export function createMap(containerId, options = {}) {
    return new MapView(containerId, options);
}