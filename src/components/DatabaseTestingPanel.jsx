import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Api as ApiIcon,
} from '@mui/icons-material';
import { tripService } from '../services/TripService.js';

/**
 * Database testing panel component for testing database functionality
 */
export const DatabaseTestingPanel = () => {
  const [tests, setTests] = useState([
    {
      name: 'Connection Test',
      description: 'Test basic database connectivity',
      status: 'pending',
    },
    {
      name: 'Create Trip',
      description: 'Create a test trip record',
      status: 'pending',
    },
    {
      name: 'Read Trip',
      description: 'Retrieve trip data',
      status: 'pending',
    },
    {
      name: 'Update Trip',
      description: 'Update trip information',
      status: 'pending',
    },
    {
      name: 'Delete Trip',
      description: 'Remove test trip data',
      status: 'pending',
    },
    {
      name: 'Add Destination',
      description: 'Add destination to trip',
      status: 'pending',
    },
    {
      name: 'Add Hotel',
      description: 'Add hotel to destination',
      status: 'pending',
    },
  ]);

  const [connectionInfo, setConnectionInfo] = useState({
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    usingMariaDB: process.env.REACT_APP_USE_MARIADB === 'true',
    backendHealth: 'unknown',
  });

  const [isRunning, setIsRunning] = useState(false);
  const [testTripId, setTestTripId] = useState(null);
  const [testDestinationId, setTestDestinationId] = useState(null);

  const updateTestStatus = (index, updates) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ));
  };

  const checkBackendHealth = useCallback(async () => {
    try {
      const healthUrl = connectionInfo.apiUrl.replace('/api', '/health');
      const response = await fetch(healthUrl);
      if (response.ok) {
        setConnectionInfo(prev => ({ ...prev, backendHealth: 'healthy' }));
        return true;
      }
      throw new Error('Backend not responding');
    } catch (error) {
      setConnectionInfo(prev => ({ ...prev, backendHealth: 'unhealthy' }));
      return false;
    }
  }, [connectionInfo.apiUrl]);

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Reset all tests to pending
    setTests(prev => prev.map(test => ({ ...test, status: 'pending', message: undefined, duration: undefined })));

    // Test 1: Connection Test
    updateTestStatus(0, { status: 'running' });
    const startTime = Date.now();
    
    try {
      const healthCheck = await checkBackendHealth();
      if (healthCheck) {
        updateTestStatus(0, {
          status: 'success',
          message: 'Backend API is responding',
          duration: Date.now() - startTime,
        });
      } else {
        throw new Error('Backend health check failed');
      }
    } catch (error) {
      updateTestStatus(0, {
        status: 'error',
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
      });
      setIsRunning(false);
      return;
    }

    // Test 2: Create Trip
    updateTestStatus(1, { status: 'running' });
    const createStartTime = Date.now();
    
    try {
      const testTrip = await tripService.createTrip({
        name: 'Database Test Trip',
        startDate: '2024-07-01',
        endDate: '2024-07-10',
        status: 'planned'
      });
      
      setTestTripId(testTrip.id);
      updateTestStatus(1, {
        status: 'success',
        message: `Trip created with ID: ${testTrip.id}`,
        duration: Date.now() - createStartTime,
      });
    } catch (error) {
      updateTestStatus(1, {
        status: 'error',
        message: `Create failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - createStartTime,
      });
      setIsRunning(false);
      return;
    }

    // Test 3: Read Trip
    updateTestStatus(2, { status: 'running' });
    const readStartTime = Date.now();
    
    try {
      const readTrip = await tripService.getTripById(testTripId);
      if (readTrip && readTrip.id === testTripId) {
        updateTestStatus(2, {
          status: 'success',
          message: `Trip retrieved successfully: ${readTrip.name}`,
          duration: Date.now() - readStartTime,
        });
      } else {
        throw new Error('Trip not found or data mismatch');
      }
    } catch (error) {
      updateTestStatus(2, {
        status: 'error',
        message: `Read failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - readStartTime,
      });
      setIsRunning(false);
      return;
    }

    // Test 4: Update Trip
    updateTestStatus(3, { status: 'running' });
    const updateStartTime = Date.now();
    
    try {
      const updatedTrip = await tripService.updateTrip(testTripId, {
        name: 'Updated Database Test Trip'
      });
      
      if (updatedTrip && updatedTrip.name === 'Updated Database Test Trip') {
        updateTestStatus(3, {
          status: 'success',
          message: 'Trip updated successfully',
          duration: Date.now() - updateStartTime,
        });
      } else {
        throw new Error('Update verification failed');
      }
    } catch (error) {
      updateTestStatus(3, {
        status: 'error',
        message: `Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - updateStartTime,
      });
      setIsRunning(false);
      return;
    }

    // Test 5: Add Destination
    updateTestStatus(5, { status: 'running' });
    const addDestStartTime = Date.now();
    
    try {
      const destination = await tripService.addDestination(testTripId, {
        name: 'Test Destination',
        location: 'Test Location',
        latitude: 40.7128,
        longitude: -74.0060
      });
      
      if (destination) {
        setTestDestinationId(destination.id);
        updateTestStatus(5, {
          status: 'success',
          message: `Destination added with ID: ${destination.id}`,
          duration: Date.now() - addDestStartTime,
        });
      } else {
        throw new Error('Destination creation failed');
      }
    } catch (error) {
      updateTestStatus(5, {
        status: 'error',
        message: `Add destination failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - addDestStartTime,
      });
      setIsRunning(false);
      return;
    }

    // Test 6: Add Hotel
    updateTestStatus(6, { status: 'running' });
    const addHotelStartTime = Date.now();
    
    try {
      const hotel = await tripService.addHotel(testTripId, testDestinationId, {
        name: 'Test Hotel',
        address: '123 Test Street, Test City'
      });
      
      if (hotel) {
        updateTestStatus(6, {
          status: 'success',
          message: `Hotel added with ID: ${hotel.id}`,
          duration: Date.now() - addHotelStartTime,
        });
      } else {
        throw new Error('Hotel creation failed');
      }
    } catch (error) {
      updateTestStatus(6, {
        status: 'error',
        message: `Add hotel failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - addHotelStartTime,
      });
    }

    // Test 7: Delete Trip (cleanup)
    updateTestStatus(4, { status: 'running' });
    const deleteStartTime = Date.now();
    
    try {
      const deleted = await tripService.deleteTrip(testTripId);
      if (deleted) {
        updateTestStatus(4, {
          status: 'success',
          message: 'Test trip deleted successfully',
          duration: Date.now() - deleteStartTime,
        });
      } else {
        throw new Error('Delete operation returned false');
      }
    } catch (error) {
      updateTestStatus(4, {
        status: 'error',
        message: `Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - deleteStartTime,
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'running':
        return <CircularProgress size={24} />;
      default:
        return <WarningIcon color="disabled" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'running':
        return 'warning';
      default:
        return 'default';
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, [checkBackendHealth]);

  const testResults = tests.filter(test => test.status !== 'pending');
  const successCount = tests.filter(test => test.status === 'success').length;
  const errorCount = tests.filter(test => test.status === 'error').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <StorageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4">Database Testing</Typography>
      </Box>

      {/* Connection Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Connection Information
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Database Type
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <StorageIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body1">
                  {connectionInfo.usingMariaDB ? 'MariaDB (via API)' : 'IndexedDB (Browser)'}
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                API Endpoint
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <ApiIcon sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {connectionInfo.apiUrl}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Backend Health
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {connectionInfo.backendHealth === 'healthy' ? (
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              ) : connectionInfo.backendHealth === 'unhealthy' ? (
                <ErrorIcon color="error" sx={{ mr: 1 }} />
              ) : (
                <WarningIcon color="disabled" sx={{ mr: 1 }} />
              )}
              <Chip 
                label={connectionInfo.backendHealth} 
                color={
                  connectionInfo.backendHealth === 'healthy' ? 'success' :
                  connectionInfo.backendHealth === 'unhealthy' ? 'error' : 'default'
                }
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Database Tests
            </Typography>
            <Button 
              variant="contained" 
              onClick={runAllTests}
              disabled={isRunning}
              startIcon={isRunning ? <CircularProgress size={20} /> : <RefreshIcon />}
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </Box>

          {testResults.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={`${successCount} Passed`}
                color="success"
                size="small"
                variant={successCount > 0 ? 'filled' : 'outlined'}
              />
              <Chip 
                label={`${errorCount} Failed`}
                color="error"
                size="small"
                variant={errorCount > 0 ? 'filled' : 'outlined'}
              />
              <Chip 
                label={`${testResults.length} / ${tests.length} Completed`}
                color="info"
                size="small"
              />
            </Box>
          )}

          <Typography variant="body2" color="text.secondary">
            Run comprehensive tests to verify database connectivity, CRUD operations, and data integrity.
          </Typography>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Paper sx={{ p: 0 }}>
        {tests.map((test, index) => (
          <Box key={test.name}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ mr: 2 }}>
                {getStatusIcon(test.status)}
              </Box>
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1">
                  {test.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {test.description}
                </Typography>
                
                {test.duration && (
                  <Typography variant="caption" color="text.secondary">
                    Completed in {test.duration}ms
                  </Typography>
                )}
              </Box>

              <Box sx={{ ml: 2 }}>
                <Chip 
                  label={test.status} 
                  color={getStatusColor(test.status)}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>
            </Box>

            {test.message && (
              <Alert 
                severity={test.status === 'success' ? 'success' : 'error'}
                sx={{ mx: 3, mb: 2 }}
              >
                {test.message}
              </Alert>
            )}
            
            {index < tests.length - 1 && <Divider />}
          </Box>
        ))}
      </Paper>
    </Box>
  );
};