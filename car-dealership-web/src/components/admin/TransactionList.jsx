import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

export const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/transactions');
        setTransactions(response.data.data || []);
      } catch (err) {
        setError('Failed to load transaction history.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading transactions...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-sm text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map(t => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.transaction_type === 'SALE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {t.transaction_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{t.Vehicle?.make} {t.Vehicle?.model}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{t.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(t.total_price)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{t.User?.username}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(t.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
