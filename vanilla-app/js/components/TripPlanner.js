/**
 * TripPlanner Component - AI-powered trip planning interface
 * Vanilla JavaScript implementation
 */

import { geminiService } from '../services/GeminiService.js';
import { tripService } from '../services/TripService.js';
import { showToast, eventBus, formatDateForInput } from '../utils/helpers.js';

export class TripPlanner {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.activeTab = 0;
        this.currentPlan = null;
        this.isLoading = false;
        
        // Form data
        this.formData = {
            destination: '',
            duration: 5,
            startDate: '',
            interests: [],
            budget: 'mid-range'
        };

        // Available interests
        this.availableInterests = [
            'history', 'art', 'food', 'nature', 'adventure', 'culture',
            'shopping', 'nightlife', 'photography', 'architecture',
            'museums', 'beaches', 'mountains', 'festivals', 'sports'
        ];

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

        this.render();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Listen for trip creation events
        eventBus.on('tripCreated', () => {
            // Could show success message or reset form
        });
    }

    /**
     * Render the trip planner interface
     */
    render() {
        this.container.innerHTML = `
            <div class="trip-planner">
                <!-- Header -->
                <div class="planner-header">
                    <h2>
                        <span class="material-icons">auto_awesome</span>
                        AI Trip Planner
                    </h2>
                    <p>Let AI help you plan your perfect trip with personalized recommendations</p>
                    
                    ${!geminiService.isConfigured() ? `
                        <div class="alert alert-warning">
                            <strong>AI Features Limited:</strong> Gemini API not configured. 
                            Using fallback responses for demonstration. To enable full AI functionality, 
                            add your Gemini API key.
                            <button class="btn btn-text" onclick="tripPlannerInstance.showApiKeyModal()">
                                Configure API Key
                            </button>
                        </div>
                    ` : ''}
                </div>

                <!-- Planning Tabs -->
                <div class="planner-tabs">
                    <div class="planner-tab-buttons">
                        <button class="planner-tab-button ${this.activeTab === 0 ? 'active' : ''}" 
                                data-tab="0">
                            <span class="material-icons">explore</span>
                            Destination Planning
                        </button>
                        <button class="planner-tab-button ${this.activeTab === 1 ? 'active' : ''}" 
                                data-tab="1">
                            <span class="material-icons">hotel</span>
                            Hotel Recommendations
                        </button>
                        <button class="planner-tab-button ${this.activeTab === 2 ? 'active' : ''}" 
                                data-tab="2">
                            <span class="material-icons">local_activity</span>
                            Activities & Experiences
                        </button>
                    </div>

                    <!-- Tab Content -->
                    <div class="planner-tab-content">
                        <!-- Destination Planning Tab -->
                        <div class="planner-tab-panel ${this.activeTab === 0 ? 'active' : ''}" data-panel="0">
                            ${this.renderDestinationTab()}
                        </div>

                        <!-- Hotel Recommendations Tab -->
                        <div class="planner-tab-panel ${this.activeTab === 1 ? 'active' : ''}" data-panel="1">
                            ${this.renderHotelTab()}
                        </div>

                        <!-- Activities Tab -->
                        <div class="planner-tab-panel ${this.activeTab === 2 ? 'active' : ''}" data-panel="2">
                            ${this.renderActivitiesTab()}
                        </div>
                    </div>
                </div>

                <!-- AI Response Section -->
                <div id="ai-response-section" class="ai-response" style="display: none;">
                    <div class="ai-response-header">
                        <h4>AI Recommendations</h4>
                        <div class="ai-response-actions">
                            <button class="btn btn-outlined save-as-trip-btn">
                                <span class="material-icons">save</span>
                                Save as Trip
                            </button>
                            <button class="btn btn-text clear-response-btn">
                                <span class="material-icons">clear</span>
                                Clear
                            </button>
                        </div>
                    </div>
                    <div id="ai-response-content" class="ai-response-content"></div>
                </div>
            </div>
        `;

        this.bindUIEvents();
        this.setDefaultDates();
        window.tripPlannerInstance = this;
    }

    /**
     * Render destination planning tab
     */
    renderDestinationTab() {
        return `
            <div class="destination-planning">
                <form id="destination-form" class="planning-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="destination" class="form-label">Destination *</label>
                            <input type="text" id="destination" name="destination" class="form-control" 
                                   value="${this.formData.destination}" required
                                   placeholder="Where do you want to go?">
                        </div>
                        
                        <div class="form-group">
                            <label for="duration" class="form-label">Duration (days)</label>
                            <input type="number" id="duration" name="duration" class="form-control" 
                                   value="${this.formData.duration}" min="1" max="30">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="start-date" class="form-label">Start Date</label>
                            <input type="date" id="start-date" name="startDate" class="form-control" 
                                   value="${this.formData.startDate}">
                        </div>
                        
                        <div class="form-group">
                            <label for="budget" class="form-label">Budget Level</label>
                            <select id="budget" name="budget" class="form-control">
                                <option value="budget" ${this.formData.budget === 'budget' ? 'selected' : ''}>Budget-friendly</option>
                                <option value="mid-range" ${this.formData.budget === 'mid-range' ? 'selected' : ''}>Mid-range</option>
                                <option value="luxury" ${this.formData.budget === 'luxury' ? 'selected' : ''}>Luxury</option>
                            </select>
                        </div>
                    </div>

                    <div class="interests-section">
                        <label class="form-label">Interests (select all that apply)</label>
                        <div class="interests-grid">
                            ${this.availableInterests.map(interest => `
                                <div class="interest-chip ${this.formData.interests.includes(interest) ? 'selected' : ''}" 
                                     data-interest="${interest}">
                                    ${interest.charAt(0).toUpperCase() + interest.slice(1)}
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-primary generate-plan-btn" 
                                ${this.isLoading ? 'disabled' : ''}>
                            <span class="material-icons">auto_awesome</span>
                            ${this.isLoading ? 'Generating...' : 'Generate Trip Plan'}
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * Render hotel recommendations tab
     */
    renderHotelTab() {
        return `
            <div class="hotel-planning">
                <form id="hotel-form" class="planning-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="hotel-destination" class="form-label">Destination *</label>
                            <input type="text" id="hotel-destination" name="destination" class="form-control" 
                                   value="${this.formData.destination}" required
                                   placeholder="Enter destination for hotel recommendations">
                        </div>
                        
                        <div class="form-group">
                            <label for="hotel-budget" class="form-label">Budget Level</label>
                            <select id="hotel-budget" name="budget" class="form-control">
                                <option value="budget">Budget-friendly</option>
                                <option value="mid-range" selected>Mid-range</option>
                                <option value="luxury">Luxury</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-primary generate-hotels-btn"
                                ${this.isLoading ? 'disabled' : ''}>
                            <span class="material-icons">hotel</span>
                            ${this.isLoading ? 'Finding Hotels...' : 'Get Hotel Recommendations'}
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * Render activities and experiences tab
     */
    renderActivitiesTab() {
        return `
            <div class="activities-planning">
                <form id="activities-form" class="planning-form">
                    <div class="form-group">
                        <label for="activities-destination" class="form-label">Destination *</label>
                        <input type="text" id="activities-destination" name="destination" class="form-control" 
                               value="${this.formData.destination}" required
                               placeholder="Enter destination for activity recommendations">
                    </div>

                    <div class="interests-section">
                        <label class="form-label">Activity Preferences</label>
                        <div class="interests-grid">
                            ${this.availableInterests.map(interest => `
                                <div class="interest-chip ${this.formData.interests.includes(interest) ? 'selected' : ''}" 
                                     data-interest="${interest}">
                                    ${interest.charAt(0).toUpperCase() + interest.slice(1)}
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-primary generate-activities-btn"
                                ${this.isLoading ? 'disabled' : ''}>
                            <span class="material-icons">local_activity</span>
                            ${this.isLoading ? 'Finding Activities...' : 'Get Activity Recommendations'}
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * Bind UI event listeners
     */
    bindUIEvents() {
        // Tab switching
        this.container.querySelectorAll('.planner-tab-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabIndex = parseInt(btn.dataset.tab);
                this.switchTab(tabIndex);
            });
        });

        // Interest chips
        this.container.querySelectorAll('.interest-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const interest = chip.dataset.interest;
                this.toggleInterest(interest);
                chip.classList.toggle('selected');
            });
        });

        // Form inputs
        const destinationInput = this.container.querySelector('#destination');
        if (destinationInput) {
            destinationInput.addEventListener('input', (e) => {
                this.formData.destination = e.target.value;
                this.syncDestinationFields();
            });
        }

        const durationInput = this.container.querySelector('#duration');
        if (durationInput) {
            durationInput.addEventListener('input', (e) => {
                this.formData.duration = parseInt(e.target.value) || 5;
            });
        }

        const startDateInput = this.container.querySelector('#start-date');
        if (startDateInput) {
            startDateInput.addEventListener('change', (e) => {
                this.formData.startDate = e.target.value;
            });
        }

        const budgetSelect = this.container.querySelector('#budget');
        if (budgetSelect) {
            budgetSelect.addEventListener('change', (e) => {
                this.formData.budget = e.target.value;
            });
        }

        // Action buttons
        const generatePlanBtn = this.container.querySelector('.generate-plan-btn');
        if (generatePlanBtn) {
            generatePlanBtn.addEventListener('click', () => this.generateTripPlan());
        }

        const generateHotelsBtn = this.container.querySelector('.generate-hotels-btn');
        if (generateHotelsBtn) {
            generateHotelsBtn.addEventListener('click', () => this.generateHotelRecommendations());
        }

        const generateActivitiesBtn = this.container.querySelector('.generate-activities-btn');
        if (generateActivitiesBtn) {
            generateActivitiesBtn.addEventListener('click', () => this.generateActivityRecommendations());
        }

        // AI response actions
        const saveAsTripBtn = this.container.querySelector('.save-as-trip-btn');
        if (saveAsTripBtn) {
            saveAsTripBtn.addEventListener('click', () => this.saveCurrentPlanAsTrip());
        }

        const clearResponseBtn = this.container.querySelector('.clear-response-btn');
        if (clearResponseBtn) {
            clearResponseBtn.addEventListener('click', () => this.clearAIResponse());
        }
    }

    /**
     * Switch between tabs
     */
    switchTab(tabIndex) {
        if (this.activeTab === tabIndex) return;

        this.activeTab = tabIndex;

        // Update tab buttons
        this.container.querySelectorAll('.planner-tab-button').forEach((btn, index) => {
            btn.classList.toggle('active', index === tabIndex);
        });

        // Update tab panels
        this.container.querySelectorAll('.planner-tab-panel').forEach((panel, index) => {
            panel.classList.toggle('active', index === tabIndex);
        });

        // Sync destination fields when switching tabs
        this.syncDestinationFields();
    }

    /**
     * Toggle interest selection
     */
    toggleInterest(interest) {
        const index = this.formData.interests.indexOf(interest);
        if (index > -1) {
            this.formData.interests.splice(index, 1);
        } else {
            this.formData.interests.push(interest);
        }
    }

    /**
     * Sync destination fields across tabs
     */
    syncDestinationFields() {
        const hotelDestination = this.container.querySelector('#hotel-destination');
        const activitiesDestination = this.container.querySelector('#activities-destination');
        
        if (hotelDestination) {
            hotelDestination.value = this.formData.destination;
        }
        if (activitiesDestination) {
            activitiesDestination.value = this.formData.destination;
        }
    }

    /**
     * Set default dates
     */
    setDefaultDates() {
        if (!this.formData.startDate) {
            const today = new Date();
            today.setDate(today.getDate() + 7); // Default to one week from now
            this.formData.startDate = formatDateForInput(today.toISOString());
            
            const startDateInput = this.container.querySelector('#start-date');
            if (startDateInput) {
                startDateInput.value = this.formData.startDate;
            }
        }
    }

    /**
     * Generate trip plan using AI
     */
    async generateTripPlan() {
        if (!this.validateForm()) return;

        this.setLoading(true);
        this.showAIResponse('Generating personalized trip plan...', true);

        try {
            const response = await geminiService.generateDestinationRecommendations(
                this.formData.destination,
                this.formData.duration,
                this.formData.interests
            );

            this.currentPlan = {
                type: 'destination',
                destination: this.formData.destination,
                duration: this.formData.duration,
                startDate: this.formData.startDate,
                interests: [...this.formData.interests],
                response: response
            };

            this.showAIResponse(response);
            showToast('Trip plan generated successfully!', 'success');
        } catch (error) {
            console.error('Error generating trip plan:', error);
            this.showAIResponse('Sorry, there was an error generating your trip plan. Please try again.', false, true);
            showToast('Failed to generate trip plan', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Generate hotel recommendations
     */
    async generateHotelRecommendations() {
        const hotelDestination = this.container.querySelector('#hotel-destination').value;
        const hotelBudget = this.container.querySelector('#hotel-budget').value;

        if (!hotelDestination.trim()) {
            showToast('Please enter a destination', 'error');
            return;
        }

        this.setLoading(true);
        this.showAIResponse('Finding the best hotels for your stay...', true);

        try {
            const response = await geminiService.generateHotelRecommendations(
                hotelDestination,
                hotelBudget
            );

            this.currentPlan = {
                type: 'hotels',
                destination: hotelDestination,
                budget: hotelBudget,
                response: response
            };

            this.showAIResponse(response);
            showToast('Hotel recommendations generated!', 'success');
        } catch (error) {
            console.error('Error generating hotel recommendations:', error);
            this.showAIResponse('Sorry, there was an error finding hotels. Please try again.', false, true);
            showToast('Failed to generate hotel recommendations', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Generate activity recommendations
     */
    async generateActivityRecommendations() {
        const activitiesDestination = this.container.querySelector('#activities-destination').value;
        const selectedInterests = Array.from(
            this.container.querySelectorAll('.interest-chip.selected')
        ).map(chip => chip.dataset.interest);

        if (!activitiesDestination.trim()) {
            showToast('Please enter a destination', 'error');
            return;
        }

        this.setLoading(true);
        this.showAIResponse('Discovering amazing activities and experiences...', true);

        try {
            const response = await geminiService.generateActivitiesRecommendations(
                activitiesDestination,
                selectedInterests
            );

            this.currentPlan = {
                type: 'activities',
                destination: activitiesDestination,
                interests: selectedInterests,
                response: response
            };

            this.showAIResponse(response);
            showToast('Activity recommendations generated!', 'success');
        } catch (error) {
            console.error('Error generating activity recommendations:', error);
            this.showAIResponse('Sorry, there was an error finding activities. Please try again.', false, true);
            showToast('Failed to generate activity recommendations', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Validate form data
     */
    validateForm() {
        if (!this.formData.destination.trim()) {
            showToast('Please enter a destination', 'error');
            this.container.querySelector('#destination').focus();
            return false;
        }

        if (this.formData.duration < 1 || this.formData.duration > 30) {
            showToast('Duration must be between 1 and 30 days', 'error');
            this.container.querySelector('#duration').focus();
            return false;
        }

        return true;
    }

    /**
     * Show AI response
     */
    showAIResponse(content, isLoading = false, isError = false) {
        const responseSection = this.container.querySelector('#ai-response-section');
        const responseContent = this.container.querySelector('#ai-response-content');

        if (!responseSection || !responseContent) return;

        responseSection.style.display = 'block';

        if (isLoading) {
            responseContent.innerHTML = `
                <div class="ai-loading">
                    <div class="spinner"></div>
                    <p>${content}</p>
                </div>
            `;
        } else if (isError) {
            responseContent.innerHTML = `
                <div class="ai-error">
                    <span class="material-icons">error_outline</span>
                    <p>${content}</p>
                </div>
            `;
        } else {
            responseContent.innerHTML = `<div class="ai-content">${this.formatAIResponse(content)}</div>`;
        }

        // Scroll to response
        responseSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Format AI response with better styling
     */
    formatAIResponse(content) {
        // Convert markdown-like formatting to HTML
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/•/g, '•')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        return `<p>${formatted}</p>`;
    }

    /**
     * Clear AI response
     */
    clearAIResponse() {
        const responseSection = this.container.querySelector('#ai-response-section');
        if (responseSection) {
            responseSection.style.display = 'none';
        }
        this.currentPlan = null;
    }

    /**
     * Save current AI plan as a trip
     */
    async saveCurrentPlanAsTrip() {
        if (!this.currentPlan) {
            showToast('No plan to save', 'error');
            return;
        }

        if (this.currentPlan.type !== 'destination') {
            showToast('Only destination plans can be saved as trips', 'info');
            return;
        }

        try {
            const tripData = await geminiService.generateStructuredTripPlan(
                this.currentPlan.destination,
                this.currentPlan.duration,
                this.currentPlan.startDate,
                this.currentPlan.interests
            );

            const savedTrip = await tripService.saveAIGeneratedTrip(tripData);
            
            showToast(`Trip "${savedTrip.name}" saved successfully!`, 'success');
            eventBus.emit('tripCreated', savedTrip);
            
            // Switch to trip details tab
            eventBus.emit('tripSelected', savedTrip);
            
        } catch (error) {
            console.error('Error saving trip:', error);
            showToast('Failed to save trip', 'error');
        }
    }

    /**
     * Set loading state
     */
    setLoading(loading) {
        this.isLoading = loading;
        
        // Update button states
        const buttons = this.container.querySelectorAll(
            '.generate-plan-btn, .generate-hotels-btn, .generate-activities-btn'
        );
        
        buttons.forEach(btn => {
            btn.disabled = loading;
            if (loading) {
                const icon = btn.querySelector('.material-icons');
                if (icon) {
                    icon.textContent = 'hourglass_empty';
                }
            } else {
                const icon = btn.querySelector('.material-icons');
                if (icon) {
                    if (btn.classList.contains('generate-plan-btn')) {
                        icon.textContent = 'auto_awesome';
                    } else if (btn.classList.contains('generate-hotels-btn')) {
                        icon.textContent = 'hotel';
                    } else if (btn.classList.contains('generate-activities-btn')) {
                        icon.textContent = 'local_activity';
                    }
                }
            }
        });
    }

    /**
     * Show API key configuration modal
     */
    showApiKeyModal() {
        const content = `
            <form id="api-key-form" class="api-key-form">
                <div class="form-group">
                    <label for="gemini-api-key" class="form-label">Gemini API Key</label>
                    <input type="password" id="gemini-api-key" name="apiKey" class="form-control" 
                           placeholder="Enter your Gemini API key">
                    <div class="form-help">
                        <p>You can get a free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a></p>
                        <p>The API key will be stored locally in your browser.</p>
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
                text: 'Save API Key',
                class: 'btn-primary',
                onclick: 'tripPlannerInstance.handleSaveApiKey()'
            }
        ];

        const { createModal } = window;
        createModal('Configure Gemini API Key', content, actions);
    }

    /**
     * Handle API key saving
     */
    async handleSaveApiKey() {
        const form = document.getElementById('api-key-form');
        if (!form) return;

        const formData = new FormData(form);
        const apiKey = formData.get('apiKey');

        if (!apiKey || !apiKey.trim()) {
            showToast('Please enter an API key', 'error');
            return;
        }

        try {
            geminiService.setApiKey(apiKey.trim());
            document.querySelector('.dialog-overlay').remove();
            showToast('API key saved successfully!', 'success');
            
            // Re-render to remove the warning
            this.render();
        } catch (error) {
            console.error('Error saving API key:', error);
            showToast('Failed to save API key', 'error');
        }
    }

    /**
     * Reset form to default values
     */
    resetForm() {
        this.formData = {
            destination: '',
            duration: 5,
            startDate: '',
            interests: [],
            budget: 'mid-range'
        };
        
        this.currentPlan = null;
        this.clearAIResponse();
        this.render();
    }

    /**
     * Get current form data
     */
    getFormData() {
        return { ...this.formData };
    }

    /**
     * Set form data
     */
    setFormData(data) {
        this.formData = { ...this.formData, ...data };
        this.render();
    }

    /**
     * Destroy component
     */
    destroy() {
        eventBus.off('tripCreated');
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // Clean up global reference
        if (window.tripPlannerInstance === this) {
            delete window.tripPlannerInstance;
        }
    }
}