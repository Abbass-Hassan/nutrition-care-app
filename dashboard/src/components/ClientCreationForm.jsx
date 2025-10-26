import React, { useState, useRef, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
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

const ClientCreationForm = ({ onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    // Basic Account Information
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    subscription_type: 'free',
    
    // Personal & Health Information
    age: '',
    gender: '',
    height: '',
    weight: '',
    goal: '',
    health_conditions: [],
    allergies: '',
    dietary_history: '',
    body_goal_questions: '',
    appetite_level: '',
    
    // Initial Measurements
    initial_weight: '',
    body_fat_percentage: '',
    muscle_percentage: '',
    other_composition: [],
    
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
    carbs_target: '',
    carbs_percentage: '',
    protein_target: '',
    protein_percentage: '',
    fat_target: '',
    fat_percentage: '',
    tolerance_band: '10',
    nutrition_notes: '',
  });

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

  const handleHealthConditionToggle = (condition) => {
    setFormData(prev => ({
      ...prev,
      health_conditions: prev.health_conditions.includes(condition)
        ? prev.health_conditions.filter(c => c !== condition)
        : [...prev.health_conditions, condition]
    }));
  };

  const handleFileUpload = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
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

  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 1: // Basic Account Information
        if (!formData.name || formData.name.trim() === '') {
          newErrors.name = 'Full name is required';
        }
        if (!formData.username || formData.username.trim() === '') {
          newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
          newErrors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
          newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }
        if (!formData.email || formData.email.trim() === '') {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.password || formData.password.trim() === '') {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        if (!formData.password_confirmation || formData.password_confirmation.trim() === '') {
          newErrors.password_confirmation = 'Please confirm your password';
        } else if (formData.password !== formData.password_confirmation) {
          newErrors.password_confirmation = 'Passwords do not match';
        }
        break;
        
      case 2: // Personal & Health Information
        if (!formData.age || formData.age === '') {
          newErrors.age = 'Age is required';
        } else if (isNaN(formData.age) || formData.age < 1 || formData.age > 120) {
          newErrors.age = 'Please enter a valid age between 1 and 120';
        }
        if (!formData.gender || formData.gender === '') {
          newErrors.gender = 'Gender is required';
        }
        if (!formData.height || formData.height === '') {
          newErrors.height = 'Height is required';
        } else if (isNaN(formData.height) || formData.height < 50 || formData.height > 300) {
          newErrors.height = 'Please enter a valid height between 50 and 300 cm';
        }
        if (!formData.weight || formData.weight === '') {
          newErrors.weight = 'Weight is required';
        } else if (isNaN(formData.weight) || formData.weight < 20 || formData.weight > 500) {
          newErrors.weight = 'Please enter a valid weight between 20 and 500 kg';
        }
        if (!formData.goal || formData.goal === '') {
          newErrors.goal = 'Goal is required';
        }
        break;
        
      case 3: // Initial Measurements
        // Optional fields, but validate if provided
        if (formData.body_fat_percentage && (isNaN(formData.body_fat_percentage) || formData.body_fat_percentage < 0 || formData.body_fat_percentage > 100)) {
          newErrors.body_fat_percentage = 'Body fat percentage must be between 0 and 100';
        }
        if (formData.muscle_percentage && (isNaN(formData.muscle_percentage) || formData.muscle_percentage < 0 || formData.muscle_percentage > 100)) {
          newErrors.muscle_percentage = 'Muscle percentage must be between 0 and 100';
        }
        break;
        
      case 4: // Blood Test Indicators
        // Optional fields, but validate if provided
        const bloodTests = ['hba1c', 'ldl', 'hdl', 'total_cholesterol', 'fasting_blood_sugar', 'triglycerides'];
        bloodTests.forEach(test => {
          if (formData[test] && isNaN(formData[test])) {
            newErrors[test] = 'Please enter a valid number';
          }
        });
        break;
        
      case 5: // Nutrition Targets
        if (!formData.daily_calorie_target || formData.daily_calorie_target === '') {
          newErrors.daily_calorie_target = 'Daily calorie target is required';
        } else if (isNaN(formData.daily_calorie_target) || formData.daily_calorie_target < 500 || formData.daily_calorie_target > 10000) {
          newErrors.daily_calorie_target = 'Daily calorie target must be between 500 and 10000';
        }
        
        if (!formData.carbs_target || formData.carbs_target === '') {
          newErrors.carbs_target = 'Carbs target is required';
        } else if (isNaN(formData.carbs_target) || formData.carbs_target < 0 || formData.carbs_target > 1000) {
          newErrors.carbs_target = 'Carbs target must be between 0 and 1000 g';
        }
        
        if (!formData.protein_target || formData.protein_target === '') {
          newErrors.protein_target = 'Protein target is required';
        } else if (isNaN(formData.protein_target) || formData.protein_target < 0 || formData.protein_target > 1000) {
          newErrors.protein_target = 'Protein target must be between 0 and 1000 g';
        }
        
        if (!formData.fat_target || formData.fat_target === '') {
          newErrors.fat_target = 'Fat target is required';
        } else if (isNaN(formData.fat_target) || formData.fat_target < 0 || formData.fat_target > 1000) {
          newErrors.fat_target = 'Fat target must be between 0 and 1000 g';
        }
        
        if (formData.carbs_percentage && (isNaN(formData.carbs_percentage) || formData.carbs_percentage < 0 || formData.carbs_percentage > 100)) {
          newErrors.carbs_percentage = 'Carbs percentage must be between 0 and 100';
        }
        if (formData.protein_percentage && (isNaN(formData.protein_percentage) || formData.protein_percentage < 0 || formData.protein_percentage > 100)) {
          newErrors.protein_percentage = 'Protein percentage must be between 0 and 100';
        }
        if (formData.fat_percentage && (isNaN(formData.fat_percentage) || formData.fat_percentage < 0 || formData.fat_percentage > 100)) {
          newErrors.fat_percentage = 'Fat percentage must be between 0 and 100';
        }
        
        // Check if macros add up to 100%
        const totalMacros = (parseFloat(formData.carbs_percentage) || 0) + 
                           (parseFloat(formData.protein_percentage) || 0) + 
                           (parseFloat(formData.fat_percentage) || 0);
        if (totalMacros > 0 && Math.abs(totalMacros - 100) > 1) {
          newErrors.macros_total = `Macros must add up to 100% (currently ${totalMacros.toFixed(1)}%)`;
        }
        break;
    }
    
    return newErrors;
  };

  const nextStep = () => {
    // Clear previous errors
    setErrors({});
    setErrorMessage(null);
    
    // Validate current step
    const stepErrors = validateStep(currentStep);
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      
      // Scroll to top to show first error
      if (formRef.current) {
        formRef.current.scrollTop = 0;
      }
      
      return;
    }
    
    // If validation passes, move to next step
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all steps before submission
    let allErrors = {};
    for (let step = 1; step <= 5; step++) {
      const stepErrors = validateStep(step);
      allErrors = { ...allErrors, ...stepErrors };
    }
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      // Don't show popup notification - field errors are enough
      // Navigate to first step with errors
      const errorKeys = Object.keys(allErrors);
      if (errorKeys.some(key => ['name', 'username', 'email', 'password', 'password_confirmation', 'subscription_type'].includes(key))) {
        setCurrentStep(1);
      } else if (errorKeys.some(key => ['age', 'gender', 'height', 'weight', 'goal'].includes(key))) {
        setCurrentStep(2);
      } else if (errorKeys.some(key => ['initial_weight', 'body_fat_percentage', 'muscle_percentage'].includes(key))) {
        setCurrentStep(3);
      } else if (errorKeys.some(key => ['hba1c', 'ldl', 'hdl', 'total_cholesterol', 'fasting_blood_sugar', 'triglycerides'].includes(key))) {
        setCurrentStep(4);
      } else if (errorKeys.some(key => ['daily_calorie_target', 'carbs_target', 'protein_target', 'fat_target', 'carbs_percentage', 'protein_percentage', 'fat_percentage'].includes(key))) {
        setCurrentStep(5);
      } else {
        setCurrentStep(1);
      }
      if (formRef.current) {
        formRef.current.scrollTop = 0;
      }
      return;
    }
    
    setLoading(true);
    setErrorMessage(null);
    setErrors({});
    
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (key === 'health_conditions' && Array.isArray(formData[key])) {
            // Send array as multiple FormData fields
            formData[key].forEach((item, index) => {
              formDataToSend.append(`${key}[${index}]`, item);
            });
          } else if (key === 'other_composition' && Array.isArray(formData[key])) {
            // Send array as multiple FormData fields
            formData[key].forEach((item, index) => {
              formDataToSend.append(`${key}[${index}]`, item);
            });
          } else if (key === 'blood_test_photo' && formData[key]) {
            formDataToSend.append(key, formData[key]);
          } else {
            // Send other fields as strings
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'}/clients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formDataToSend,
      });

      const data = await response.json();
      
      if (data.success) {
        setErrorMessage({
          message: `Client "${data.client.name}" created successfully!`,
          type: 'success'
        });
        setTimeout(() => {
          onSuccess(data.client);
          onClose();
        }, 1500);
      } else {
        // Handle validation errors from backend
        if (data.errors) {
          // Convert backend errors to our format
          const backendErrors = {};
          Object.keys(data.errors).forEach(key => {
            const errorValue = data.errors[key];
            backendErrors[key] = Array.isArray(errorValue) ? errorValue[0] : errorValue;
          });
          
          setErrors(backendErrors);
          
          // Find which step contains the first error and navigate to it
          const errorKeys = Object.keys(backendErrors);
          const step1Fields = ['name', 'username', 'email', 'password', 'password_confirmation', 'subscription_type'];
          const step2Fields = ['age', 'gender', 'height', 'weight', 'goal', 'health_conditions', 'allergies'];
          const step3Fields = ['initial_weight', 'body_fat_percentage', 'muscle_percentage'];
          const step4Fields = ['hba1c', 'ldl', 'hdl', 'total_cholesterol', 'fasting_blood_sugar', 'triglycerides'];
          const step5Fields = ['daily_calorie_target', 'carbs_target', 'protein_target', 'fat_target', 'carbs_percentage', 'protein_percentage', 'fat_percentage'];
          
          if (errorKeys.some(key => step1Fields.includes(key))) {
            setCurrentStep(1);
          } else if (errorKeys.some(key => step2Fields.includes(key))) {
            setCurrentStep(2);
          } else if (errorKeys.some(key => step3Fields.includes(key))) {
            setCurrentStep(3);
          } else if (errorKeys.some(key => step4Fields.includes(key))) {
            setCurrentStep(4);
          } else if (errorKeys.some(key => step5Fields.includes(key))) {
            setCurrentStep(5);
          } else {
            setCurrentStep(1);
          }
          
          // Scroll to top to show errors
          if (formRef.current) {
            formRef.current.scrollTop = 0;
          }
        } else {
          // Only show popup for non-validation errors (server errors, etc)
          setErrorMessage({
            message: data.message || 'Failed to create client. Please check all required fields.',
            type: 'error'
          });
        }
      }
    } catch (error) {
      console.error('Error creating client:', error);
      setErrorMessage({
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => {
    return (
      <div className="step-content">
        <h3>Basic Account Information</h3>
        
        <div className="form-row">
          <div className={`form-group ${errors.name ? 'error' : ''}`}>
            <label>Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`form-input ${errors.name ? 'error' : ''}`}
              required
            />
            {errors.name && <span className="error-text">{Array.isArray(errors.name) ? errors.name[0] : errors.name}</span>}
          </div>
          <div className={`form-group ${errors.username ? 'error' : ''}`}>
            <label>Username *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={`form-input ${errors.username ? 'error' : ''}`}
              required
            />
            {errors.username && <span className="error-text">{Array.isArray(errors.username) ? errors.username[0] : errors.username}</span>}
          </div>
          <div className={`form-group ${errors.email ? 'error' : ''}`}>
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`form-input ${errors.email ? 'error' : ''}`}
              required
            />
            {errors.email && <span className="error-text">{Array.isArray(errors.email) ? errors.email[0] : errors.email}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Subscription Type *</label>
            <select
              value={formData.subscription_type}
              onChange={(e) => handleInputChange('subscription_type', e.target.value)}
              className="form-input"
              required
            >
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className={`form-group ${errors.password ? 'error' : ''}`}>
            <label>Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`form-input ${errors.password ? 'error' : ''}`}
              required
            />
            {errors.password && <span className="error-text">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className={`form-group ${errors.password_confirmation ? 'error' : ''}`}>
            <label>Confirm Password *</label>
            <input
              type="password"
              value={formData.password_confirmation}
              onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
              className={`form-input ${errors.password_confirmation ? 'error' : ''}`}
              required
            />
            {errors.password_confirmation && <span className="error-text">{Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation}</span>}
          </div>
        </div>
    </div>
  );
};

  const renderStep2 = () => (
    <div className="step-content">
      <h3>Personal & Health Information</h3>
      
      <div className="form-row">
        <div className={`form-group ${errors.age ? 'error' : ''}`}>
          <label>Age *</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            className={`form-input ${errors.age ? 'error' : ''}`}
            min="1"
            max="120"
            required
          />
          {errors.age && <span className="error-text">{Array.isArray(errors.age) ? errors.age[0] : errors.age}</span>}
        </div>
        <div className={`form-group ${errors.gender ? 'error' : ''}`}>
          <label>Gender *</label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className={`form-input ${errors.gender ? 'error' : ''}`}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <span className="error-text">{Array.isArray(errors.gender) ? errors.gender[0] : errors.gender}</span>}
        </div>
        <div className={`form-group ${errors.height ? 'error' : ''}`}>
          <label>Height (cm) *</label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            className={`form-input ${errors.height ? 'error' : ''}`}
            min="50"
            max="300"
            required
          />
          {errors.height && <span className="error-text">{Array.isArray(errors.height) ? errors.height[0] : errors.height}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className={`form-group ${errors.weight ? 'error' : ''}`}>
          <label>Weight (kg) *</label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            className={`form-input ${errors.weight ? 'error' : ''}`}
            min="20"
            max="500"
            step="0.1"
            required
          />
          {errors.weight && <span className="error-text">{Array.isArray(errors.weight) ? errors.weight[0] : errors.weight}</span>}
        </div>
        <div className={`form-group ${errors.goal ? 'error' : ''}`}>
          <label>Goal *</label>
          <select
            value={formData.goal}
            onChange={(e) => handleInputChange('goal', e.target.value)}
            className={`form-input ${errors.goal ? 'error' : ''}`}
            required
          >
            <option value="">Select Goal</option>
            <option value="lose_weight">Lose Weight</option>
            <option value="maintain">Maintain Weight</option>
            <option value="gain_weight">Gain Weight</option>
            <option value="gain_muscle">Gain Muscle</option>
          </select>
          {errors.goal && <span className="error-text">{Array.isArray(errors.goal) ? errors.goal[0] : errors.goal}</span>}
        </div>
        <div className="form-group">
          <label>Appetite Level</label>
          <select
            value={formData.appetite_level}
            onChange={(e) => handleInputChange('appetite_level', e.target.value)}
            className="form-input"
          >
            <option value="">Select Appetite Level</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Health Conditions</label>
        <MultiSelectDropdown
          options={healthConditionsOptions}
          value={formData.health_conditions}
          onChange={(value) => handleInputChange('health_conditions', value)}
          placeholder="Select health conditions..."
        />
      </div>

      <div className="form-row full-width">
        <div className="form-group">
          <label>Allergies</label>
          <textarea
            value={formData.allergies}
            onChange={(e) => handleInputChange('allergies', e.target.value)}
            className="form-textarea"
            rows="3"
            placeholder="List any allergies..."
          />
        </div>
      </div>

      <div className="form-row full-width">
        <div className="form-group">
          <label>Dietary History</label>
          <textarea
            value={formData.dietary_history}
            onChange={(e) => handleInputChange('dietary_history', e.target.value)}
            className="form-textarea"
            rows="3"
            placeholder="Previous dietary patterns, restrictions, etc..."
          />
        </div>
      </div>

      <div className="form-row full-width">
        <div className="form-group">
          <label>Body Goal Questions</label>
          <textarea
            value={formData.body_goal_questions}
            onChange={(e) => handleInputChange('body_goal_questions', e.target.value)}
            className="form-textarea"
            rows="3"
            placeholder="Specific body composition goals..."
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <h3>Initial Measurements (Optional)</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label>Initial Weight (kg)</label>
          <input
            type="number"
            value={formData.initial_weight}
            onChange={(e) => handleInputChange('initial_weight', e.target.value)}
            className="form-input"
            min="20"
            max="500"
            step="0.1"
          />
        </div>
        <div className={`form-group ${errors.body_fat_percentage ? 'error' : ''}`}>
          <label>Body Fat %</label>
          <input
            type="number"
            value={formData.body_fat_percentage}
            onChange={(e) => handleInputChange('body_fat_percentage', e.target.value)}
            className={`form-input ${errors.body_fat_percentage ? 'error' : ''}`}
            min="0"
            max="100"
            step="0.1"
          />
          {errors.body_fat_percentage && <span className="error-text">{Array.isArray(errors.body_fat_percentage) ? errors.body_fat_percentage[0] : errors.body_fat_percentage}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className={`form-group ${errors.muscle_percentage ? 'error' : ''}`}>
          <label>Muscle %</label>
          <input
            type="number"
            value={formData.muscle_percentage}
            onChange={(e) => handleInputChange('muscle_percentage', e.target.value)}
            className={`form-input ${errors.muscle_percentage ? 'error' : ''}`}
            min="0"
            max="100"
            step="0.1"
          />
          {errors.muscle_percentage && <span className="error-text">{Array.isArray(errors.muscle_percentage) ? errors.muscle_percentage[0] : errors.muscle_percentage}</span>}
        </div>
        <div className="form-group">
          <label>Other Composition</label>
          <input
            type="text"
            placeholder="e.g., water %, bone density (separate with commas)"
            value={Array.isArray(formData.other_composition) ? formData.other_composition.join(', ') : formData.other_composition}
            onChange={(e) => {
              const value = e.target.value;
              // Convert comma-separated string to array
              const arrayValue = value ? value.split(',').map(item => item.trim()).filter(item => item) : [];
              handleInputChange('other_composition', arrayValue);
            }}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="step-content">
      <h3>Blood Test Indicators (Optional)</h3>
      
      <div className="form-row">
        <div className={`form-group ${errors.hba1c ? 'error' : ''}`}>
          <label>HbA1c (%)</label>
          <input
            type="number"
            value={formData.hba1c}
            onChange={(e) => handleInputChange('hba1c', e.target.value)}
            className={`form-input ${errors.hba1c ? 'error' : ''}`}
            min="0"
            max="20"
            step="0.1"
          />
          {errors.hba1c && <span className="error-text">{Array.isArray(errors.hba1c) ? errors.hba1c[0] : errors.hba1c}</span>}
        </div>
        <div className={`form-group ${errors.ldl ? 'error' : ''}`}>
          <label>LDL (mg/dL)</label>
          <input
            type="number"
            value={formData.ldl}
            onChange={(e) => handleInputChange('ldl', e.target.value)}
            className={`form-input ${errors.ldl ? 'error' : ''}`}
            min="0"
            max="500"
          />
          {errors.ldl && <span className="error-text">{Array.isArray(errors.ldl) ? errors.ldl[0] : errors.ldl}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className={`form-group ${errors.hdl ? 'error' : ''}`}>
          <label>HDL (mg/dL)</label>
          <input
            type="number"
            value={formData.hdl}
            onChange={(e) => handleInputChange('hdl', e.target.value)}
            className={`form-input ${errors.hdl ? 'error' : ''}`}
            min="0"
            max="200"
          />
          {errors.hdl && <span className="error-text">{Array.isArray(errors.hdl) ? errors.hdl[0] : errors.hdl}</span>}
        </div>
        <div className={`form-group ${errors.total_cholesterol ? 'error' : ''}`}>
          <label>Total Cholesterol (mg/dL)</label>
          <input
            type="number"
            value={formData.total_cholesterol}
            onChange={(e) => handleInputChange('total_cholesterol', e.target.value)}
            className={`form-input ${errors.total_cholesterol ? 'error' : ''}`}
            min="0"
            max="1000"
          />
          {errors.total_cholesterol && <span className="error-text">{Array.isArray(errors.total_cholesterol) ? errors.total_cholesterol[0] : errors.total_cholesterol}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className={`form-group ${errors.fasting_blood_sugar ? 'error' : ''}`}>
          <label>Fasting Blood Sugar (mg/dL)</label>
          <input
            type="number"
            value={formData.fasting_blood_sugar}
            onChange={(e) => handleInputChange('fasting_blood_sugar', e.target.value)}
            className={`form-input ${errors.fasting_blood_sugar ? 'error' : ''}`}
            min="0"
            max="1000"
          />
          {errors.fasting_blood_sugar && <span className="error-text">{Array.isArray(errors.fasting_blood_sugar) ? errors.fasting_blood_sugar[0] : errors.fasting_blood_sugar}</span>}
        </div>
        <div className={`form-group ${errors.triglycerides ? 'error' : ''}`}>
          <label>Triglycerides (mg/dL)</label>
          <input
            type="number"
            value={formData.triglycerides}
            onChange={(e) => handleInputChange('triglycerides', e.target.value)}
            className={`form-input ${errors.triglycerides ? 'error' : ''}`}
            min="0"
            max="2000"
          />
          {errors.triglycerides && <span className="error-text">{Array.isArray(errors.triglycerides) ? errors.triglycerides[0] : errors.triglycerides}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Blood Test Photo</label>
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
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="step-content">
      <h3>Nutrition Targets</h3>
      
      <div className="form-row">
        <div className={`form-group ${errors.daily_calorie_target ? 'error' : ''}`}>
          <label>Daily Calorie Target (kcal) *</label>
          <input
            type="number"
            value={formData.daily_calorie_target}
            onChange={(e) => handleInputChange('daily_calorie_target', e.target.value)}
            className={`form-input ${errors.daily_calorie_target ? 'error' : ''}`}
            min="500"
            max="10000"
            required
          />
          {errors.daily_calorie_target && <span className="error-text">{Array.isArray(errors.daily_calorie_target) ? errors.daily_calorie_target[0] : errors.daily_calorie_target}</span>}
        </div>
        <div className="form-group">
          <label>Tolerance Band (%)</label>
          <input
            type="number"
            value={formData.tolerance_band}
            onChange={(e) => handleInputChange('tolerance_band', e.target.value)}
            className="form-input"
            min="0"
            max="50"
          />
        </div>
      </div>

      <div className="nutrition-targets">
        <h4>Macronutrient Targets</h4>
        
        <div className="form-row">
          <div className={`form-group ${errors.carbs_target ? 'error' : ''}`}>
            <label>Carbs Target (g) *</label>
            <input
              type="number"
              value={formData.carbs_target}
              onChange={(e) => handleInputChange('carbs_target', e.target.value)}
              className={`form-input ${errors.carbs_target ? 'error' : ''}`}
              min="0"
              max="1000"
              required
            />
            {errors.carbs_target && <span className="error-text">{Array.isArray(errors.carbs_target) ? errors.carbs_target[0] : errors.carbs_target}</span>}
          </div>
          <div className={`form-group ${errors.carbs_percentage ? 'error' : ''}`}>
            <label>Carbs %</label>
            <input
              type="number"
              value={formData.carbs_percentage}
              onChange={(e) => handleInputChange('carbs_percentage', e.target.value)}
              className={`form-input ${errors.carbs_percentage ? 'error' : ''}`}
              min="0"
              max="100"
            />
            {errors.carbs_percentage && <span className="error-text">{Array.isArray(errors.carbs_percentage) ? errors.carbs_percentage[0] : errors.carbs_percentage}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className={`form-group ${errors.protein_target ? 'error' : ''}`}>
            <label>Protein Target (g) *</label>
            <input
              type="number"
              value={formData.protein_target}
              onChange={(e) => handleInputChange('protein_target', e.target.value)}
              className={`form-input ${errors.protein_target ? 'error' : ''}`}
              min="0"
              max="1000"
              required
            />
            {errors.protein_target && <span className="error-text">{Array.isArray(errors.protein_target) ? errors.protein_target[0] : errors.protein_target}</span>}
          </div>
          <div className={`form-group ${errors.protein_percentage ? 'error' : ''}`}>
            <label>Protein %</label>
            <input
              type="number"
              value={formData.protein_percentage}
              onChange={(e) => handleInputChange('protein_percentage', e.target.value)}
              className={`form-input ${errors.protein_percentage ? 'error' : ''}`}
              min="0"
              max="100"
            />
            {errors.protein_percentage && <span className="error-text">{Array.isArray(errors.protein_percentage) ? errors.protein_percentage[0] : errors.protein_percentage}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className={`form-group ${errors.fat_target ? 'error' : ''}`}>
            <label>Fat Target (g) *</label>
            <input
              type="number"
              value={formData.fat_target}
              onChange={(e) => handleInputChange('fat_target', e.target.value)}
              className={`form-input ${errors.fat_target ? 'error' : ''}`}
              min="0"
              max="1000"
              required
            />
            {errors.fat_target && <span className="error-text">{Array.isArray(errors.fat_target) ? errors.fat_target[0] : errors.fat_target}</span>}
          </div>
          <div className={`form-group ${errors.fat_percentage ? 'error' : ''}`}>
            <label>Fat %</label>
            <input
              type="number"
              value={formData.fat_percentage}
              onChange={(e) => handleInputChange('fat_percentage', e.target.value)}
              className={`form-input ${errors.fat_percentage ? 'error' : ''}`}
              min="0"
              max="100"
            />
            {errors.fat_percentage && <span className="error-text">{Array.isArray(errors.fat_percentage) ? errors.fat_percentage[0] : errors.fat_percentage}</span>}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Nutrition Notes</label>
        <textarea
          value={formData.nutrition_notes}
          onChange={(e) => handleInputChange('nutrition_notes', e.target.value)}
          className="form-textarea"
          rows="3"
          placeholder="Additional notes about nutrition targets..."
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  return (
    <div className="modal-overlay">
      <ErrorMessage 
        message={errorMessage?.message} 
        type={errorMessage?.type} 
        show={!!errorMessage}
        onClose={() => setErrorMessage(null)}
        autoClose={true}
        duration={6000}
      />
      <div className="client-creation-form-container" ref={formRef}>
        <div className="modal-header">
          <h2>Create New Client</h2>
          <button className="close-btn" onClick={onClose}><MdClose /></button>
        </div>

        <div className="step-indicator">
          {[1, 2, 3, 4, 5].map(step => (
            <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
              <span className="step-number">{step}</span>
              <span className="step-label">
                {step === 1 && 'Account'}
                {step === 2 && 'Health'}
                {step === 3 && 'Measurements'}
                {step === 4 && 'Blood Tests'}
                {step === 5 && 'Targets'}
              </span>
            </div>
          ))}
        </div>


        <div className="modal-body">
          {renderCurrentStep()}
        </div>

        <div className="modal-actions">
          <button 
            className="btn btn-secondary"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </button>
          
          {currentStep < 5 ? (
            <button 
              className="btn btn-primary"
              onClick={nextStep}
            >
              Next
            </button>
          ) : (
            <button 
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Client'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientCreationForm;
