import { Button } from './Button';

export const DealAgreement = ({ monthlyPayment, onAccept, onCancel }) => {
  return (
    <div style={{
      background: '#111', color: '#fff', padding: '32px', borderRadius: '16px',
      fontFamily: "'Inter', sans-serif", width: '100%', maxWidth: '400px'
    }}>
      <h2 style={{ fontSize: '24px', fontWeight: '400', marginBottom: '24px', fontFamily: "'Playfair Display', serif" }}>
        Deal <span style={{ fontWeight: '700' }}>Agreement</span>
      </h2>

      <div style={{ background: '#000', border: '1px solid #333', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#ccc' }}>
          By accepting this agreement, you commit to the purchase of this vehicle at the calculated estimated monthly payment of 
          <strong style={{ color: '#fff', fontSize: '16px' }}> ${monthlyPayment?.toFixed(2) || '0.00'}</strong>.
        </p>
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#ccc', marginTop: '16px' }}>
          This action is final and will remove the vehicle from our active inventory.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <Button 
          variant="secondary"
          onClick={onCancel}
          style={{ flex: 1, padding: '14px', background: 'transparent', border: '1px solid #475569' }}
        >
          CANCEL
        </Button>
        <Button 
          onClick={onAccept}
          style={{ flex: 1, padding: '14px', background: '#fff', color: '#000', fontWeight: 'bold' }}
        >
          ACCEPT & PURCHASE
        </Button>
      </div>
    </div>
  );
};
