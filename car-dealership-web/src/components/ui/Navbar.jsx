import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Car } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Car className="brand-icon" />
        <Link to="/">Velocity Auto</Link>
      </div>
      <div className="nav-user">
        {user && (
          <>
            <span className="user-greeting">Welcome, {user.username}</span>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
