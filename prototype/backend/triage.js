// Simple rule-based triage system for   prototype
// In TRL 6, this would be replaced with ML/AI model

function triageCase(caseData) {
  const {
    symptoms,
    fever,
    temperature,
    pain_level,
    duration
  } = caseData;

  const symptomsLower = symptoms.toLowerCase();
  let level = 'GREEN';
  let reasons = [];

  // RED LEVEL - Emergency indicators
  if (fever && temperature && temperature > 38.5) {
    level = 'RED';
    reasons.push(`High fever (${temperature}°C)`);
  }

  if (pain_level >= 8) {
    level = 'RED';
    reasons.push(`Severe pain level (${pain_level}/10)`);
  }

  // Emergency symptoms keywords
  const emergencyKeywords = [
    'chest pain', 'heart attack', 'stroke', 'unconscious',
    'severe bleeding', 'difficulty breathing', 'shortness of breath',
    'suicide', 'overdose', 'severe accident'
  ];

  emergencyKeywords.forEach(keyword => {
    if (symptomsLower.includes(keyword)) {
      level = 'RED';
      reasons.push(`Emergency symptom: ${keyword}`);
    }
  });

  // YELLOW LEVEL - Urgent but not emergency
  if (level !== 'RED') {
    if (fever && temperature && temperature > 37.5) {
      level = 'YELLOW';
      reasons.push(`Moderate fever (${temperature}°C)`);
    }

    if (pain_level >= 5 && pain_level < 8) {
      level = 'YELLOW';
      reasons.push(`Moderate pain level (${pain_level}/10)`);
    }

    if (duration === '> 7 days') {
      level = 'YELLOW';
      reasons.push('Persistent symptoms > 7 days');
    }

    // Concerning symptoms that need attention
    const urgentKeywords = [
      'persistent cough', 'vomiting', 'diarrhea', 'rash',
      'swelling', 'dizziness', 'headache', 'infection'
    ];

    urgentKeywords.forEach(keyword => {
      if (symptomsLower.includes(keyword) && level === 'GREEN') {
        level = 'YELLOW';
        reasons.push(`Concerning symptom: ${keyword}`);
      }
    });
  }

  // GREEN LEVEL - Routine care
  if (level === 'GREEN') {
    reasons.push('Mild symptoms suitable for routine care');
  }

  return {
    level,
    reason: reasons.join('; '),
    timestamp: new Date().toISOString()
  };
}

// Validate case data before triage
function validateCaseData(data) {
  const errors = [];

  if (!data.symptoms || data.symptoms.trim().length < 5) {
    errors.push('Symptoms description must be at least 5 characters');
  }

  if (!data.duration) {
    errors.push('Duration is required');
  }

  if (data.pain_level && (data.pain_level < 0 || data.pain_level > 10)) {
    errors.push('Pain level must be between 0 and 10');
  }

  if (data.fever && data.temperature && (data.temperature < 35 || data.temperature > 45)) {
    errors.push('Temperature must be between 35°C and 45°C');
  }

  return errors;
}

module.exports = {
  triageCase,
  validateCaseData
};