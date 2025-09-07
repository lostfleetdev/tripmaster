import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  TravelExplore as TravelExploreIcon,
  LocationOn as LocationIcon,
  Hotel as HotelIcon,
  LocalActivity as ActivityIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { geminiService } from '../services/GeminiService';

/**
 * TabPanel component for organizing AI planner tab content
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Tab content
 * @param {number} props.index - Tab index
 * @param {number} props.value - Current active tab value
 */
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ai-tabpanel-${index}`}
      aria-labelledby={`ai-tab-${index}`}
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

/**
 * TripPlanner component for AI-powered trip planning
 * @param {Object} props - Component props
 * @param {Function} props.onTripCreated - Callback when a new trip is created
 */
const TripPlanner = ({ onTripCreated }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(7);
  const [startDate, setStartDate] = useState('');
  const [interests, setInterests] = useState([]);
  const [budget, setBudget] = useState('mid-range');
  
  // Results state
  const [aiResponse, setAiResponse] = useState('');
  const [structuredPlan, setStructuredPlan] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const interestOptions = [
    'Art & Museums', 'Food & Dining', 'History', 'Nature & Outdoors', 
    'Architecture', 'Nightlife', 'Shopping', 'Adventure Sports', 
    'Cultural Events', 'Photography', 'Beach & Water', 'Mountains'
  ];

  /**
   * Toggle an interest selection
   * @param {string} interest - Interest to toggle
   */
  const handleInterestToggle = (interest) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  /**
   * Handle tab change events
   * @param {Object} event - React synthetic event
   * @param {number} newValue - New tab index
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(null);
    setAiResponse('');
  };

  /**
   * Generate a complete trip plan using AI
   */
  const generateTripPlan = async () => {
    if (!destination.trim()) {
      setError('Please enter a destination');
      return;
    }

    setLoading(true);
    setError(null);
    setAiResponse('');

    try {
      const response = await geminiService.generateDestinationRecommendations(
        destination,
        duration,
        interests
      );
      setAiResponse(response);
    } catch (err) {
      setError(err.message || 'Failed to generate trip plan');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate hotel recommendations using AI
   */
  const generateHotelRecommendations = async () => {
    if (!destination.trim()) {
      setError('Please enter a destination');
      return;
    }

    setLoading(true);
    setError(null);
    setAiResponse('');

    try {
      const response = await geminiService.generateHotelRecommendations(destination, budget);
      setAiResponse(response);
    } catch (err) {
      setError(err.message || 'Failed to generate hotel recommendations');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate activity recommendations using AI
   */
  const generateActivities = async () => {
    if (!destination.trim()) {
      setError('Please enter a destination');
      return;
    }

    if (interests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setLoading(true);
    setError(null);
    setAiResponse('');

    try {
      const response = await geminiService.generateActivitiesRecommendations(destination, interests);
      setAiResponse(response);
    } catch (err) {
      setError(err.message || 'Failed to generate activity recommendations');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate a structured trip plan that can be saved
   */
  const generateStructuredPlan = async () => {
    if (!destination.trim() || !startDate) {
      setError('Please enter a destination and start date');
      return;
    }

    setLoading(true);
    setError(null);
    setStructuredPlan(null);

    try {
      const result = await geminiService.generateAndSaveTrip(
        destination,
        duration,
        startDate,
        interests,
        false // Don't save yet, just generate
      );
      setStructuredPlan(result.suggestion);
      setShowSaveDialog(true);
    } catch (err) {
      setError(err.message || 'Failed to generate structured trip plan');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save the generated trip to the database
   */
  const saveGeneratedTrip = async () => {
    if (!structuredPlan) return;

    setLoading(true);
    try {
      await geminiService.generateAndSaveTrip(
        destination,
        duration,
        startDate,
        interests,
        true // Save to database
      );
      setShowSaveDialog(false);
      setStructuredPlan(null);
      onTripCreated(); // Refresh the trip list
      
      // Reset form
      setDestination('');
      setStartDate('');
      setInterests([]);
      setActiveTab(0);
    } catch (err) {
      setError(err.message || 'Failed to save trip');
    } finally {
      setLoading(false);
    }
  };

  const isApiConfigured = geminiService.isConfigured();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AutoAwesomeIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4">AI Trip Planner</Typography>
      </Box>

      {!isApiConfigured && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Gemini API not configured.</strong> The AI features will use fallback responses. 
            To enable full AI functionality, add your Gemini API key to the environment variables.
          </Typography>
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Trip Details
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 2, mb: 3 }}>
            <TextField
              label="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Paris, Tokyo, New York"
              fullWidth
              required
            />
            
            <TextField
              label="Duration (days)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 7)}
              inputProps={{ min: 1, max: 30 }}
              fullWidth
            />
            
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Budget Range
            </Typography>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              >
                <MenuItem value="budget">Budget</MenuItem>
                <MenuItem value="mid-range">Mid-range</MenuItem>
                <MenuItem value="luxury">Luxury</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Interests & Preferences
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {interestOptions.map((interest) => (
                <Chip
                  key={interest}
                  label={interest}
                  clickable
                  color={interests.includes(interest) ? 'primary' : 'default'}
                  onClick={() => handleInterestToggle(interest)}
                  variant={interests.includes(interest) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          aria-label="AI planning options"
        >
          <Tab 
            icon={<TravelExploreIcon />} 
            label="Complete Trip Plan"
            id="ai-tab-0"
            aria-controls="ai-tabpanel-0"
          />
          <Tab 
            icon={<HotelIcon />} 
            label="Hotel Recommendations"
            id="ai-tab-1"
            aria-controls="ai-tabpanel-1"
          />
          <Tab 
            icon={<ActivityIcon />} 
            label="Activities & Attractions"
            id="ai-tab-2"
            aria-controls="ai-tabpanel-2"
          />
          <Tab 
            icon={<SaveIcon />} 
            label="Create Trip"
            id="ai-tab-3"
            aria-controls="ai-tabpanel-3"
          />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Complete Trip Plan
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Get a comprehensive trip plan including attractions, activities, restaurants, and travel tips.
            </Typography>
            <Button
              variant="contained"
              onClick={generateTripPlan}
              disabled={loading || !destination.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
              sx={{ mb: 2 }}
            >
              {loading ? 'Generating...' : 'Generate Trip Plan'}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Hotel Recommendations
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Get personalized hotel recommendations based on your budget and preferences.
            </Typography>
            <Button
              variant="contained"
              onClick={generateHotelRecommendations}
              disabled={loading || !destination.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <HotelIcon />}
              sx={{ mb: 2 }}
            >
              {loading ? 'Generating...' : 'Get Hotel Recommendations'}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Activities & Attractions
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Discover activities and attractions tailored to your interests.
            </Typography>
            <Button
              variant="contained"
              onClick={generateActivities}
              disabled={loading || !destination.trim() || interests.length === 0}
              startIcon={loading ? <CircularProgress size={20} /> : <ActivityIcon />}
              sx={{ mb: 2 }}
            >
              {loading ? 'Generating...' : 'Find Activities'}
            </Button>
            {interests.length === 0 && (
              <Typography variant="caption" color="error" display="block">
                Please select at least one interest above to get activity recommendations.
              </Typography>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Create Complete Trip
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Generate a structured trip that you can save and manage in your trip list.
            </Typography>
            <Button
              variant="contained"
              onClick={generateStructuredPlan}
              disabled={loading || !destination.trim() || !startDate}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{ mb: 2 }}
            >
              {loading ? 'Creating...' : 'Create Trip Plan'}
            </Button>
            {(!destination.trim() || !startDate) && (
              <Typography variant="caption" color="error" display="block">
                Please enter a destination and start date to create a trip.
              </Typography>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* AI Response Display */}
      {(aiResponse || error) && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {error ? 'Error' : 'AI Recommendation'}
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => {
                setAiResponse('');
                setError(null);
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {error ? (
            <Alert severity="error">
              {error}
            </Alert>
          ) : (
            <Typography 
              variant="body1" 
              sx={{ 
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                lineHeight: 1.6
              }}
            >
              {aiResponse}
            </Typography>
          )}
        </Paper>
      )}

      {/* Save Trip Dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SaveIcon sx={{ mr: 1 }} />
            Save Generated Trip
          </Box>
        </DialogTitle>
        <DialogContent>
          {structuredPlan && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {structuredPlan.tripName}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {structuredPlan.startDate} to {structuredPlan.endDate}
              </Typography>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    Destinations ({structuredPlan.destinations?.length || 0})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {structuredPlan.destinations?.map((dest, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography>
                        <strong>{dest.name}</strong> - {dest.location}
                      </Typography>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>

              <Alert severity="info" sx={{ mt: 2 }}>
                This trip will be added to your trip list. You can then add hotels, activities, 
                and more details using the trip management features.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button 
            onClick={saveGeneratedTrip} 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {loading ? 'Saving...' : 'Save Trip'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TripPlanner;