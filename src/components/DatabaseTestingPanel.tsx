import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
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
import { tripService } from '../services/TripService';

interface DatabaseTest {
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
}

interface ConnectionInfo {
  apiUrl: string;
  usingMariaDB: boolean;
  backendHealth: 'unknown' | 'healthy' | 'unhealthy';
}

export const DatabaseTestingPanel: React.FC = () => {
  const [tests, setTests] = useState<DatabaseTest[]>([
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

  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    usingMariaDB: process.env.REACT_APP_USE_MARIADB === 'true',
    backendHealth: 'unknown',
  });

  const [isRunning, setIsRunning] = useState(false);
  const [testTripId, setTestTripId] = useState<string | null>(null);
  const [testDestinationId, setTestDestinationId] = useState<string | null>(null);

  const updateTestStatus = (index: number, updates: Partial<DatabaseTest>) => {
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
      } else {
        setConnectionInfo(prev => ({ ...prev, backendHealth: 'unhealthy' }));
        return false;
      }
    } catch (error) {
      setConnectionInfo(prev => ({ ...prev, backendHealth: 'unhealthy' }));
      return false;
    }
  }, [connectionInfo.apiUrl]);

  const runTests = async () => {
    setIsRunning(true);
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' as const, message: undefined, duration: undefined })));

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
        name: `Test Trip ${Date.now()}`,
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        status: 'planned',
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
    if (testTripId) {
      updateTestStatus(2, { status: 'running' });
      const readStartTime = Date.now();
      
      try {
        const retrievedTrip = await tripService.getTripById(testTripId);
        if (retrievedTrip) {
          updateTestStatus(2, {
            status: 'success',
            message: `Trip retrieved: ${retrievedTrip.name}`,
            duration: Date.now() - readStartTime,
          });
        } else {
          throw new Error('Trip not found');
        }
      } catch (error) {
        updateTestStatus(2, {
          status: 'error',
          message: `Read failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration: Date.now() - readStartTime,
        });
      }
    }

    // Test 4: Update Trip
    if (testTripId) {
      updateTestStatus(3, { status: 'running' });
      const updateStartTime = Date.now();
      
      try {
        const updatedTrip = await tripService.updateTrip(testTripId, {
          name: `Updated Test Trip ${Date.now()}`,
        });
        
        if (updatedTrip) {
          updateTestStatus(3, {
            status: 'success',
            message: `Trip updated: ${updatedTrip.name}`,
            duration: Date.now() - updateStartTime,
          });
        } else {
          throw new Error('Update returned null');
        }
      } catch (error) {
        updateTestStatus(3, {
          status: 'error',
          message: `Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration: Date.now() - updateStartTime,
        });
      }
    }

    // Test 5: Add Destination
    if (testTripId) {
      updateTestStatus(5, { status: 'running' });
      const destStartTime = Date.now();
      
      try {
        const destination = await tripService.addDestination(testTripId, {
          name: 'Test Destination',
          location: 'Test City, Test Country',
          latitude: 40.7128,
          longitude: -74.0060,
        });
        
        if (destination) {
          setTestDestinationId(destination.id);
          updateTestStatus(5, {
            status: 'success',
            message: `Destination added: ${destination.name}`,
            duration: Date.now() - destStartTime,
          });
        } else {
          throw new Error('Add destination returned null');
        }
      } catch (error) {
        updateTestStatus(5, {
          status: 'error',
          message: `Add destination failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration: Date.now() - destStartTime,
        });
      }
    }

    // Test 6: Add Hotel
    if (testTripId && testDestinationId) {
      updateTestStatus(6, { status: 'running' });
      const hotelStartTime = Date.now();
      
      try {
        const hotel = await tripService.addHotel(testTripId, testDestinationId, {
          name: 'Test Hotel',
          address: '123 Test Street, Test City',
        });
        
        if (hotel) {
          updateTestStatus(6, {
            status: 'success',
            message: `Hotel added: ${hotel.name}`,
            duration: Date.now() - hotelStartTime,
          });
        } else {
          throw new Error('Add hotel returned null');
        }
      } catch (error) {
        updateTestStatus(6, {
          status: 'error',
          message: `Add hotel failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration: Date.now() - hotelStartTime,
        });
      }
    }

    // Test 7: Delete Trip (cleanup)
    if (testTripId) {
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
          throw new Error('Delete returned false');
        }
      } catch (error) {
        updateTestStatus(4, {
          status: 'error',
          message: `Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration: Date.now() - deleteStartTime,
        });
      }
    }

    setIsRunning(false);
  };

  useEffect(() => {
    checkBackendHealth();
  }, [checkBackendHealth]);

  const getStatusIcon = (status: DatabaseTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'running':
        return <CircularProgress size={24} />;
      default:
        return <WarningIcon color="warning" />;
    }
  };

  const getStatusColor = (status: DatabaseTest['status']) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'running':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Database Testing Panel
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        This panel allows you to test the database connectivity and operations
        for the TRIPI application.
      </Typography>

      {/* Connection Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <ApiIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Connection Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="API URL"
              value={connectionInfo.apiUrl}
              fullWidth
              disabled
              variant="outlined"
              size="small"
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StorageIcon />
              <Typography>Database:</Typography>
              <Chip
                label={connectionInfo.usingMariaDB ? 'MariaDB' : 'IndexedDB'}
                color={connectionInfo.usingMariaDB ? 'primary' : 'default'}
                size="small"
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>Backend Status:</Typography>
              <Chip
                label={connectionInfo.backendHealth}
                color={
                  connectionInfo.backendHealth === 'healthy' ? 'success' :
                  connectionInfo.backendHealth === 'unhealthy' ? 'error' : 'default'
                }
                size="small"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={isRunning ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={runTests}
          disabled={isRunning}
          sx={{ mr: 2 }}
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={checkBackendHealth}
          disabled={isRunning}
        >
          Check Backend Health
        </Button>
      </Box>

      {/* Test Results */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Test Results
        </Typography>
        
        {tests.map((test, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              {getStatusIcon(test.status)}
              <Typography variant="h6">{test.name}</Typography>
              <Chip
                label={test.status}
                color={getStatusColor(test.status)}
                size="small"
              />
              {test.duration && (
                <Typography variant="caption" color="text.secondary">
                  ({test.duration}ms)
                </Typography>
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {test.description}
            </Typography>
            
            {test.message && (
              <Alert 
                severity={test.status === 'success' ? 'success' : test.status === 'error' ? 'error' : 'info'}
                sx={{ mb: 1 }}
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