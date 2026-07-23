import { useEffect } from 'react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(4px)',
      }} />
      {/* Panel */}
      <div style={{
        position: 'relative', background: '#1e293b',
        border: '1px solid #334155', width: '100%', maxWidth: '500px',
        margin: '16px', padding: '32px', borderRadius: '12px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 id="modal-title" style={{
            fontSize: '18px', fontWeight: 600, color: '#f8fafc', margin: 0,
          }}>{title}</h2>
          <button onClick={onClose} aria-label="Close" style={{
            background: 'none', border: 'none', color: '#94a3b8',
            fontSize: '24px', cursor: 'pointer', lineHeight: 1, padding: '4px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.target.style.color = '#f8fafc'}
          onMouseLeave={e => e.target.style.color = '#94a3b8'}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  );
};
