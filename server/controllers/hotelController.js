const db = require('../config/database');

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

class HotelController {
  async addHotel(req, res) {
    try {
      const { tripId, destinationId } = req.params;
      const { name, address } = req.body;
      
      // Check if destination exists and belongs to the trip
      const [destination] = await db.query(`
        SELECT * FROM destinations 
        WHERE id = ? AND trip_id = ?
      `, [destinationId, tripId]);

      if (!destination) {
        return res.status(404).json({ error: 'Destination not found' });
      }

      const id = generateId();
      await db.query(`
        INSERT INTO hotels (id, destination_id, name, address) 
        VALUES (?, ?, ?, ?)
      `, [id, destinationId, name, address || null]);

      const hotel = {
        id,
        name,
        address: address || null
      };

      res.status(201).json(hotel);
    } catch (error) {
      console.error('Error adding hotel:', error);
      res.status(500).json({ error: 'Failed to add hotel' });
    }
  }

  async updateHotel(req, res) {
    try {
      const { tripId, destinationId, hotelId } = req.params;
      const { name, address } = req.body;

      // Check if hotel exists and belongs to the destination/trip
      const [hotel] = await db.query(`
        SELECT h.* FROM hotels h
        JOIN destinations d ON h.destination_id = d.id
        WHERE h.id = ? AND d.id = ? AND d.trip_id = ?
      `, [hotelId, destinationId, tripId]);

      if (!hotel) {
        return res.status(404).json({ error: 'Hotel not found' });
      }

      await db.query(`
        UPDATE hotels 
        SET name = ?, address = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [name, address || null, hotelId]);

      const [updatedHotel] = await db.query('SELECT * FROM hotels WHERE id = ?', [hotelId]);
      res.json(updatedHotel);
    } catch (error) {
      console.error('Error updating hotel:', error);
      res.status(500).json({ error: 'Failed to update hotel' });
    }
  }

  async deleteHotel(req, res) {
    try {
      const { tripId, destinationId, hotelId } = req.params;

      // Check if hotel exists and belongs to the destination/trip
      const result = await db.query(`
        DELETE h FROM hotels h
        JOIN destinations d ON h.destination_id = d.id
        WHERE h.id = ? AND d.id = ? AND d.trip_id = ?
      `, [hotelId, destinationId, tripId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Hotel not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting hotel:', error);
      res.status(500).json({ error: 'Failed to delete hotel' });
    }
  }
}

module.exports = new HotelController();