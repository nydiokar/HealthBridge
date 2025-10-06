require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const db = require('./database');
const { triageCase, validateCaseData } = require('./triage');
const {
  authenticateUser,
  requireRole,
  login,
  logout,
  getCurrentUser
} = require('./auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Data retention policy
const RETENTION_DAYS = 180; // TODO: Implement auto-purge in TRL-6

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000 // 1 hour
  }
}));

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Version endpoint
app.get('/api/version', (req, res) => {
  res.json({ version: '0.1-prototype' });
});

// OpenAPI spec stub
app.get('/api/openapi.json', (req, res) => {
  res.json({ planned: true, message: 'OpenAPI specification coming soon' });
});

// Public metrics (no authentication required)
app.get('/api/public/metrics', async (req, res) => {
  try {
    const stats = await db.all(`
      SELECT
        triage_level,
        status,
        COUNT(*) as count
      FROM cases
      GROUP BY triage_level, status
    `);

    const summary = {
      total: 0,
      red: 0,
      yellow: 0,
      green: 0,
      pending: 0,
      resolved: 0
    };

    stats.forEach(stat => {
      summary.total += stat.count;
      summary[stat.triage_level.toLowerCase()] += stat.count;
      summary[stat.status] += stat.count;
    });

    res.json(summary);
  } catch (error) {
    console.error('Public metrics error:', error);
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

// Authentication routes
app.post('/api/login', login);
app.post('/api/logout', logout);
app.get('/api/user', getCurrentUser);

// Case submission (Citizens only)
app.post('/api/submit-case', authenticateUser, requireRole('citizen'), async (req, res) => {
  try {
    const caseData = req.body;

    // Validate input
    const validationErrors = validateCaseData(caseData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    // Generate IDs
    const caseId = db.generateCaseId();
    const patientId = db.generatePatientId();

    // Run triage
    const triageResult = triageCase(caseData);

    // Save to database
    const result = await db.run(`
      INSERT INTO cases (
        case_id, patient_id, symptoms, duration, fever, temperature,
        pain_level, allergies, triage_level, triage_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      caseId,
      patientId,
      caseData.symptoms,
      caseData.duration,
      caseData.fever ? 1 : 0,
      caseData.temperature || null,
      caseData.pain_level || null,
      caseData.allergies || '',
      triageResult.level,
      triageResult.reason
    ]);

    res.json({
      success: true,
      case_id: caseId,
      patient_id: patientId,
      triage_level: triageResult.level,
      message: `Case ${caseId} submitted successfully. Priority: ${triageResult.level}`
    });

  } catch (error) {
    console.error('Case submission error:', error);
    res.status(500).json({ error: 'Failed to submit case' });
  }
});

// Get cases (GP only)
app.get('/api/cases', authenticateUser, requireRole('gp'), async (req, res) => {
  try {
    const { filter, status } = req.query;

    let query = 'SELECT * FROM cases WHERE 1=1';
    const params = [];

    // Filter by triage level
    if (filter && ['RED', 'YELLOW', 'GREEN'].includes(filter.toUpperCase())) {
      query += ' AND triage_level = ?';
      params.push(filter.toUpperCase());
    }

    // Filter by status
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const cases = await db.all(query, params);
    res.json(cases);

  } catch (error) {
    console.error('Get cases error:', error);
    res.status(500).json({ error: 'Failed to retrieve cases' });
  }
});

// Get single case (GP only)
app.get('/api/cases/:caseId', authenticateUser, requireRole('gp'), async (req, res) => {
  try {
    const { caseId } = req.params;

    const caseData = await db.get(
      'SELECT * FROM cases WHERE case_id = ?',
      [caseId]
    );

    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json(caseData);

  } catch (error) {
    console.error('Get case error:', error);
    res.status(500).json({ error: 'Failed to retrieve case' });
  }
});

// Update case status (GP only)
app.patch('/api/cases/:caseId', authenticateUser, requireRole('gp'), async (req, res) => {
  try {
    const { caseId } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await db.run(
      'UPDATE cases SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE case_id = ?',
      [status, caseId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ success: true, message: 'Case status updated' });

  } catch (error) {
    console.error('Update case error:', error);
    res.status(500).json({ error: 'Failed to update case' });
  }
});

// Get dashboard stats (GP only)
app.get('/api/dashboard/stats', authenticateUser, requireRole('gp'), async (req, res) => {
  try {
    const stats = await db.all(`
      SELECT
        triage_level,
        status,
        COUNT(*) as count
      FROM cases
      GROUP BY triage_level, status
    `);

    const summary = {
      total: 0,
      red: 0,
      yellow: 0,
      green: 0,
      pending: 0,
      resolved: 0
    };

    stats.forEach(stat => {
      summary.total += stat.count;
      summary[stat.triage_level.toLowerCase()] += stat.count;
      summary[stat.status] += stat.count;
    });

    res.json(summary);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`AI GP Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});