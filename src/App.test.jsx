import { render, screen } from '@testing-library/react';
import App from './App';

test('renders trip management app', () => {
  render(<App />);
  const linkElement = screen.getByText(/TRIPI - Trip Management/i);
  expect(linkElement).toBeInTheDocument();
});