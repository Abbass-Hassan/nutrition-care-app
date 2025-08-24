import React, { useState, useEffect } from 'react';
import { MdArrowBack, MdEdit, MdEmail, MdPerson, MdDateRange, MdSubscriptions } from 'react-icons/md';

const ClientProfile = ({ clientId, onBack, onEdit }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClientDetails();
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/clients/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setClient(data.client);
      } else {
        setError('Failed to load client details');
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
      setError('Failed to load client details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="client-profile-loading">
        <div className="loading-spinner">Loading client details...</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="client-profile-error">
        <div className="error-message">
          <p>{error || 'Client not found'}</p>
          <button className="btn-primary" onClick={onBack}>
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="client-profile">
      <div className="profile-header">
        <button className="back-button" onClick={onBack}>
          <MdArrowBack className="back-icon" />
          Back to Clients
        </button>
        <div className="profile-actions">
          <button className="btn-primary" onClick={() => onEdit(client)}>
            <MdEdit className="edit-icon" />
            Edit Client
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="client-header">
          <div className="client-avatar">
            {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="client-info">
            <h1 className="client-name">{client.name}</h1>
            <p className="client-username">@{client.username}</p>
          </div>
        </div>

        <div className="profile-sections">
          <div className="profile-section">
            <h3 className="section-title">
              <MdPerson className="section-icon" />
              Personal Information
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <span>{client.name}</span>
              </div>
              <div className="info-item">
                <label>Username</label>
                <span>@{client.username}</span>
              </div>
              <div className="info-item">
                <label>Email</label>
                <span>{client.email || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3 className="section-title">
              <MdSubscriptions className="section-icon" />
              Subscription Details
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Subscription Type</label>
                <span className={`subscription-badge ${client.subscription_type || 'paid'}`}>
                  {(client.subscription_type || 'paid').toUpperCase()}
                </span>
              </div>
              <div className="info-item">
                <label>Account Created</label>
                <span>{new Date(client.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="info-item">
                <label>Last Updated</label>
                <span>{new Date(client.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
          </div>

          {/* Future sections can be added here */}
          <div className="profile-section">
            <h3 className="section-title">
              <MdDateRange className="section-icon" />
              Activity Summary
            </h3>
            <div className="activity-placeholder">
              <p>Activity tracking will be available in future updates.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile; 