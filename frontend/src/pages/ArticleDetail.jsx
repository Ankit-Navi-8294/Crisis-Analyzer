import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
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

  // Chat State
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your AI Geopolitical Analyst. Do you have any questions about the economic or geopolitical impacts of this event?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const article = useMemo(() => {
    if (!data || !Array.isArray(data)) return null;
    return data.find(item => item.title === articleTitle);
  }, [data, articleTitle]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const barData = useMemo(() => {
    if (!article) return [];
    return [
      { name: 'Short-Term', severity: estimateSeverity(article.shortTerm) },
      { name: 'Long-Term', severity: estimateSeverity(article.longTerm) },
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8080/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: article.title, message: userMsg }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessages(prev => [...prev, { role: 'ai', text: result.response }]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I'm having trouble connecting to the intelligence server. Please try again in a moment." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!article) {
    return (
      <div className="country-detail-page">
        <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>
          <h2 style={{ color: '#f1f5f9' }}>Analysis Data Unavailable</h2>
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
        <div className="cd-header-left">
          <button className="back-button" onClick={() => navigate('/')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Dashboard
          </button>
          <div className="cd-title-group">
            <span className="hero-label">Executive Intelligence Briefing</span>
            <h1 className="cd-country-name">{article.title}</h1>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
               <span className={`risk-badge risk-${article.riskLevel}`}>
                {article.riskLevel} Risk Level
              </span>
              <span className="country-tag" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {article.countriesAffected?.join(', ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="cd-content">
        <div className="cd-charts-row">
          <div className="cd-chart-card">
            <h3 className="cd-chart-title">Impact Severity Spectrum</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 13 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 13 }} domain={[0, 10]} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}
                />
                <Bar dataKey="severity" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="cd-chart-card">
            <h3 className="cd-chart-title">Geopolitical Dimensions</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Radar name="Impact" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="results-grid" style={{ gridTemplateColumns: '1fr', marginTop: '2.5rem' }}>
          <div className={`result-card risk-${article.riskLevel}`} style={{ opacity: 1, transform: 'none', background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(10px)' }}>
            <div className="card-section">
              <h4 style={{ color: '#3b82f6', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1rem', marginBottom: '1rem' }}>Principal Impact</h4>
              <p className="impact-text" style={{ fontSize: '1.2rem', color: '#f8fafc', lineHeight: '1.6' }}>{article.impact}</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
              <div className="card-section">
                <h4 style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Short-Term Dynamics</h4>
                <p className="effect-text" style={{ color: '#cbd5e1' }}>{article.shortTerm}</p>
              </div>
              <div className="card-section">
                <h4 style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Long-Term Trajectory</h4>
                <p className="effect-text" style={{ color: '#cbd5e1' }}>{article.longTerm}</p>
              </div>
            </div>

            <div className="card-divider" style={{ margin: '2rem 0', opacity: 0.1 }} />
            
            <div className="card-section">
              <h4 style={{ color: '#10b981', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Strategic Action Plan</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {article.suggestions?.map((s, i) => (
                  <div key={i} className="suggestion-item" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px', color: '#ecfdf5', fontSize: '0.9rem' }}>
                    <span style={{ marginRight: '0.5rem' }}>•</span> {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Media Intelligence ────────────────────────────────────────── */}
        <div className="cd-charts-row" style={{ marginTop: '2.5rem' }}>
          <div className="cd-chart-card" style={{ flex: '1' }}>
            <h3 className="cd-chart-title">Global Sentiment Score</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: article.sentimentScore < 0 ? '#ef4444' : '#10b981' }}>
                {(article.sentimentScore * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                {article.sentimentScore < -0.5 ? '⚠️ High Crisis Tension' : (article.sentimentScore < 0 ? '📉 Negative Sentiment' : '📈 Stable/Positive')}
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '1.5rem', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${((article.sentimentScore + 1) / 2) * 100}%`, 
                  height: '100%', 
                  background: `linear-gradient(90deg, #ef4444 0%, #facc15 50%, #10b981 100%)`,
                  transition: 'width 1s ease-out'
                }} />
              </div>
            </div>
          </div>

          <div className="cd-chart-card" style={{ flex: '1' }}>
            <h3 className="cd-chart-title">Media Bias Narrative</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="hero-label" style={{ margin: 0, background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>Primary Narrative:</span>
                <span style={{ color: '#f8fafc', fontWeight: '600' }}>{article.mediaBias || 'Neutral Analysis'}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.5' }}>
                The AI detected a <strong>{article.mediaBias}</strong> bias in this report. This narrative typically prioritizes specific geopolitical objectives over neutral economic reporting.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Chatbot Section ────────────────────────────────────────── */}
        <section className="chat-section">
          <div className="chat-header">
            <div className="chat-dot"></div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>AI Impact Assistant</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: 'auto' }}>Powered by Gemini 2.0</span>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message message-${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="message message-ai typing-indicator">
                Analyst is thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Ask about geopolitical implications or economic risks..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" className="chat-send-btn" disabled={!input.trim() || isTyping}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
              </svg>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ArticleDetail;
