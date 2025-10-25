import React, { useState, Fragment } from 'react';
import './Auth.css';
import { API_BASE } from '../config';
import ErrorMessage from '../components/ErrorMessage';

const SignIn = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    
    try {
      const response = await fetch(`${API_BASE}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          user_type: 'dietitian' // Dashboard = dietitian
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Dietitian signed in successfully:', data);
        // Store token and redirect to dashboard
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Reload the page to trigger authentication state
        window.location.reload();
      } else {
        setError({
          message: data.message || 'Sign in failed. Please check your credentials.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError({
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpClick = (e) => {
    e.preventDefault();
    onNavigate('signup');
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
        <div className="auth-card compact">
          <div className="auth-header compact">
            <h1 className="text-primary">
              <span className="logo-icon">🍎</span> NutritionCare
            </h1>
            <h2>Welcome Back, Dietitian</h2>
            <p>Sign in to your professional dashboard to manage your clients</p>
          </div>

        <form onSubmit={handleSubmit} className="auth-form compact">
          <div className="form-group compact">
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

          <div className="form-group compact">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            className="btn-primary auth-submit compact"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="auth-footer compact">
          <p>
            New to NutritionCare?{' '}
            <a href="#" className="auth-link" onClick={handleSignUpClick}>Register as Dietitian</a>
          </p>
        </div>
      </div>
      </div>
    </Fragment>
  );
};

export default SignIn; 