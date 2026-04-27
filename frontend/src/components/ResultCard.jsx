import React from 'react';
import { useNavigate } from 'react-router-dom';

const ResultCard = ({ data, index }) => {
  const navigate = useNavigate();
  const { title, impact, riskLevel, id } = data;
  const animationDelay = `${index * 0.12}s`;

  return (
    <div className={`result-card risk-${riskLevel}`} style={{ 
      animationDelay,
      background: 'rgba(30, 41, 59, 0.4)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
    }}>
      <div className="card-header">
        <h3 className="card-title" style={{ fontSize: '1.2rem', color: '#f8fafc' }}>{title}</h3>
        <span className={`risk-badge risk-${riskLevel}`} style={{ padding: '0.4rem 1rem', borderRadius: '8px' }}>
          {riskLevel}
        </span>
      </div>

      <div className="card-divider" style={{ opacity: 0.1, margin: '1rem 0' }} />

      <div className="card-section">
        <p className="impact-text" style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6' }}>
          {impact?.length > 140 ? impact.substring(0, 140) + '...' : impact}
        </p>
      </div>

      <div className="card-footer" style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
        <button 
          className="impacts-button" 
          onClick={() => navigate(`/article/${encodeURIComponent(title)}`)}
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            background: 'rgba(59, 130, 246, 0.05)',
            color: '#60a5fa',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
            e.currentTarget.style.borderColor = '#3b82f6';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/><path d="M12 8v4l3 3"/>
          </svg>
          Explore Deep Analytics
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
