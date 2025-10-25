import React, { useState, useEffect, useRef } from 'react';
import { MdArrowBack, MdSave, MdCancel, MdClose } from 'react-icons/md';
import ErrorMessage from './ErrorMessage';

const MultiSelectDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemoveTag = (e, optionValue) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  const getSelectedLabels = () => {
    return value.map(v => options.find(o => o.value === v)?.label || v);
  };

  return (
    <div className="multi-select-dropdown" ref={dropdownRef}>
      <div 
        className={`multi-select-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ flex: 1 }}>
          {value.length === 0 ? (
            <span className="multi-select-placeholder">{placeholder}</span>
          ) : (
            <div className="multi-select-values">
              {getSelectedLabels().map((label, index) => (
                <span key={index} className="multi-select-tag">
                  {label}
                  <span 
                    className="multi-select-tag-remove"
                    onClick={(e) => handleRemoveTag(e, value[index])}
                  >
                    <MdClose size={14} />
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
        <span className={`multi-select-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div className="multi-select-dropdown-menu">
          {options.map(option => (
            <div key={option.value} className="multi-select-option">
              <input
                type="checkbox"
                id={`option-${option.value}`}
                checked={value.includes(option.value)}
                onChange={() => handleToggle(option.value)}
              />
              <label htmlFor={`option-${option.value}`}>
                {option.label}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ClientEdit = ({ client, onBack, onSave }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    // Basic Account Information
    name: '',
    email: '',
    subscription_type: 'paid',
    
    // Personal & Health Information
    age: '',
    gender: '',
    height_cm: '',
    current_weight_kg: '',
    goal: '',
    health_conditions: [],
    allergies: '',
    dietary_history_questions: {},
    body_goal_questions: {},
    appetite_level: '',
    
    // Initial Measurements
    initial_weight_kg: '',
    body_fat_percentage: '',
    muscle_percentage: '',
    other_composition_indicators: {},
    
    // Blood Test Indicators
    hba1c: '',
    ldl: '',
    hdl: '',
    total_cholesterol: '',
    fasting_blood_sugar: '',
    triglycerides: '',
    blood_test_photo: null,
    
    // Nutrition Targets
    daily_calorie_target: '',
    carbs_target_grams: '',
    protein_target_grams: '',
    fat_target_grams: '',
    carbs_target_percentage: '',
    protein_target_percentage: '',
    fat_target_percentage: '',
    tolerance_band_percentage: '10',
    target_notes: '',
  });

  // Health conditions options
  const healthConditionsOptions = [
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'high_bp', label: 'High Blood Pressure' },
    { value: 'heart_disease', label: 'Heart Disease' },
    { value: 'kidney_disease', label: 'Kidney Disease' },
    { value: 'liver_disease', label: 'Liver Disease' },
    { value: 'thyroid_disorder', label: 'Thyroid Disorder' },
    { value: 'allergies', label: 'Allergies' },
    { value: 'asthma', label: 'Asthma' },
    { value: 'arthritis', label: 'Arthritis' },
    { value: 'depression', label: 'Depression' },
    { value: 'anxiety', label: 'Anxiety' },
    { value: 'other', label: 'Other' }
  ];

  // Initialize form data when client changes
  useEffect(() => {
    if (client) {
    setFormData({
        // Basic Account Information
        name: client.name || '',
        email: client.email || '',
        subscription_type: client.subscription_type || 'paid',
        
        // Personal & Health Information
        age: client.profile?.age || '',
        gender: client.profile?.gender || '',
        height_cm: client.profile?.height_cm || '',
        current_weight_kg: client.profile?.weight_kg || '',
        goal: client.profile?.goal || '',
        health_conditions: client.profile?.health_conditions || [],
        allergies: client.profile?.allergies || '',
        dietary_history_questions: client.profile?.dietary_history_questions || {},
        body_goal_questions: client.profile?.body_goal_questions || {},
        appetite_level: client.profile?.appetite_level || '',
        
        // Initial Measurements
        initial_weight_kg: client.measurements?.[0]?.weight_kg || '',
        body_fat_percentage: client.measurements?.[0]?.body_fat_percentage || '',
        muscle_percentage: client.measurements?.[0]?.muscle_percentage || '',
        other_composition_indicators: client.measurements?.[0]?.other_composition_indicators || {},
        
        // Blood Test Indicators
        hba1c: client.blood_tests?.[0]?.hba1c || '',
        ldl: client.blood_tests?.[0]?.ldl || '',
        hdl: client.blood_tests?.[0]?.hdl || '',
        total_cholesterol: client.blood_tests?.[0]?.total_cholesterol || '',
        fasting_blood_sugar: client.blood_tests?.[0]?.fasting_blood_sugar || '',
        triglycerides: client.blood_tests?.[0]?.triglycerides || '',
        blood_test_photo: null,
        
        // Nutrition Targets
        daily_calorie_target: client.active_nutrition_target?.daily_calorie_target || '',
        carbs_target_grams: client.active_nutrition_target?.carbs_target || '',
        protein_target_grams: client.active_nutrition_target?.protein_target || '',
        fat_target_grams: client.active_nutrition_target?.fat_target || '',
        carbs_target_percentage: client.active_nutrition_target?.carbs_percentage || '',
        protein_target_percentage: client.active_nutrition_target?.protein_percentage || '',
        fat_target_percentage: client.active_nutrition_target?.fat_percentage || '',
        tolerance_band_percentage: client.active_nutrition_target?.tolerance_band || '10',
        target_notes: client.active_nutrition_target?.notes || '',
      });
    }
  }, [client]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing (UX best practice)
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleHealthConditionChange = (value) => {
    setFormData(prev => ({
      ...prev,
      health_conditions: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        blood_test_photo: file
      }));
    }
  };

  const handlePhotoUpload = (field, file) => {
    if (file) {
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  const removePhoto = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: null
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Function to determine which step contains a specific field
  const getStepForField = (fieldName) => {
    const stepFields = {
      1: ['name', 'email', 'subscription_type'],
      2: ['age', 'gender', 'height_cm', 'current_weight_kg', 'goal', 'health_conditions', 'allergies', 'appetite_level'],
      3: ['initial_weight_kg', 'body_fat_percentage', 'muscle_percentage', 'other_composition_indicators'],
      4: ['hba1c', 'ldl', 'hdl', 'total_cholesterol', 'fasting_blood_sugar', 'triglycerides', 'blood_test_photo'],
      5: ['daily_calorie_target', 'carbs_target_grams', 'protein_target_grams', 'fat_target_grams', 'carbs_target_percentage', 'protein_target_percentage', 'fat_target_percentage', 'tolerance_band_percentage', 'target_notes']
    };
    
    for (const [step, fields] of Object.entries(stepFields)) {
      if (fields.includes(fieldName)) {
        return parseInt(step);
      }
    }
    return 1; // Default to step 1 if field not found
  };

  const hasChanges = () => {
    // Check if any meaningful changes have been made
    const originalData = {
      name: client.name || '',
      email: client.email || '',
      subscription_type: client.subscription_type || 'paid',
      age: client.profile?.age || '',
      gender: client.profile?.gender || '',
      height_cm: client.profile?.height_cm || '',
      current_weight_kg: client.profile?.weight_kg || '',
      goal: client.profile?.goal || '',
      health_conditions: client.profile?.health_conditions || [],
      allergies: client.profile?.allergies || '',
      appetite_level: client.profile?.appetite_level || '',
      initial_weight_kg: client.measurements?.[0]?.weight_kg || '',
      body_fat_percentage: client.measurements?.[0]?.body_fat_percentage || '',
      muscle_percentage: client.measurements?.[0]?.muscle_percentage || '',
      hba1c: client.blood_tests?.[0]?.hba1c || '',
      ldl: client.blood_tests?.[0]?.ldl || '',
      hdl: client.blood_tests?.[0]?.hdl || '',
      total_cholesterol: client.blood_tests?.[0]?.total_cholesterol || '',
      fasting_blood_sugar: client.blood_tests?.[0]?.fasting_blood_sugar || '',
      triglycerides: client.blood_tests?.[0]?.triglycerides || '',
      daily_calorie_target: client.active_nutrition_target?.daily_calorie_target || '',
      carbs_target_grams: client.active_nutrition_target?.carbs_target || '',
      protein_target_grams: client.active_nutrition_target?.protein_target || '',
      fat_target_grams: client.active_nutrition_target?.fat_target || '',
      tolerance_band_percentage: client.active_nutrition_target?.tolerance_band || '10',
      target_notes: client.active_nutrition_target?.notes || '',
    };

    // Compare current form data with original data
    for (const key in originalData) {
      if (formData[key] !== originalData[key]) {
        return true;
      }
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if there are any changes
    if (!hasChanges()) {
      setErrorMessage({
        message: 'No changes detected. Please make changes before saving.',
        type: 'warning'
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Clean data to ensure proper types
      const dataToSend = {
        ...formData,
        health_conditions: formData.health_conditions.map(c => String(c)),
        dietary_history_questions: Array.isArray(formData.dietary_history_questions) ? formData.dietary_history_questions : [],
        body_goal_questions: Array.isArray(formData.body_goal_questions) ? formData.body_goal_questions : [],
        other_composition_indicators: Array.isArray(formData.other_composition_indicators) ? formData.other_composition_indicators : []
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'}/clients/${client.id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (data.success) {
        setErrorMessage({
          message: 'Client information updated successfully!',
          type: 'success'
        });
        
        // Call onSave callback with updated client data
        if (onSave) {
          onSave(data.client);
        }
        
        // Auto-redirect after success
        setTimeout(() => {
          onBack();
        }, 2000);
      } else {
        if (data.errors) {
          // Convert array errors to strings for display
          const processedErrors = {};
          Object.keys(data.errors).forEach(key => {
            if (Array.isArray(data.errors[key])) {
              processedErrors[key] = data.errors[key][0]; // Take first error message
            } else {
              processedErrors[key] = data.errors[key];
            }
          });
          setErrors(processedErrors);
          
          // Auto-navigate to the step with the first error
          const errorFields = Object.keys(processedErrors);
          if (errorFields.length > 0) {
            const firstErrorField = errorFields[0];
            const stepWithError = getStepForField(firstErrorField);
            if (stepWithError && stepWithError !== currentStep) {
              setCurrentStep(stepWithError);
              // Show error message about auto-navigation
              setErrorMessage({
                message: `Please fix the validation errors on step ${stepWithError}`,
                type: 'warning'
              });
            }
          }
        } else {
          setErrorMessage({
            message: data.message || 'Failed to update client information',
            type: 'error'
          });
        }
      }
    } catch (error) {
      console.error('Error updating client:', error);
      setErrorMessage({
        message: 'Failed to update client information. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="step-content">
      <h3>Basic Account Information</h3>
      <div className="form-row">
        <div className={`form-group ${errors.name ? 'error' : ''}`}>
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            className={`form-input ${errors.name ? 'error' : ''}`}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter client's full name"
            required
          />
          {errors.name && <span className="error-text">{Array.isArray(errors.name) ? errors.name[0] : errors.name}</span>}
        </div>
        <div className={`form-group ${errors.email ? 'error' : ''}`}>
          <label htmlFor="email">Email (Optional)</label>
          <input
            type="email"
            id="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Client's email address"
          />
          {errors.email && <span className="error-text">{Array.isArray(errors.email) ? errors.email[0] : errors.email}</span>}
        </div>
        <div className={`form-group ${errors.subscription_type ? 'error' : ''}`}>
          <label htmlFor="subscription_type">Subscription Type *</label>
          <select
            id="subscription_type"
            className={`form-select ${errors.subscription_type ? 'error' : ''}`}
            value={formData.subscription_type}
            onChange={(e) => handleInputChange('subscription_type', e.target.value)}
            required
          >
            <option value="paid">Paid</option>
            <option value="free">Free</option>
          </select>
          {errors.subscription_type && <span className="error-text">{Array.isArray(errors.subscription_type) ? errors.subscription_type[0] : errors.subscription_type}</span>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <h3>Personal & Health Information</h3>
      <div className="form-row">
        <div className={`form-group ${errors.age ? 'error' : ''}`}>
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            className={`form-input ${errors.age ? 'error' : ''}`}
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            placeholder="Age in years"
            min="1"
            max="120"
          />
          {errors.age && <span className="error-text">{Array.isArray(errors.age) ? errors.age[0] : errors.age}</span>}
        </div>
        <div className={`form-group ${errors.gender ? 'error' : ''}`}>
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            className={`form-select ${errors.gender ? 'error' : ''}`}
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <span className="error-text">{Array.isArray(errors.gender) ? errors.gender[0] : errors.gender}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="height_cm">Height (cm)</label>
          <input
            type="number"
            id="height_cm"
            className={`form-input ${errors.height_cm ? 'error' : ''}`}
            value={formData.height_cm}
            onChange={(e) => handleInputChange('height_cm', e.target.value)}
            placeholder="Height in centimeters"
            min="50"
            max="300"
          />
          {errors.height_cm && <div className="error-message">{errors.height_cm}</div>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="current_weight_kg">Current Weight (kg)</label>
          <input
            type="number"
            id="current_weight_kg"
            className={`form-input ${errors.current_weight_kg ? 'error' : ''}`}
            value={formData.current_weight_kg}
            onChange={(e) => handleInputChange('current_weight_kg', e.target.value)}
            placeholder="Current weight in kilograms"
            min="20"
            max="500"
          />
          {errors.current_weight_kg && <div className="error-message">{errors.current_weight_kg}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="goal">Goal</label>
          <select
            id="goal"
            className={`form-select ${errors.goal ? 'error' : ''}`}
            value={formData.goal}
            onChange={(e) => handleInputChange('goal', e.target.value)}
          >
            <option value="">Select Goal</option>
            <option value="lose_weight">Lose Weight</option>
            <option value="maintain">Maintain Weight</option>
            <option value="gain_weight">Gain Weight</option>
            <option value="gain_muscle">Gain Muscle</option>
          </select>
          {errors.goal && <div className="error-message">{errors.goal}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="appetite_level">Appetite Level</label>
          <select
            id="appetite_level"
            className={`form-select ${errors.appetite_level ? 'error' : ''}`}
            value={formData.appetite_level}
            onChange={(e) => handleInputChange('appetite_level', e.target.value)}
          >
            <option value="">Select Appetite Level</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {errors.appetite_level && <div className="error-message">{errors.appetite_level}</div>}
        </div>
      </div>
      <div className="form-group">
        <label>Health Conditions</label>
        <MultiSelectDropdown
          options={healthConditionsOptions}
          value={formData.health_conditions}
          onChange={handleHealthConditionChange}
          placeholder="Select health conditions..."
        />
        {errors.health_conditions && <div className="error-message">{errors.health_conditions}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="allergies">Allergies</label>
        <textarea
          id="allergies"
          className={`form-textarea ${errors.allergies ? 'error' : ''}`}
          value={formData.allergies}
          onChange={(e) => handleInputChange('allergies', e.target.value)}
          placeholder="List any allergies or food sensitivities"
          rows="3"
        />
        {errors.allergies && <div className="error-message">{errors.allergies}</div>}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <h3>Initial Measurements (Optional)</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="initial_weight_kg">Initial Weight (kg)</label>
          <input
            type="number"
            id="initial_weight_kg"
            className={`form-input ${errors.initial_weight_kg ? 'error' : ''}`}
            value={formData.initial_weight_kg}
            onChange={(e) => handleInputChange('initial_weight_kg', e.target.value)}
            placeholder="Initial weight measurement"
            min="20"
            max="500"
          />
          {errors.initial_weight_kg && <div className="error-message">{errors.initial_weight_kg}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="body_fat_percentage">Body Fat %</label>
          <input
            type="number"
            id="body_fat_percentage"
            className={`form-input ${errors.body_fat_percentage ? 'error' : ''}`}
            value={formData.body_fat_percentage}
            onChange={(e) => handleInputChange('body_fat_percentage', e.target.value)}
            placeholder="Body fat percentage"
            min="0"
            max="100"
            step="0.1"
          />
          {errors.body_fat_percentage && <div className="error-message">{errors.body_fat_percentage}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="muscle_percentage">Muscle %</label>
          <input
            type="number"
            id="muscle_percentage"
            className={`form-input ${errors.muscle_percentage ? 'error' : ''}`}
            value={formData.muscle_percentage}
            onChange={(e) => handleInputChange('muscle_percentage', e.target.value)}
            placeholder="Muscle percentage"
            min="0"
            max="100"
            step="0.1"
          />
          {errors.muscle_percentage && <div className="error-message">{errors.muscle_percentage}</div>}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="step-content">
      <h3>Blood Test Indicators (Optional)</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="hba1c">HbA1c</label>
          <input
            type="number"
            id="hba1c"
            className={`form-input ${errors.hba1c ? 'error' : ''}`}
            value={formData.hba1c}
            onChange={(e) => handleInputChange('hba1c', e.target.value)}
            placeholder="HbA1c level"
            min="0"
            max="20"
            step="0.1"
          />
          {errors.hba1c && <div className="error-message">{errors.hba1c}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="ldl">LDL</label>
          <input
            type="number"
            id="ldl"
            className={`form-input ${errors.ldl ? 'error' : ''}`}
            value={formData.ldl}
            onChange={(e) => handleInputChange('ldl', e.target.value)}
            placeholder="LDL cholesterol"
            min="0"
            max="500"
          />
          {errors.ldl && <div className="error-message">{errors.ldl}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="hdl">HDL</label>
          <input
            type="number"
            id="hdl"
            className={`form-input ${errors.hdl ? 'error' : ''}`}
            value={formData.hdl}
            onChange={(e) => handleInputChange('hdl', e.target.value)}
            placeholder="HDL cholesterol"
            min="0"
            max="200"
          />
          {errors.hdl && <div className="error-message">{errors.hdl}</div>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="total_cholesterol">Total Cholesterol</label>
          <input
            type="number"
            id="total_cholesterol"
            className={`form-input ${errors.total_cholesterol ? 'error' : ''}`}
            value={formData.total_cholesterol}
            onChange={(e) => handleInputChange('total_cholesterol', e.target.value)}
            placeholder="Total cholesterol"
            min="0"
            max="1000"
          />
          {errors.total_cholesterol && <div className="error-message">{errors.total_cholesterol}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="fasting_blood_sugar">Fasting Blood Sugar</label>
          <input
            type="number"
            id="fasting_blood_sugar"
            className={`form-input ${errors.fasting_blood_sugar ? 'error' : ''}`}
            value={formData.fasting_blood_sugar}
            onChange={(e) => handleInputChange('fasting_blood_sugar', e.target.value)}
            placeholder="Fasting blood sugar"
            min="0"
            max="1000"
          />
          {errors.fasting_blood_sugar && <div className="error-message">{errors.fasting_blood_sugar}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="triglycerides">Triglycerides</label>
          <input
            type="number"
            id="triglycerides"
            className={`form-input ${errors.triglycerides ? 'error' : ''}`}
            value={formData.triglycerides}
            onChange={(e) => handleInputChange('triglycerides', e.target.value)}
            placeholder="Triglycerides"
            min="0"
            max="2000"
          />
          {errors.triglycerides && <div className="error-message">{errors.triglycerides}</div>}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="blood_test_photo">Blood Test Photo</label>
        <div className="photo-upload-container">
          <div 
            className="photo-upload-area"
            onClick={() => document.getElementById('blood_test_photo').click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('dragover');
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('dragover');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('dragover');
              const file = e.dataTransfer.files[0];
              if (file && file.type.startsWith('image/')) {
                handlePhotoUpload('blood_test_photo', file);
              }
            }}
          >
            {formData.blood_test_photo ? (
              <div className="photo-preview">
                <img 
                  src={URL.createObjectURL(formData.blood_test_photo)} 
                  alt="Blood test preview" 
                />
                <button 
                  type="button"
                  className="photo-remove-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto('blood_test_photo');
                  }}
                >
                  <i className="fas fa-trash"></i> Remove Photo
                </button>
              </div>
            ) : (
              <>
                <div className="photo-upload-icon">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <div className="photo-upload-text">Upload Blood Test Photo</div>
                <div className="photo-upload-subtext">
                  Drag & drop an image here, or click to browse
                </div>
                <button 
                  type="button"
                  className="photo-upload-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('blood_test_photo').click();
                  }}
                >
                  <i className="fas fa-plus"></i>
                  Choose File
                </button>
              </>
            )}
            <input
              type="file"
              id="blood_test_photo"
              accept="image/*"
              onChange={(e) => handlePhotoUpload('blood_test_photo', e.target.files[0])}
              className="photo-upload-input"
            />
          </div>
        </div>
        <small>Upload a photo of blood test results (optional)</small>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="step-content">
      <h3>Nutrition Targets</h3>
      <div className="nutrition-targets">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="daily_calorie_target">Daily Calorie Target</label>
            <input
              type="number"
              id="daily_calorie_target"
              className={`form-input ${errors.daily_calorie_target ? 'error' : ''}`}
              value={formData.daily_calorie_target}
              onChange={(e) => handleInputChange('daily_calorie_target', e.target.value)}
              placeholder="Daily calorie target"
              min="500"
              max="10000"
            />
            {errors.daily_calorie_target && <div className="error-message">{errors.daily_calorie_target}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="carbs_target_grams">Carbs Target (grams)</label>
            <input
              type="number"
              id="carbs_target_grams"
              className={`form-input ${errors.carbs_target_grams ? 'error' : ''}`}
              value={formData.carbs_target_grams}
              onChange={(e) => handleInputChange('carbs_target_grams', e.target.value)}
              placeholder="Carbohydrates in grams"
              min="0"
              max="1000"
            />
            {errors.carbs_target_grams && <div className="error-message">{errors.carbs_target_grams}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="protein_target_grams">Protein Target (grams)</label>
            <input
              type="number"
              id="protein_target_grams"
              className={`form-input ${errors.protein_target_grams ? 'error' : ''}`}
              value={formData.protein_target_grams}
              onChange={(e) => handleInputChange('protein_target_grams', e.target.value)}
              placeholder="Protein in grams"
              min="0"
              max="1000"
            />
            {errors.protein_target_grams && <div className="error-message">{errors.protein_target_grams}</div>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fat_target_grams">Fat Target (grams)</label>
            <input
              type="number"
              id="fat_target_grams"
              className={`form-input ${errors.fat_target_grams ? 'error' : ''}`}
              value={formData.fat_target_grams}
              onChange={(e) => handleInputChange('fat_target_grams', e.target.value)}
              placeholder="Fat in grams"
              min="0"
              max="1000"
            />
            {errors.fat_target_grams && <div className="error-message">{errors.fat_target_grams}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="tolerance_band_percentage">Tolerance Band (%)</label>
            <input
              type="number"
              id="tolerance_band_percentage"
              className={`form-input ${errors.tolerance_band_percentage ? 'error' : ''}`}
              value={formData.tolerance_band_percentage}
              onChange={(e) => handleInputChange('tolerance_band_percentage', e.target.value)}
              placeholder="Tolerance band percentage"
              min="0"
              max="100"
            />
            {errors.tolerance_band_percentage && <div className="error-message">{errors.tolerance_band_percentage}</div>}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="target_notes">Target Notes</label>
          <textarea
            id="target_notes"
            className={`form-textarea ${errors.target_notes ? 'error' : ''}`}
            value={formData.target_notes}
            onChange={(e) => handleInputChange('target_notes', e.target.value)}
            placeholder="Additional notes about nutrition targets"
            rows="3"
          />
          {errors.target_notes && <div className="error-message">{errors.target_notes}</div>}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {errorMessage && (
        <ErrorMessage
          message={errorMessage.message}
          type={errorMessage.type}
          onClose={() => setErrorMessage(null)}
        />
      )}
      
      <div className="modal-overlay">
        <div className="client-edit-form-container">
            <div className="modal-header">
              <button className="close-button" onClick={onBack}>
                <MdClose />
              </button>
                </div>

          <form onSubmit={handleSubmit} className="modal-body">
            <div className="step-indicator">
              <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-label">Basic Info</div>
                </div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">Health Info</div>
              </div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">Measurements</div>
            </div>
              <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
                <div className="step-number">4</div>
                <div className="step-label">Blood Tests</div>
                </div>
              <div className={`step ${currentStep >= 5 ? 'active' : ''}`}>
                <div className="step-number">5</div>
                <div className="step-label">Targets</div>
              </div>
            </div>

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </form>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={prevStep}
              disabled={currentStep === 1 || loading}
            >
              Previous
            </button>
            {currentStep < 5 ? (
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={nextStep}
                disabled={loading}
              >
                Next
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={loading || !hasChanges()}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            </div>
        </div>
      </div>
    </>
  );
};

export default ClientEdit; 