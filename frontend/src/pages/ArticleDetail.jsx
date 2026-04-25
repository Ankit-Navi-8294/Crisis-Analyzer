import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';

const RISK_COLORS = { High: '#ef4444', Medium: '#facc15', Low: '#10b981' };

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

const ArticleDetail = () => {
  const { title } = useParams();
  const navigate = useNavigate();
  const { data } = useData();
  const articleTitle = decodeURIComponent(title);

  const article = useMemo(() => {
    if (!data || !Array.isArray(data)) return null;
    return data.find(item => item.title === articleTitle);
  }, [data, articleTitle]);

  const barData = useMemo(() => {
    if (!article) return [];
    return [
      {
        name: 'Short-Term',
        severity: estimateSeverity(article.shortTerm),
      },
      {
        name: 'Long-Term',
        severity: estimateSeverity(article.longTerm),
      },
    ];
  }, [article]);

  const radarData = useMemo(() => {
    if (!article) return [];
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
      const text = ((article.impact || '') + ' ' + (article.shortTerm || '') + ' ' + (article.longTerm || '')).toLowerCase();
      keywords[dim].forEach(kw => { if (text.includes(kw)) score += 2; });
      return { dimension: dim, score: Math.min(10, score || 2) };
    });
  }, [article]);

  if (!article) {
    return (
      <div className="country-detail-page">
        <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>
          <h2 style={{ color: '#f1f5f9' }}>Article Not Found</h2>
          <button className="back-button" onClick={() => navigate('/')} style={{ marginTop: '2rem' }}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="country-detail-page">
      <div className="cd-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="cd-title-group" style={{ maxWidth: '70%' }}>
          <span className="hero-label">Detailed Economic Impact Analysis</span>
          <h1 className="cd-country-name" style={{ fontSize: '1.5rem', lineHeight: '1.2' }}>{article.title}</h1>
          <span className={`risk-badge risk-${article.riskLevel}`} style={{ marginTop: '0.5rem' }}>
            {article.riskLevel} Risk
          </span>
        </div>
        <div style={{ width: 80 }} />
      </div>

      <div className="cd-content">
        <div className="cd-charts-row">
          <div className="cd-chart-card">
            <h3 className="cd-chart-title">Impact Severity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                <YAxis tick={{ fill: '#94a3b8' }} domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Bar dataKey="severity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="cd-chart-card">
            <h3 className="cd-chart-title">Affected Dimensions</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Radar name="Impact" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="cd-chart-card">
             <h3 className="cd-chart-title">Countries Involved</h3>
             <div className="countries-list" style={{ marginTop: '1rem' }}>
                {article.countriesAffected?.map((c, i) => (
                  <span key={i} className="country-tag" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>{c}</span>
                ))}
             </div>
          </div>
        </div>

        <div className="results-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className={`result-card risk-${article.riskLevel}`} style={{ opacity: 1, transform: 'none' }}>
            <div className="card-section">
              <h4>Economic Impact</h4>
              <p className="impact-text" style={{ fontSize: '1.1rem' }}>{article.impact}</p>
            </div>
            <div className="card-divider" />
            <div className="card-section">
              <h4>Short-Term Outlook</h4>
              <p className="effect-text">{article.shortTerm}</p>
            </div>
            <div className="card-section">
              <h4>Long-Term Outlook</h4>
              <p className="effect-text">{article.longTerm}</p>
            </div>
            <div className="card-section">
              <h4>Strategic Recommendations</h4>
              <ul className="suggestions-list">
                {article.suggestions?.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
