import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';

export const DealCalculator = ({ initialPrice = 147100, onProceed }) => {
  const [price, setPrice] = useState(initialPrice);
  const [downPayment, setDownPayment] = useState(initialPrice * 0.1);
  const [tradeIn, setTradeIn] = useState(0);
  const [term, setTerm] = useState(60);
  const [rate, setRate] = useState(4.99);
  const [monthlyPayment, setMonthlyPayment] = useState(null);

  const calculateDeal = (e) => {
    if (e) e.preventDefault();
    const principal = Number(price) - Number(downPayment) - Number(tradeIn);
    if (principal <= 0) {
      setMonthlyPayment(0);
      return;
    }

    const n = Number(term);
    const r = Number(rate) / 100 / 12;

    let payment = 0;
    if (r === 0) {
      payment = principal / n;
    } else {
      payment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    setMonthlyPayment(payment);
  };

  return (
    <div style={{
      background: '#111', color: '#fff', padding: '32px', borderRadius: '16px',
      fontFamily: "'Inter', sans-serif", width: '100%', maxWidth: '400px'
    }}>
      <h2 style={{ fontSize: '24px', fontWeight: '400', marginBottom: '24px', fontFamily: "'Playfair Display', serif" }}>
        Deal <span style={{ fontWeight: '700' }}>Calculator</span>
      </h2>

      <form onSubmit={calculateDeal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input 
          label="VEHICLE PRICE" 
          type="number" 
          value={price} 
          onChange={e => setPrice(e.target.value)} 
          style={{ background: '#000', border: '1px solid #333' }}
        />
        
        <Input 
          label="DOWN PAYMENT" 
          type="number" 
          value={downPayment} 
          onChange={e => setDownPayment(e.target.value)} 
          style={{ background: '#000', border: '1px solid #333' }}
        />
        
        <Input 
          label="TRADE-IN VALUE" 
          type="number" 
          value={tradeIn} 
          onChange={e => setTradeIn(e.target.value)} 
          style={{ background: '#000', border: '1px solid #333' }}
        />
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#999', marginBottom: '8px', textTransform: 'uppercase' }}>Term (Months)</label>
            <select 
              value={term} 
              onChange={e => setTerm(e.target.value)}
              style={{
                background: '#000', color: '#fff', padding: '12px', borderRadius: '6px', 
                border: '1px solid #333', fontSize: '14px', outline: 'none'
              }}
            >
              <option value={36}>36 Months</option>
              <option value={48}>48 Months</option>
              <option value={60}>60 Months</option>
              <option value={72}>72 Months</option>
            </select>
          </div>
          
          <div style={{ flex: 1 }}>
            <Input 
              label="RATE (%)" 
              type="number" 
              step="0.01" 
              value={rate} 
              onChange={e => setRate(e.target.value)} 
              style={{ background: '#000', border: '1px solid #333' }}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          style={{ 
            background: '#fff', color: '#000', padding: '16px', fontWeight: 'bold', 
            textTransform: 'uppercase', marginTop: '16px', borderRadius: '4px' 
          }}
        >
          CALCULATE DEAL
        </Button>
      </form>

      {monthlyPayment !== null && (
        <div style={{ 
          marginTop: '24px', padding: '20px', background: '#222', borderRadius: '8px', 
          textAlign: 'center', border: '1px solid #333' 
        }}>
          <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Estimated Monthly Payment
          </p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>
            ${monthlyPayment.toFixed(2)}
          </p>
          <Button 
            onClick={() => onProceed && onProceed(monthlyPayment)}
            style={{ 
              width: '100%', background: '#10b981', color: '#fff', padding: '12px', 
              fontWeight: 'bold', textTransform: 'uppercase', borderRadius: '4px',
              border: 'none'
            }}
          >
            Proceed to Agreement
          </Button>
        </div>
      )}
    </div>
  );
};
