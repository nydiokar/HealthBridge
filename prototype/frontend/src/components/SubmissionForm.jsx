import React, { useState } from 'react';
import axios from 'axios';

const SubmissionForm = () => {
  const [formData, setFormData] = useState({
    symptoms: '',
    duration: '',
    fever: false,
    temperature: '',
    pain_level: 0,
    allergies: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        temperature: formData.fever && formData.temperature ? parseFloat(formData.temperature) : null,
        pain_level: parseInt(formData.pain_level)
      };

      const response = await axios.post('/api/submit-case', submitData);
      setResult(response.data);
      setSubmitted(true);
    } catch (error) {
      setError(
        error.response?.data?.error ||
        error.response?.data?.details?.join(', ') ||
        'Failed to submit case. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      symptoms: '',
      duration: '',
      fever: false,
      temperature: '',
      pain_level: 0,
      allergies: ''
    });
    setSubmitted(false);
    setResult(null);
    setError('');
  };

  if (submitted && result) {
    return (
      <div className="submission-success">
        <div className="success-card">
          <h2>✅ Case Submitted Successfully</h2>

          <div className="case-details">
            <p><strong>Case ID:</strong> {result.case_id}</p>
            <p><strong>Patient ID:</strong> {result.patient_id}</p>
            <p><strong>Priority Level:</strong>
              <span className={`priority-badge ${result.triage_level.toLowerCase()}`}>
                {result.triage_level}
              </span>
            </p>
          </div>

          <div className="next-steps">
            <h3>What happens next?</h3>
            <p>Your case has been reviewed and prioritized. A healthcare professional may contact you based on the urgency level.</p>
            
            <div className="medical-disclaimer">
              <p><strong>⚠️ Important:</strong> This is advisory only, not a medical diagnosis. In an emergency, call 112.</p>
            </div>

            {result.triage_level === 'RED' && (
              <div className="urgent-notice">
                <strong>⚠️ High Priority:</strong> Please seek immediate medical attention or contact emergency services if your condition worsens.
              </div>
            )}

            {result.triage_level === 'YELLOW' && (
              <div className="moderate-notice">
                <strong>📋 Moderate Priority:</strong> A GP will review your case within 24 hours.
              </div>
            )}

            {result.triage_level === 'GREEN' && (
              <div className="routine-notice">
                <strong>✅ Routine Care:</strong> Your case will be reviewed during regular GP rounds.
              </div>
            )}
          </div>

          <button onClick={resetForm} className="new-case-btn">
            Submit Another Case
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="submission-container">
      <div className="submission-card">
        <h2>Health Concern Submission</h2>
        <p>Please describe your health concerns. All information will be reviewed by a healthcare professional.</p>

        <form onSubmit={handleSubmit} className="submission-form">
          <div className="form-group">
            <label htmlFor="symptoms">Describe your symptoms: *</label>
            <textarea
              id="symptoms"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows="4"
              placeholder="Please describe your symptoms in detail..."
              required
              autoFocus
              maxLength="500"
            />
            <small>{formData.symptoms.length}/500 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="duration">How long have you had these symptoms? *</label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
            >
              <option value="">Select duration</option>
              <option value="< 1 hour">Less than 1 hour</option>
              <option value="1-6 hours">1-6 hours</option>
              <option value="6-24 hours">6-24 hours</option>
              <option value="1-2 days">1-2 days</option>
              <option value="2-7 days">2-7 days</option>
              <option value="> 7 days">More than 7 days</option>
            </select>
          </div>

          <div className="form-group fever-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="fever"
                checked={formData.fever}
                onChange={handleChange}
              />
              I have a fever
            </label>

            {formData.fever && (
              <div className="temperature-input">
                <label htmlFor="temperature">Temperature (°C):</label>
                <input
                  type="number"
                  id="temperature"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  min="35"
                  max="45"
                  step="0.1"
                  placeholder="37.5"
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="pain_level">Pain level (0 = no pain, 10 = severe):</label>
            <div className="pain-slider">
              <input
                type="range"
                id="pain_level"
                name="pain_level"
                value={formData.pain_level}
                onChange={handleChange}
                min="0"
                max="10"
                step="1"
              />
              <div className="pain-value">
                <span>{formData.pain_level}/10</span>
                <small>
                  {formData.pain_level === 0 && 'No pain'}
                  {formData.pain_level >= 1 && formData.pain_level <= 3 && 'Mild pain'}
                  {formData.pain_level >= 4 && formData.pain_level <= 6 && 'Moderate pain'}
                  {formData.pain_level >= 7 && formData.pain_level <= 10 && 'Severe pain'}
                </small>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="allergies">Known allergies (optional):</label>
            <input
              type="text"
              id="allergies"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="e.g., Penicillin, Peanuts..."
              maxLength="200"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Submitting...' : 'Submit Health Concern'}
          </button>
        </form>

        <div className="privacy-notice">
          <small>
            🔒 Your information is secure and will only be shared with authorized healthcare professionals.
          </small>
        </div>
      </div>
    </div>
  );
};

export default SubmissionForm;