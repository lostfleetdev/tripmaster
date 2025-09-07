const db = require('../config/database');

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

class DestinationController {
  async addDestination(req, res) {
    try {
      const { tripId } = req.params;
      const { name, location, latitude, longitude } = req.body;
      
      // Check if trip exists
      const [trip] = await db.query('SELECT * FROM trips WHERE id = ?', [tripId]);
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      // Get next sequence number
      const [sequenceResult] = await db.query(`
        SELECT COALESCE(MAX(sequence_num), 0) + 1 as next_sequence 
        FROM destinations WHERE trip_id = ?
      `, [tripId]);
      const sequence = sequenceResult.next_sequence;

      const id = generateId();
      const parsedLatitude = latitude ? parseFloat(latitude) : null;
      const parsedLongitude = longitude ? parseFloat(longitude) : null;
      
      await db.query(`
        INSERT INTO destinations (id, trip_id, name, location, latitude, longitude, sequence_num) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [id, tripId, name, location, parsedLatitude, parsedLongitude, sequence]);

      const destination = {
        id,
        tripId,
        name,
        location,
        latitude: parsedLatitude || 0,
        longitude: parsedLongitude || 0,
        sequence,
        hotels: []
      };

      res.status(201).json(destination);
    } catch (error) {
      console.error('Error adding destination:', error);
      res.status(500).json({ error: 'Failed to add destination' });
    }
  }

  async updateDestination(req, res) {
    try {
      const { tripId, destinationId } = req.params;
      const { name, location, latitude, longitude } = req.body;

      const [destination] = await db.query(`
        SELECT * FROM destinations 
        WHERE id = ? AND trip_id = ?
      `, [destinationId, tripId]);

      if (!destination) {
        return res.status(404).json({ error: 'Destination not found' });
      }

      const parsedLatitude = latitude ? parseFloat(latitude) : null;
      const parsedLongitude = longitude ? parseFloat(longitude) : null;

      await db.query(`
        UPDATE destinations 
        SET name = ?, location = ?, latitude = ?, longitude = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [name, location, parsedLatitude, parsedLongitude, destinationId]);

      const [updatedDestination] = await db.query('SELECT * FROM destinations WHERE id = ?', [destinationId]);
      
      // Map the response to match frontend expectations
      const mappedDestination = {
        id: updatedDestination.id,
        tripId: updatedDestination.trip_id,
        name: updatedDestination.name,
        location: updatedDestination.location,
        latitude: parseFloat(updatedDestination.latitude) || 0,
        longitude: parseFloat(updatedDestination.longitude) || 0,
        sequence: updatedDestination.sequence_num,
        hotels: []
      };
      
      res.json(mappedDestination);
    } catch (error) {
      console.error('Error updating destination:', error);
      res.status(500).json({ error: 'Failed to update destination' });
    }
  }

  async deleteDestination(req, res) {
    try {
      const { tripId, destinationId } = req.params;

      const result = await db.query(`
        DELETE FROM destinations 
        WHERE id = ? AND trip_id = ?
      `, [destinationId, tripId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Destination not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting destination:', error);
      res.status(500).json({ error: 'Failed to delete destination' });
    }
  }
}

module.exports = new DestinationController();