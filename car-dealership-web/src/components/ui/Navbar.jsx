import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#0f172a', borderBottom: '1px solid #1e293b',
      fontFamily: "'Montserrat', sans-serif",
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: '72px',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          fontWeight: 700, fontSize: '20px',
          letterSpacing: '0.05em', color: '#d4af37',
          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <div style={{ width: '24px', height: '24px', background: '#d4af37', borderRadius: '4px' }}></div>
          PRESTIGE MOTORS
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {user && (
            <>
              <Link to="/dashboard" style={{
                color: '#cbd5e1', fontSize: '13px', fontWeight: 600,
                textDecoration: 'none', transition: 'color 0.2s'
              }}>Dashboard</Link>
              {user.role === 'ADMIN' && (
                <>
                  <Link to="/admin" style={{
                    color: '#cbd5e1', fontSize: '13px', fontWeight: 600,
                    textDecoration: 'none', transition: 'color 0.2s'
                  }}>Admin</Link>
                  <Link to="/admin/transactions" style={{
                    color: '#cbd5e1', fontSize: '13px', fontWeight: 600,
                    textDecoration: 'none', transition: 'color 0.2s'
                  }}>Transactions</Link>
                </>
              )}
            </>
          )}

          {/* Divider + email */}
          {user && (
            <>
              <span style={{ color: '#334155', fontSize: '14px' }}>|</span>
              <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>{user.email || user.username}</span>
            </>
          )}

          {/* Auth buttons */}
          {!user ? (
            <>
              <Link to="/login" style={{
                color: '#cbd5e1', fontSize: '13px', fontWeight: 600,
                textDecoration: 'none', transition: 'color 0.2s'
              }}>Log In</Link>
              <Link to="/register" style={{
                display: 'inline-block',
                background: '#d4af37', color: '#0f172a',
                padding: '10px 20px', borderRadius: '6px',
                fontSize: '13px', fontWeight: 600,
                textDecoration: 'none', cursor: 'pointer',
                transition: 'background 0.2s'
              }}>Sign Up</Link>
            </>
          ) : (
            <button onClick={handleLogout} style={{
              background: 'transparent', border: '1px solid #d4af37', color: '#d4af37',
              padding: '8px 16px', borderRadius: '6px',
              fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s'
            }}>Logout</button>
          )}
        </div>
      </div>
    </nav>
  );
};
