import React, { useState } from 'react';
import { MdArrowBack, MdSave, MdCancel } from 'react-icons/md';
import Notification from './Notification';

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
  const [notification, setNotification] = useState(null);

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
      setFormData(prev => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('_method', 'PUT');      formDataToSend.append('category', formData.category);
      formDataToSend.append('default_serving', formData.default_serving);
      formDataToSend.append('calories', formData.calories);
      console.log('Sending data:', {
        calories: formData.calories,
        carbs: formData.carbs,
        protein: formData.protein,
        fat: formData.fat
      });      formDataToSend.append('carbs', formData.carbs || '');
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
        setNotification({
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
        setNotification({
          message: data.message || 'Failed to update food information',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating food:', error);
      setNotification({
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
      formData.notes !== (food.notes || '') ||
      formData.photo !== null
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
            Back to Foods
          </button>
          <h1 className="page-title">Edit Food Information</h1>
        </div>

        <div className="create-client-full-page">
          <div className="client-summary">
            <div className="client-avatar">
              {food.photo_url ? (
                <img 
                  src={food.photo_url} 
                  alt={food.name}
                  className="food-avatar-image"
                />
              ) : (
                <span>🍎</span>
              )}
            </div>
            <div className="client-details">
              <h3>{food.name}</h3>
              <p>{food.category}</p>
              <small>Food ID: {food.id}</small>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="client-form-page">
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
                    placeholder="Enter food name"
                    required
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

export default FoodEdit;
