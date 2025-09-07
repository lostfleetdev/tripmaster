# 🗺️ TRIPI - Trip Management Application

A modern React-based trip management application built with Material-UI, featuring AI-powered trip planning, interactive maps, and comprehensive travel organization tools.

## ✨ Features

### Core Functionality
- **Trip Management**: Create, edit, and delete trips with multiple destinations
- **Trip Status**: Track trips as planned, in-progress, or completed
- **Destination Management**: Add multiple destinations with hotels and activities
- **Interactive Maps**: View trips and destinations using OpenStreetMap and Leaflet.js

### AI-Powered Features
- **Gemini API Integration**: AI-powered trip planning and recommendations
- **Personalized Suggestions**: Get destination, hotel, and activity recommendations
- **Custom Trip Planning**: AI assistant for creating detailed itineraries

### Technical Features
- **Responsive Design**: Material-UI components for modern, mobile-friendly interface
- **Local Storage**: Self-contained data persistence for development
- **Environment Configuration**: Secure API key management
- **TypeScript**: Full type safety and better development experience

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MariaDB or MySQL server (for database features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lostfleetdev/tripi.git
   cd tripi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   # Required for AI-powered features
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
   
   # Backend API Configuration
   REACT_APP_API_URL=http://localhost:3001/api
   
   # Database Service Configuration (use MariaDB or IndexedDB)
   REACT_APP_USE_MARIADB=true
   ```
   
   Edit `server/.env` for database configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=trip_manager
   DB_USER=root
   DB_PASSWORD=your_database_password
   
   # Server Configuration
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   ```

4. **Set up MariaDB (Optional but Recommended)**
   For full database functionality, follow the [MariaDB Setup Guide](docs/MARIADB_SETUP.md).
   
   Quick setup:
   ```bash
   # Initialize database (creates tables automatically)
   npm run server:init
   
   # Or initialize with sample data
   npm run server:init-sample
   ```

5. **Start the development server**
   ```bash
   # Start both frontend and backend (recommended)
   npm run dev
   
   # Or start individually:
   # Backend only: npm run server
   # Frontend only: npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with TypeScript
- **Material-UI v7** - Comprehensive React component library
- **React Router** - Client-side routing
- **TypeScript** - Type-safe JavaScript

### Maps & Visualization
- **Leaflet.js** - Interactive maps
- **React-Leaflet** - React integration for Leaflet
- **OpenStreetMap** - Free, collaborative mapping

### AI Integration
- **Google Generative AI** - Gemini API for trip planning
- **React Markdown** - Formatted AI responses

### Data Management
- **MariaDB Integration** - Direct MariaDB connectivity via backend API
- **IndexedDB Fallback** - Browser-based persistence for development
- **Auto-database Creation** - Automatic schema setup and initialization
- **Axios** - HTTP client for API communication

### Development Tools
- **Create React App** - Build tooling and development server
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 Project Structure

```
tripi/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── Layout.tsx     # Main layout component
│   │   ├── TripList.tsx   # Trip listing and management
│   │   ├── TripDetail.tsx # Trip details and destinations
│   │   ├── TripPlanner.tsx# AI-powered trip planning
│   │   ├── MapView.tsx    # Interactive map component
│   │   └── DatabaseTestingPanel.tsx # Database testing utilities
│   ├── services/          # Business logic and API services
│   │   ├── TripService.ts # Trip data management facade
│   │   ├── MariaDBService.ts # MariaDB integration
│   │   ├── IndexedDBService.ts # Browser storage fallback
│   │   └── GeminiService.ts# AI service integration
│   ├── types.ts          # TypeScript type definitions
│   ├── App.tsx           # Main application component
│   └── index.tsx         # Application entry point
├── server/               # Backend API server
│   ├── controllers/      # API route handlers
│   ├── config/          # Database configuration
│   ├── routes/          # API route definitions
│   └── scripts/         # Database initialization scripts
├── docs/                # Documentation
├── .env                 # Environment variables (frontend)
├── server/.env         # Environment variables (backend)
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## 🎯 Usage Guide

### Creating Your First Trip

1. **Click "Add New Trip"** on the main dashboard
2. **Fill in trip details**:
   - Trip name
   - Start and end dates
   - Initial status (planned/in-progress/completed)
3. **Click "Create"** to save your trip

### Adding Destinations

1. **Select a trip** from your trip list
2. **Click "Add Destination"** in the trip details
3. **Enter destination information**:
   - Destination name
   - Location description
   - Coordinates (auto-detected for major cities)
4. **Save the destination**

### Adding Hotels

1. **Expand a destination** in the trip details
2. **Click "Add Hotel"**
3. **Enter hotel details**:
   - Hotel name
   - Full address
4. **Save the hotel**

### Using AI Trip Planning

1. **Navigate to "AI Trip Planner"** tab
2. **Choose your planning type**:
   - Complete trip plan
   - Hotel recommendations
   - Activities and attractions
   - Custom request
3. **Fill in your preferences**:
   - Destination
   - Duration
   - Interests
   - Budget level
4. **Click "Generate Plan"** for AI-powered recommendations

### Using Database Testing Tools

1. **Navigate to "Database Testing"** tab in the application
2. **Check connection status** to verify backend connectivity
3. **Run comprehensive tests** to validate database operations
4. **Monitor test results** for any connectivity or data issues

### Database Management

#### Quick Commands
```bash
# Start both frontend and backend
npm run dev

# Initialize database
npm run server:init

# Initialize with sample data
npm run server:init-sample

# Backend only
npm run server

# Frontend only
npm start
```

#### Direct Database Access
```bash
# Connect to MariaDB (if using XAMPP or local installation)
mysql -u root -p

# Use the trip database
USE trip_manager;

# View tables
SHOW TABLES;

# View trip data
SELECT * FROM trips;
```

## 🔧 Configuration

### API Keys

#### Gemini API (Google AI)
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create an account or sign in
3. Generate an API key
4. Add it to your `.env` file as `REACT_APP_GEMINI_API_KEY`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_GEMINI_API_KEY` | Google Gemini API key for AI features | No* |
| `REACT_APP_API_URL` | Backend API URL (default: http://localhost:3001/api) | No |
| `REACT_APP_USE_MARIADB` | Enable MariaDB integration (true/false) | No |

**Backend Environment Variables (server/.env)**

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | Database host (default: localhost) | No |
| `DB_PORT` | Database port (default: 3306) | No |
| `DB_NAME` | Database name (default: trip_manager) | No |
| `DB_USER` | Database user (default: root) | No |
| `DB_PASSWORD` | Database password | Yes** |
| `PORT` | Backend server port (default: 3001) | No |
| `FRONTEND_URL` | Frontend URL for CORS (default: http://localhost:3000) | No |

*The app works without API keys but AI features will show demo responses.
**Required if using password-protected MariaDB installation.

## 🚢 Deployment

### Development Build
```bash
npm run build
```

### Serve Production Build Locally
```bash
npm install -g serve
serve -s build
```

### Deploy to Static Hosting
The built files in the `build/` directory can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

## 🛣️ Roadmap

### Phase 1: Core Features ✅
- [x] Basic trip management (CRUD)
- [x] Trip status tracking
- [x] Material-UI interface
- [x] Local storage persistence
- [x] Environment configuration

### Phase 2: Enhanced Features ✅
- [x] Full destination and hotel management
- [x] Interactive map with OpenStreetMap/Leaflet
- [x] AI-powered trip planning with Gemini API
- [x] Advanced trip organization

### Phase 3: Backend Integration ✅
- [x] MariaDB database integration
- [x] REST API development
- [x] Auto-database creation and initialization
- [x] Database testing and management tools

### Phase 4: Advanced Features (Future)
- [ ] Photo upload and management
- [ ] Expense tracking
- [ ] Trip sharing and collaboration
- [ ] Mobile app development
- [ ] Offline capability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Material-UI** for the excellent React component library
- **Leaflet** and **OpenStreetMap** for mapping capabilities
- **Google AI** for Gemini API integration
- **React team** for the amazing framework

## 📞 Support

- Create an [issue](https://github.com/lostfleetdev/tripi/issues) for bug reports
- Join discussions in [GitHub Discussions](https://github.com/lostfleetdev/tripi/discussions)
- Follow the project for updates

---

**Happy traveling! 🌎✈️**