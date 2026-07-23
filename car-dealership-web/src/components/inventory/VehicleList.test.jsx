import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VehicleList } from './VehicleList';
import apiClient from '../../api/apiClient';

vi.mock('../../api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('VehicleList', () => {
  const mockVehiclesResponse = {
    data: {
      data: [
        { id: '1', make: 'Honda', model: 'Civic', category: 'Compact', price: 20000, quantity_in_stock: 2 },
        { id: '2', make: 'Ford', model: 'F-150', category: 'Truck', price: 35000, quantity_in_stock: 0 }
      ],
      total: 2,
      page: 1,
      limit: 20
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and render vehicles on mount', async () => {
    apiClient.get.mockResolvedValue(mockVehiclesResponse);
    render(<VehicleList />);

    expect(screen.getByText(/loading inventory/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
      expect(screen.getByText('Ford F-150')).toBeInTheDocument();
    });

    expect(apiClient.get).toHaveBeenCalledWith('/vehicles/search', { params: { limit: 20, offset: 0 } });
  });

  it('should perform search with filters', async () => {
    apiClient.get.mockResolvedValue({ data: { data: [] } });
    render(<VehicleList />);

    // Wait for initial load
    await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText(/make/i), { target: { value: 'Toyota' } });
    fireEvent.change(screen.getByLabelText(/min price/i), { target: { value: '10000' } });
    fireEvent.change(screen.getByLabelText(/max price/i), { target: { value: '50000' } });
    
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/vehicles/search', { 
        params: { limit: 20, offset: 0, make: 'Toyota', minPrice: '10000', maxPrice: '50000' } 
      });
    });
  });

  it('should handle purchase successfully', async () => {
    apiClient.get.mockResolvedValue(mockVehiclesResponse);
    apiClient.post.mockResolvedValue({});
    
    render(<VehicleList />);

    await waitFor(() => {
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
    });

    const purchaseButtons = screen.getAllByRole('button', { name: /purchase/i });
    fireEvent.click(purchaseButtons[0]); // Honda Civic is in stock

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/transactions/purchase', { vehicle_id: '1', quantity: 1 });
      // Should refetch vehicles
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });
});
