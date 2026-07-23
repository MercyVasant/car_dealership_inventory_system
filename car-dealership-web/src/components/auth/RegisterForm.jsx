import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Create Account</h1>
      {error && (
        <div role="alert" className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="username" type="text" label="Username" placeholder="johndoe"
          value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isLoading} />
        <Input id="email" type="email" label="Email" placeholder="john@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
        <Input id="password" type="password" label="Password" placeholder="••••••••"
          value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
        <Button type="submit" className="w-full mt-2" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Register'}
        </Button>
      </form>
      <p className="mt-4 text-sm text-center text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 hover:underline">Login</Link>
      </p>
    </div>
  );
};
