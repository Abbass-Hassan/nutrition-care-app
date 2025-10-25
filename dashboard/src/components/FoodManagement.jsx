import React, { useState, useEffect } from 'react';
import { MdRestaurant } from 'react-icons/md';
import ErrorMessage from './ErrorMessage';
import { API_BASE } from '../config';

const FoodManagement = ({ onStatsUpdate, onCreateFood, onViewFood, onEditFood, viewMode = 'list', onBack }) => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
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
      const response = await fetch(`${API_BASE}/foods`, {
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
        setErrorMessage({
          message: errorData.message || 'Failed to load foods. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
      setErrorMessage({
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
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
    } else if (viewMode === 'create') {
      // Reset form data when switching to create mode
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
    }
  }, [viewMode]);

  // Cleanup photo preview URL on unmount
  useEffect(() => {
    return () => {
      if (formData.photoPreview) {
        URL.revokeObjectURL(formData.photoPreview);
      }
    };
  }, [formData.photoPreview]);

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
      // Clean up previous preview URL to prevent memory leaks
      if (formData.photoPreview) {
        URL.revokeObjectURL(formData.photoPreview);
      }
      
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        photo: file,
        photoPreview: previewUrl
      }));
    }
  };

  const handleCreateFood = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

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

      const response = await fetch(`${API_BASE}/foods`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (response.ok) {
        setErrorMessage({
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
          : data.message || 'Failed to create food. Please check all required fields.';
        setErrorMessage({
          message,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating food:', error);
      setErrorMessage({
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
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
        <ErrorMessage 
          message={errorMessage?.message} 
          type={errorMessage?.type} 
          show={!!errorMessage}
          onClose={() => setErrorMessage(null)}
          autoClose={true}
          duration={6000}
        />
        
        <div className="food-create-container">
          <div className="food-create-header">
            <button 
              className="back-btn"
              onClick={onBack}
              disabled={loading}
            >
              ← Back to Foods
            </button>
            <h1>Add New Food</h1>
            <p>Create a new food item for your nutrition database</p>
          </div>

          <form onSubmit={handleCreateFood} className="food-create-form">
            <div className="form-grid">
              {/* Basic Information */}
              <div className="form-card">
                <div className="form-card-header">
                  <h3>Basic Information</h3>
                </div>
                <div className="form-card-content">
                  <div className="form-group">
                    <label htmlFor="name">Food Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Grilled Chicken Breast"
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

              {/* Nutritional Information */}
              <div className="form-card">
                <div className="form-card-header">
                  <h3>Nutritional Information</h3>
                </div>
                <div className="form-card-content">
                  <div className="nutrition-grid">
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
                        placeholder="0"
                        required
                        disabled={loading}
                      />
                    </div>
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
                        placeholder="0"
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
                        placeholder="0"
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
                        placeholder="0"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="form-card">
                <div className="form-card-header">
                  <h3>Photo</h3>
                </div>
                <div className="form-card-content">
                  <div className="photo-upload-section">
                    <div className="photo-upload-area">
                      <input
                        type="file"
                        id="photo"
                        name="photo"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        disabled={loading}
                        className="photo-input"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="photo" className="photo-upload-label">
                        {formData.photoPreview && formData.photoPreview.startsWith('blob:') ? (
                          <img 
                            src={formData.photoPreview} 
                            alt="Food preview" 
                            className="photo-preview"
                          />
                        ) : (
                          <div className="photo-placeholder">
                            <MdRestaurant size={32} />
                            <span>Click to upload photo</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="form-card">
                <div className="form-card-header">
                  <h3>Additional Notes</h3>
                </div>
                <div className="form-card-content">
                  <div className="form-group">
                    <label htmlFor="notes">Notes</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Any additional information about this food..."
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
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

  // Render foods list
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
      
      <div className="food-management-container">
        <div className="food-header">
          <div className="food-header-content">
            <h1>Food Management</h1>
            <p>Manage your nutrition database</p>
          </div>
          <button 
            className="btn-primary"
            onClick={onCreateFood}
          >
            <MdRestaurant size={20} />
            Add New Food
          </button>
        </div>

        <div className="food-content">
          {loading ? (
            <div className="food-loading">
              <div className="loading-spinner"></div>
              <p>Loading foods...</p>
            </div>
          ) : foods.length === 0 ? (
            <div className="food-empty-state">
              <div className="empty-icon">
                <MdRestaurant size={48} />
              </div>
              <h3>No foods yet</h3>
              <p>Create your first food item to get started with your nutrition database.</p>
              <button 
                className="btn-primary"
                onClick={onCreateFood}
              >
                <MdRestaurant size={20} />
                Add Your First Food
              </button>
            </div>
          ) : (
            <div className="food-grid">
              {foods.map((food) => (
                <div key={food.id} className="food-card">
                  <div className="food-card-header">
                    <div className="food-photo">
                      {food.photo_url ? (
                        <img 
                          src={food.photo_url} 
                          alt={food.name}
                          className="food-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="food-photo-placeholder" style={{display: food.photo_url ? 'none' : 'flex'}}>
                        <MdRestaurant size={24} />
                      </div>
                    </div>
                    <div className="food-category">
                      <span className={`category-tag ${food.category.toLowerCase().replace('/', '-')}`}>
                        {food.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="food-card-body">
                    <h3 className="food-name">{food.name}</h3>
                    <p className="food-serving">{food.default_serving}</p>
                    
                    <div className="food-nutrition">
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
                  
                  <div className="food-card-actions">
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => onEditFood && onEditFood(food)}
                      title="Edit Food"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteClick(food)}
                      title="Delete Food"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="confirmation-overlay">
          <div className="confirmation-panel">
            <div className="confirmation-header">
              <div className="warning-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3>Delete Food</h3>
            </div>
            <div className="confirmation-body">
              <p className="warning-text">
                Are you sure you want to delete <strong>"{foodToDelete?.name}"</strong>? 
                This action cannot be undone and will remove the food from your database.
              </p>
            </div>
            <div className="confirmation-actions">
              <button className="btn-cancel" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn-delete" onClick={confirmDelete} disabled={loading}>
                {loading ? 'Deleting...' : 'Delete Food'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FoodManagement;
