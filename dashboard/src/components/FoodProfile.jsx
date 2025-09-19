import React, { useState, useEffect } from 'react';
import { MdArrowBack, MdEdit, MdRestaurant, MdCategory, MdScale, MdLocalFireDepartment, MdFitnessCenter } from 'react-icons/md';

const FoodProfile = ({ foodId, onBack, onEdit }) => {
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFoodDetails();
  }, [foodId]);

  const fetchFoodDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/foods/${foodId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFood(data);
      } else {
        setError('Failed to load food details');
      }
    } catch (error) {
      console.error('Error fetching food details:', error);
      setError('Failed to load food details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="client-profile-loading">
        <div className="loading-spinner">Loading food details...</div>
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="client-profile-error">
        <div className="error-message">
          <p>{error || 'Food not found'}</p>
          <button className="btn-primary" onClick={onBack}>
            Back to Foods
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
          Back to Foods
        </button>
        <div className="profile-actions">
          <button className="btn-primary" onClick={() => onEdit(food)}>
            <MdEdit className="edit-icon" />
            Edit Food
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="client-header">
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
          <div className="client-info">
            <h1 className="client-name">{food.name}</h1>
            <p className="client-username">{food.category}</p>
          </div>
        </div>

        <div className="profile-sections">
          <div className="profile-section">
            <h3 className="section-title">
              <MdRestaurant className="section-icon" />
              Food Information
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Food Name</label>
                <span>{food.name}</span>
              </div>
              <div className="info-item">
                <label>Category</label>
                <span className={`category-badge ${food.category.toLowerCase().replace('/', '-')}`}>
                  {food.category}
                </span>
              </div>
              <div className="info-item">
                <label>Default Serving</label>
                <span>{food.default_serving}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3 className="section-title">
              <MdLocalFireDepartment className="section-icon" />
              Nutritional Information
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Calories</label>
                <span>{food.calories} cal</span>
              </div>
              <div className="info-item">
                <label>Carbohydrates</label>
                <span>{food.carbs || 0}g</span>
              </div>
              <div className="info-item">
                <label>Protein</label>
                <span>{food.protein || 0}g</span>
              </div>
              <div className="info-item">
                <label>Fat</label>
                <span>{food.fat || 0}g</span>
              </div>
            </div>
          </div>

          {food.notes && (
            <div className="profile-section">
              <h3 className="section-title">
                <MdFitnessCenter className="section-icon" />
                Additional Notes
              </h3>
              <div className="notes-content">
                <p>{food.notes}</p>
              </div>
            </div>
          )}

          <div className="profile-section">
            <h3 className="section-title">
              <MdScale className="section-icon" />
              Food Details
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Created</label>
                <span>{new Date(food.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="info-item">
                <label>Last Updated</label>
                <span>{new Date(food.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodProfile;
