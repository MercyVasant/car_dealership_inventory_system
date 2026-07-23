export const Button = ({ children, variant = 'primary', className = '', type = 'button', disabled = false, onClick, ...props }) => {
  const styles = {
    primary: {
      background: '#d4af37', color: '#0f172a', border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    },
    secondary: {
      background: '#1e293b', color: '#f8fafc', border: '1px solid #334155',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    },
    danger: {
      background: 'transparent', color: '#ef4444', border: '1px solid #ef4444',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    },
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '10px 24px', fontSize: '14px', fontWeight: 600,
        borderRadius: '8px',
        fontFamily: "'Montserrat', sans-serif",
        transition: 'all 0.2s ease',
        ...styles[variant] || styles.primary,
      }}
      {...props}
    >
      {children}
    </button>
  );
};
