import React, { useState, useEffect } from 'react';
import { MdCheckCircle, MdWarning } from 'react-icons/md';
import ErrorMessage from './ErrorMessage';
import ClientCreationForm from './ClientCreationForm';
import { API_BASE } from '../config';

const ClientManagement = ({ onStatsUpdate, onCreateClient, onViewClient, onEditClient, viewMode = 'list', onBack }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientProgress, setClientProgress] = useState({});

  // Fetch existing clients
  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      } else {
        const errorData = await response.json();
        setErrorMessage({
          message: errorData.message || 'Failed to load clients. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setErrorMessage({
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch progress data for all clients
  const fetchClientProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/progress/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const progressMap = {};
        data.clients.forEach(client => {
          progressMap[client.id] = client;
        });
        setClientProgress(progressMap);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  useEffect(() => {
    if (viewMode === 'list' || viewMode === 'progress') {
      fetchClients();
      if (viewMode === 'progress') {
        fetchClientProgress();
      }
    }
  }, [viewMode]);

  const handleClientCreated = async (client) => {
    setErrorMessage({
      message: `Client "${client.name}" created successfully with comprehensive profile!`,
      type: 'success'
    });
    
    // Refresh list
    await fetchClients();
    
    // Update stats
    if (onStatsUpdate) onStatsUpdate();
    
    // Close form
    setShowClientForm(false);
    
    // Go back after showing success
    setTimeout(() => {
      if (onBack) onBack();
    }, 2000);
  };

  const handleDeleteClient = async (client) => {
    setClientToDelete(client);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/clients/${clientToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setErrorMessage({
          message: `Client "${clientToDelete.name}" deleted successfully!`,
          type: 'success'
        });
        
        // Refresh list
        await fetchClients();
        
        // Update stats
        if (onStatsUpdate) onStatsUpdate();
      } else {
        const errorData = await response.json();
        setErrorMessage({
          message: errorData.message || 'Failed to delete client. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      setErrorMessage({
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setClientToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setClientToDelete(null);
  };

  // Render create client form
  if (viewMode === 'create') {
    return (
      <>
        <ErrorMessage 
          message={errorMessage?.message} 
          type={errorMessage?.type} 
          show={!!errorMessage}
          onClose={() => setErrorMessage(null)}
          autoClose={true}
          duration={6000}
        />
        
        <ClientCreationForm
          onClose={() => {
            setShowClientForm(false);
            if (onBack) onBack();
          }}
          onSuccess={handleClientCreated}
        />
      </>
    );
  }

  // Render clients list
  return (
    <>
      <ErrorMessage 
        message={errorMessage?.message} 
        type={errorMessage?.type} 
        show={!!errorMessage}
        onClose={() => setErrorMessage(null)}
        autoClose={true}
        duration={6000}
      />

      {/* Delete Confirmation Panel */}
      {showDeleteConfirm && (
        <div className="confirmation-overlay">
          <div className="confirmation-panel">
            <div className="confirmation-header">
              <i className="fas fa-exclamation-triangle warning-icon"></i>
              <h3>Confirm Deletion</h3>
            </div>
            <div className="confirmation-body">
              <p>Are you sure you want to delete <strong>"{clientToDelete?.name}"</strong>?</p>
              <p className="warning-text">This action cannot be undone and will permanently remove all client data.</p>
            </div>
            <div className="confirmation-actions">
              <button 
                className="btn-cancel" 
                onClick={cancelDelete}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn-delete" 
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Client'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="client-management">
        <div className="section-header">
          <h2 className="section-title">{viewMode === 'progress' ? 'Client Progress Overview' : 'Client Management'}</h2>
          {viewMode === 'list' && (
            <button 
              className="add-client-btn"
              onClick={onCreateClient}
            >
              <i className="fas fa-user-plus"></i>
              <span>Add New Client</span>
            </button>
          )}
        </div>

        <div className="clients-list-container">
          {clients.length === 0 ? (
            <div className="empty-state">
              <p>No clients yet. Create your first client to get started.</p>
            </div>
          ) : (
            <table className={viewMode === 'progress' ? 'progress-table' : 'clean-table'}>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Email</th>
                  {viewMode === 'progress' ? (
                    <>
                      <th>Avg Calories</th>
                      <th>Meals/Day</th>
                      <th>Goal Rate</th>
                    </>
                  ) : (
                    <>
                      <th>Subscription</th>
                      <th>Profile</th>
                      <th>Joined</th>
                    </>
                  )}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div className="client-info">
                        <div className="client-initial">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="client-details">
                          <div className="client-name">{client.name}</div>
                          <div className="client-username">@{client.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-secondary">{client.email || '—'}</span>
                    </td>
                    {viewMode === 'progress' ? (
                      <>
                        <td>
                          <div className="progress-metric">
                            <div className="metric-icon calories">
                              <i className="fas fa-fire"></i>
                            </div>
                            <div className="metric-value">
                              {clientProgress[client.id]?.avg_calories || '—'}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="progress-metric">
                            <div className="metric-icon meals">
                              <i className="fas fa-utensils"></i>
                            </div>
                            <div className="metric-value">
                              {clientProgress[client.id]?.avg_meals || '—'}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="progress-metric">
                            <div className="metric-icon goal">
                              <i className="fas fa-trophy"></i>
                            </div>
                            <div className="metric-value">
                              {clientProgress[client.id]?.avg_goal_rate 
                                ? `${clientProgress[client.id].avg_goal_rate}%`
                                : '—'}
                            </div>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <span className="subscription-badge">{client.subscription_type}</span>
                        </td>
                        <td>
                          {client.profile ? (
                            <span className="status-badge complete">Complete</span>
                          ) : (
                            <span className="status-badge incomplete">Incomplete</span>
                          )}
                        </td>
                        <td>
                          <span className="text-secondary">
                            {new Date(client.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </td>
                      </>
                    )}
                    <td>
                      <div className="action-buttons">
                        {viewMode === 'progress' ? (
                          <button 
                            className="btn-primary progress-btn"
                            onClick={() => onViewClient && onViewClient(client)}
                            title="View Detailed Progress"
                          >
                            <i className="fas fa-chart-line"></i>
                            View Progress
                          </button>
                        ) : (
                          <>
                            <button 
                              className="icon-btn"
                              onClick={() => onViewClient && onViewClient(client)}
                              title="View"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              className="icon-btn"
                              onClick={() => onEditClient && onEditClient(client)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="icon-btn delete"
                              onClick={() => handleDeleteClient(client)}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default ClientManagement; 