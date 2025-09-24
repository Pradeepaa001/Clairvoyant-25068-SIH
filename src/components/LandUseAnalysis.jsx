import React, { useMemo } from 'react';
import '../assets/LandUseAnalysis.css';

const LandUseAnalysis = ({ data = [] }) => {
  const stats = useMemo(() => {
    // Group by well_no first, then by land_use
    const wellsById = data.reduce((map, item) => {
      const id = item.well_no;
      if (!id) return map;
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(item);
      return map;
    }, new Map());

    // Calculate per-well averages, then group by land_use
    const landUseGroups = new Map();
    Array.from(wellsById.values()).forEach(records => {
      const well = records[0]; // Use first record for land_use
      const landUse = well.land_use || 'Unknown';
      
      // Calculate average water level for this well
      const levels = records
        .map(r => Number(r.water_level_bgl_m))
        .filter(v => isFinite(v) && v > 0);
      
      if (levels.length > 0) {
        const wellAvg = levels.reduce((a, b) => a + b, 0) / levels.length;
        
        if (!landUseGroups.has(landUse)) {
          landUseGroups.set(landUse, []);
        }
        landUseGroups.get(landUse).push(wellAvg);
      }
    });

    const items = Array.from(landUseGroups.entries()).map(([key, wellAverages]) => {
      const avg = wellAverages.length ? 
        wellAverages.reduce((a, b) => a + b, 0) / wellAverages.length : 0;
      return { key, avg, count: wellAverages.length };
    }).sort((a, b) => b.count - a.count).slice(0, 6);
    
    return items;
  }, [data]);

  const maxAvg = Math.max(1, ...stats.map(s => s.avg));

  return (
    <div className="lu-card">
      <div className="lu-header">
        <div className="lu-title">Land Use vs Avg Water Level (Well-based)</div>
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


