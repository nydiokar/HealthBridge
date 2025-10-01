import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/login', credentials);
      if (response.data.success) {
        onLogin(response.data.user);
      }
    } catch (error) {
      setError(
        error.response?.data?.error || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const useTestCredentials = (role) => {
    if (role === 'citizen') {
      setCredentials({ username: 'citizen1', password: 'citizen123' });
    } else {
      setCredentials({ username: 'gp1', password: 'gp123' });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login to AI GP System</h2>

        <div className="test-credentials">
          <p>Test credentials:</p>
          <button
            type="button"
            onClick={() => useTestCredentials('citizen')}
            className="test-btn citizen-btn"
          >
            Use Citizen Login
          </button>
          <button
            type="button"
            onClick={() => useTestCredentials('gp')}
            className="test-btn gp-btn"
          >
            Use GP Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="login-submit-btn"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-info">
          <h3>System Information</h3>
          <p><strong>Citizens:</strong> Submit health concerns and symptoms</p>
          <p><strong>GPs:</strong> Review triaged cases and manage patient care</p>
        </div>
      </div>
    </div>
  );
};

export default Login;