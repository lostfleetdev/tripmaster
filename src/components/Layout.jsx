import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Paper
} from '@mui/material';
import TripList from './TripListSimple.jsx';
import TripDetail from './TripDetailSimple.jsx';
import TripPlanner from './TripPlannerSimple.jsx';
import { DatabaseTestingPanel } from './DatabaseTestingPanel.jsx';
import { tripService } from '../services/TripService.js';

/**
 * Tab panel component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {number} props.index
 * @param {number} props.value
 */
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Layout = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    // Initialize sample data and load trips
    const initializeData = async () => {
      await tripService.initializeSampleData();
      loadTrips();
    };
    initializeData();
  }, []);

  const loadTrips = async () => {
    const allTrips = await tripService.getAllTrips();
    setTrips(allTrips);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue !== 1) {
      setSelectedTrip(null);
    }
  };

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    setActiveTab(1); // Switch to trip detail tab
  };

  const handleTripUpdate = async () => {
    await loadTrips();
    if (selectedTrip) {
      const updatedTrip = await tripService.getTripById(selectedTrip.id);
      setSelectedTrip(updatedTrip || null);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🗺️ TripMaster - Trip Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <Paper elevation={1}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="trip management tabs">
              <Tab label="My Trips" />
              <Tab label="Trip Details" disabled={!selectedTrip} />
              <Tab label="AI Trip Planner" />
              <Tab label="Database Testing" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <TripList 
              trips={trips}
              onTripSelect={handleTripSelect}
              onTripUpdate={handleTripUpdate}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {selectedTrip ? (
              <TripDetail 
                trip={selectedTrip}
                onTripUpdate={handleTripUpdate}
              />
            ) : (
              <Typography variant="body1" color="text.secondary">
                Please select a trip from the "My Trips" tab to view details.
              </Typography>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <TripPlanner onTripCreated={handleTripUpdate} />
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <DatabaseTestingPanel />
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default Layout;