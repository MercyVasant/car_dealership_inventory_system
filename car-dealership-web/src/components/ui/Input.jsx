import { forwardRef } from 'react';

export const Input = forwardRef(({ className = '', type = 'text', error, label, id, disabled, style: customStyle, ...props }, ref) => {
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label htmlFor={id} style={{
          display: 'block', marginBottom: '6px',
          fontSize: '13px', fontWeight: 500,
          color: '#cbd5e1',
        }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        disabled={disabled}
        className={className}
        {...props}
        style={{
          display: 'block', width: '100%',
          background: '#1e293b', color: '#f8fafc',
          border: `1px solid ${error ? '#ef4444' : '#334155'}`,
          padding: '12px 16px', fontSize: '15px',
          fontFamily: "'Montserrat', sans-serif",
          borderRadius: '8px',
          outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
          ...(customStyle || {})
        }}
        onFocus={e => { e.target.style.borderColor = '#d4af37'; }}
        onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : '#334155'; }}
      />
      {error && <p style={{ marginTop: '6px', fontSize: '13px', color: '#ef4444' }}>{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
