import { Link } from 'react-router-dom';
import { Navbar } from '../ui/Navbar';
import { Button } from '../ui/Button';

const featured = [
  { make: 'Porsche', model: '911 GT3 RS', category: 'Coupe', price: '$241,300' },
  { make: 'Lamborghini', model: 'Urus Performante', category: 'SUV', price: '$269,885' },
  { make: 'Rolls-Royce', model: 'Spectre', category: 'Grand Tourer', price: '$413,000' },
  { make: 'Bentley', model: 'Continental GT', category: 'Coupe', price: '$224,900' },
];

export const LandingPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: "'Montserrat', sans-serif" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 24px 80px' }}>
        <div style={{
          display: 'inline-block', padding: '6px 16px', background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '20px',
          color: '#d4af37', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.1em', marginBottom: '32px',
        }}>
          Experience Unmatched Luxury
        </div>
        <h1 style={{
          fontSize: 'clamp(44px, 8vw, 72px)', fontWeight: 800,
          lineHeight: 1.1, color: '#f8fafc', marginBottom: '24px',
          letterSpacing: '-0.02em'
        }}>
          Drive <span style={{ color: '#d4af37' }}>Excellence</span>.
        </h1>
        <p style={{
          maxWidth: '540px', margin: '0 auto 48px',
          fontSize: '16px', color: '#cbd5e1', lineHeight: 1.6,
        }}>
          Curated inventory for the world's most discerning drivers. We source the finest vehicles, delivering unparalleled service and exclusivity.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <Button style={{ padding: '14px 32px', fontSize: '15px' }}>Explore Collection</Button>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" style={{ padding: '14px 32px', fontSize: '15px' }}>Become a Member</Button>
          </Link>
        </div>
      </section>

      {/* Fleet preview grid */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px',
        }}>
          {featured.map((v) => (
            <div key={`${v.make}-${v.model}`} style={{
              background: '#1e293b', border: '1px solid #334155',
              borderRadius: '16px', overflow: 'hidden',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s', cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '100%', height: '220px',
                background: '#334155', position: 'relative',
              }}>
                <img 
                  src={
                    v.make === 'Porsche' ? '/images/porsche.png' :
                    v.make === 'Lamborghini' ? '/images/bmw.png' :
                    v.make === 'Rolls-Royce' ? '/images/bmw_m3.png' :
                    '/images/bmw_m4.png'
                  }
                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/car_default.png'; }}
                  alt={`${v.make} ${v.model}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ 
                  position: 'absolute', inset: 0, 
                  background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 60%)',
                  display: 'flex', alignItems: 'flex-end', padding: '24px' 
                }}>
                  <div>
                    <p style={{
                      fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em',
                      textTransform: 'uppercase', color: '#d4af37', marginBottom: '8px',
                    }}>
                      {v.make} • {v.category}
                    </p>
                    <h3 style={{
                      fontSize: '24px', fontWeight: 700, color: '#f8fafc',
                    }}>
                      {v.model}
                    </h3>
                  </div>
                </div>
              </div>
              <div style={{
                borderTop: '1px solid #334155', padding: '20px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>Market Value</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc' }}>{v.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};