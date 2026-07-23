import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <div className="auth-layout">
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-container">
        <Sidebar />
        <main className="content">{children}</main>
      </div>
    </div>
  );
};
