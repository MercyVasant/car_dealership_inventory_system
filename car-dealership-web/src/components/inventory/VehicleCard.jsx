import { useState } from 'react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { DealCalculator } from '../ui/DealCalculator';
import { DealAgreement } from '../ui/DealAgreement';

const statusBadge = (quantity, inStock) => {
  const label = inStock ? 'Available' : 'Sold Out';
  const color = inStock ? '#10b981' : '#ef4444';
  const bg = inStock ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)';
  return (
    <span style={{
      display: 'inline-block', padding: '6px 12px',
      fontSize: '11px', fontWeight: 700,
      color, background: bg, borderRadius: '20px',
    }}>
      {label}
    </span>
  );
};

export const VehicleCard = ({ vehicle, onPurchase }) => {
  const { id, make, model, category, price, quantity_in_stock, image_url, year } = vehicle;
  const [showCalculator, setShowCalculator] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  const getFallbackImage = (brand) => {
    const b = brand?.toLowerCase();
    const brandImages = {
      'porsche': '/images/porsche.png',
      'bmw': '/images/bmw.png',
      'lamborghini': 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=800&q=80',
      'rolls-royce': 'https://images.unsplash.com/photo-1503376760367-15ea62194a28?w=800&q=80',
      'bentley': 'https://images.unsplash.com/photo-1580274455191-1c62238fa1c7?w=800&q=80',
      'ferrari': 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&q=80',
      'mclaren': 'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=800&q=80',
      'aston martin': 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80',
      'audi': 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80',
      'mercedes': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
      'toyota': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
      'honda': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
      'ford': 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&q=80',
      'chevrolet': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
      'tesla': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80'
    };
    return brandImages[b] || '/images/car_default.png';
  };

  const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  const inStock = quantity_in_stock > 0;

  return (
    <div style={{
      background: '#1e293b', border: '1px solid #334155',
      borderRadius: '16px', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'box-shadow 0.3s, border-color 0.3s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#475569';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#334155';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Image Header */}
      <div style={{ position: 'relative', height: '220px', background: '#334155' }}>
        <img
          src={image_url || getFallbackImage(make)}
          alt={`${make} ${model}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => {
            if (!e.target.dataset.failed) {
              e.target.dataset.failed = true;
              e.target.src = getFallbackImage(make);
            } else {
              e.target.onerror = null;
              e.target.src = '/images/car_default.png';
            }
          }}
        />
        <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
          {statusBadge(quantity_in_stock, inStock)}
        </div>
        {year && (
          <div style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'rgba(15, 23, 42, 0.8)', color: '#f8fafc',
            padding: '6px 12px', fontSize: '12px', fontWeight: 600,
            borderRadius: '6px', backdropFilter: 'blur(4px)'
          }}>
            {year}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{
          fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em',
          textTransform: 'uppercase', color: '#d4af37', marginBottom: '8px',
        }}>
          {make} • {category}
        </p>
        <h3 style={{
          fontSize: '22px', fontWeight: 700, color: '#f8fafc', marginBottom: '12px',
        }}>
          {model}
        </h3>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #334155',
        }}>
          <div>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Value</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc' }}>{formattedPrice}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Inventory</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#cbd5e1' }}>{quantity_in_stock} Units</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Button
          variant={inStock ? 'primary' : 'secondary'}
          style={{ width: '100%', padding: '14px', border: 'none' }}
          onClick={() => setShowCalculator(true)}
          disabled={!inStock}
        >
          {inStock ? 'Calculate Deal & Purchase' : 'Currently Unavailable'}
        </Button>
      </div>

      <Modal isOpen={showCalculator} onClose={() => setShowCalculator(false)} title="Deal Calculator">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <DealCalculator 
            initialPrice={price} 
            onProceed={(payment) => {
              setMonthlyPayment(payment);
              setShowCalculator(false);
              setShowAgreement(true);
            }} 
          />
        </div>
      </Modal>

      <Modal isOpen={showAgreement} onClose={() => setShowAgreement(false)} title="Deal Agreement">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <DealAgreement 
            monthlyPayment={monthlyPayment} 
            onCancel={() => setShowAgreement(false)}
            onAccept={() => {
              setShowAgreement(false);
              onPurchase(id);
            }} 
          />
        </div>
      </Modal>
    </div>
  );
};
