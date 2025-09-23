import React from 'react';
import '../assets/KPICards.css';

const KPICards = ({ data }) => {
  // Calculate KPI metrics
  const totalWells = data.length;
  const dryWells = data.filter(item => item.is_dry).length;
  const avgWaterLevel = data.reduce((sum, item) => sum + (item.water_level_bgl_m || 0), 0) / totalWells;
  let maxWaterLevel = Math.max(...data.map(item => item.water_level_bgl_m || 0));
  let minWaterLevel = Math.min(...data.map(item => item.water_level_bgl_m || 0));
  // Well types count
  const borewells = data.filter(item => item.well_type_unified?.toLowerCase().includes('bore')).length;
  const dugWells = data.filter(item => item.well_type_unified?.toLowerCase().includes('dug')).length;

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
      title: 'Deepest Level',
      value: `${maxWaterLevel.toFixed(2)}m`,
      icon: '⬇️',
      color: 'teal',
      trend: 'good',
      description: 'Maximum depth recorded'
    },
    {
      title: 'Shallowest Level',
      value: `${minWaterLevel.toFixed(2)}m`,
      icon: '⬆️',
      color: 'orange',
      trend: 'critical',
      description: 'Minimum depth recorded'
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