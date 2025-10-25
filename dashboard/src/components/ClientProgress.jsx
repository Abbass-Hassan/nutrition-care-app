import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import ErrorMessage from './ErrorMessage';
import { MdTrendingUp, MdRestaurantMenu, MdCheckCircle } from 'react-icons/md';

const ClientProgress = ({ clientId, clientName, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [errorMessage, setErrorMessage] = useState(null);
  const [monthData, setMonthData] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (clientId) {
      loadMonthData();
    }
  }, [clientId, selectedDate]);

  const toLocalISOString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadMonthData = async (monthDate = null) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const dateToUse = monthDate || currentMonth;
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'}/progress/clients/${clientId}?view=month&date=${toLocalISOString(dateToUse)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        const dataMap = {};
        
        // Handle the response format from backend
        let progressArray = [];
        if (responseData.success && responseData.progress) {
          if (Array.isArray(responseData.progress)) {
            progressArray = responseData.progress;
          } else if (responseData.progress) {
            // Single day data
            progressArray = [responseData.progress];
          }
        }
        
        // Map the data by date
        progressArray.forEach(item => {
          if (item && item.date) {
            // Handle different date formats from backend
            let dateKey;
            if (typeof item.date === 'string') {
              // If it's already a string, extract just the date part
              if (item.date.includes('T')) {
                // ISO format: 2025-10-24T00:00:00.000000Z -> 2025-10-24
                dateKey = item.date.split('T')[0];
              } else {
                // Simple date format: 2025-10-24 -> 2025-10-24
                dateKey = item.date.split(' ')[0]; // Remove time part if present
              }
            } else if (item.date instanceof Date) {
              // If it's a Date object, convert to string
              dateKey = toLocalISOString(item.date);
            } else {
              // Fallback: try to parse as date
              dateKey = new Date(item.date).toISOString().split('T')[0];
            }
            
            dataMap[dateKey] = item;
          }
        });
        
        setMonthData(dataMap);
        
        // Load selected day details
        const dateStr = toLocalISOString(selectedDate);
        if (dataMap[dateStr]) {
          setProgressData(dataMap[dateStr]);
        } else {
          setProgressData(null);
        }
      } else {
        const errorData = await response.json();
        setErrorMessage({ 
          message: errorData.message || 'Failed to load progress data', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      setErrorMessage({ message: 'Failed to load progress data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = toLocalISOString(date);
      const progress = monthData[dateStr];
      
      if (progress) {
        return `calendar-tile-${progress.status}`;
      }
    }
    return '';
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const dateStr = toLocalISOString(date);
    if (monthData[dateStr]) {
      setProgressData(monthData[dateStr]);
    } else {
      setProgressData(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return '#10b981'; // Green
      case 'good':
        return '#3b82f6'; // Blue
      case 'needs_attention':
        return '#f59e0b'; // Amber
      case 'poor':
        return '#ef4444'; // Red
      default:
        return '#9ca3af'; // Gray
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'needs_attention':
        return 'Needs Attention';
      case 'poor':
        return 'Poor';
      default:
        return 'No Data';
    }
  };

  if (loading && !progressData) {
    return (
      <div className="progress-loading">
        <div className="loading-spinner"></div>
        <p>Loading progress data...</p>
      </div>
    );
  }

  return (
    <div className="client-progress-page">
      {errorMessage && (
        <ErrorMessage
          message={errorMessage.message}
          type={errorMessage.type}
          onClose={() => setErrorMessage(null)}
        />
      )}

      <div className="progress-header-bar">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="progress-title">
          <h2>{clientName}'s Progress</h2>
          <p className="progress-subtitle">Track daily nutrition and activity</p>
        </div>
      </div>

      <div className="progress-layout">
        {/* Calendar Section */}
        <div className="calendar-section">
          <div className="calendar-container">
            <Calendar
              key={`calendar-${Object.keys(monthData).length}`}
              onChange={handleDateChange}
              value={selectedDate}
              tileClassName={getTileClassName}
              maxDate={new Date()}
              onActiveStartDateChange={({ activeStartDate }) => {
                setCurrentMonth(activeStartDate);
                loadMonthData(activeStartDate);
              }}
            />
            
            <div className="calendar-legend">
              <div className="legend-item">
                <span className="legend-dot excellent"></span>
                <span>Excellent</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot good"></span>
                <span>Good</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot needs-attention"></span>
                <span>Needs Attention</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot poor"></span>
                <span>Poor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="details-section">
          {progressData ? (
            <>
              <div className="detail-header">
                <h3>{selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}</h3>
                <span 
                  className="status-indicator"
                  style={{ backgroundColor: getStatusColor(progressData.status) }}
                >
                  {getStatusLabel(progressData.status)}
                </span>
              </div>

              <div className="compact-stats">
                {/* Main Metrics Row */}
                <div className="main-metrics">
                  <div className="metric-item calories">
                    <div className="metric-icon"><MdTrendingUp /></div>
                    <div className="metric-content">
                      <div className="metric-value">{Math.round(progressData.calories_consumed)}</div>
                      <div className="metric-label">Calories</div>
                      <div className="metric-goal">of {Math.round(progressData.calories_goal || 0)}</div>
                    </div>
                    <div className="metric-progress">
                      <div 
                        className="progress-ring"
                        style={{ 
                          '--progress': `${Math.min((progressData.calories_consumed / (progressData.calories_goal || 1)) * 100, 100)}%`,
                          '--color': getStatusColor(progressData.status)
                        }}
                      >
                        <div className="progress-text">
                          {Math.round((progressData.calories_consumed / (progressData.calories_goal || 1)) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>


                  <div className="metric-item meals">
                    <div className="metric-icon"><MdRestaurantMenu /></div>
                    <div className="metric-content">
                      <div className="metric-value">{progressData.meals_logged}</div>
                      <div className="metric-label">Meals</div>
                      <div className="metric-goal">of 5</div>
                    </div>
                    <div className="metric-progress">
                      <div 
                        className="progress-ring"
                        style={{ 
                          '--progress': `${Math.min((progressData.meals_logged / 5) * 100, 100)}%`,
                          '--color': '#8b5cf6'
                        }}
                      >
                        <div className="progress-text">
                          {Math.round((progressData.meals_logged / 5) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Macros Row */}
                <div className="macros-row">
                  <div className="macro-item">
                    <div className="macro-label">Protein</div>
                    <div className="macro-bar">
                      <div 
                        className="macro-fill"
                        style={{ 
                          width: `${Math.min((progressData.protein_consumed / (progressData.protein_goal || 1)) * 100, 100)}%`,
                          backgroundColor: '#3b82f6'
                        }}
                      ></div>
                    </div>
                    <div className="macro-values">
                      <div className="macro-consumed">{Math.round(progressData.protein_consumed)}g</div>
                      <div className="macro-goal">of {Math.round(progressData.protein_goal || 0)}g</div>
                    </div>
                  </div>

                  <div className="macro-item">
                    <div className="macro-label">Carbs</div>
                    <div className="macro-bar">
                      <div 
                        className="macro-fill"
                        style={{ 
                          width: `${Math.min((progressData.carbs_consumed / (progressData.carbs_goal || 1)) * 100, 100)}%`,
                          backgroundColor: '#f59e0b'
                        }}
                      ></div>
                    </div>
                    <div className="macro-values">
                      <div className="macro-consumed">{Math.round(progressData.carbs_consumed)}g</div>
                      <div className="macro-goal">of {Math.round(progressData.carbs_goal || 0)}g</div>
                    </div>
                  </div>

                  <div className="macro-item">
                    <div className="macro-label">Fat</div>
                    <div className="macro-bar">
                      <div 
                        className="macro-fill"
                        style={{ 
                          width: `${Math.min((progressData.fat_consumed / (progressData.fat_goal || 1)) * 100, 100)}%`,
                          backgroundColor: '#ef4444'
                        }}
                      ></div>
                    </div>
                    <div className="macro-values">
                      <div className="macro-consumed">{Math.round(progressData.fat_consumed)}g</div>
                      <div className="macro-goal">of {Math.round(progressData.fat_goal || 0)}g</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-data">
              <div className="no-data-icon"><MdCheckCircle /></div>
              <p>No data recorded for this date</p>
              <span className="no-data-hint">Select a date with logged data</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientProgress;
