import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Navbar } from '../ui/Navbar';

export const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: "'Montserrat', sans-serif" }}>
      <Navbar />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 72px)',
      }}>
        <div style={{
          background: '#1e293b', border: '1px solid #334155',
          width: '100%', maxWidth: '460px', margin: '24px 16px',
          padding: '40px', borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '28px', fontWeight: 700, color: '#f8fafc',
              marginBottom: '8px',
            }}>
              Welcome Back
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#d4af37', fontWeight: 600, textDecoration: 'none' }}>
                Sign up
              </Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div role="alert" style={{
              marginBottom: '24px', padding: '12px 16px', borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', fontSize: '14px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>{error}</span>
              <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '18px' }}>×</button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Input
              id="login-email"
              type="email"
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <Input
              id="login-password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading} style={{ width: '100%', marginTop: '12px', padding: '14px' }}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
