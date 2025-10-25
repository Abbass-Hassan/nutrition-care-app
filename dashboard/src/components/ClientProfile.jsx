import React, { useState, useEffect } from 'react';
import { MdArrowBack, MdEmail, MdPerson, MdDateRange, MdSubscriptions, MdFitnessCenter, MdLocalHospital, MdScience, MdTrendingUp } from 'react-icons/md';
import ErrorMessage from './ErrorMessage';
import { API_BASE } from '../config';

const ClientProfile = ({ clientId, onBack }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetchClientDetails();
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/clients/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setClient(data.client);
      } else {
        const errorData = await response.json();
        setErrorMessage({
          message: errorData.message || 'Failed to load client details. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
      setErrorMessage({
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        type: 'error'
      });
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

  if (errorMessage || !client) {
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
        <div className="client-profile-error">
          <div className="error-message">
            <p>{errorMessage?.message || 'Client not found'}</p>
            <button className="btn-primary" onClick={onBack}>
              Back to Clients
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="client-profile">
      <div className="profile-header">
        <button className="back-button" onClick={onBack}>
          <MdArrowBack className="back-icon" />
          Back to Clients
        </button>
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
              Basic Information
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
              <div className="info-item">
                <label>Subscription Type</label>
                <span className={`subscription-badge ${client.subscription_type || 'paid'}`}>
                  {(client.subscription_type || 'paid').toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {client.profile && (
            <div className="profile-section">
              <h3 className="section-title">
                <MdFitnessCenter className="section-icon" />
                Health & Physical Information
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Age</label>
                  <span>{client.profile.age || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Gender</label>
                  <span>{client.profile.gender ? client.profile.gender.charAt(0).toUpperCase() + client.profile.gender.slice(1) : 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Height</label>
                  <span>{client.profile.height_cm ? `${client.profile.height_cm} cm` : 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Current Weight</label>
                  <span>{client.profile.weight_kg ? `${client.profile.weight_kg} kg` : 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Goal</label>
                  <span>{client.profile.goal ? client.profile.goal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Appetite Level</label>
                  <span>{client.profile.appetite_level ? client.profile.appetite_level.charAt(0).toUpperCase() + client.profile.appetite_level.slice(1) : 'Not provided'}</span>
                </div>
              </div>
              {client.profile.health_conditions && client.profile.health_conditions.length > 0 && (
                <div className="info-item full-width">
                  <label>Health Conditions</label>
                  <div className="health-conditions">
                    {client.profile.health_conditions.map((condition, index) => (
                      <span key={index} className="condition-tag">
                        {condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {client.profile.allergies && (
                <div className="info-item full-width">
                  <label>Allergies</label>
                  <span>{client.profile.allergies}</span>
                </div>
              )}
            </div>
          )}

          {client.measurements && client.measurements.length > 0 && (
            <div className="profile-section">
              <h3 className="section-title">
                <MdTrendingUp className="section-icon" />
                Body Composition
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Initial Weight</label>
                  <span>{client.measurements[0].weight_kg ? `${client.measurements[0].weight_kg} kg` : 'Not measured'}</span>
                </div>
                <div className="info-item">
                  <label>Body Fat %</label>
                  <span>{client.measurements[0].body_fat_percentage ? `${client.measurements[0].body_fat_percentage}%` : 'Not measured'}</span>
                </div>
                <div className="info-item">
                  <label>Muscle %</label>
                  <span>{client.measurements[0].muscle_percentage ? `${client.measurements[0].muscle_percentage}%` : 'Not measured'}</span>
                </div>
                <div className="info-item">
                  <label>Measured On</label>
                  <span>{new Date(client.measurements[0].measured_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>
          )}

          {client.blood_tests && client.blood_tests.length > 0 && (
            <div className="profile-section">
              <h3 className="section-title">
                <MdScience className="section-icon" />
                Blood Test Results
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>HbA1c</label>
                  <span>{client.blood_tests[0].hba1c ? `${client.blood_tests[0].hba1c}%` : 'Not tested'}</span>
                </div>
                <div className="info-item">
                  <label>LDL Cholesterol</label>
                  <span>{client.blood_tests[0].ldl ? `${client.blood_tests[0].ldl} mg/dL` : 'Not tested'}</span>
                </div>
                <div className="info-item">
                  <label>HDL Cholesterol</label>
                  <span>{client.blood_tests[0].hdl ? `${client.blood_tests[0].hdl} mg/dL` : 'Not tested'}</span>
                </div>
                <div className="info-item">
                  <label>Total Cholesterol</label>
                  <span>{client.blood_tests[0].total_cholesterol ? `${client.blood_tests[0].total_cholesterol} mg/dL` : 'Not tested'}</span>
                </div>
                <div className="info-item">
                  <label>Fasting Blood Sugar</label>
                  <span>{client.blood_tests[0].fasting_blood_sugar ? `${client.blood_tests[0].fasting_blood_sugar} mg/dL` : 'Not tested'}</span>
                </div>
                <div className="info-item">
                  <label>Triglycerides</label>
                  <span>{client.blood_tests[0].triglycerides ? `${client.blood_tests[0].triglycerides} mg/dL` : 'Not tested'}</span>
                </div>
                <div className="info-item">
                  <label>Tested On</label>
                  <span>{new Date(client.blood_tests[0].tested_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>
          )}

          {client.active_nutrition_target && (
            <div className="profile-section">
              <h3 className="section-title">
                <MdTrendingUp className="section-icon" />
                Nutrition Targets
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Daily Calorie Target</label>
                  <span>{client.active_nutrition_target.daily_calorie_target ? `${client.active_nutrition_target.daily_calorie_target} kcal` : 'Not set'}</span>
                </div>
                <div className="info-item">
                  <label>Protein Target</label>
                  <span>{client.active_nutrition_target.protein_target ? `${client.active_nutrition_target.protein_target} g` : 'Not set'}</span>
                </div>
                <div className="info-item">
                  <label>Carbs Target</label>
                  <span>{client.active_nutrition_target.carbs_target ? `${client.active_nutrition_target.carbs_target} g` : 'Not set'}</span>
                </div>
                <div className="info-item">
                  <label>Fat Target</label>
                  <span>{client.active_nutrition_target.fat_target ? `${client.active_nutrition_target.fat_target} g` : 'Not set'}</span>
                </div>
                <div className="info-item">
                  <label>Tolerance Band</label>
                  <span>{client.active_nutrition_target.tolerance_band ? `±${client.active_nutrition_target.tolerance_band}%` : 'Not set'}</span>
                </div>
                <div className="info-item">
                  <label>Set On</label>
                  <span>{new Date(client.active_nutrition_target.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
              {client.active_nutrition_target.notes && (
                <div className="info-item full-width">
                  <label>Target Notes</label>
                  <span>{client.active_nutrition_target.notes}</span>
                </div>
              )}
            </div>
          )}

          <div className="profile-section">
            <h3 className="section-title">
              <MdDateRange className="section-icon" />
              Account Information
            </h3>
            <div className="info-grid">
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
        </div>
      </div>
    </div>
  );
};

export default ClientProfile; 