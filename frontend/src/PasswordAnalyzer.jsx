import React, { useState } from 'react';
import axios from 'axios';
import './PasswordAnalyzer.css';

function PasswordAnalyzer() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzePassword = async () => {
    if (!password) {
      setError('Please enter a password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('https://sturdy-goldfish-x5xgr675w4g7cp9w7-5000.app.github.dev/api/analyze', {
        password: password
      });
      setResult(response.data);
    } catch (err) {
      setError('Failed to analyze password. Make sure the backend is running.');
      console.error('Error:', err);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      analyzePassword();
    }
  };

  return (
    <div className="analyzer-container">
      <div className="header">
        <h1>🔐 SecurePass Analyzer</h1>
        <p className="subtitle">Check your password strength and breach status</p>
      </div>

      <div className="input-section">
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter password to analyze"
            className="password-input"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="toggle-visibility"
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>

        <button
          onClick={analyzePassword}
          disabled={loading}
          className="analyze-button"
        >
          {loading ? '⏳ Analyzing...' : '🔍 Analyze Password'}
        </button>

        {error && <div className="error-message">{error}</div>}
      </div>

      {result && (
        <div className="results-section">
          <OverallStatus status={result.overall_status} warnings={result.warnings} />
          <StrengthDisplay strength={result.strength} />
          <BreachDisplay breach={result.breach} />
        </div>
      )}
    </div>
  );
}

function OverallStatus({ status, warnings }) {
  const statusConfig = {
    secure: { emoji: '✅', color: '#10b981', text: 'Secure' },
    moderate: { emoji: '⚠️', color: '#f59e0b', text: 'Moderate' },
    weak: { emoji: '⚠️', color: '#ef4444', text: 'Weak' },
    critical: { emoji: '🚨', color: '#dc2626', text: 'Critical Risk' }
  };

  const config = statusConfig[status] || statusConfig.moderate;

  return (
    <div className="overall-status" style={{ borderColor: config.color }}>
      <h2 style={{ color: config.color }}>
        {config.emoji} Overall Status: {config.text}
      </h2>
      {warnings.length > 0 && (
        <ul className="warnings-list">
          {warnings.map((warning, idx) => (
            <li key={idx}>⚠️ {warning}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StrengthDisplay({ strength }) {
  const colors = ['#dc2626', '#f97316', '#eab308', '#84cc16', '#10b981'];
  const color = colors[strength.score];

  return (
    <div className="strength-card">
      <h3>💪 Password Strength</h3>
      
      <div className="strength-header">
        <span className="strength-label" style={{ color }}>
          {strength.strength_label}
        </span>
        <span className="strength-score">{strength.score}/4</span>
      </div>

      <div className="strength-bar">
        <div
          className="strength-bar-fill"
          style={{
            width: `${(strength.score + 1) * 20}%`,
            backgroundColor: color
          }}
        />
      </div>

      <p className="crack-time">
        ⏱️ Time to crack: <strong>{strength.crack_time}</strong>
      </p>

      <div className="checks-grid">
        <CheckItem 
          label="12+ Characters" 
          passed={strength.checks.length} 
        />
        <CheckItem 
          label="Uppercase (A-Z)" 
          passed={strength.checks.uppercase} 
        />
        <CheckItem 
          label="Lowercase (a-z)" 
          passed={strength.checks.lowercase} 
        />
        <CheckItem 
          label="Numbers (0-9)" 
          passed={strength.checks.numbers} 
        />
        <CheckItem 
          label="Special (!@#$)" 
          passed={strength.checks.special} 
        />
        <CheckItem 
          label="No Common Patterns" 
          passed={strength.checks.no_common_patterns} 
        />
      </div>

      {strength.feedback.warning && (
        <div className="feedback-warning">
          ⚠️ {strength.feedback.warning}
        </div>
      )}

      {strength.feedback.suggestions && strength.feedback.suggestions.length > 0 && (
        <div className="feedback-suggestions">
          <strong>💡 Suggestions:</strong>
          <ul>
            {strength.feedback.suggestions.map((suggestion, idx) => (
              <li key={idx}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CheckItem({ label, passed }) {
  return (
    <div className={`check-item ${passed ? 'passed' : 'failed'}`}>
      <span className="check-icon">{passed ? '✓' : '✗'}</span>
      <span className="check-label">{label}</span>
    </div>
  );
}

function BreachDisplay({ breach }) {
  if (!breach.checked) {
    return (
      <div className="breach-card breach-error">
        <h3>🔍 Breach Check</h3>
        <p>❌ Unable to check breaches: {breach.error}</p>
      </div>
    );
  }

  return (
    <div className={`breach-card ${breach.breached ? 'breach-found' : 'breach-safe'}`}>
      <h3>🔍 Data Breach Check</h3>
      
      {breach.breached ? (
        <div className="breach-found-content">
          <div className="breach-icon">🚨</div>
          <h4>Password Compromised!</h4>
          <p className="breach-count">
            Seen <strong>{breach.count.toLocaleString()}</strong> times in data breaches
          </p>
          <p className="breach-severity">
            Severity: <span className={`severity-${breach.severity}`}>
              {breach.severity.toUpperCase()}
            </span>
          </p>
          <div className="breach-warning">
            <strong>⚠️ This password is unsafe!</strong>
            <p>It has been exposed in data breaches and should never be used.</p>
          </div>
        </div>
      ) : (
        <div className="breach-safe-content">
          <div className="breach-icon">✅</div>
          <h4>No Breaches Found</h4>
          <p>This password hasn't appeared in any known data breaches.</p>
          <p className="breach-note">
            <small>Checked against 500M+ compromised passwords via Have I Been Pwned</small>
          </p>
        </div>
      )}
    </div>
  );
}

export default PasswordAnalyzer;