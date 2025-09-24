import React from 'react';
import '../assets/KPICards.css';

const KPICards = ({ data }) => {
  // Calculate KPI metrics using unique wells
  const wellsById = data.reduce((map, item) => {
    const id = item.well_no;
    if (!id) return map;
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(item);
    return map;
  }, new Map());

  const totalWells = wellsById.size;

  // Unique dry wells: any record with is_dry=true per well_no
  const dryWells = Array.from(wellsById.values()).filter(records => records.some(r => r.is_dry)).length;

  // Per-well average water level, then overall average of these per-well averages
  const perWellAverages = Array.from(wellsById.values()).map(records => {
    const levels = records.map(r => Number(r.water_level_bgl_m)).filter(v => isFinite(v));
    if (levels.length === 0) return null;
    return levels.reduce((a,b)=>a+b,0) / levels.length;
  }).filter(v => v !== null);
  const avgWaterLevel = perWellAverages.length ? (perWellAverages.reduce((a,b)=>a+b,0) / perWellAverages.length) : 0;

  // Extremes across observed levels (not per-well averages)
  const numericLevels = data.map(item => Number(item.water_level_bgl_m)).filter(v => isFinite(v));
  let maxWaterLevel = numericLevels.length ? Math.max(...numericLevels) : 0;
  let minWaterLevel = numericLevels.length ? Math.min(...numericLevels) : 0;

  // Well types count based on unique wells (use first record's type)
  const uniqueWellTypes = Array.from(wellsById.values()).map(records => (records[0]?.well_type_unified || '').toLowerCase());
  const borewells = uniqueWellTypes.filter(t => t.includes('bore')).length;
  const dugWells = uniqueWellTypes.filter(t => t.includes('dug')).length;

  // Unique districts and talukas present in filtered data
  const totalDistricts = [...new Set(data.map(item => item.district_unified).filter(Boolean))].length;
  const totalTalukas = [...new Set(data.map(item => item.taluk_unified).filter(Boolean))].length;

  const kpiData = [
    {
      title: 'Total Wells',
      value: totalWells.toLocaleString(),
      icon: '🏗️',
      color: 'blue',
      trend: 'stable',
      description: 'Active monitoring points'
    },
    {
      title: 'Dry Wells',
      value: dryWells.toLocaleString(),
      icon: '🚨',
      color: 'red',
      trend: dryWells > totalWells * 0.1 ? 'up' : 'down',
      description: `${((dryWells / totalWells) * 100).toFixed(1)}% of total wells`,
      critical: dryWells > totalWells * 0.1
    },
    {
      title: 'Avg Water Level',
      value: `${avgWaterLevel.toFixed(2)}m`,
      icon: '📊',
      color: 'green',
      trend: 'stable',
      description: 'Below ground level (BGL)'
    },
    {
      title: 'Districts',
      value: totalDistricts.toLocaleString(),
      icon: '🗺️',
      color: 'teal',
      trend: 'good',
      description: 'Districts in view'
    },
    {
      title: 'Talukas',
      value: totalTalukas.toLocaleString(),
      icon: '🏘️',
      color: 'orange',
      trend: 'good',
      description: 'Talukas in view'
    },
    {
      title: 'Borewells',
      value: borewells.toLocaleString(),
      icon: '🔩',
      color: 'purple',
      trend: 'stable',
      description: `${((borewells / totalWells) * 100).toFixed(1)}% of total`
    }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'good': return '✅';
      case 'critical': return '⚠️';
      default: return '➡️';
    }
  };

  return (
    <div className="kpi-container">
      <h2 className="kpi-section-title">
        <span className="section-icon">📈</span>
        Key Performance Indicators
      </h2>
      <div className="kpi-grid">
        {kpiData.map((kpi, index) => (
          <div 
            key={index} 
            className={`kpi-card ${kpi.color} ${kpi.critical ? 'critical' : ''}`}
          >
            <div className="kpi-header">
              <div className="kpi-icon">{kpi.icon}</div>
              <div className="kpi-trend">
                {getTrendIcon(kpi.trend)}
              </div>
            </div>
            
            <div className="kpi-content">
              <div className="kpi-value">{kpi.value}</div>
              <div className="kpi-title">{kpi.title}</div>
              <div className="kpi-description">{kpi.description}</div>
            </div>

            <div className="kpi-footer">
              <div className={`trend-indicator ${kpi.trend}`}>
                <span className="trend-text">
                  {kpi.trend === 'up' ? 'Increasing' : 
                   kpi.trend === 'down' ? 'Decreasing' :
                   kpi.trend === 'good' ? 'Optimal' :
                   kpi.trend === 'critical' ? 'Critical' : 'Stable'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KPICards;