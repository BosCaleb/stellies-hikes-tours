import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';

describe('App', () => {
  it('renders the main app shell', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Walk the mountains we know by heart/i)).toBeInTheDocument();
  });
});
