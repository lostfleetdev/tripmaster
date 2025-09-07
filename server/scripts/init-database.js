require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function insertSampleData(connection) {
  console.log('Inserting sample data...');
  
  try {
    // Sample trips
    const trip1Id = generateId();
    const trip2Id = generateId();
    
    await connection.execute(`
      INSERT INTO trips (id, name, start_date, end_date, status) VALUES
      (?, 'European Adventure', '2024-06-01', '2024-06-15', 'planned'),
      (?, 'Asian Discovery', '2024-08-10', '2024-08-25', 'planned')
    `, [trip1Id, trip2Id]);
    
    // Sample destinations for European Adventure
    const parisId = generateId();
    const romeId = generateId();
    const barcelonaId = generateId();
    
    await connection.execute(`
      INSERT INTO destinations (id, trip_id, name, location, latitude, longitude, sequence_num) VALUES
      (?, ?, 'Paris', 'Paris, France', 48.8566, 2.3522, 1),
      (?, ?, 'Rome', 'Rome, Italy', 41.9028, 12.4964, 2),
      (?, ?, 'Barcelona', 'Barcelona, Spain', 41.3851, 2.1734, 3)
    `, [parisId, trip1Id, romeId, trip1Id, barcelonaId, trip1Id]);
    
    // Sample destinations for Asian Discovery
    const tokyoId = generateId();
    const seoulId = generateId();
    
    await connection.execute(`
      INSERT INTO destinations (id, trip_id, name, location, latitude, longitude, sequence_num) VALUES
      (?, ?, 'Tokyo', 'Tokyo, Japan', 35.6762, 139.6503, 1),
      (?, ?, 'Seoul', 'Seoul, South Korea', 37.5665, 126.9780, 2)
    `, [tokyoId, trip2Id, seoulId, trip2Id]);
    
    // Sample hotels
    await connection.execute(`
      INSERT INTO hotels (id, destination_id, name, address) VALUES
      (?, ?, 'Hotel de Crillon', '10 Place de la Concorde, 75008 Paris, France'),
      (?, ?, 'The Ritz Paris', '15 Place Vendôme, 75001 Paris, France'),
      (?, ?, 'Hotel de Russie', 'Via del Babuino 9, 00187 Roma RM, Italy'),
      (?, ?, 'Hotel Arts Barcelona', 'Carrer de la Marina, 19-21, 08005 Barcelona, Spain'),
      (?, ?, 'The Tokyo Station Hotel', '1-9-1 Marunouchi, Chiyoda City, Tokyo, Japan'),
      (?, ?, 'The Westin Chosun Seoul', '106 Sogong-ro, Jung-gu, Seoul, South Korea')
    `, [
      generateId(), parisId,
      generateId(), parisId,
      generateId(), romeId,
      generateId(), barcelonaId,
      generateId(), tokyoId,
      generateId(), seoulId
    ]);
    
    console.log('Sample data inserted successfully!');
    console.log('- 2 sample trips created');
    console.log('- 5 sample destinations added');
    console.log('- 6 sample hotels added');
    
  } catch (error) {
    console.error('Error inserting sample data:', error);
    throw error;
  }
}

async function initializeDatabase(includeSampleData = false) {
  let connection;
  
  try {
    console.log('Connecting to MariaDB...');
    // Connect without specifying database first
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Creating database if it doesn\'t exist...');
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'trip_manager'}\``);
    
    console.log('Switching to trip_manager database...');
    await connection.execute(`USE \`${process.env.DB_NAME || 'trip_manager'}\``);
    
    console.log('Creating tables...');
    
    // Create trips table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS trips (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status ENUM('planned', 'in-progress', 'completed') NOT NULL DEFAULT 'planned',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create destinations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS destinations (
        id VARCHAR(255) PRIMARY KEY,
        trip_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        sequence_num INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
      )
    `);
    
    // Create hotels table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS hotels (
        id VARCHAR(255) PRIMARY KEY,
        destination_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
      )
    `);
    
    // Create indexes
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_destinations_trip_id ON destinations(trip_id)
    `);
    
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_hotels_destination_id ON hotels(destination_id)
    `);
    
    console.log('Database initialization completed successfully!');
    console.log(`Database: ${process.env.DB_NAME || 'trip_manager'}`);
    console.log('Tables created: trips, destinations, hotels');
    console.log('Indexes created: idx_destinations_trip_id, idx_hotels_destination_id');
    
    // Insert sample data if requested
    if (includeSampleData) {
      await insertSampleData(connection);
    }
    
  } catch (error) {
    console.error('Error initializing database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run initialization if called directly
if (require.main === module) {
  const includeSampleData = process.argv.includes('--sample-data');
  console.log('Starting database initialization...');
  if (includeSampleData) {
    console.log('Sample data will be included.');
  }
  initializeDatabase(includeSampleData);
}

module.exports = { initializeDatabase, insertSampleData };