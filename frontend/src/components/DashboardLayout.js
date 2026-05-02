import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ title, children }) {
  const { user } = useAuth();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="top-navbar">
          <h2 className="page-title">{title}</h2>
          <div className="navbar-actions">
            <button className="notification-btn">
              <i className="fas fa-bell"></i>
              <span className="notification-badge">3</span>
            </button>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #1a1f5e, #2d3494)',
              color: 'white', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem'
            }}>
              {initials}
            </div>
          </div>
        </div>
        <div className="content-area fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}
