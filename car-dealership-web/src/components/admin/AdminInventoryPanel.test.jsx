import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminInventoryPanel } from './AdminInventoryPanel';
import apiClient from '../../api/apiClient';

vi.mock('../../api/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}));

describe('AdminInventoryPanel', () => {
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

  it('should fetch and render vehicles correctly', async () => {
    apiClient.get.mockResolvedValue(mockVehiclesResponse);
    render(<AdminInventoryPanel />);

    await waitFor(() => {
      expect(screen.getByText('Honda')).toBeInTheDocument();
      expect(screen.getByText('Civic')).toBeInTheDocument();
      expect(screen.getByText('F-150')).toBeInTheDocument();
    });
  });

  it('should allow adding a new vehicle', async () => {
    apiClient.get.mockResolvedValue(mockVehiclesResponse);
    apiClient.post.mockResolvedValue({});
    
    render(<AdminInventoryPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Honda')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/make/i), { target: { value: 'Tesla' } });
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'Model 3' } });
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'Electric' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '45000' } });
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/vehicles', expect.objectContaining({
        make: 'Tesla', model: 'Model 3', price: 45000
      }));
      expect(apiClient.get).toHaveBeenCalledTimes(2); // refetches list
    });
  });

  it('should allow deleting a vehicle', async () => {
    apiClient.get.mockResolvedValue(mockVehiclesResponse);
    apiClient.delete.mockResolvedValue({});
    
    render(<AdminInventoryPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Honda')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith('/vehicles/1');
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });

  it('should open restock modal and handle restock correctly', async () => {
    apiClient.get.mockResolvedValue(mockVehiclesResponse);
    apiClient.post.mockResolvedValue({});
    
    render(<AdminInventoryPanel />);
    
    await waitFor(() => {
      expect(screen.getByText('Honda')).toBeInTheDocument();
    });

    const restockButtons = screen.getAllByRole('button', { name: /restock/i });
    fireEvent.click(restockButtons[0]);

    const quantityInput = screen.getByLabelText(/quantity/i);
    fireEvent.change(quantityInput, { target: { value: '5' } });
    
    const confirmButton = screen.getByRole('button', { name: /confirm restock/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/transactions/restock', {
        vehicle_id: '1', quantity: 5
      });
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });
});
