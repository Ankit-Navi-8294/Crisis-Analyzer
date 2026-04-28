import React, { useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const GlobalMap = ({ data, onCountryClick, selectedCountry }) => {
  const [hoveredCountry, setHoveredCountry] = React.useState(null);
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 });

  // Create a lookup map for faster access
  const riskMap = useMemo(() => {
    const map = {};
    if (!data || !Array.isArray(data)) return map;
    
    data.forEach(item => {
      if (item.countriesAffected && Array.isArray(item.countriesAffected)) {
        item.countriesAffected.forEach(country => {
          // Normalize country name for matching
          const name = country.trim().toLowerCase();
          // Keep the highest risk if multiple articles affect the same country
          const currentRisk = map[name];
          if (!currentRisk || 
              (item.riskLevel === 'High') || 
              (item.riskLevel === 'Medium' && currentRisk === 'Low')) {
            map[name] = item.riskLevel;
          }
        });
      }
    });
    return map;
  }, [data]);

  const getFillColor = (geoName) => {
    const isSelected = selectedCountry?.toLowerCase() === geoName.toLowerCase();
    if (isSelected) return "#3b82f6"; // Primary blue for selected

    const risk = riskMap[geoName.toLowerCase()];
    if (!risk) return "#1e293b"; // Default slate-800
    
    switch (risk) {
      case "High": return "#ef4444";   // Red-500
      case "Medium": return "#f59e0b"; // Amber-500
      case "Low": return "#10b981";    // Emerald-500
      default: return "#1e293b";
    }
  };

  const handleMouseMove = (e) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="map-container" onMouseMove={handleMouseMove} style={{ 
      width: '100%', 
      background: 'rgba(15, 23, 42, 0.6)', 
      borderRadius: '1.5rem',
      padding: '1rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      marginBottom: '2rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Tooltip */}
      {hoveredCountry && (
        <div style={{
          position: 'fixed',
          top: tooltipPos.y + 15,
          left: tooltipPos.x + 15,
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#f8fafc',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          pointerEvents: 'none',
          zIndex: 9999,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)'
        }}>
          {hoveredCountry}
        </div>
      )}

      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#f8fafc', margin: 0 }}>Global Threat Topology</h3>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Click a country to filter intelligence
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ color: '#94a3b8' }}>High Risk</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ color: '#94a3b8' }}>Medium Risk</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ color: '#94a3b8' }}>Low Risk</span>
          </div>
        </div>
      </div>

      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147
        }}
        style={{ width: "100%", height: "auto", maxHeight: "400px" }}
      >
        <Sphere stroke="#334155" strokeWidth={0.5} />
        <Graticule stroke="#334155" strokeWidth={0.5} />
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const { name } = geo.properties;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getFillColor(name)}
                  stroke="#0f172a"
                  strokeWidth={0.5}
                  onMouseEnter={() => setHoveredCountry(name)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => onCountryClick && onCountryClick(name)}
                  style={{
                    default: { outline: "none", transition: "all 250ms" },
                    hover: { fill: "#475569", outline: "none", cursor: "pointer" },
                    pressed: { outline: "none" }
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};

export default GlobalMap;
