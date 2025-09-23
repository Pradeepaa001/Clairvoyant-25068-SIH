import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../assets/WaterLevelChart.css';

const WaterLevelChart = ({ data }) => {
  // Process data for time series chart
  const chartData = useMemo(() => {
    // Group data by date and calculate average water level
    const groupedData = data.reduce((acc, item) => {
      const date = item.date_parsed;
      if (!acc[date]) {
        acc[date] = {
          date,
          levels: [],
          dryWells: 0,
          totalWells: 0
        };
      }
      
      acc[date].totalWells += 1;
      if (item.is_dry) {
        acc[date].dryWells += 1;
      } else {
        acc[date].levels.push(item.water_level_bgl_m || 0);
      }
      
      return acc;
    }, {});

    // Convert to array and calculate averages
    return Object.values(groupedData)
      .map(group => ({
        date: group.date,
        avgWaterLevel: group.levels.length > 0 ? 
          group.levels.reduce((sum, level) => sum + level, 0) / group.levels.length : null,
        maxWaterLevel: group.levels.length > 0 ? Math.max(...group.levels) : null,
        minWaterLevel: group.levels.length > 0 ? Math.min(...group.levels) : null,
        dryWellsPercentage: (group.dryWells / group.totalWells) * 100,
        wellCount: group.totalWells
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 50); // Limit to 50 data points for performance
  }, [data]);

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{`Date: ${new Date(label).toLocaleDateString()}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="tooltip-data">
              {`${entry.name}: ${entry.value?.toFixed(2) || 'N/A'}${entry.name.includes('Level') ? 'm' : '%'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatXAxis = (tickItem) => {
    return new Date(tickItem).toLocaleDateString('en-US', { 
      month: 'short', 
      year: '2-digit' 
    });
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">
          <span className="chart-icon">📈</span>
          Water Level Trends Over Time
        </h3>
        <div className="chart-stats">
          <span className="stat-item">
            📊 {chartData.length} Data Points
          </span>
          <span className="stat-item">
            🏗️ {data.length} Wells
          </span>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              angle={-45}
              textAnchor="end"
              height={60}
              stroke="#718096"
              fontSize={12}
            />
            <YAxis 
              stroke="#718096"
              fontSize={12}
              label={{ value: 'Water Level (m BGL)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={customTooltip} />
            <Legend />
            
            <Line 
              type="monotone" 
              dataKey="avgWaterLevel" 
              stroke="#667eea" 
              strokeWidth={3}
              name="Average Water Level"
              dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2, fill: '#fff' }}
            />
            
            <Line 
              type="monotone" 
              dataKey="maxWaterLevel" 
              stroke="#f56565" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Maximum Water Level"
              dot={false}
            />
            
            <Line 
              type="monotone" 
              dataKey="minWaterLevel" 
              stroke="#48bb78" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Minimum Water Level"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Statistics */}
      <div className="chart-summary">
        <div className="summary-card">
          <div className="summary-value">
            {chartData.length > 0 ? 
              chartData[chartData.length - 1]?.avgWaterLevel?.toFixed(2) || 'N/A' : 'N/A'}m
          </div>
          <div className="summary-label">Latest Average</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-value">
            {Math.max(...chartData.map(d => d.avgWaterLevel || 0)).toFixed(2)}m
          </div>
          <div className="summary-label">Deepest Recorded</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-value">
            {Math.min(...chartData.map(d => d.avgWaterLevel || Infinity)).toFixed(2)}m
          </div>
          <div className="summary-label">Shallowest Recorded</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-value">
            {chartData.reduce((sum, d) => sum + (d.dryWellsPercentage || 0), 0) / chartData.length || 0}%
          </div>
          <div className="summary-label">Avg Dry Wells</div>
        </div>
      </div>
    </div>
  );
};

export default WaterLevelChart;