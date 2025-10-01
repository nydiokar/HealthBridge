import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import SubmissionForm from './components/SubmissionForm';
import Dashboard from './components/Dashboard';
import './App.css';

// Configure axios defaults
axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/user');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null); // Force logout on error
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>AI GP Support System</h1>
          {user && (
            <div className="user-info">
              <span>Welcome, {user.username} ({user.role})</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          )}
        </header>

        <main className="app-main">
          <Routes>
            <Route
              path="/login"
              element={
                user ?
                  <Navigate to={user.role === 'gp' ? '/dashboard' : '/submit'} replace /> :
                  <Login onLogin={handleLogin} />
              }
            />

            <Route
              path="/submit"
              element={
                user && user.role === 'citizen' ?
                  <SubmissionForm /> :
                  <Navigate to="/login" replace />
              }
            />

            <Route
              path="/dashboard"
              element={
                user && user.role === 'gp' ?
                  <Dashboard /> :
                  <Navigate to="/login" replace />
              }
            />

            <Route
              path="/"
              element={
                <Navigate to={
                  user ?
                    (user.role === 'gp' ? '/dashboard' : '/submit') :
                    '/login'
                } replace />
              }
            />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>AI GP Support System - Prototype</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;