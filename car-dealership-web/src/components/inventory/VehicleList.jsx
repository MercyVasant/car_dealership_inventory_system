import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/apiClient';
import { VehicleCard } from './VehicleCard';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [make, setMake] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 20, offset: 0 };
      if (make) params.make = make;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      // API: GET /api/vehicles/search → { data: [], total, page, limit }
      const response = await apiClient.get('/vehicles/search', { params });
      setVehicles(response.data.data || []);
    } catch {
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [make, minPrice, maxPrice]);

  useEffect(() => { fetchVehicles(); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchVehicles(); };

  const handlePurchase = async (vehicleId) => {
    // API: POST /api/transactions/purchase → { vehicle_id, quantity }
    // Verified from transactionRoutes.js
    try {
      await apiClient.post('/transactions/purchase', { vehicle_id: vehicleId, quantity: 1 });
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.error || 'Purchase failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <Input label="Make" id="make" placeholder="e.g. Toyota" value={make} onChange={(e) => setMake(e.target.value)} />
          </div>
          <div className="flex-1">
            <Input label="Min Price" id="minPrice" type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          </div>
          <div className="flex-1">
            <Input label="Max Price" id="maxPrice" type="number" placeholder="100000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>
      {error && <div role="alert" className="text-red-600 p-4 bg-red-50 rounded-lg">{error}</div>}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading inventory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500">No vehicles found.</div>
          ) : (
            vehicles.map(v => <VehicleCard key={v.id} vehicle={v} onPurchase={handlePurchase} />)
          )}
        </div>
      )}
    </div>
  );
};
