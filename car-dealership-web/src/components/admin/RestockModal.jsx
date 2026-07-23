/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const RestockModal = ({ isOpen, onClose, vehicle, onConfirm }) => {
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    if (isOpen) setQuantity('');
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quantity && Number(quantity) > 0) {
      onConfirm(vehicle.id, Number(quantity));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Allocate ${vehicle?.make} ${vehicle?.model}`}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p style={{ fontSize: '14px', color: '#94a3b8' }}>Please specify the number of units to allocate to this vehicle's inventory.</p>
        <Input
          id="restock-quantity"
          label="Unit Quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">Confirm Allocation</Button>
        </div>
      </form>
    </Modal>
  );
};
