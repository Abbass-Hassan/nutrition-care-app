import React, { useState, useEffect } from 'react';
import Notification from './Notification';
import { API_BASE } from '../config';

const ClientManagement = ({ onStatsUpdate, onCreateClient, onViewClient, onEditClient, viewMode = 'list', onBack }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    subscriptionType: 'paid'
  });

  // Fetch existing clients
  const fetchClients = async () => {
    try {
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
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    if (viewMode === 'list') {
      fetchClients();
    }
  }, [viewMode]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setNotification({
        message: 'Passwords do not match',
        type: 'error'
      });
      return;
    }

    if (formData.password.length < 8) {
      setNotification({
        message: 'Password must be at least 8 characters long',
        type: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email || null,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          user_type: 'client',
          subscription_type: formData.subscriptionType
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNotification({
          message: `Client "${formData.name}" created successfully!\n\nProvide these credentials to your client:\nUsername: ${formData.username}\nPassword: ${formData.password}`,
          type: 'success',
          autoClose: false
        });
        
        // Reset form
        setFormData({
          name: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          subscriptionType: 'paid'
        });
        
        // Refresh list
        await fetchClients();
        
        // Update stats and go back after showing success
        if (onStatsUpdate) onStatsUpdate();
        setTimeout(() => {
          if (onBack) onBack();
        }, 1500);
      } else {
        setNotification({
          message: data.message || 'Failed to create client account',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating client:', error);
      setNotification({
        message: 'Failed to create client account. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateUsername = () => {
    const name = formData.name.toLowerCase().replace(/\s+/g, '');
    const randomNum = Math.floor(Math.random() * 1000);
    const suggestedUsername = `${name}${randomNum}`;
    setFormData({ ...formData, username: suggestedUsername });
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password, confirmPassword: password });
  };

  // Render create client form
  if (viewMode === 'create') {
    return (
      <>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            autoClose={notification.autoClose !== false}
            onClose={() => setNotification(null)}
          />
        )}
        
        <div className="create-client-full-page">
          <form onSubmit={handleCreateClient} className="client-form-page">
            <div className="form-section">
              <h3>Client Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Client Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter client's full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subscriptionType">Subscription Type *</label>
                  <select
                    id="subscriptionType"
                    name="subscriptionType"
                    value={formData.subscriptionType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="paid">Paid (Default)</option>
                    <option value="free">Free (Special Case)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">Username *</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Choose a unique username"
                      required
                    />
                    <button 
                      type="button" 
                      className="btn-secondary small"
                      onClick={generateUsername}
                      disabled={!formData.name}
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email (Optional)</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Client's email (optional)"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Account Credentials</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password"
                      required
                      minLength="8"
                    />
                    <button 
                      type="button" 
                      className="btn-secondary small"
                      onClick={generatePassword}
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="text"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm the password"
                    required
                    minLength="8"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions-page">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={onBack}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Client Account'}
              </button>
            </div>
          </form>
        </div>
      </>
    );
  }

  // Render clients list
  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          autoClose={notification.autoClose !== false}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="client-management">
        <div className="section-header">
          <h2 className="section-title">Client Management</h2>
          <button 
            className="btn-primary"
            onClick={onCreateClient}
          >
            + Add New Client
          </button>
        </div>

        <div className="clients-list">
          <h3>Your Clients</h3>
          {clients.length === 0 ? (
            <div className="empty-state">
              <p>No clients yet. Create your first client account to get started!</p>
            </div>
          ) : (
            <div className="clients-table-container">
              <table className="clients-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <div className="client-name">
                          <span className="name">{client.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="username">@{client.username}</span>
                      </td>
                      <td>
                        <span className="email">{client.email || 'No email'}</span>
                      </td>
                      <td>
                        <span className="created-date">
                          {new Date(client.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button 
                            className="btn-secondary small"
                            onClick={() => onViewClient && onViewClient(client)}
                          >
                            View
                          </button>
                          <button 
                            className="btn-secondary small"
                            onClick={() => onEditClient && onEditClient(client)}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ClientManagement; 