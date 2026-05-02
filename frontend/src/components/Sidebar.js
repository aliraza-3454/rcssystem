import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
  { icon: '🏠', label: 'Dashboard', path: '/student/dashboard' },
  { icon: '📝', label: 'Submit Topic', path: '/student/submit-topic' },
  { icon: '💡', label: 'Topic Suggestions', path: '/student/suggestions' },
  { icon: '📋', label: 'My Topics', path: '/student/my-topics' },
];

const supervisorLinks = [
  { icon: '🏠', label: 'Dashboard', path: '/supervisor/dashboard' },
  { icon: '🔍', label: 'Review Topics', path: '/supervisor/review-topics' },
];

const adminLinks = [
  { icon: '🏠', label: 'Dashboard', path: '/admin/dashboard' },
  { icon: '👥', label: 'Manage Users', path: '/admin/users' },
  { icon: '📊', label: 'All Topics', path: '/admin/topics' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = user?.role === 'student' ? studentLinks : user?.role === 'supervisor' ? supervisorLinks : adminLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🔬</div>
          <div className="sidebar-logo-text">
            <h2>RCS Portal</h2>
            <span>PMAS-UAAR</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Navigation</div>
          {links.map((link) => (
            <button
              key={link.path}
              className={`nav-item ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => navigate(link.path)}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role}</div>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">⏻</button>
      </div>
    </aside>
  );
};

export default Sidebar;
