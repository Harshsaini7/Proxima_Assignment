import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiUsers, FiUserCheck, FiDollarSign, FiBarChart2, FiActivity, FiLogOut } from 'react-icons/fi';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>CRM Dashboard</h2>
          <div className="user-info">
            <p className="user-name">{user?.name}</p>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
            <FiHome /> <span>Dashboard</span>
          </Link>
          <Link to="/leads" className={`nav-item ${isActive('/leads')}`}>
            <FiUsers /> <span>Leads</span>
          </Link>
          <Link to="/contacts" className={`nav-item ${isActive('/contacts')}`}>
            <FiUserCheck /> <span>Contacts</span>
          </Link>
          <Link to="/deals" className={`nav-item ${isActive('/deals')}`}>
            <FiDollarSign /> <span>Deals</span>
          </Link>
          <Link to="/reports" className={`nav-item ${isActive('/reports')}`}>
            <FiBarChart2 /> <span>Reports</span>
          </Link>
          <Link to="/activity-logs" className={`nav-item ${isActive('/activity-logs')}`}>
            <FiActivity /> <span>Activity Logs</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut /> <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
