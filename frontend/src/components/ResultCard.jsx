import React from 'react';
import { useNavigate } from 'react-router-dom';

const ResultCard = ({ data, index }) => {
  const navigate = useNavigate();
  const { title, description, riskLevel, id } = data;
  const animationDelay = `${index * 0.12}s`;

  return (
    <div className={`result-card risk-${riskLevel}`} style={{ animationDelay }}>
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        <span className={`risk-badge risk-${riskLevel}`}>
          {riskLevel === 'High' ? '⚠ ' : riskLevel === 'Medium' ? '◉ ' : '✓ '}{riskLevel}
        </span>
      </div>

      <div className="card-divider" />

      <div className="card-section">
        <p className="impact-text">{description || 'No description available.'}</p>
      </div>

      <div className="card-footer" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        <button 
          className="impacts-button" 
          onClick={() => navigate(`/article/${encodeURIComponent(title)}`)}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          View Impacts & Analytics
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
