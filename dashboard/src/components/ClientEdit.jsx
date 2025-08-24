import React, { useState } from 'react';
import { MdArrowBack, MdSave, MdCancel } from 'react-icons/md';
import Notification from './Notification';

const ClientEdit = ({ client, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    name: client.name || '',
    email: client.email || '',
    subscriptionType: client.subscription_type || 'paid'
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/clients/${client.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || null,
          subscription_type: formData.subscriptionType
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNotification({
          message: 'Client information updated successfully!',
          type: 'success'
        });
        
        // Call onSave callback with updated client data
        if (onSave) {
          onSave({
            ...client,
            name: formData.name,
            email: formData.email,
            subscription_type: formData.subscriptionType
          });
        }
        
        // Auto-redirect after success
        setTimeout(() => {
          onBack();
        }, 2000);
      } else {
        setNotification({
          message: data.message || 'Failed to update client information',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating client:', error);
      setNotification({
        message: 'Failed to update client information. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return (
      formData.name !== client.name ||
      formData.email !== (client.email || '') ||
      formData.subscriptionType !== (client.subscription_type || 'paid')
    );
  };

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          autoClose={notification.type === 'error'}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="create-client-page">
        <div className="page-header">
          <button className="back-button" onClick={onBack}>
            <MdArrowBack className="back-icon" />
            Back to Profile
          </button>
          <h1 className="page-title">Edit Client Information</h1>
        </div>

        <div className="create-client-full-page">
          <div className="client-summary">
            <div className="client-avatar">
              {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="client-details">
              <h3>{client.name}</h3>
              <p>@{client.username}</p>
              <small>Username cannot be changed</small>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="client-form-page">
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
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
                  <label htmlFor="email">Email (Optional)</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Client's email address"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Subscription Settings</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="subscriptionType">Subscription Type *</label>
                  <select
                    id="subscriptionType"
                    name="subscriptionType"
                    value={formData.subscriptionType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="paid">Paid</option>
                    <option value="free">Free</option>
                  </select>
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
                disabled={loading || !hasChanges()}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ClientEdit; 