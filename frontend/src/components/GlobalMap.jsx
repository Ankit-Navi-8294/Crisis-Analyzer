import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Sphere, Graticule } from 'react-simple-maps';
import { useNavigate } from 'react-router-dom';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const GlobalMap = ({ data }) => {
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState({ visible: false, name: '', risk: '', x: 0, y: 0 });

  // Build a map of countryName -> data
  const countryMetrics = React.useMemo(() => {
    const metrics = {};
    if (!data || !Array.isArray(data)) return metrics;
    data.forEach(item => {
      const { countriesAffected, riskLevel, sentimentScore } = item;
      if (countriesAffected && Array.isArray(countriesAffected)) {
        countriesAffected.forEach(country => {
          const cur = metrics[country];
          if (!cur || riskLevel === 'High' || (riskLevel === 'Medium' && cur.risk !== 'High')) {
            metrics[country] = { risk: riskLevel, sentiment: sentimentScore };
          }
        });
      }
    });
    return metrics;
  }, [data]);

  const getMetric = (geo) => {
    const name = geo.properties.name;
    if (countryMetrics[name]) return countryMetrics[name];
    const match = Object.keys(countryMetrics).find(c =>
      name.toLowerCase().includes(c.toLowerCase()) ||
      c.toLowerCase().includes(name.toLowerCase())
    );
    return match ? countryMetrics[match] : null;
  };

  const getFillColor = (geo) => {
    const metric = getMetric(geo);
    if (!metric) return '#1e2a3a';
    
    // Gradient based on sentiment: -1 (Red) -> 0 (Yellow) -> 1 (Green)
    const s = metric.sentiment;
    if (s < -0.3) return '#ef4444'; // Red
    if (s < 0.2) return '#facc15';  // Yellow
    return '#10b981';               // Green
  };

  const riskBadgeColor = (risk) => {
    if (risk === 'High') return '#ef4444';
    if (risk === 'Medium') return '#facc15';
    if (risk === 'Low') return '#10b981';
    return '#64748b';
  };

  const handleMouseEnter = (geo, evt) => {
    const metric = getMetric(geo);
    setTooltip({
      visible: true,
      name: geo.properties.name,
      risk: metric ? metric.risk : null,
      x: evt.clientX,
      y: evt.clientY,
    });
  };

  const handleMouseMove = (evt) => {
    setTooltip(t => ({ ...t, x: evt.clientX, y: evt.clientY }));
  };

  const handleMouseLeave = () => {
    setTooltip(t => ({ ...t, visible: false }));
  };

  const handleClick = (geo) => {
    const metric = getMetric(geo);
    if (metric) {
      // Find the actual stored key name
      const name = geo.properties.name;
      const matchedKey = countryMetrics[name]
        ? name
        : Object.keys(countryMetrics).find(c =>
            name.toLowerCase().includes(c.toLowerCase()) ||
            c.toLowerCase().includes(name.toLowerCase())
          );
      if (matchedKey) {
        navigate(`/country/${encodeURIComponent(matchedKey)}`);
      }
    }
  };

  return (
    <div className="global-map-container" style={{ position: 'relative' }}>
      <h3 className="map-title">🗺 Global Risk Heatmap — Click a highlighted country to explore</h3>

      <ComposableMap
        projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
        height={400}
        style={{ background: 'transparent' }}
        onMouseMove={handleMouseMove}
      >
        <Sphere stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} fill="rgba(59,130,246,0.04)" />
        <Graticule stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const metric = getMetric(geo);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getFillColor(geo)}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: {
                      fill: metric ? 'rgba(255,255,255,0.3)' : '#253347',
                      outline: 'none',
                      cursor: metric ? 'pointer' : 'default',
                    },
                    pressed: { outline: 'none' },
                  }}
                  onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleClick(geo)}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 14,
            top: tooltip.y - 10,
            background: 'rgba(15, 20, 35, 0.95)',
            border: `1px solid ${tooltip.risk ? riskBadgeColor(tooltip.risk) : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '10px',
            padding: '0.5rem 0.9rem',
            pointerEvents: 'none',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: `0 0 20px ${tooltip.risk ? riskBadgeColor(tooltip.risk) + '44' : 'transparent'}`,
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.875rem' }}>
            {tooltip.name}
          </span>
          {tooltip.risk && (
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: riskBadgeColor(tooltip.risk),
              padding: '0.15rem 0.5rem',
              background: riskBadgeColor(tooltip.risk) + '22',
              borderRadius: '9999px',
              border: `1px solid ${riskBadgeColor(tooltip.risk)}44`,
            }}>
              {tooltip.risk} Risk
            </span>
          )}
          {tooltip.risk && (
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Click to explore →</span>
          )}
        </div>
      )}

      <div className="map-legend">
        <span className="legend-item"><span className="dot high" /> Negative Sentiment</span>
        <span className="legend-item"><span className="dot medium" /> Neutral / Tense</span>
        <span className="legend-item"><span className="dot low" /> Stable / Positive</span>
        <span className="legend-item" style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: '1rem' }}>
          💡 Global Sentiment Intelligence Heatmap
        </span>
      </div>
    </div>
  );
};

export default GlobalMap;
