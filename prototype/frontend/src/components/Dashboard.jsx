import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [filter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch cases and stats in parallel
      const [casesResponse, statsResponse] = await Promise.all([
        axios.get('/api/cases', {
          params: filter !== 'all' ? { filter } : {}
        }),
        axios.get('/api/dashboard/stats')
      ]);

      setCases(casesResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCaseStatus = async (caseId, newStatus) => {
    try {
      await axios.patch(`/api/cases/${caseId}`, { status: newStatus });

      // Update local state
      setCases(cases.map(case_ =>
        case_.case_id === caseId
          ? { ...case_, status: newStatus, updated_at: new Date().toISOString() }
          : case_
      ));

      // Update selected case if it's the one being modified
      if (selectedCase && selectedCase.case_id === caseId) {
        setSelectedCase({ ...selectedCase, status: newStatus });
      }

      // Refresh stats
      const statsResponse = await axios.get('/api/dashboard/stats');
      setStats(statsResponse.data);
    } catch (error) {
      setError('Failed to update case status');
      console.error('Update error:', error);
    }
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getPriorityClass = (level) => {
    return `priority-${level.toLowerCase()}`;
  };

  const getStatusClass = (status) => {
    return `status-${status.replace('_', '-')}`;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>GP Dashboard</h2>
        <button onClick={fetchDashboardData} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card total">
          <h3>Total Cases</h3>
          <span className="stat-number">{stats.total || 0}</span>
        </div>
        <div className="stat-card red">
          <h3>High Priority</h3>
          <span className="stat-number">{stats.red || 0}</span>
        </div>
        <div className="stat-card yellow">
          <h3>Medium Priority</h3>
          <span className="stat-number">{stats.yellow || 0}</span>
        </div>
        <div className="stat-card green">
          <h3>Low Priority</h3>
          <span className="stat-number">{stats.green || 0}</span>
        </div>
        <div className="stat-card pending">
          <h3>Pending</h3>
          <span className="stat-number">{stats.pending || 0}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="dashboard-filters">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'active' : ''}
        >
          All Cases
        </button>
        <button
          onClick={() => setFilter('RED')}
          className={filter === 'RED' ? 'active' : ''}
        >
          🔴 High Priority
        </button>
        <button
          onClick={() => setFilter('YELLOW')}
          className={filter === 'YELLOW' ? 'active' : ''}
        >
          🟡 Medium Priority
        </button>
        <button
          onClick={() => setFilter('GREEN')}
          className={filter === 'GREEN' ? 'active' : ''}
        >
          🟢 Low Priority
        </button>
      </div>

      {/* Cases List */}
      <div className="cases-container">
        <div className="cases-list">
          <h3>Cases ({cases.length})</h3>

          {cases.length === 0 ? (
            <div className="no-cases">
              <p>No cases found for the selected filter.</p>
            </div>
          ) : (
            <div className="cases-table">
              <div className="table-header">
                <span>Case ID</span>
                <span>Patient</span>
                <span>Priority</span>
                <span>Status</span>
                <span>Submitted</span>
                <span>Actions</span>
              </div>

              {cases.map(case_ => (
                <div key={case_.id} className="table-row">
                  <span className="case-id">{case_.case_id}</span>
                  <span className="patient-id">{case_.patient_id}</span>
                  <span className={`priority ${getPriorityClass(case_.triage_level)}`}>
                    {case_.triage_level}
                  </span>
                  <span className={`status ${getStatusClass(case_.status)}`}>
                    {case_.status.replace('_', ' ')}
                  </span>
                  <span className="timestamp">
                    {formatDateTime(case_.created_at)}
                  </span>
                  <span className="actions">
                    <button
                      onClick={() => setSelectedCase(case_)}
                      className="view-btn"
                    >
                      View
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Case Details Modal */}
        {selectedCase && (
          <div className="case-modal-overlay" onClick={() => setSelectedCase(null)}>
            <div className="case-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Case Details: {selectedCase.case_id}</h3>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="close-btn"
                >
                  ✕
                </button>
              </div>

              <div className="modal-content">
                <div className="case-info">
                  <div className="info-row">
                    <strong>Patient ID:</strong> {selectedCase.patient_id}
                  </div>
                  <div className="info-row">
                    <strong>Priority:</strong>
                    <span className={`priority ${getPriorityClass(selectedCase.triage_level)}`}>
                      {selectedCase.triage_level}
                    </span>
                  </div>
                  <div className="info-row">
                    <strong>Status:</strong>
                    <span className={`status ${getStatusClass(selectedCase.status)}`}>
                      {selectedCase.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="info-row">
                    <strong>Submitted:</strong> {formatDateTime(selectedCase.created_at)}
                  </div>
                  {selectedCase.updated_at !== selectedCase.created_at && (
                    <div className="info-row">
                      <strong>Last Updated:</strong> {formatDateTime(selectedCase.updated_at)}
                    </div>
                  )}
                </div>

                <div className="symptoms-section">
                  <h4>Symptoms:</h4>
                  <p>{selectedCase.symptoms}</p>
                </div>

                <div className="medical-details">
                  <div className="detail-row">
                    <strong>Duration:</strong> {selectedCase.duration}
                  </div>
                  {selectedCase.fever && (
                    <div className="detail-row">
                      <strong>Fever:</strong> Yes
                      {selectedCase.temperature && ` (${selectedCase.temperature}°C)`}
                    </div>
                  )}
                  {selectedCase.pain_level > 0 && (
                    <div className="detail-row">
                      <strong>Pain Level:</strong> {selectedCase.pain_level}/10
                    </div>
                  )}
                  {selectedCase.allergies && (
                    <div className="detail-row">
                      <strong>Allergies:</strong> {selectedCase.allergies}
                    </div>
                  )}
                </div>

                <div className="triage-section">
                  <h4>Triage Assessment:</h4>
                  <p><strong>Level:</strong> {selectedCase.triage_level}</p>
                  <p><strong>Reasoning:</strong> {selectedCase.triage_reason}</p>
                </div>

                <div className="status-actions">
                  <h4>Update Status:</h4>
                  <div className="status-buttons">
                    <button
                      onClick={() => updateCaseStatus(selectedCase.case_id, 'reviewed')}
                      className={selectedCase.status === 'reviewed' ? 'active' : ''}
                    >
                      Mark as Reviewed
                    </button>
                    <button
                      onClick={() => updateCaseStatus(selectedCase.case_id, 'in_progress')}
                      className={selectedCase.status === 'in_progress' ? 'active' : ''}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => updateCaseStatus(selectedCase.case_id, 'resolved')}
                      className={selectedCase.status === 'resolved' ? 'active' : ''}
                    >
                      Mark as Resolved
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;