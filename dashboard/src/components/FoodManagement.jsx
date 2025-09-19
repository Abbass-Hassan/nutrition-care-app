import React, { useState, useEffect } from 'react';
import Notification from './Notification';

const FoodManagement = ({ onStatsUpdate, onCreateFood, onViewFood, onEditFood, viewMode = 'list', onBack }) => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Meat',
    default_serving: '',
    calories: '',
    carbs: '',
    protein: '',
    fat: '',
    photo: null,
    photoPreview: null,
    notes: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState(null);

  const categories = [
    'Meat', 'Fruit', 'Vegetables', 'Dairy', 'Grains', 
    'Nuts/Seeds', 'Oils', 'Drinks', 'Sweets', 'Other'
  ];

  // Fetch existing foods from API
  const fetchFoods = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/foods', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFoods(data.foods || []);
      } else {
        const errorData = await response.json();
        setNotification({
          message: errorData.message || 'Failed to fetch foods',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
      setNotification({
        message: 'Failed to fetch foods. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load foods on component mount (only for list mode)
  useEffect(() => {
    if (viewMode === 'list') {
      fetchFoods();
    }
  }, [viewMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleCreateFood = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('default_serving', formData.default_serving);
      formDataToSend.append('calories', formData.calories);
      formDataToSend.append('carbs', formData.carbs || '');
      formDataToSend.append('protein', formData.protein || '');
      formDataToSend.append('fat', formData.fat || '');
      formDataToSend.append('notes', formData.notes || '');
      
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      console.log('Sending food data:', {
        name: formData.name,
        category: formData.category,
        default_serving: formData.default_serving,
        calories: formData.calories,
        carbs: formData.carbs,
        protein: formData.protein,
        fat: formData.fat,
        notes: formData.notes
      });

      const response = await fetch('http://localhost:8000/api/foods', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (response.ok) {
        setNotification({
          message: 'Food created successfully!',
          type: 'success'
        });
        
        // Reset form
        setFormData({
          name: '',
          category: 'Meat',
          default_serving: '',
          calories: '',
          carbs: '',
          protein: '',
          fat: '',
          photo: null,
          photoPreview: null,
          notes: ''
        });
        
        // Call parent callback if provided
        if (onCreateFood) {
          onCreateFood(data);
        }
        
        // Go back to list if this is a standalone create
        if (onBack) {
          setTimeout(() => onBack(), 1500);
        }
      } else {
        console.error('API Error:', data);
        const message = response.status === 409
          ? 'A food with this name already exists.'
          : data.message || 'Failed to create food';
        setNotification({
          message,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating food:', error);
      setNotification({
        message: 'Failed to create food. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (food) => {
    if (onEditFood) {
      onEditFood(food);
    }
  };

  const handleDeleteClick = (food) => {
    setFoodToDelete(food);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!foodToDelete) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/foods/${foodToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setFoods(foods.filter(f => f.id !== foodToDelete.id));
        setNotification({
          message: `Food "${foodToDelete.name}" deleted successfully!`,
          type: 'success'
        });
      } else {
        setNotification({
          message: data.message || 'Failed to delete food',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting food:', error);
      setNotification({
        message: 'Failed to delete food. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setShowConfirmDelete(false);
      setFoodToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setFoodToDelete(null);
  };

  const handleBackToList = () => {
    if (onBack) {
      onBack();
    }
  };

  // Render create food form
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
          <form onSubmit={handleCreateFood} className="client-form-page">
            <div className="form-section">
              <h3>Food Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Food Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="default_serving">Default Serving *</label>
                  <input
                    type="text"
                    id="default_serving"
                    name="default_serving"
                    value={formData.default_serving}
                    onChange={handleInputChange}
                    placeholder="e.g., 1 medium (150g)"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Nutritional Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="calories">Calories *</label>
                  <input
                    type="number"
                    id="calories"
                    name="calories"
                    value={formData.calories}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="carbs">Carbs (g)</label>
                  <input
                    type="number"
                    id="carbs"
                    name="carbs"
                    value={formData.carbs}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="protein">Protein (g)</label>
                  <input
                    type="number"
                    id="protein"
                    name="protein"
                    value={formData.protein}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fat">Fat (g)</label>
                  <input
                    type="number"
                    id="fat"
                    name="fat"
                    value={formData.fat}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Photo</h3>
              <div className="form-group">
                <label htmlFor="photo">Food Photo</label>
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={loading}
                />
                {formData.photoPreview && (
                  <div className="photo-preview-container">
                    <img 
                      src={formData.photoPreview} 
                      alt="Food preview" 
                      className="photo-preview"
                    />
                    <span className="photo-preview-label">Preview</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>Notes</h3>
              <div className="form-group">
                <label htmlFor="notes">Additional Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Any additional information about this food..."
                  disabled={loading}
                />
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
                {loading ? 'Creating...' : 'Create Food'}
              </button>
            </div>
          </form>
        </div>
      </>
    );
  }

  // Render foods list - EXACT SAME STRUCTURE AS CLIENT MANAGEMENT
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
          {loading ? (
            <div className="loading">Loading foods...</div>
          ) : foods.length === 0 ? (
            <div className="empty-state">
              <p>No foods yet. Create your first food to get started!</p>
            </div>
          ) : (
            <div className="clients-table-container">
              <table className="clients-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Serving</th>
                    <th>Calories</th>
                    <th>Carbs</th>
                    <th>Protein</th>
                    <th>Fat</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map((food) => (
                    <tr key={food.id}>
                      <td>
                        {food.photo_url ? (
                          <img 
                            src={food.photo_url} 
                            alt={food.name}
                            className="food-photo-thumbnail"
                          />
                        ) : (
                          <div className="food-photo-placeholder">🍎</div>
                        )}
                      </td>
                      <td>
                        <div className="client-name">
                          <span className="name">{food.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`category-badge ${food.category.toLowerCase().replace('/', '-')}`}>
                          {food.category}
                        </span>
                      </td>
                      <td>
                        <span className="serving">{food.default_serving}</span>
                      </td>
                      <td>
                        <span className="calories">{food.calories} cal</span>
                      </td>
                      <td>
                        <span className="carbs">{food.carbs || 0}g</span>
                      </td>
                      <td>
                        <span className="protein">{food.protein || 0}g</span>
                      </td>
                      <td>
                        <span className="fat">{food.fat || 0}g</span>
                      </td>
                      <td>
                        <div className="table-actions">

                          <button 
                            className="btn-secondary small"
                            onClick={() => onEditFood && onEditFood(food)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn-secondary small btn-delete"
                            onClick={() => handleDeleteClick(food)}
                          >
                            Delete
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

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete "{foodToDelete?.name}"? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete} disabled={loading}>
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FoodManagement;
