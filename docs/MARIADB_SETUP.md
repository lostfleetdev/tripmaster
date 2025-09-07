# MariaDB Setup Guide for TRIPI

This guide will help you set up MariaDB for local development with the TRIPI application.

## Overview

TRIPI now supports MariaDB integration through a local backend service. The architecture includes:
- React frontend (port 3000)
- Express.js backend API (port 3001)
- MariaDB database (port 3306)

## Prerequisites

- Node.js (v14 or higher)
- MariaDB or MySQL server

## Installation Options

### Option 1: Using XAMPP (Windows/macOS/Linux - Recommended for Beginners)

1. **Download XAMPP**
   - Visit [https://www.apachefriends.org/](https://www.apachefriends.org/)
   - Download the version for your operating system

2. **Install XAMPP**
   - Run the installer and follow the setup wizard
   - Make sure to include MariaDB in the installation

3. **Start MariaDB**
   - Open XAMPP Control Panel
   - Click "Start" next to MySQL/MariaDB
   - The database server will run on port 3306

### Option 2: Standalone MariaDB Installation

#### Windows
1. Download MariaDB from [https://mariadb.org/download/](https://mariadb.org/download/)
2. Run the installer and follow the setup wizard
3. Set a root password when prompted
4. Start the MariaDB service

#### macOS (using Homebrew)
```bash
# Install MariaDB
brew install mariadb

# Start MariaDB service
brew services start mariadb

# Secure installation (optional but recommended)
mysql_secure_installation
```

#### Linux (Ubuntu/Debian)
```bash
# Update package list
sudo apt update

# Install MariaDB
sudo apt install mariadb-server

# Start MariaDB service
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Secure installation (optional but recommended)
sudo mysql_secure_installation
```

## Project Setup

### 1. Install Dependencies

```bash
# Install main project dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment Configuration

1. **Copy environment files**
   ```bash
   # Copy main environment file
   cp .env.example .env
   
   # Copy server environment file
   cp server/.env.example server/.env
   ```

2. **Configure main .env file**
   ```env
   # Gemini API Configuration
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
   
   # Backend API Configuration
   REACT_APP_API_URL=http://localhost:3001/api
   
   # Database Service Configuration
   REACT_APP_USE_MARIADB=true
   ```

3. **Configure server/.env file**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=trip_manager
   DB_USER=root
   DB_PASSWORD=your_password_here
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   ```

### 3. Database Initialization

The backend automatically creates the database and tables when it starts. However, you can also run the initialization script manually:

```bash
# Initialize database manually
npm run server:init
```

This script will:
- Create the `trip_manager` database if it doesn't exist
- Create the required tables (trips, destinations, hotels)
- Set up necessary indexes

## Database Schema

The application uses the following database structure:

### Tables

#### trips
- `id` VARCHAR(255) PRIMARY KEY
- `name` VARCHAR(255) NOT NULL
- `start_date` DATE NOT NULL
- `end_date` DATE NOT NULL
- `status` ENUM('planned', 'in-progress', 'completed') DEFAULT 'planned'
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

#### destinations
- `id` VARCHAR(255) PRIMARY KEY
- `trip_id` VARCHAR(255) NOT NULL
- `name` VARCHAR(255) NOT NULL
- `location` VARCHAR(255) NOT NULL
- `latitude` DECIMAL(10, 8)
- `longitude` DECIMAL(11, 8)
- `sequence_num` INT NOT NULL
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
- Foreign key: `trip_id` references `trips(id)`

#### hotels
- `id` VARCHAR(255) PRIMARY KEY
- `destination_id` VARCHAR(255) NOT NULL
- `name` VARCHAR(255) NOT NULL
- `address` TEXT
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
- Foreign key: `destination_id` references `destinations(id)`

## Running the Application

### Development Mode (Recommended)

Run both frontend and backend simultaneously:

```bash
npm run dev
```

This command starts:
- Backend API server on http://localhost:3001
- React frontend on http://localhost:3000

### Individual Services

You can also run services separately:

```bash
# Run backend only
npm run server

# Run frontend only (in another terminal)
npm start
```

## Verification

### 1. Check Backend Health
Visit http://localhost:3001/health in your browser. You should see:
```json
{
  "status": "OK",
  "message": "TRIPI Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Check Database Connection
The backend logs will show successful database initialization:
```
Initializing database...
Connecting to MariaDB...
Creating database if it doesn't exist...
Database initialization completed successfully!
🚀 TRIPI Server is running on port 3001
```

### 3. Test the Frontend
1. Open http://localhost:3000
2. Try creating a new trip
3. Check if data persists after page refresh

## Troubleshooting

### Common Issues

#### "Connection refused" or "Database connection failed"
- Ensure MariaDB is running
- Check database credentials in `server/.env`
- Verify the database port (default: 3306)

#### "CORS error" in browser console
- Ensure the backend is running on port 3001
- Check `REACT_APP_API_URL` in `.env`
- Verify `FRONTEND_URL` in `server/.env`

#### Tables not created
- Run the database initialization manually: `npm run server:init`
- Check MariaDB logs for permission issues
- Ensure the database user has CREATE privileges

### Database Management

#### Using Command Line
```bash
# Connect to MariaDB
mysql -u root -p

# Use the trip_manager database
USE trip_manager;

# Show all tables
SHOW TABLES;

# View table structure
DESCRIBE trips;

# View data
SELECT * FROM trips;
```

#### Using phpMyAdmin (with XAMPP)
1. Open http://localhost/phpmyadmin
2. Log in with your database credentials
3. Navigate to the `trip_manager` database

## Security Notes

- Change default database passwords in production
- Use environment variables for sensitive configuration
- Consider setting up database user with limited privileges
- Enable MariaDB's built-in security features

## Production Deployment

For production deployment:
1. Use a managed database service (AWS RDS, DigitalOcean Managed Databases, etc.)
2. Update connection strings in environment variables
3. Enable SSL/TLS for database connections
4. Set up proper backup and monitoring
5. Use a process manager like PM2 for the Node.js backend

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure MariaDB is accessible and running
4. Check firewall settings if connecting remotely

For more help, create an issue in the project repository.