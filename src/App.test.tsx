import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders TRIPI app header', () => {
  render(<App />);
  const headerElement = screen.getByText(/🗺️ TRIPI - Trip Management/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders My Trips tab', () => {
  render(<App />);
  const tripsTab = screen.getByRole('tab', { name: /My Trips/i });
  expect(tripsTab).toBeInTheDocument();
});

test('renders AI Trip Planner tab', () => {
  render(<App />);
  const aiTab = screen.getByText(/AI Trip Planner/i);
  expect(aiTab).toBeInTheDocument();
});
