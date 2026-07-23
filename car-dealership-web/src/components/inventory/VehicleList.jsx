/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/apiClient';
import { VehicleCard } from './VehicleCard';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Navbar } from '../ui/Navbar';

export const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 20, page: 1 };
      if (make) params.make = make;
      if (model) params.model = model;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const response = await apiClient.get('/vehicles/search', { params });
      setVehicles(response.data.data || []);
    } catch {
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [make, model, category, minPrice, maxPrice]);

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchVehicles(); };

  const handlePurchase = async (vehicleId) => {
    try {
      await apiClient.post('/transactions', { vehicle_id: vehicleId, quantity: 1, type: 'PURCHASE' });
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.error || 'Purchase failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: "'Montserrat', sans-serif" }}>
      <Navbar />

      {/* Search Header */}
      <div style={{
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '32px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', marginBottom: '24px' }}>
            Browse Collection
          </h2>
          <form onSubmit={handleSearch} style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px', alignItems: 'end',
          }}>
            <Input label="Brand" id="make" placeholder="e.g. Porsche" value={make} onChange={(e) => setMake(e.target.value)} />
            <Input label="Model" id="model" placeholder="e.g. 911" value={model} onChange={(e) => setModel(e.target.value)} />
            <Input label="Type" id="category" placeholder="e.g. Coupe" value={category} onChange={(e) => setCategory(e.target.value)} />
            <Input label="Min Value" id="minPrice" type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            <Input label="Max Value" id="maxPrice" type="number" placeholder="No limit" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            <Button type="submit" style={{ padding: '12px' }}>Apply Filters</Button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        {error && (
          <div role="alert" style={{
            marginBottom: '32px', padding: '16px 20px', borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171', fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{
            textAlign: 'center', padding: '100px 0',
            fontSize: '14px', fontWeight: 600, color: '#94a3b8',
          }}>
            Retrieving inventory...
          </div>
        ) : vehicles.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '100px 0',
            fontSize: '14px', fontWeight: 600, color: '#94a3b8',
          }}>
            No matching vehicles available in current allocation.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px',
          }}>
            {vehicles.map(v => (
              <VehicleCard key={v.id} vehicle={v} onPurchase={handlePurchase} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};