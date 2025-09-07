const db = require('../config/database');

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

class TripController {
  async getAllTrips(req, res) {
    try {
      // Get all trips
      const trips = await db.query(`
        SELECT * FROM trips 
        ORDER BY created_at DESC
      `);

      // For each trip, get its destinations and hotels
      for (let trip of trips) {
        // Get destinations for this trip
        const destinations = await db.query(`
          SELECT * FROM destinations 
          WHERE trip_id = ? 
          ORDER BY sequence_num
        `, [trip.id]);

        // Get hotels for each destination
        for (let destination of destinations) {
          const hotels = await db.query(`
            SELECT * FROM hotels 
            WHERE destination_id = ? 
            ORDER BY created_at
          `, [destination.id]);
          
          // Map hotel fields
          destination.hotels = hotels.map(hotel => ({
            id: hotel.id,
            name: hotel.name,
            address: hotel.address,
            destinationId: hotel.destination_id
          }));
        }

        // Map destination fields
        trip.destinations = destinations.map(dest => ({
          id: dest.id,
          tripId: dest.trip_id,
          name: dest.name,
          location: dest.location,
          latitude: parseFloat(dest.latitude) || 0,
          longitude: parseFloat(dest.longitude) || 0,
          sequence: dest.sequence_num,
          hotels: dest.hotels
        }));
      }

      // Map trip fields
      const mappedTrips = trips.map(trip => ({
        id: trip.id,
        name: trip.name,
        startDate: trip.start_date,
        endDate: trip.end_date,
        status: trip.status,
        destinations: trip.destinations
      }));

      res.json(mappedTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
      res.status(500).json({ error: 'Failed to fetch trips' });
    }
  }

  async getTripById(req, res) {
    try {
      const { id } = req.params;
      
      // Get trip details
      const [trip] = await db.query('SELECT * FROM trips WHERE id = ?', [id]);
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      // Get destinations for this trip
      const destinations = await db.query(`
        SELECT * FROM destinations 
        WHERE trip_id = ? 
        ORDER BY sequence_num
      `, [id]);

      // Get hotels for each destination
      for (let destination of destinations) {
        const hotels = await db.query(`
          SELECT * FROM hotels 
          WHERE destination_id = ? 
          ORDER BY created_at
        `, [destination.id]);
        
        // Map hotel fields
        destination.hotels = hotels.map(hotel => ({
          id: hotel.id,
          name: hotel.name,
          address: hotel.address,
          destinationId: hotel.destination_id
        }));
      }

      // Map destination fields
      const mappedDestinations = destinations.map(dest => ({
        id: dest.id,
        tripId: dest.trip_id,
        name: dest.name,
        location: dest.location,
        latitude: parseFloat(dest.latitude) || 0,
        longitude: parseFloat(dest.longitude) || 0,
        sequence: dest.sequence_num,
        hotels: dest.hotels
      }));

      // Map trip fields
      const mappedTrip = {
        id: trip.id,
        name: trip.name,
        startDate: trip.start_date,
        endDate: trip.end_date,
        status: trip.status,
        destinations: mappedDestinations
      };

      res.json(mappedTrip);
    } catch (error) {
      console.error('Error fetching trip:', error);
      res.status(500).json({ error: 'Failed to fetch trip' });
    }
  }

  async createTrip(req, res) {
    try {
      const { name, startDate, endDate, status = 'planned' } = req.body;
      const id = generateId();

      await db.query(`
        INSERT INTO trips (id, name, start_date, end_date, status) 
        VALUES (?, ?, ?, ?, ?)
      `, [id, name, startDate, endDate, status]);

      const trip = {
        id,
        name,
        startDate,
        endDate,
        status,
        destinations: []
      };

      res.status(201).json(trip);
    } catch (error) {
      console.error('Error creating trip:', error);
      res.status(500).json({ error: 'Failed to create trip' });
    }
  }

  async updateTrip(req, res) {
    try {
      const { id } = req.params;
      const { name, startDate, endDate, status } = req.body;

      const [existingTrip] = await db.query('SELECT * FROM trips WHERE id = ?', [id]);
      if (!existingTrip) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      await db.query(`
        UPDATE trips 
        SET name = ?, start_date = ?, end_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [name, startDate, endDate, status, id]);

      // Return updated trip
      const [updatedTrip] = await db.query('SELECT * FROM trips WHERE id = ?', [id]);
      res.json(updatedTrip);
    } catch (error) {
      console.error('Error updating trip:', error);
      res.status(500).json({ error: 'Failed to update trip' });
    }
  }

  async deleteTrip(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query('DELETE FROM trips WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting trip:', error);
      res.status(500).json({ error: 'Failed to delete trip' });
    }
  }

  async saveAIGeneratedTrip(req, res) {
    try {
      const { name, startDate, endDate, status = 'planned', destinations = [] } = req.body;
      const tripId = generateId();

      // Start transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Insert trip
        await connection.execute(`
          INSERT INTO trips (id, name, start_date, end_date, status) 
          VALUES (?, ?, ?, ?, ?)
        `, [tripId, name, startDate, endDate, status]);

        // Insert destinations
        const savedDestinations = [];
        for (let i = 0; i < destinations.length; i++) {
          const dest = destinations[i];
          const destId = generateId();
          
          await connection.execute(`
            INSERT INTO destinations (id, trip_id, name, location, latitude, longitude, sequence_num) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [destId, tripId, dest.name, dest.location, dest.latitude || null, dest.longitude || null, i + 1]);

          savedDestinations.push({
            id: destId,
            name: dest.name,
            location: dest.location,
            latitude: dest.latitude || null,
            longitude: dest.longitude || null,
            sequence: i + 1,
            hotels: []
          });
        }

        await connection.commit();

        const trip = {
          id: tripId,
          name,
          startDate,
          endDate,
          status,
          destinations: savedDestinations
        };

        res.status(201).json(trip);
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error saving AI generated trip:', error);
      res.status(500).json({ error: 'Failed to save AI generated trip' });
    }
  }
}

module.exports = new TripController();