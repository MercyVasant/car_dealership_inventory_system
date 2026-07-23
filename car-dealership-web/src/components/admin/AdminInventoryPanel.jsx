/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { vehicleApi } from '../../api/vehicleApi';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { RestockModal } from './RestockModal';
import { Navbar } from '../ui/Navbar';

const INITIAL_FORM_STATE = { make: '', model: '', category: '', price: '', quantity_in_stock: 0, image_url: '' };

export const AdminInventoryPanel = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restockVehicle, setRestockVehicle] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM_STATE);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehicleApi.getVehicles();
      setVehicles(response.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleDelete = async (id) => {
    await vehicleApi.deleteVehicle(id);
    fetchVehicles();
  };

  const handleRestock = async (vehicleId, quantity) => {
    await vehicleApi.restockVehicle(vehicleId, quantity);
    setRestockVehicle(null);
    fetchVehicles();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await vehicleApi.createVehicle({ ...form, price: Number(form.price), quantity_in_stock: Number(form.quantity_in_stock) });
    setIsModalOpen(false);
    setForm(INITIAL_FORM_STATE);
    fetchVehicles();
  };

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const thStyle = {
    padding: '16px 20px', textAlign: 'left',
    fontSize: '12px', fontWeight: 600, color: '#94a3b8',
    borderBottom: '2px solid #334155',
  };
  const tdStyle = {
    padding: '16px 20px', fontSize: '14px', color: '#f8fafc',
    borderBottom: '1px solid #1e293b',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: "'Montserrat', sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#f8fafc' }}>
              Fleet Operations
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
              Manage vehicle inventory and allocations
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>Add New Asset</Button>
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center', padding: '100px 0',
            fontSize: '14px', fontWeight: 600, color: '#94a3b8',
          }}>
            Loading records...
          </div>
        ) : (
          <div style={{ 
            background: '#1e293b', border: '1px solid #334155', 
            borderRadius: '12px', overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: '#0f172a' }}>
                    {['Make', 'Model', 'Category', 'Value', 'Stock', 'Actions'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map(v => (
                    <tr key={v.id} style={{ transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#334155'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={tdStyle}>{v.make}</td>
                      <td style={tdStyle}><strong>{v.model}</strong></td>
                      <td style={tdStyle}>{v.category}</td>
                      <td style={tdStyle}>${Number(v.price).toLocaleString()}</td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block', padding: '4px 10px', borderRadius: '20px',
                          background: v.quantity_in_stock > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: v.quantity_in_stock > 0 ? '#10b981' : '#ef4444',
                          fontSize: '12px', fontWeight: 600
                        }}>
                          {v.quantity_in_stock}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, display: 'flex', gap: '8px' }}>
                        <Button variant="secondary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => setRestockVehicle(v)}>Stock</Button>
                        <Button variant="danger" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => handleDelete(v.id)}>Remove</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Asset">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input id="add-make" label="Manufacturer" value={form.make} onChange={handleChange('make')} required />
          <Input id="add-model" label="Model Designation" value={form.model} onChange={handleChange('model')} required />
          <Input id="add-category" label="Class" value={form.category} onChange={handleChange('category')} required />
          <Input id="add-price" label="Market Value" type="number" value={form.price} onChange={handleChange('price')} required />
          <Input id="add-stock" label="Initial Allocation" type="number" value={form.quantity_in_stock} onChange={handleChange('quantity_in_stock')} />
          <Input id="add-image" label="Image URL" type="url" placeholder="https://..." value={form.image_url} onChange={handleChange('image_url')} />
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Commit Record</Button>
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
