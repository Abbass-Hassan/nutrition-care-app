import React, { useState, useEffect } from 'react';
import Notification from './Notification';

const FoodManagement = ({ onStatsUpdate, onCreateFood, onViewFood, onEditFood, viewMode = 'list', onBack }) => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fetch existing foods (placeholder for future implementation)
  const fetchFoods = async () => {
    try {
      // TODO: Implement API call to fetch foods
      // For now, we'll just set an empty array
      setFoods([]);
    } catch (error) {
      console.error('Error fetching foods:', error);
    }
  };

  useEffect(() => {
    if (viewMode === 'list') {
      fetchFoods();
    }
  }, [viewMode]);

  // Render foods list
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
          <h2 className="section-title">Food Management</h2>
          <button 
            className="btn-primary"
            onClick={onCreateFood}
          >
            + Add New Food
          </button>
        </div>

        <div className="clients-list">
          <h3>Your Foods</h3>
          {foods.length === 0 ? (
            <div className="empty-state">
              <p>No foods yet. Create your first food to get started!</p>
            </div>
          ) : (
            <div className="clients-table-container">
              <table className="clients-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map((food) => (
                    <tr key={food.id}>
                      <td>
                        <div className="client-name">
                          <span className="name">{food.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="username">{food.category}</span>
                      </td>
                      <td>
                        <span className="email">{food.price || 'N/A'}</span>
                      </td>
                      <td>
                        <span className="created-date">
                          {new Date(food.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button 
                            className="btn-secondary small"
                            onClick={() => onViewFood && onViewFood(food)}
                          >
                            View
                          </button>
                          <button 
                            className="btn-secondary small"
                            onClick={() => onEditFood && onEditFood(food)}
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

export default FoodManagement;
