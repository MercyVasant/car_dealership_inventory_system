import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const RestockModal = ({ isOpen, onClose, vehicle, onConfirm }) => {
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuantity('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quantity && Number(quantity) > 0) {
      onConfirm(vehicle.id, Number(quantity));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Restock ${vehicle?.make} ${vehicle?.model}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">Enter the number of vehicles you would like to restock.</p>
        <Input 
          id="restock-quantity" 
          label="Quantity" 
          type="number" 
          min="1"
          value={quantity} 
          onChange={(e) => setQuantity(e.target.value)} 
          required 
        />
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">Confirm Restock</Button>
        </div>
      </form>
    </Modal>
  );
};
