/**
 * @typedef {'planned' | 'in-progress' | 'completed'} TripStatus
 */

/**
 * @typedef {Object} Hotel
 * @property {string} id
 * @property {string} name
 * @property {string} address
 * @property {string} destinationId
 */

/**
 * @typedef {Object} Destination
 * @property {string} id
 * @property {string} tripId
 * @property {string} name
 * @property {string} location
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} sequence
 * @property {Hotel[]} hotels
 */

/**
 * @typedef {Object} Trip
 * @property {string} id
 * @property {string} name
 * @property {string} startDate
 * @property {string} endDate
 * @property {TripStatus} status
 * @property {Destination[]} destinations
 */

/**
 * @typedef {Object} TripFormData
 * @property {string} name
 * @property {string} startDate
 * @property {string} endDate
 * @property {TripStatus} status
 */

/**
 * @typedef {Object} DestinationFormData
 * @property {string} name
 * @property {string} location
 * @property {number} latitude
 * @property {number} longitude
 */

/**
 * @typedef {Object} HotelFormData
 * @property {string} name
 * @property {string} address
 */

// Export empty object to make this a module
export {};