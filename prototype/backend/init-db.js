const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/prototype.db');

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
});

// Create tables
db.serialize(() => {
  // Cases table
  db.run(`
    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id TEXT UNIQUE NOT NULL,
      patient_id TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      duration TEXT NOT NULL,
      fever BOOLEAN DEFAULT 0,
      temperature REAL,
      pain_level INTEGER,
      allergies TEXT,
      triage_level TEXT NOT NULL,
      triage_reason TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating cases table:', err);
    else console.log('Cases table created');
  });

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('citizen', 'gp'))
    )
  `, (err) => {
    if (err) console.error('Error creating users table:', err);
    else console.log('Users table created');
  });

  // Seed users
  const citizenHash = bcrypt.hashSync('citizen123', 10);
  const gpHash = bcrypt.hashSync('gp123', 10);

  db.run(`INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)`,
    ['citizen1', citizenHash, 'citizen']);
  db.run(`INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)`,
    ['gp1', gpHash, 'gp']);

  // Seed sample cases for testing
  const sampleCases = [
    {
      case_id: 'CS001',
      patient_id: 'P001',
      symptoms: 'Severe chest pain and shortness of breath',
      duration: '< 1 hour',
      fever: 0,
      temperature: null,
      pain_level: 9,
      allergies: 'None',
      triage_level: 'RED',
      triage_reason: 'High pain level (9/10) indicates emergency'
    },
    {
      case_id: 'CS002',
      patient_id: 'P002',
      symptoms: 'High fever and persistent cough',
      duration: '2-3 days',
      fever: 1,
      temperature: 39.2,
      pain_level: 4,
      allergies: 'Penicillin',
      triage_level: 'RED',
      triage_reason: 'High fever (39.2°C) requires immediate attention'
    },
    {
      case_id: 'CS003',
      patient_id: 'P003',
      symptoms: 'Moderate headache and nausea',
      duration: '1-2 days',
      fever: 1,
      temperature: 37.8,
      pain_level: 5,
      allergies: 'None',
      triage_level: 'YELLOW',
      triage_reason: 'Moderate symptoms with low fever'
    },
    {
      case_id: 'CS004',
      patient_id: 'P004',
      symptoms: 'Mild sore throat',
      duration: '1-2 days',
      fever: 0,
      temperature: null,
      pain_level: 2,
      allergies: 'None',
      triage_level: 'GREEN',
      triage_reason: 'Mild symptoms, routine care sufficient'
    },
    {
      case_id: 'CS005',
      patient_id: 'P005',
      symptoms: 'Chronic back pain worsening',
      duration: '> 7 days',
      fever: 0,
      temperature: null,
      pain_level: 6,
      allergies: 'Aspirin',
      triage_level: 'YELLOW',
      triage_reason: 'Chronic condition lasting > 7 days'
    }
  ];

  sampleCases.forEach(caseData => {
    db.run(`
      INSERT OR IGNORE INTO cases (
        case_id, patient_id, symptoms, duration, fever, temperature,
        pain_level, allergies, triage_level, triage_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      caseData.case_id, caseData.patient_id, caseData.symptoms,
      caseData.duration, caseData.fever, caseData.temperature,
      caseData.pain_level, caseData.allergies, caseData.triage_level,
      caseData.triage_reason
    ]);
  });

  console.log('Database initialization completed');
  console.log('Test users created:');
  console.log('- citizen1 / citizen123');
  console.log('- gp1 / gp123');
  console.log('Sample cases added for testing');
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database connection closed');
  }
});