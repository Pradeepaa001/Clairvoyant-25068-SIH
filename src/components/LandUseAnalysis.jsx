import React, { useMemo } from 'react';
import '../assets/LandUseAnalysis.css';

const LandUseAnalysis = ({ data = [] }) => {
  const stats = useMemo(() => {
    const groups = new Map();
    data.forEach(d => {
      const key = d.land_use || 'Unknown';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(Number(d.water_level_bgl_m) || 0);
    });
    const items = Array.from(groups.entries()).map(([key, arr]) => {
      const avg = arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : 0;
      return { key, avg, count: arr.length };
    }).sort((a,b)=> b.count - a.count).slice(0,6);
    return items;
  }, [data]);

  const maxAvg = Math.max(1, ...stats.map(s => s.avg));

  return (
    <div className="lu-card">
      <div className="lu-header">
        <div className="lu-title">Land Use vs Avg Water Level (BGL)</div>
      </div>
      <div className="lu-body">
        {stats.map((s, idx) => (
          <div className="lu-row" key={idx}>
            <div className="lu-name">{s.key}</div>
            <div className="lu-bar">
              <div className="lu-fill" style={{ width: `${(s.avg / maxAvg) * 100}%` }}></div>
            </div>
            <div className="lu-value">{s.avg.toFixed(2)} m</div>
          </div>
        ))}
        {stats.length === 0 && <div className="lu-empty">No data</div>}
      </div>
    </div>
  );
};

export default LandUseAnalysis;


