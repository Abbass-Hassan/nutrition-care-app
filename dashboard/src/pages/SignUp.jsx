import React, { useState } from 'react';
import './Auth.css';

const SignUp = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dietitian registration:', formData);
    // Handle dietitian registration logic here
  };

  const handleSignInClick = (e) => {
    e.preventDefault();
    onNavigate('signin');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="text-primary">🍎 NutritionCare</h1>
          <h2>Join Our Professional Network</h2>
          <p>Register as a dietitian to start managing your clients</p>
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
              placeholder="Create a secure password"
              required
            />
          </div>

          <div className="form-group">
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

          <button type="submit" className="btn-primary auth-submit">
            Create Professional Account
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have a professional account?{' '}
            <a href="#" className="auth-link" onClick={handleSignInClick}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 