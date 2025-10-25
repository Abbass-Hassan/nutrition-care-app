import React, { useState, Fragment } from 'react';
import './Auth.css';
import { API_BASE } from '../config';
import ErrorMessage from '../components/ErrorMessage';

const SignUp = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    if (formData.password !== formData.confirmPassword) {
      setError({
        message: 'Passwords do not match. Please ensure both password fields are identical.',
        type: 'error'
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          user_type: 'dietitian' // Dashboard = dietitian
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Dietitian registered successfully:', data);
        setError({
          message: 'Account created successfully! Redirecting to dashboard...',
          type: 'success'
        });
        // Store token and redirect to dashboard
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Reload the page to trigger authentication state
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setError({
          message: data.message || 'Registration failed. Please check your information and try again.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError({
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInClick = (e) => {
    e.preventDefault();
    onNavigate('signin');
  };

  return (
    <Fragment>
      <ErrorMessage 
        message={error?.message} 
        type={error?.type} 
        show={!!error}
        onClose={() => setError(null)}
        autoClose={true}
        duration={6000}
      />
      <div className="auth-container">
      <div className="auth-card compact signup">
        <div className="auth-header compact signup">
          <h1 className="text-primary">
            <span className="logo-icon">🍎</span> NutritionCare
          </h1>
          <h2>Join Our Professional Network</h2>
          <p>Register as a dietitian to start managing your clients</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form compact signup">
          <div className="form-group compact signup">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group compact signup">
            <label htmlFor="email">Professional Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your professional email"
              required
            />
          </div>

          <div className="form-group compact signup">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a secure password"
              required
            />
          </div>

          <div className="form-group compact signup">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary auth-submit compact signup"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Professional Account'}
          </button>
        </form>

        <div className="auth-footer compact signup">
          <p>
            Already have a professional account?{' '}
            <a href="#" className="auth-link" onClick={handleSignInClick}>Sign in</a>
          </p>
        </div>
      </div>
      </div>
    </Fragment>
  );
};

export default SignUp; 