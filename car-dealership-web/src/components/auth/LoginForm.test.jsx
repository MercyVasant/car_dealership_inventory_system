import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { AuthContext } from '../../context/AuthContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('LoginForm', () => {
  it('should render login form', () => {
    render(
      <AuthContext.Provider value={{ login: vi.fn() }}>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should call login and navigate on successful submission', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ role: 'USER' });
    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display error message on failed login', async () => {
    const mockLogin = vi.fn().mockRejectedValue({ response: { data: { error: 'Invalid credentials' } } });
    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
    });
  });
});
