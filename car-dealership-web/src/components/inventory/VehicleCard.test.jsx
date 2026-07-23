import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VehicleCard } from './VehicleCard';

describe('VehicleCard', () => {
  const mockVehicle = {
    id: 'uuid-1',
    make: 'Toyota',
    model: 'Camry',
    category: 'Sedan',
    price: 25000,
    quantity_in_stock: 5
  };

  it('should render vehicle details and format price correctly', () => {
    render(<VehicleCard vehicle={mockVehicle} onPurchase={vi.fn()} />);
    
    expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    expect(screen.getByText('Sedan')).toBeInTheDocument();
    expect(screen.getByText('$25,000.00')).toBeInTheDocument();
    expect(screen.getByText('In Stock: 5')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /purchase/i })).not.toBeDisabled();
  });

  it('should display out of stock and disable purchase button when quantity is 0', () => {
    const outOfStockVehicle = { ...mockVehicle, quantity_in_stock: 0 };
    render(<VehicleCard vehicle={outOfStockVehicle} onPurchase={vi.fn()} />);
    
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /purchase/i })).toBeDisabled();
  });

  it('should call onPurchase with vehicle id when purchase button is clicked', () => {
    const mockOnPurchase = vi.fn();
    render(<VehicleCard vehicle={mockVehicle} onPurchase={mockOnPurchase} />);
    
    fireEvent.click(screen.getByRole('button', { name: /purchase/i }));
    expect(mockOnPurchase).toHaveBeenCalledWith('uuid-1');
  });
});
