import React, { useState, useEffect } from 'react';
import { MdPeople, MdDashboard, MdLogout, MdArrowBack, MdInventory, MdChat, MdCheckCircle, MdMenu, MdMenuOpen, MdTrendingUp, MdRestaurant } from 'react-icons/md';
import ClientManagement from '../components/ClientManagement';
import ClientProfile from '../components/ClientProfile';
import ClientEdit from '../components/ClientEdit';
import ClientProgress from '../components/ClientProgress';
import FoodManagement from '../components/FoodManagement';
import FoodProfile from '../components/FoodProfile';
import FoodEdit from '../components/FoodEdit';
import FoodApprovals from '../components/FoodApprovals';
import Chat from '../components/Chat';
import './Dashboard.css';

const Dashboard = ({ onSignOut }) => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('clients');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [clientStats, setClientStats] = useState({
    totalClients: 0,
    newThisMonth: 0,
    paidSubscriptions: 0
  });
  const [pendingFoodsCount, setPendingFoodsCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchClientStats();
    fetchPendingFoodsCount();
    
    // Poll for pending foods every 30 seconds
    const interval = setInterval(fetchPendingFoodsCount, 30000);
    return () => clearInterval(interval);
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

  const fetchPendingFoodsCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'}/pending-foods`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPendingFoodsCount(data.pending_foods?.length || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching pending foods count:', error);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onSignOut();
  };

  const handleCreateClient = () => {
    setCurrentView('create-client');
    setSidebarCollapsed(true); // Auto-collapse sidebar for form
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setCurrentView('view-client');
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setCurrentView('edit-client');
    setSidebarCollapsed(true); // Auto-collapse sidebar for edit form
  };

  const handleViewProgress = (client) => {
    setSelectedClient(client);
    setCurrentView('client-progress');
    setSidebarCollapsed(false); // Keep sidebar visible for progress page
  };

  const handleProgressNavigation = () => {
    setCurrentView('progress-list');
    setSelectedClient(null);
  };

  const handleBackToClients = () => {
    setCurrentView('clients');
    setSelectedClient(null);
    setSidebarCollapsed(false); // Expand sidebar when going back
    fetchClientStats();
  };

  const handleBackToProfile = () => {
    setCurrentView('view-client');
    setSidebarCollapsed(false); // Expand sidebar when going back to profile
  };

  const handleClientUpdated = (updatedClient) => {
    setSelectedClient(updatedClient);
    fetchClientStats();
  };

  const handleFoodsNavigation = () => {
    setCurrentView('foods');
  };

  const handleClientsNavigation = () => {
    setCurrentView('clients');
  };

  const handleChatNavigation = () => {
    setCurrentView('chat');
  };

  const handleCreateFood = () => {
    setCurrentView('create-food');
  };

  const handleViewFood = (food) => {
    console.log('🍎 handleViewFood called with:', food);
    setSelectedFood(food);
    setCurrentView('view-food');
    console.log('🍎 Current view set to:', 'view-food');
    console.log('🍎 Selected food set to:', food);
  };

  const handleEditFood = (food) => {
    console.log('🍎 handleEditFood called with:', food);
    setSelectedFood(food);
    setCurrentView('edit-food');
  };

  const handleBackToFoods = () => {
    setCurrentView('foods');
    setSelectedFood(null);
  };

  const handleBackToFoodProfile = () => {
    setCurrentView('view-food');
  };

  const handleFoodUpdated = (updatedFood) => {
    setSelectedFood(updatedFood);
    fetchClientStats();
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  console.log('🍎 Dashboard render - currentView:', currentView);
  console.log('🍎 Dashboard render - selectedFood:', selectedFood);

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
            onViewFood={handleViewFood}
            onEditFood={handleEditFood}
            viewMode="list"
          />
        );

      case 'create-food':
        return (
          <FoodManagement 
            onStatsUpdate={fetchClientStats} 
            viewMode="create"
            onBack={handleBackToFoods}
          />
        );

      case 'view-food':
        console.log('🍎 Rendering FoodProfile with foodId:', selectedFood?.id);
        return (
          <FoodProfile
            foodId={selectedFood?.id}
            onBack={handleBackToFoods}
            onEdit={handleEditFood}
          />
        );

      case 'edit-food':
        console.log('🍎 Rendering FoodEdit with food:', selectedFood);
        return (
          <FoodEdit
            food={selectedFood}
            onBack={handleBackToFoods}
            onSave={handleFoodUpdated}
          />
        );
      
      case 'chat':
        return (
          <Chat />
        );
      
      case 'food-approvals':
        return (
          <FoodApprovals />
        );
      
      case 'client-progress':
        return (
          <ClientProgress 
            clientId={selectedClient?.id}
            clientName={selectedClient?.name}
            onBack={() => setCurrentView('progress-list')}
          />
        );
      
      case 'progress-list':
        return (
          <ClientManagement 
            onStatsUpdate={fetchClientStats} 
            onCreateClient={handleCreateClient}
            onViewClient={handleViewProgress}
            onEditClient={handleEditClient}
            viewMode="progress"
          />
        );
      
      default:
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

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <MdRestaurant className="logo-icon" />
            {!sidebarCollapsed && <span className="logo-text">NutritionCare</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {sidebarCollapsed ? <MdMenu /> : <MdMenuOpen />}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <div className={`nav-item ${currentView.includes('client') && !currentView.includes('progress') ? 'active' : ''}`} onClick={handleClientsNavigation} title="Client Management">
            <MdPeople className="nav-icon" />
            {!sidebarCollapsed && <span>Client Management</span>}
          </div>
          <div className={`nav-item ${currentView.includes('progress') ? 'active' : ''}`} onClick={handleProgressNavigation} title="Client Progress">
            <MdTrendingUp className="nav-icon" />
            {!sidebarCollapsed && <span>Client Progress</span>}
          </div>
          <div className={`nav-item ${currentView.includes('food') && !currentView.includes('approval') ? 'active' : ''}`} onClick={handleFoodsNavigation} title="Food Management">
            <MdInventory className="nav-icon" />
            {!sidebarCollapsed && <span>Food Management</span>}
          </div>
          <div className={`nav-item ${currentView === 'food-approvals' ? 'active' : ''}`} onClick={() => { setCurrentView('food-approvals'); fetchPendingFoodsCount(); }} title="Food Approvals">
            <MdCheckCircle className="nav-icon" />
            {!sidebarCollapsed && <span>Food Approvals</span>}
            {pendingFoodsCount > 0 && (
              <span className="notification-badge">{pendingFoodsCount}</span>
            )}
          </div>
          <div className={`nav-item ${currentView === 'chat' ? 'active' : ''}`} onClick={handleChatNavigation} title="Chat">
            <MdChat className="nav-icon" />
            {!sidebarCollapsed && <span>Chat</span>}
          </div>
        </nav>
        
        <div className="sidebar-footer">
          {!sidebarCollapsed && (
            <div className="user-info">
              <div className="user-avatar">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="user-details">
                <div className="user-name">{user.name}</div>
                <div className="user-role">Dietitian</div>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="user-info collapsed">
              <div className="user-avatar">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            </div>
          )}
          <button className="sign-out-btn" onClick={handleSignOut} title="Sign Out">
            <MdLogout className="logout-icon" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
