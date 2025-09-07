const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const destinationController = require('../controllers/destinationController');
const hotelController = require('../controllers/hotelController');

// Trip routes
router.get('/trips', tripController.getAllTrips);
router.get('/trips/:id', tripController.getTripById);
router.post('/trips', tripController.createTrip);
router.put('/trips/:id', tripController.updateTrip);
router.delete('/trips/:id', tripController.deleteTrip);
router.post('/trips/ai-generated', tripController.saveAIGeneratedTrip);

// Destination routes
router.post('/trips/:tripId/destinations', destinationController.addDestination);
router.put('/trips/:tripId/destinations/:destinationId', destinationController.updateDestination);
router.delete('/trips/:tripId/destinations/:destinationId', destinationController.deleteDestination);

// Hotel routes
router.post('/trips/:tripId/destinations/:destinationId/hotels', hotelController.addHotel);
router.put('/trips/:tripId/destinations/:destinationId/hotels/:hotelId', hotelController.updateHotel);
router.delete('/trips/:tripId/destinations/:destinationId/hotels/:hotelId', hotelController.deleteHotel);

module.exports = router;