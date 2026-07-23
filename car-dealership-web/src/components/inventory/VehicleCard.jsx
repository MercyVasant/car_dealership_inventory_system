import React from 'react';
import { Button } from '../ui/Button';
import heroImage from '../../assets/hero.png';

export const VehicleCard = ({ vehicle, onPurchase }) => {
  const { id, make, model, category, price, quantity_in_stock, image_url } = vehicle;
  const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  const inStock = quantity_in_stock > 0;
  const imageSource = image_url || heroImage;

  return (
    <div className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/60 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-300/70">
      <div className="relative h-56 overflow-hidden">
        <img src={imageSource} alt={`${make} ${model}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
          Showroom
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-slate-950">{make} {model}</h3>
          <p className="mt-1 text-sm text-slate-500">{category}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {inStock ? `In Stock: ${quantity_in_stock}` : 'Out of Stock'}
          </span>
          <span className="text-sm font-semibold text-slate-500">{formattedPrice}</span>
        </div>
      </div>
      <div className="border-t border-slate-100 bg-slate-50 p-4">
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
