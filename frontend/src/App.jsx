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
import { API_BASE_URL } from './config';
import './index.css';

function Dashboard() {
  const { data, setData, lastUpdated, setLastUpdated } = useData();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const contentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: 'Global_Economic_Risk_Briefing',
  });

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/analyze?t=${Date.now()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      const resultData = await response.json();
      setData(resultData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Connection Error: ${err.message}. Please check if the backend is running and CORS is configured.`);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    const s = search.toLowerCase().trim();
    return data.filter(item => 
      item.title?.toLowerCase().includes(s) || 
      item.impact?.toLowerCase().includes(s) ||
      item.riskLevel?.toLowerCase().includes(s) ||
      item.countriesAffected?.some(c => c.toLowerCase().includes(s))
    );
  }, [data, search]);

  const highCount   = filteredData.filter(d => d.riskLevel === 'High').length;
  const mediumCount = filteredData.filter(d => d.riskLevel === 'Medium').length;
  const lowCount    = filteredData.filter(d => d.riskLevel === 'Low').length;
  const hasData     = Array.isArray(data) && data.length > 0;

  return (
    <div className="app-container">
      {/* ─── Live Intelligence Ticker ─── */}
      <div className="ticker-bar">
        <span className="ticker-label">Live Monitor</span>
        <div className="ticker-track">
          {hasData 
            ? data.map(d => `[${d.riskLevel} RISK] ${d.title}`).join(' • ') 
            : 'Satellite Intelligence Link: Standing by for global risk telemetry... System Status: Operational'}
        </div>
      </div>

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
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '2rem' }}>
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

            {hasData && !loading && (
              <div className="search-container" style={{ width: '100%' }}>
                <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Filter crises by country, event, or impact..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
          </div>
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

              <GlobalMap data={filteredData} search={search} />

              <div className="results-grid">
                {filteredData.map((item, index) => (
                  <ResultCard key={index} data={item} index={index} />
                ))}
              </div>

              {filteredData.length === 0 && search && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <p>No matches found for "{search}"</p>
                </div>
              )}
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
