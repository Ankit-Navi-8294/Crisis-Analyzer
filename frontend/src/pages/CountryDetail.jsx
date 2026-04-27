import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';

const RISK_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

// Estimate a severity score 1–10 from text length / keywords
const estimateSeverity = (text = '') => {
  if (!text) return 3;
  const severe = ['severe', 'crisis', 'collapse', 'war', 'conflict', 'disruption', 'shortage', 'inflation', 'recession'];
  const moderate = ['concern', 'risk', 'tension', 'pressure', 'volatility', 'impact'];
  let score = 4;
  const lower = text.toLowerCase();
  severe.forEach(w => { if (lower.includes(w)) score += 1.5; });
  moderate.forEach(w => { if (lower.includes(w)) score += 0.5; });
  return Math.min(10, Math.round(score * 10) / 10);
};

const CountryDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { data } = useData();
  const countryName = decodeURIComponent(name);

  // Filter analyses that mention this country
  const countryAnalyses = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.filter(item =>
      item.countriesAffected &&
      item.countriesAffected.some(c =>
        c.toLowerCase().includes(countryName.toLowerCase()) ||
        countryName.toLowerCase().includes(c.toLowerCase())
      )
    );
  }, [data, countryName]);

  // Derive the highest risk level for this country
  const overallRisk = useMemo(() => {
    if (countryAnalyses.some(a => a.riskLevel === 'High')) return 'High';
    if (countryAnalyses.some(a => a.riskLevel === 'Medium')) return 'Medium';
    return 'Low';
  }, [countryAnalyses]);

  // Build bar chart data: each article → short-term vs long-term severity
  const barData = useMemo(() =>
    countryAnalyses.map((item, i) => ({
      name: item.title.length > 30 ? item.title.slice(0, 30) + '…' : item.title,
      shortTerm: estimateSeverity(item.shortTerm),
      longTerm: estimateSeverity(item.longTerm),
    })), [countryAnalyses]);

  // Pie chart data: risk level breakdown
  const pieData = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    countryAnalyses.forEach(a => { if (counts[a.riskLevel] !== undefined) counts[a.riskLevel]++; });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [countryAnalyses]);

  // Radar chart: economic dimensions
  const radarData = useMemo(() => {
    const dims = ['Trade', 'Finance', 'Energy', 'Supply Chain', 'Geopolitics'];
    const keywords = {
      Trade: ['trade', 'export', 'import', 'tariff', 'sanction'],
      Finance: ['market', 'inflation', 'currency', 'gdp', 'debt', 'bank'],
      Energy: ['oil', 'gas', 'energy', 'fuel', 'power'],
      'Supply Chain': ['supply', 'chain', 'logistics', 'production', 'shortage'],
      Geopolitics: ['war', 'conflict', 'military', 'political', 'diplomatic'],
    };
    return dims.map(dim => {
      let score = 0;
      countryAnalyses.forEach(a => {
        const text = ((a.impact || '') + ' ' + (a.shortTerm || '') + ' ' + (a.longTerm || '')).toLowerCase();
        keywords[dim].forEach(kw => { if (text.includes(kw)) score += 2; });
      });
      return { dimension: dim, score: Math.min(10, score || 2) };
    });
  }, [countryAnalyses]);

  const riskColor = RISK_COLORS[overallRisk] || '#64748b';

  if (!data) {
    return (
      <div className="country-detail-page">
        <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>
          <span style={{ fontSize: '3rem' }}>📭</span>
          <h2 style={{ marginTop: '1rem', color: '#f1f5f9' }}>No data loaded</h2>
          <p style={{ marginTop: '0.5rem' }}>Please go back and run an analysis first.</p>
          <button className="back-button" onClick={() => navigate('/')} style={{ marginTop: '2rem' }}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (countryAnalyses.length === 0) {
    return (
      <div className="country-detail-page">
        <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>
          <span style={{ fontSize: '3rem' }}>🌍</span>
          <h2 style={{ marginTop: '1rem', color: '#f1f5f9' }}>No risks found for {countryName}</h2>
          <p>This country was not flagged in the current analysis.</p>
          <button className="back-button" onClick={() => navigate('/')} style={{ marginTop: '2rem' }}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="country-detail-page">
      {/* Header */}
      <div className="cd-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Dashboard
        </button>
        <div className="cd-title-group">
          <span className="hero-label">Country Intelligence Report</span>
          <h1 className="cd-country-name">{countryName}</h1>
          <span
            className={`risk-badge risk-${overallRisk}`}
            style={{ fontSize: '0.875rem', padding: '0.35rem 1rem', marginTop: '0.5rem', display: 'inline-block' }}
          >
            {overallRisk === 'High' ? '⚠ ' : overallRisk === 'Medium' ? '◉ ' : '✓ '}
            Overall {overallRisk} Risk
          </span>
        </div>
        <div style={{ width: 120 }} />
      </div>

      <div className="cd-content">

        {/* Summary Pills */}
        <div className="stats-bar">
          <div className="stat-pill">
            <span>Analyses</span>
            <span className="stat-pill-value">{countryAnalyses.length}</span>
          </div>
          <div className={`stat-pill stat-pill-${overallRisk.toLowerCase()}`}>
            <span>Risk Level</span>
            <span className="stat-pill-value" style={{ color: riskColor }}>{overallRisk}</span>
          </div>
        </div>

        {/* Charts Row */}
        <div className="cd-charts-row">

          {/* Bar Chart */}
          <div className="cd-chart-card">
            <h3 className="cd-chart-title">📊 Short-Term vs Long-Term Impact Severity</h3>
            <p className="cd-chart-sub">AI-estimated severity score (1–10 scale) per article</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 10, right: 20, left: -10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{ background: '#0f1423', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9' }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="shortTerm" name="Short-Term" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="longTerm" name="Long-Term" fill="#818cf8" radius={[4, 4, 0, 0]} />
                <Legend wrapperStyle={{ color: '#94a3b8', paddingTop: '1rem' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="cd-chart-card">
            <h3 className="cd-chart-title">🥧 Risk Level Distribution</h3>
            <p className="cd-chart-sub">Breakdown of risk levels across all articles for {countryName}</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f1423', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9' }}
                />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="cd-chart-card">
            <h3 className="cd-chart-title">🕸 Economic Dimension Analysis</h3>
            <p className="cd-chart-sub">Estimated exposure across key economic sectors</p>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={90}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Radar name="Exposure" dataKey="score" stroke={riskColor} fill={riskColor} fillOpacity={0.2} strokeWidth={2} />
                <Tooltip
                  contentStyle={{ background: '#0f1423', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analysis Cards */}
        <h2 className="cd-section-title">Detailed Analyses Mentioning {countryName}</h2>
        <div className="results-grid">
          {countryAnalyses.map((item, index) => (
            <div key={index} className={`result-card risk-${item.riskLevel}`} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="card-header">
                <h3 className="card-title">{item.title}</h3>
                <span className={`risk-badge risk-${item.riskLevel}`}>
                  {item.riskLevel === 'High' ? '⚠ ' : item.riskLevel === 'Medium' ? '◉ ' : '✓ '}{item.riskLevel}
                </span>
              </div>
              <div className="card-divider" />
              {item.countriesAffected?.length > 0 && (
                <div className="card-section">
                  <h4>Countries Affected</h4>
                  <div className="countries-list">
                    {item.countriesAffected.map((c, i) => (
                      <span key={i} className="country-tag">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="card-section">
                <h4>Economic Impact</h4>
                <p className="impact-text">{item.impact || '—'}</p>
              </div>
              {item.shortTerm && (
                <div className="card-section">
                  <h4>Short Term</h4>
                  <p className="effect-text">{item.shortTerm}</p>
                </div>
              )}
              {item.longTerm && (
                <div className="card-section">
                  <h4>Long Term</h4>
                  <p className="effect-text">{item.longTerm}</p>
                </div>
              )}
              {item.suggestions?.length > 0 && (
                <div className="card-section">
                  <h4>Recommendations</h4>
                  <ul className="suggestions-list">
                    {item.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CountryDetail;
