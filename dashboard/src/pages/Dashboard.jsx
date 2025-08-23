import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ onSignOut }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalClients: 24,
    activeClients: 18,
    pendingReports: 5,
    monthlyRevenue: 3200
  });

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onSignOut();
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="logo">🍎 NutritionCare</h1>
            <p className="welcome-text">Welcome back, {user.name}!</p>
          </div>
          <div className="header-right">
            <button className="btn-secondary" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.totalClients}</h3>
              <p className="stat-label">Total Clients</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.activeClients}</h3>
              <p className="stat-label">Active Clients</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3 className="stat-number">{stats.pendingReports}</h3>
              <p className="stat-label">Pending Reports</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3 className="stat-number">${stats.monthlyRevenue}</h3>
              <p className="stat-label">Monthly Revenue</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="content-section">
            <h2 className="section-title">Recent Clients</h2>
            <div className="clients-list">
              <div className="client-item">
                <div className="client-avatar">👤</div>
                <div className="client-info">
                  <h4 className="client-name">Sarah Johnson</h4>
                  <p className="client-status">Active - Weight Loss Program</p>
                </div>
                <div className="client-actions">
                  <button className="btn-small">View</button>
                </div>
              </div>
              
              <div className="client-item">
                <div className="client-avatar">👤</div>
                <div className="client-info">
                  <h4 className="client-name">Mike Chen</h4>
                  <p className="client-status">Active - Muscle Building</p>
                </div>
                <div className="client-actions">
                  <button className="btn-small">View</button>
                </div>
              </div>
              
              <div className="client-item">
                <div className="client-avatar">👤</div>
                <div className="client-info">
                  <h4 className="client-name">Emily Davis</h4>
                  <p className="client-status">Pending - Initial Consultation</p>
                </div>
                <div className="client-actions">
                  <button className="btn-small">Review</button>
                </div>
              </div>
            </div>
          </div>

          <div className="content-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-button">
                <span className="action-icon">➕</span>
                <span className="action-text">Add New Client</span>
              </button>
              
              <button className="action-button">
                <span className="action-icon">📊</span>
                <span className="action-text">Generate Reports</span>
              </button>
              
              <button className="action-button">
                <span className="action-icon">📅</span>
                <span className="action-text">Schedule Consultation</span>
              </button>
              
              <button className="action-button">
                <span className="action-icon">📝</span>
                <span className="action-text">Create Meal Plan</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 