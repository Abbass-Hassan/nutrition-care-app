import React, { useState, useEffect } from 'react';
import { MdCheckCircle, MdWarning, MdRestaurant, MdCheck, MdClose, MdEdit, MdPerson, MdAccessTime } from 'react-icons/md';
import ErrorMessage from './ErrorMessage';

const FoodApprovals = () => {
  const [pendingFoods, setPendingFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    default_serving: ''
  });
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    loadPendingFoods();
  }, []);

  const showNotification = (type, message) => {
    setErrorMessage({ type, message });
    setTimeout(() => {
      setErrorMessage(null);
    }, 4000);
  };

  const loadPendingFoods = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'}/pending-foods`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load pending foods');
      }

      const data = await response.json();
      if (data.success) {
        setPendingFoods(data.pending_foods);
      }
    } catch (error) {
      console.error('Error loading pending foods:', error);
      showNotification('error', 'Failed to load pending food submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (foodId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'}/foods/${foodId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve food');
      }

      const data = await response.json();
      if (data.success) {
        showNotification('success', 'Food approved successfully!');
        loadPendingFoods(); // Refresh list
      }
    } catch (error) {
      console.error('Error approving food:', error);
      showNotification('error', 'Failed to approve food');
    }
  };

  const handleReject = (food) => {
    setSelectedFood(food);
    setShowRejectModal(true);
  };

  const handleEdit = (food) => {
    setSelectedFood(food);
    setEditForm({
      name: food.name,
      calories: food.calories.toString(),
      protein: food.protein?.toString() || '0',
      carbs: food.carbs?.toString() || '0',
      fat: food.fat?.toString() || '0',
      default_serving: food.default_serving || '1 serving'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedFood) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'}/foods/${selectedFood.id}/edit-pending`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to edit food');
      }

      const data = await response.json();
      if (data.success) {
        showNotification('success', 'Food updated successfully!');
        setShowEditModal(false);
        setSelectedFood(null);
        loadPendingFoods(); // Refresh list
      }
    } catch (error) {
      console.error('Error editing food:', error);
      showNotification('error', 'Failed to edit food');
    }
  };

  const confirmReject = async () => {
    if (!selectedFood) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'}/foods/${selectedFood.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          reason: rejectionReason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject food');
      }

      const data = await response.json();
      if (data.success) {
        showNotification('warning', 'Food rejected');
        setShowRejectModal(false);
        setSelectedFood(null);
        setRejectionReason('');
        loadPendingFoods(); // Refresh list
      }
    } catch (error) {
      console.error('Error rejecting food:', error);
      showNotification('error', 'Failed to reject food');
    }
  };

  if (loading) {
    return (
      <div className="food-management-container">
        <div className="food-loading">
          <div className="loading-spinner"></div>
          <p>Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {errorMessage && (
        <ErrorMessage
          message={errorMessage.message}
          type={errorMessage.type}
          autoClose={errorMessage.type === 'error'}
          onClose={() => setErrorMessage(null)}
        />
      )}

      <div className="food-approvals-container">
        <div className="food-approvals-header">
          <div className="approvals-header-content">
            <h1 className="approvals-title">Food Approvals</h1>
            <p className="approvals-subtitle">Review and approve food items submitted by your clients</p>
          </div>
          <div className="approvals-summary">
            <div className="summary-card">
              <div className="summary-icon">
                <MdWarning />
              </div>
              <div className="summary-content">
                <span className="summary-number">{pendingFoods.length}</span>
                <span className="summary-label">Pending Reviews</span>
              </div>
            </div>
          </div>
        </div>

        {pendingFoods.length === 0 ? (
          <div className="approvals-empty-state">
            <div className="empty-icon">
              <MdCheckCircle />
            </div>
            <h3 className="empty-title">All Caught Up!</h3>
            <p className="empty-description">No pending food approvals at the moment.</p>
          </div>
        ) : (
          <div className="approvals-content">
            <div className="approvals-grid">
              {pendingFoods.map((food) => (
                <div key={food.id} className="approval-card">
                  <div className="approval-card-header">
                    <div className="food-image-container">
                      <div className="food-image-placeholder">
                        <MdRestaurant />
                      </div>
                    </div>
                    <div className="approval-status">
                      <span className="status-badge pending">Pending</span>
                    </div>
                  </div>

                  <div className="approval-card-body">
                    <h3 className="food-title">{food.name}</h3>
                    <p className="food-serving">{food.default_serving || '1 serving'}</p>

                    <div className="client-section">
                      <div className="client-info">
                        <div className="client-avatar">
                          <MdPerson />
                        </div>
                        <div className="client-details">
                          <div className="client-name">{food.created_by_client?.name || 'Unknown Client'}</div>
                          <div className="client-email">{food.created_by_client?.email || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="submission-info">
                      <MdAccessTime />
                      <span>
                        {new Date(food.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="nutrition-grid">
                      <div className="nutrition-item">
                        <span className="nutrition-label">Calories</span>
                        <span className="nutrition-value">{food.calories}</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Protein</span>
                        <span className="nutrition-value">{food.protein || 0}g</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Carbs</span>
                        <span className="nutrition-value">{food.carbs || 0}g</span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Fat</span>
                        <span className="nutrition-value">{food.fat || 0}g</span>
                      </div>
                    </div>
                  </div>

                  <div className="approval-card-actions">
                    <button 
                      className="approval-btn edit-btn"
                      onClick={() => handleEdit(food)}
                    >
                      <MdEdit />
                      <span>Edit</span>
                    </button>
                    <button 
                      className="approval-btn approve-btn"
                      onClick={() => handleApprove(food.id)}
                    >
                      <MdCheck />
                      <span>Approve</span>
                    </button>
                    <button 
                      className="approval-btn reject-btn"
                      onClick={() => handleReject(food)}
                    >
                      <MdClose />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="approval-modal-overlay">
            <div className="approval-modal">
              <div className="approval-modal-header">
                <h3 className="modal-title">Edit Food Details</h3>
                <button 
                  className="modal-close-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  <MdClose />
                </button>
              </div>
              
              <div className="approval-modal-body">
                <div className="approval-form-group">
                  <label className="approval-label">Food Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="approval-input"
                  />
                </div>
                
                <div className="approval-form-group">
                  <label className="approval-label">Serving Size</label>
                  <input
                    type="text"
                    value={editForm.default_serving}
                    onChange={(e) => setEditForm({...editForm, default_serving: e.target.value})}
                    className="approval-input"
                    placeholder="e.g., 1 cup, 100g"
                  />
                </div>

                <div className="approval-nutrition-inputs">
                  <div className="approval-form-group">
                    <label className="approval-label">Calories</label>
                    <input
                      type="number"
                      value={editForm.calories}
                      onChange={(e) => setEditForm({...editForm, calories: e.target.value})}
                      className="approval-input"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  
                  <div className="approval-form-group">
                    <label className="approval-label">Protein (g)</label>
                    <input
                      type="number"
                      value={editForm.protein}
                      onChange={(e) => setEditForm({...editForm, protein: e.target.value})}
                      className="approval-input"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  
                  <div className="approval-form-group">
                    <label className="approval-label">Carbs (g)</label>
                    <input
                      type="number"
                      value={editForm.carbs}
                      onChange={(e) => setEditForm({...editForm, carbs: e.target.value})}
                      className="approval-input"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  
                  <div className="approval-form-group">
                    <label className="approval-label">Fat (g)</label>
                    <input
                      type="number"
                      value={editForm.fat}
                      onChange={(e) => setEditForm({...editForm, fat: e.target.value})}
                      className="approval-input"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              <div className="approval-modal-actions">
                <button 
                  className="approval-btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="approval-btn-primary"
                  onClick={handleEditSubmit}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="approval-modal-overlay">
            <div className="approval-modal reject-modal">
              <div className="approval-modal-header">
                <div className="warning-icon">
                  <MdWarning />
                </div>
                <h3 className="modal-title">Reject Food Submission</h3>
                <button 
                  className="modal-close-btn"
                  onClick={() => setShowRejectModal(false)}
                >
                  <MdClose />
                </button>
              </div>
              
              <div className="approval-modal-body">
                <p className="rejection-warning">
                  Are you sure you want to reject <strong>"{selectedFood?.name}"</strong>?
                </p>
                <div className="approval-form-group">
                  <label className="approval-label">Reason for rejection (optional)</label>
                  <textarea
                    placeholder="Provide feedback to help the client improve their submission..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="3"
                    className="approval-textarea"
                  />
                </div>
              </div>

              <div className="approval-modal-actions">
                <button 
                  className="approval-btn-cancel"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="approval-btn-reject"
                  onClick={confirmReject}
                >
                  Reject Food
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FoodApprovals;

