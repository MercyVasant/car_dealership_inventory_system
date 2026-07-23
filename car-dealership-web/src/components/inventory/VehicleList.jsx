/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { vehicleApi } from '../../api/vehicleApi';
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
      const response = await vehicleApi.searchVehicles(params);
      setVehicles(response.data.data || []);
    } catch {
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [make, model, category, minPrice, maxPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicles();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchVehicles]);

  const handleSearch = (e) => { e.preventDefault(); };

  const handlePurchase = async (vehicleId) => {
    try {
      await vehicleApi.purchaseVehicle(vehicleId);
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.error || 'Purchase failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: "'Montserrat', sans-serif" }}>
      <Navbar />

      <div style={{
        background: '#000',
        borderBottom: '1px solid #222',
        padding: '32px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <form onSubmit={handleSearch} style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '12px', alignItems: 'center',
          }}>
            <input 
              placeholder="SEARCH MANUFACTURER" 
              value={make} 
              onChange={(e) => setMake(e.target.value)}
              style={{ background: '#0a0a0a', border: '1px solid #222', color: '#fff', padding: '14px', fontSize: '12px', letterSpacing: '1px', outline: 'none' }}
            />
            <input 
              placeholder="SEARCH DESIGNATION" 
              value={model} 
              onChange={(e) => setModel(e.target.value)}
              style={{ background: '#0a0a0a', border: '1px solid #222', color: '#fff', padding: '14px', fontSize: '12px', letterSpacing: '1px', outline: 'none' }}
            />
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={{ background: '#0a0a0a', border: '1px solid #222', color: '#fff', padding: '14px', fontSize: '12px', letterSpacing: '1px', outline: 'none', appearance: 'none' }}
            >
              <option value="">GLOBAL INVENTORY (ALL)</option>
              <option value="EXECUTIVE SALOON">EXECUTIVE SALOON</option>
              <option value="SPORT UTILITY">SPORT UTILITY</option>
              <option value="SUPERCAR">SUPERCAR</option>
              <option value="GRAND TOURER">GRAND TOURER</option>
              <option value="ELECTRIC ASSET">ELECTRIC ASSET</option>
            </select>
            <input 
              placeholder="MIN $" 
              type="number" 
              value={minPrice} 
              onChange={(e) => setMinPrice(e.target.value)}
              style={{ background: '#0a0a0a', border: '1px solid #222', color: '#fff', padding: '14px', fontSize: '12px', letterSpacing: '1px', outline: 'none' }}
            />
            <input 
              placeholder="MAX $" 
              type="number" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{ background: '#0a0a0a', border: '1px solid #222', color: '#fff', padding: '14px', fontSize: '12px', letterSpacing: '1px', outline: 'none' }}
            />
            <button type="submit" style={{ display: 'none' }}>Search</button>
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