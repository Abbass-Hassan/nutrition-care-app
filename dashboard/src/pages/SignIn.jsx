import React, { useState } from 'react';
import './Auth.css';

const SignIn = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dietitian sign in:', formData);
    // Handle dietitian sign in logic here
  };

  const handleSignUpClick = (e) => {
    e.preventDefault();
    onNavigate('signup');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="text-primary">🍎 NutritionCare</h1>
          <h2>Welcome Back, Dietitian</h2>
          <p>Sign in to your professional dashboard to manage your clients</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
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

          <div className="form-group">
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

          <button type="submit" className="btn-primary auth-submit">
            Sign In to Dashboard
          </button>
        </form>

        <div className="auth-footer">
          <p>
            New to NutritionCare?{' '}
            <a href="#" className="auth-link" onClick={handleSignUpClick}>Register as Dietitian</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 