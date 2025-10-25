import React, { useState } from 'react';
import { MdArrowBack, MdSave, MdCancel, MdRestaurant } from 'react-icons/md';
import ErrorMessage from './ErrorMessage';

const FoodEdit = ({ food, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    name: food.name || '',
    category: food.category || 'Meat',
    default_serving: food.default_serving || '',
    calories: food.calories || '',
    carbs: food.carbs || '',
    protein: food.protein || '',
    fat: food.fat || '',
    notes: food.notes || '',
    photo: null,
    photoPreview: food.photo_url || null
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const categories = [
    'Meat', 'Fruit', 'Vegetables', 'Dairy', 'Grains', 
    'Nuts/Seeds', 'Oils', 'Drinks', 'Sweets', 'Other'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clean up previous preview URL to prevent memory leaks
      if (formData.photoPreview && formData.photoPreview.startsWith('blob:')) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('_method', 'PUT');
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

      const response = await fetch(`http://localhost:8000/api/foods/${food.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        setErrorMessage({
          message: 'Food information updated successfully!',
          type: 'success'
        });
        
        // Call onSave callback with updated food data
        if (onSave) {
          onSave({
            ...food,
            ...data,
            name: formData.name,
            category: formData.category,
            default_serving: formData.default_serving,
            calories: formData.calories,
            carbs: formData.carbs,
            protein: formData.protein,
            fat: formData.fat,
            notes: formData.notes,
            photo_url: formData.photoPreview
          });
        }
        
        // Auto-redirect after success
        setTimeout(() => {
          onBack();
        }, 2000);
      } else {
        setErrorMessage({
          message: data.message || 'Failed to update food information',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating food:', error);
      setErrorMessage({
        message: 'Failed to update food information. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return (
      formData.name !== food.name ||
      formData.category !== food.category ||
      formData.default_serving !== food.default_serving ||
      formData.calories !== food.calories ||
      formData.carbs !== (food.carbs || '') ||
      formData.protein !== (food.protein || '') ||
      formData.fat !== (food.fat || '') ||
      formData.notes !== (food.notes || '') ||
      formData.photo !== null
    );
  };

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
      
      <div className="food-create-container">
        <div className="food-create-header">
          <button 
            className="back-btn"
            onClick={onBack}
            disabled={loading}
          >
            ← Back to Foods
          </button>
          <h1>Edit Food Information</h1>
          <p>Update the food item details in your nutrition database</p>
        </div>

        <form onSubmit={handleSubmit} className="food-create-form">
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
                    placeholder="Enter food name"
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
            </div>

            {/* Photo */}
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

            {/* Additional Notes */}
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
                    rows="4"
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
              disabled={loading || !hasChanges()}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default FoodEdit;
