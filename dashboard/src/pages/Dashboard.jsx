import React, { useState, useEffect } from 'react';
import { MdPeople, MdDashboard, MdLogout, MdArrowBack, MdInventory } from 'react-icons/md';
import ClientManagement from '../components/ClientManagement';
import ClientProfile from '../components/ClientProfile';
import ClientEdit from '../components/ClientEdit';
import './Dashboard.css';
import FoodManagement from '../components/FoodManagement';
const Dashboard = ({ onSignOut }) => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('clients'); // 'clients', 'create-client', 'view-client', 'edit-client', 'foods', 'create-food'
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientStats, setClientStats] = useState({
    totalClients: 0,
    newThisMonth: 0,
    paidSubscriptions: 0
  });

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Fetch client statistics
    fetchClientStats();
  }, []);

  const fetchClientStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/clients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const clients = data.clients || [];
        
        // Calculate stats
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const newThisMonth = clients.filter(client => 
          new Date(client.created_at) >= thisMonth
        ).length;
        
        const paidSubscriptions = clients.filter(client => 
          (client.subscription_type || 'paid') === 'paid'
        ).length;
        
        setClientStats({
          totalClients: clients.length,
          newThisMonth,
          paidSubscriptions
        });
      }
    } catch (error) {
      console.error('Error fetching client stats:', error);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onSignOut();
  };

  const handleCreateClient = () => {
    setCurrentView('create-client');
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setCurrentView('view-client');
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setCurrentView('edit-client');
  };

  const handleBackToClients = () => {
    setCurrentView('clients');
    setSelectedClient(null);
    fetchClientStats(); // Refresh stats when returning to clients list
  };

  const handleBackToProfile = () => {
    setCurrentView('view-client');
  };

  const handleClientUpdated = (updatedClient) => {
    setSelectedClient(updatedClient);
    fetchClientStats(); // Refresh stats after update
  };

  // Items handlers
  const handleFoodsNavigation = () => {
    setCurrentView('foods');
  };

  const handleCreateFood = () => {
    setCurrentView('create-food');
  };

  const handleBackToFoods = () => {
    setCurrentView('foods');
  };
  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'create-client':
        return (
          <div className="create-client-page">
            <div className="page-header">
              <button className="back-button" onClick={handleBackToClients}>
                <MdArrowBack className="back-icon" />
                Back to Clients
              </button>
              <h1 className="page-title">Create New Client Account</h1>
            </div>
            
            <div className="create-client-form">
              <ClientManagement 
                onStatsUpdate={fetchClientStats} 
                viewMode="create"
                onBack={handleBackToClients}
              />
            </div>
          </div>
        );
      
      case 'view-client':
        return (
          <ClientProfile
            clientId={selectedClient.id}
            onBack={handleBackToClients}
            onEdit={handleEditClient}
          />
        );
      
      case 'edit-client':
        return (
          <ClientEdit
            client={selectedClient}
            onBack={handleBackToProfile}
            onSave={handleClientUpdated}
          />
        );
      
      case 'foods':
        return (
          <FoodManagement 
            onCreateFood={handleCreateFood}
            viewMode="list"
          />
        );

      case 'create-food':
        return (
          <div className="create-client-page">
            <div className="page-header">
              <button className="back-button" onClick={handleBackToFoods}>
                <MdArrowBack className="back-icon" />
                Back to Foods
              </button>
              <h1 className="page-title">Create New Food</h1>
            </div>
            
            <div className="create-client-form">
              <div className="empty-state">
                <p>Food creation form will be implemented here.</p>
              </div>
            </div>
          </div>
        );
      default: // 'clients'
        return (
          <ClientManagement 
            onStatsUpdate={fetchClientStats} 
            onCreateClient={handleCreateClient}
            onViewClient={handleViewClient}
            onEditClient={handleEditClient}
            viewMode="list"
          />
        );
    }
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'create-client':
        return 'Create New Client';
      case 'view-client':
        return selectedClient ? `${selectedClient.name} - Profile` : 'Client Profile';
      case 'edit-client':
        return selectedClient ? `Edit ${selectedClient.name}` : 'Edit Client';
      case 'foods':
        return 'Food Management';
      case 'create-food':
        return 'Create New Food';      default:
        return currentView.includes('food') ? 'Food Management' : 'Client Management';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🍎</span>
            <span className="logo-text">NutritionCare</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className={`nav-item ${currentView.includes('client') ? 'active' : ''}`} onClick={() => setCurrentView('clients')}>
            <MdPeople className="nav-icon" />
            <span>Client Management</span>
          </div>
          <div className={`nav-item ${currentView.includes('food') ? 'active' : ''}`} onClick={handleFoodsNavigation}>
            <MdInventory className="nav-icon" />
            <span>Food Management</span>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-role">Dietitian</div>
            </div>
          </div>
          <button className="sign-out-btn" onClick={handleSignOut}>
            <MdLogout className="logout-icon" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 