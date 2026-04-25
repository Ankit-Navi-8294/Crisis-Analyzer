import React from 'react';

const Header = ({ lastUpdated, onRefresh, loading }) => {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-logo">🌐</div>
        <div>
          <div className="header-title">CrisisAnalyzer</div>
          <div className="header-subtitle">AI Economic Intelligence Platform</div>
        </div>
      </div>

      <div className="header-controls">
        <div className="status-dot">Live</div>
        {lastUpdated && (
          <span className="last-updated">Updated {lastUpdated}</span>
        )}
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh Analysis"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.4 : 1,
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
