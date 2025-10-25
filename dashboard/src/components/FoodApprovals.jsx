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

      <div className="food-approvals-page">
        <div className="approvals-page-header">
          <div className="page-title-section">
            <h1>Food Approvals</h1>
            <p>Review pending food submissions from your clients</p>
          </div>
          <div className="pending-count">
            <span className="count-number">{pendingFoods.length}</span>
            <span className="count-label">Pending</span>
          </div>
        </div>

        {pendingFoods.length === 0 ? (
          <div className="no-pending-state">
            <div className="check-icon">
              <MdCheckCircle />
            </div>
            <h3>All Caught Up!</h3>
            <p>No pending food approvals at the moment.</p>
          </div>
        ) : (
          <div className="approvals-list">
            {pendingFoods.map((food) => (
              <div key={food.id} className="approval-item">
                <div className="item-header">
                  <div className="food-info">
                    <div className="food-icon">
                      <MdRestaurant />
                    </div>
                    <div className="food-details">
                      <h3>{food.name}</h3>
                      <p>{food.default_serving || '1 serving'}</p>
                    </div>
                  </div>
                  <div className="status-indicator">
                    <span className="pending-badge">Pending</span>
                  </div>
                </div>

                <div className="item-content">
                  <div className="client-info-row">
                    <div className="client-avatar-small">
                      <MdPerson />
                    </div>
                    <div className="client-text">
                      <span className="client-name">{food.created_by_client?.name || 'Unknown Client'}</span>
                      <span className="client-email">{food.created_by_client?.email || 'N/A'}</span>
                    </div>
                    <div className="submission-time">
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
                  </div>

                  <div className="nutrition-row">
                    <div className="nutrition-item">
                      <span className="nutrient-label">Calories</span>
                      <span className="nutrient-value">{food.calories}</span>
                    </div>
                    <div className="nutrition-item">
                      <span className="nutrient-label">Protein</span>
                      <span className="nutrient-value">{food.protein || 0}g</span>
                    </div>
                    <div className="nutrition-item">
                      <span className="nutrient-label">Carbs</span>
                      <span className="nutrient-value">{food.carbs || 0}g</span>
                    </div>
                    <div className="nutrition-item">
                      <span className="nutrient-label">Fat</span>
                      <span className="nutrient-value">{food.fat || 0}g</span>
                    </div>
                  </div>
                </div>

                <div className="item-actions">
                  <button 
                    className="action-button edit-button"
                    onClick={() => handleEdit(food)}
                  >
                    <MdEdit />
                    Edit
                  </button>
                  <button 
                    className="action-button approve-button"
                    onClick={() => handleApprove(food.id)}
                  >
                    <MdCheck />
                    Approve
                  </button>
                  <button 
                    className="action-button reject-button"
                    onClick={() => handleReject(food)}
                  >
                    <MdClose />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="modal-backdrop">
            <div className="modal-container">
              <div className="modal-header">
                <h3>Edit Food Details</h3>
                <button 
                  className="close-button"
                  onClick={() => setShowEditModal(false)}
                >
                  <MdClose />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="input-group">
                  <label>Food Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="text-input"
                  />
                </div>
                
                <div className="input-group">
                  <label>Serving Size</label>
                  <input
                    type="text"
                    value={editForm.default_serving}
                    onChange={(e) => setEditForm({...editForm, default_serving: e.target.value})}
                    className="text-input"
                    placeholder="e.g., 1 cup, 100g"
                  />
                </div>

                <div className="nutrition-inputs">
                  <div className="input-group">
                    <label>Calories</label>
                    <input
                      type="number"
                      value={editForm.calories}
                      onChange={(e) => setEditForm({...editForm, calories: e.target.value})}
                      className="number-input"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label>Protein (g)</label>
                    <input
                      type="number"
                      value={editForm.protein}
                      onChange={(e) => setEditForm({...editForm, protein: e.target.value})}
                      className="number-input"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label>Carbs (g)</label>
                    <input
                      type="number"
                      value={editForm.carbs}
                      onChange={(e) => setEditForm({...editForm, carbs: e.target.value})}
                      className="number-input"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label>Fat (g)</label>
                    <input
                      type="number"
                      value={editForm.fat}
                      onChange={(e) => setEditForm({...editForm, fat: e.target.value})}
                      className="number-input"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="cancel-button"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="save-button"
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
          <div className="modal-backdrop">
            <div className="modal-container reject-modal">
              <div className="modal-header">
                <div className="warning-icon">
                  <MdWarning />
                </div>
                <h3>Reject Food Submission</h3>
                <button 
                  className="close-button"
                  onClick={() => setShowRejectModal(false)}
                >
                  <MdClose />
                </button>
              </div>
              
              <div className="modal-body">
                <p className="warning-message">
                  Are you sure you want to reject <strong>"{selectedFood?.name}"</strong>?
                </p>
                <div className="input-group">
                  <label>Reason for rejection (optional)</label>
                  <textarea
                    placeholder="Provide feedback to help the client improve their submission..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="3"
                    className="textarea-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="cancel-button"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="reject-button"
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

