import React from 'react';
import { Button } from '../ui/Button';

export const VehicleCard = ({ vehicle, onPurchase }) => {
  const { id, make, model, category, price, quantity_in_stock } = vehicle;
  const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  const inStock = quantity_in_stock > 0;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{make} {model}</h3>
            <p className="text-sm text-gray-500 mt-1">{category}</p>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {formattedPrice}
          </span>
        </div>
        <div className="mt-4">
          <span className={`text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>
            {inStock ? `In Stock: ${quantity_in_stock}` : 'Out of Stock'}
          </span>
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <Button
          variant={inStock ? 'primary' : 'secondary'}
          className="w-full"
          disabled={!inStock}
          onClick={() => onPurchase(id)}
        >
          Purchase
        </Button>
      </div>
    </div>
  );
};
