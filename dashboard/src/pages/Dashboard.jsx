import React, { useState, useEffect } from 'react';
import { MdPeople, MdDashboard, MdLogout, MdArrowBack, MdInventory, MdChat } from 'react-icons/md';
import ClientManagement from '../components/ClientManagement';
import ClientProfile from '../components/ClientProfile';
import ClientEdit from '../components/ClientEdit';
import FoodManagement from '../components/FoodManagement';
import FoodProfile from '../components/FoodProfile';
import FoodEdit from '../components/FoodEdit';
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

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
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
    fetchClientStats();
  };

  const handleBackToProfile = () => {
    setCurrentView('view-client');
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
            onViewFood={handleViewFood}
            onEditFood={handleEditFood}
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
              <FoodManagement 
                onStatsUpdate={fetchClientStats} 
                viewMode="create"
                onBack={handleBackToFoods}
              />
            </div>
          </div>
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
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🍎</span>
            <span className="logo-text">NutritionCare</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className={`nav-item ${currentView.includes('client') ? 'active' : ''}`} onClick={handleClientsNavigation}>
            <MdPeople className="nav-icon" />
            <span>Client Management</span>
          </div>
          <div className={`nav-item ${currentView.includes('food') ? 'active' : ''}`} onClick={handleFoodsNavigation}>
            <MdInventory className="nav-icon" />
            <span>Food Management</span>
          </div>
          <div className={`nav-item ${currentView === 'chat' ? 'active' : ''}`} onClick={handleChatNavigation}>
            <MdChat className="nav-icon" />
            <span>Chat</span>
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

      <main className="main-content">
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
