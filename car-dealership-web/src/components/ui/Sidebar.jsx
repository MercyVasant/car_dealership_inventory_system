import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, ShieldAlert } from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        {user?.role === 'ADMIN' && (
          <>
            <NavLink 
              to="/admin" 
              className={({ isActive }) => (isActive && window.location.pathname === '/admin' ? 'nav-item active' : 'nav-item')}
            >
              <ShieldAlert size={20} />
              <span>Admin Panel</span>
            </NavLink>
            <NavLink 
              to="/admin/transactions" 
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <ShieldAlert size={20} />
              <span>Transactions</span>
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};
