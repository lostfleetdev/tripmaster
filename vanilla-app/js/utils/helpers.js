// Utility functions for the Trip Management App

/**
 * Generate a unique ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Format date to readable string
 */
export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format date for input fields
 */
export function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

/**
 * Calculate duration between two dates
 */
export function calculateDuration(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate required field
 */
export function isRequired(value) {
    return value && value.toString().trim().length > 0;
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate, endDate) {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
}

/**
 * Validate coordinates
 */
export function isValidCoordinate(lat, lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    return !isNaN(latitude) && !isNaN(longitude) && 
           latitude >= -90 && latitude <= 90 && 
           longitude >= -180 && longitude <= 180;
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show toast notification
 */
export function showToast(message, type = 'info', duration = 5000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div>${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    if (duration > 0) {
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
    }

    return toast;
}

/**
 * Show loading overlay
 */
export function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.querySelector('p').textContent = message;
        overlay.classList.remove('hidden');
    }
}

/**
 * Hide loading overlay
 */
export function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

/**
 * Create modal dialog
 */
export function createModal(title, content, actions = []) {
    const container = document.getElementById('modal-container');
    if (!container) return null;

    const modal = document.createElement('div');
    modal.className = 'dialog-overlay';
    modal.innerHTML = `
        <div class="dialog">
            <div class="dialog-header">
                <h3 class="dialog-title">${title}</h3>
                <button class="dialog-close" onclick="this.closest('.dialog-overlay').remove()">
                    <span class="material-icons">close</span>
                </button>
            </div>
            <div class="dialog-content">
                ${content}
            </div>
            <div class="dialog-actions">
                ${actions.map(action => `
                    <button class="btn ${action.class || 'btn-text'}" 
                            onclick="${action.onclick}"
                            ${action.disabled ? 'disabled' : ''}>
                        ${action.text}
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    container.appendChild(modal);
    return modal;
}

/**
 * Validate form data
 */
export function validateForm(formData, rules) {
    const errors = {};
    
    for (const [field, value] of Object.entries(formData)) {
        const fieldRules = rules[field];
        if (!fieldRules) continue;

        for (const rule of fieldRules) {
            if (rule.required && !isRequired(value)) {
                errors[field] = rule.message || `${field} is required`;
                break;
            }
            
            if (rule.type === 'email' && value && !isValidEmail(value)) {
                errors[field] = rule.message || 'Invalid email format';
                break;
            }
            
            if (rule.minLength && value && value.length < rule.minLength) {
                errors[field] = rule.message || `${field} must be at least ${rule.minLength} characters`;
                break;
            }
            
            if (rule.maxLength && value && value.length > rule.maxLength) {
                errors[field] = rule.message || `${field} must be no more than ${rule.maxLength} characters`;
                break;
            }
            
            if (rule.min && value && parseFloat(value) < rule.min) {
                errors[field] = rule.message || `${field} must be at least ${rule.min}`;
                break;
            }
            
            if (rule.max && value && parseFloat(value) > rule.max) {
                errors[field] = rule.message || `${field} must be no more than ${rule.max}`;
                break;
            }
            
            if (rule.pattern && value && !rule.pattern.test(value)) {
                errors[field] = rule.message || `${field} format is invalid`;
                break;
            }
            
            if (rule.custom && !rule.custom(value, formData)) {
                errors[field] = rule.message || `${field} is invalid`;
                break;
            }
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Update form validation display
 */
export function updateFormValidation(formElement, errors) {
    // Clear previous errors
    formElement.querySelectorAll('.form-error').forEach(el => el.remove());
    formElement.querySelectorAll('.form-control').forEach(el => {
        el.classList.remove('invalid');
    });

    // Add new errors
    for (const [field, message] of Object.entries(errors)) {
        const input = formElement.querySelector(`[name="${field}"]`);
        if (input) {
            input.classList.add('invalid');
            const errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            errorElement.textContent = message;
            input.parentElement.appendChild(errorElement);
        }
    }
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard', 'success', 2000);
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        showToast('Failed to copy to clipboard', 'error', 3000);
        return false;
    }
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get user's current location
 */
export function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    });
}

/**
 * Local storage helpers with error handling
 */
export const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading from localStorage:`, error);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to localStorage:`, error);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from localStorage:`, error);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error(`Error clearing localStorage:`, error);
            return false;
        }
    }
};

/**
 * Event emitter for component communication
 */
export class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        });
    }
}

// Global event emitter instance
export const eventBus = new EventEmitter();