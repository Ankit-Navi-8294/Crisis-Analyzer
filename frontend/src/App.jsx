import React, { useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { useData } from './context/DataContext';
import Header from './components/Header';
import ResultCard from './components/ResultCard';
import Loader from './components/Loader';
import GlobalMap from './components/GlobalMap';
import CountryDetail from './pages/CountryDetail';
import ArticleDetail from './pages/ArticleDetail';
import './index.css';

function Dashboard() {
  const { data, setData, lastUpdated, setLastUpdated } = useData();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const contentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: 'Global_Economic_Risk_Briefing',
  });

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/analyze');
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const resultData = await response.json();
      setData(resultData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Failed to connect to backend. Ensure the server is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  const highCount   = Array.isArray(data) ? data.filter(d => d.riskLevel === 'High').length : 0;
  const mediumCount = Array.isArray(data) ? data.filter(d => d.riskLevel === 'Medium').length : 0;
  const lowCount    = Array.isArray(data) ? data.filter(d => d.riskLevel === 'Low').length : 0;
  const hasData     = Array.isArray(data) && data.length > 0;

  return (
    <div className="app-container">
      <Header lastUpdated={lastUpdated} onRefresh={handleAnalyze} loading={loading} />

      <main className="main-content" ref={contentRef}>
        {hasData && (
          <div className="download-bar">
            <button onClick={() => handlePrint()} className="download-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export Executive Briefing
            </button>
          </div>
        )}

        <section className="action-section">
          <span className="hero-label">AI-Powered Intelligence</span>
          <h1 className="hero-heading">Global Economic Risk Analyzer</h1>
          <p className="hero-sub">
            Real-time geopolitical intelligence powered by AI — identify economic threats before they impact your organization.
          </p>
          <button onClick={handleAnalyze} disabled={loading} className="analyze-button">
            {loading ? (
              <>
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                Analyzing...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Analyze Global Risks
              </>
            )}
          </button>
        </section>

        <section className="results-section">
          {loading && <Loader />}

          {error && !loading && <div className="error-message">{error}</div>}

          {!loading && hasData && (
            <>
              <div className="stats-bar">
                <div className="stat-pill">
                  <span>Total Risks</span>
                  <span className="stat-pill-value">{data.length}</span>
                </div>
                {highCount > 0 && (
                  <div className="stat-pill stat-pill-high">
                    <span style={{ color: '#ef4444' }}>⚠</span>
                    <span>High Risk</span>
                    <span className="stat-pill-value">{highCount}</span>
                  </div>
                )}
                {mediumCount > 0 && (
                  <div className="stat-pill stat-pill-medium">
                    <span style={{ color: '#f59e0b' }}>◉</span>
                    <span>Medium Risk</span>
                    <span className="stat-pill-value">{mediumCount}</span>
                  </div>
                )}
                {lowCount > 0 && (
                  <div className="stat-pill stat-pill-low">
                    <span style={{ color: '#10b981' }}>✓</span>
                    <span>Low Risk</span>
                    <span className="stat-pill-value">{lowCount}</span>
                  </div>
                )}
              </div>

              <GlobalMap data={data} />

              <div className="results-grid">
                {data.map((item, index) => (
                  <ResultCard key={index} data={item} index={index} />
                ))}
              </div>
            </>
          )}

          {!loading && !error && data !== null && !hasData && (
            <div className="empty-state">
              <span className="empty-icon">🌐</span>
              <h3>No Risks Detected</h3>
              <p>The AI found no significant economic risks in the current news cycle. Try again shortly.</p>
            </div>
          )}

          {!loading && !error && data === null && (
            <div className="empty-state">
              <span className="empty-icon">🛰️</span>
              <h3>No analysis yet</h3>
              <p>Click "Analyze Global Risks" to scan live news and generate an AI-powered economic risk briefing.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/country/:name" element={<CountryDetail />} />
      <Route path="/article/:title" element={<ArticleDetail />} />
    </Routes>
  );
}

export default App;
