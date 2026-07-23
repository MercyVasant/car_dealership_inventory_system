import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { RestockModal } from './RestockModal';

export const AdminInventoryPanel = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restockVehicle, setRestockVehicle] = useState(null);
  const [form, setForm] = useState({ make: '', model: '', category: '', price: '', quantity_in_stock: 0 });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/vehicles');
      setVehicles(response.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleDelete = async (id) => {
    await apiClient.delete(`/vehicles/${id}`);
    fetchVehicles();
  };

  const handleRestock = async (vehicleId, quantity) => {
    await apiClient.post('/transactions/restock', { vehicle_id: vehicleId, quantity });
    setRestockVehicle(null);
    fetchVehicles();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await apiClient.post('/vehicles', { ...form, price: Number(form.price) });
    setIsModalOpen(false);
    setForm({ make: '', model: '', category: '', price: '', quantity_in_stock: 0 });
    fetchVehicles();
  };

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        <Button onClick={() => setIsModalOpen(true)}>Add Vehicle</Button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Make', 'Model', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vehicles.map(v => (
                <tr key={v.id}>
                  <td className="px-4 py-3 text-sm">{v.make}</td>
                  <td className="px-4 py-3 text-sm">{v.model}</td>
                  <td className="px-4 py-3 text-sm">{v.category}</td>
                  <td className="px-4 py-3 text-sm">${Number(v.price).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">{v.quantity_in_stock}</td>
                  <td className="px-4 py-3 text-sm flex gap-2">
                    <Button variant="secondary" onClick={() => setRestockVehicle(v)}>Restock</Button>
                    <Button variant="danger" onClick={() => handleDelete(v.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Vehicle">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="make" label="Make" value={form.make} onChange={handleChange('make')} required />
          <Input id="model" label="Model" value={form.model} onChange={handleChange('model')} required />
          <Input id="category" label="Category" value={form.category} onChange={handleChange('category')} required />
          <Input id="price" label="Price" type="number" value={form.price} onChange={handleChange('price')} required />
          <Input id="quantity_in_stock" label="Stock" type="number" value={form.quantity_in_stock} onChange={handleChange('quantity_in_stock')} />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <RestockModal 
        isOpen={!!restockVehicle}
        onClose={() => setRestockVehicle(null)}
        vehicle={restockVehicle}
        onConfirm={handleRestock}
      />
    </div>
  );
};
