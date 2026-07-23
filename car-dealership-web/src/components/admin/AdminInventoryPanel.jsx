import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

export const AdminInventoryPanel = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ make: '', model: '', category: '', price: '', quantity_in_stock: 0 });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      // API: GET /api/vehicles → { vehicles: [] } (auth required)
      const response = await apiClient.get('/vehicles');
      setVehicles(response.data.vehicles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleDelete = async (id) => {
    // API: DELETE /api/vehicles/:id → 204 (ADMIN)
    await apiClient.delete(`/vehicles/${id}`);
    fetchVehicles();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // API: POST /api/vehicles → 201 (ADMIN)
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
                  <td className="px-4 py-3 text-sm">
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
    </div>
  );
};
