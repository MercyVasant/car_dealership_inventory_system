import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionList } from './TransactionList';
import apiClient from '../../api/apiClient';

vi.mock('../../api/apiClient', () => ({
  default: {
    get: vi.fn()
  }
}));

describe('TransactionList', () => {
  const mockTransactionsResponse = {
    data: {
      data: [
        {
          id: 't1',
          transaction_type: 'SALE',
          quantity: 1,
          total_price: 25000,
          created_at: '2023-10-27T10:00:00Z',
          Vehicle: { make: 'Toyota', model: 'Camry' },
          User: { username: 'john_doe' }
        },
        {
          id: 't2',
          transaction_type: 'RESTOCK',
          quantity: 5,
          total_price: 125000,
          created_at: '2023-10-28T10:00:00Z',
          Vehicle: { make: 'Ford', model: 'F-150' },
          User: { username: 'admin_user' }
        }
      ],
      total: 2,
      page: 1,
      limit: 20
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and render transaction history correctly', async () => {
    apiClient.get.mockResolvedValue(mockTransactionsResponse);
    render(<TransactionList />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      expect(screen.getByText('SALE')).toBeInTheDocument();
      expect(screen.getByText('john_doe')).toBeInTheDocument();
      expect(screen.getByText('$25,000.00')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      
      expect(screen.getByText('Ford F-150')).toBeInTheDocument();
      expect(screen.getByText('RESTOCK')).toBeInTheDocument();
      expect(screen.getByText('admin_user')).toBeInTheDocument();
    });

    expect(apiClient.get).toHaveBeenCalledWith('/transactions');
  });

  it('should handle empty transaction list', async () => {
    apiClient.get.mockResolvedValue({ data: { data: [] } });
    render(<TransactionList />);

    await waitFor(() => {
      expect(screen.getByText('No transactions found.')).toBeInTheDocument();
    });
  });
});
