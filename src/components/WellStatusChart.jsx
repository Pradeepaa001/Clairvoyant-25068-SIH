import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import '../assets/WellStatusChart.css';

const WellStatusChart = ({ data }) => {
  // Process data for well status pie chart - group by well_no first
  const statusData = useMemo(() => {
    // Group by well_no first, then get the latest status for each well
    const wellsById = data.reduce((map, item) => {
      const id = item.well_no;
      if (!id) return map;
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(item);
      return map;
    }, new Map());

    // Get the latest status for each well (most recent date)
    const wellStatuses = Array.from(wellsById.values()).map(records => {
      const sorted = records.sort((a, b) => new Date(b.date_parsed) - new Date(a.date_parsed));
      return sorted[0].remarks_category || 'unknown';
    });

    const statusCount = wellStatuses.reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const totalWells = wellStatuses.length;

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      percentage: ((count / totalWells) * 100).toFixed(1)
    }));
  }, [data]);

  // Process data for well type comparison - group by well_no first
  const wellTypeData = useMemo(() => {
    // Group by well_no first
    const wellsById = data.reduce((map, item) => {
      const id = item.well_no;
      if (!id) return map;
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(item);
      return map;
    }, new Map());

    // Process each unique well
    const typeCount = {};
    Array.from(wellsById.values()).forEach(records => {
      const well = records[0]; // Use first record for well type and depth
      const type = well.well_type_unified || 'Unknown';
      
      if (!typeCount[type]) {
        typeCount[type] = {
          name: type,
          total: 0,
          dry: 0,
          avgDepth: 0,
          depths: []
        };
      }
      
      typeCount[type].total += 1;
      
      // Check if this well has ever been dry
      const hasBeenDry = records.some(r => r.is_dry);
      if (hasBeenDry) typeCount[type].dry += 1;
      
      if (well.well_depth_m_unified) {
        typeCount[type].depths.push(well.well_depth_m_unified);
      }
    });

    return Object.values(typeCount).map(type => ({
      ...type,
      dryPercentage: ((type.dry / type.total) * 100).toFixed(1),
      avgDepth: type.depths.length > 0 ? 
        (type.depths.reduce((sum, depth) => sum + depth, 0) / type.depths.length).toFixed(2) : 0
    }));
  }, [data]);

  const statusColors = {
    'Closed': '#f56565',
    'Dry': '#ed8936',
    'Debris': '#9f7aea',
    'Rootblock': '#38b2ac',
    'Unknown': '#718096',
    'Active': '#48bb78'
  };

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="status-tooltip">
          <p className="tooltip-title">{data.name}</p>
          <p className="tooltip-value">Count: {data.value}</p>
          <p className="tooltip-percentage">Percentage: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const barTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="status-tooltip">
          <p className="tooltip-title">{label}</p>
          <p className="tooltip-value">Total Wells: {payload[0].value}</p>
          <p className="tooltip-percentage">Dry Wells: {payload[1] ? payload[1].value : 0}%</p>
          <p className="tooltip-info">Avg Depth: {payload[0].payload.avgDepth}m</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="well-status-container">
      <div className="chart-header">
        <h3 className="chart-title">
          <span className="chart-icon">🔄</span>
          Well Status Distribution
        </h3>
      </div>

      {/* Pie Chart for Status Distribution */}
      <div className="pie-chart-section">
        <h4 className="subsection-title">Status Overview</h4>
        <div className="pie-chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={statusColors[entry.name] || statusColors['Unknown']} 
                  />
                ))}
              </Pie>
              <Tooltip content={customTooltip} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>
                    {value} ({entry.payload.percentage}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart for Well Type Comparison */}
      <div className="bar-chart-section">
        <h4 className="subsection-title">Well Type Analysis</h4>
        <div className="bar-chart-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={wellTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={60}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip content={barTooltip} />
              <Legend />
              <Bar 
                dataKey="total" 
                fill="#667eea" 
                name="Total Wells"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="dryPercentage" 
                fill="#f56565" 
                name="Dry Wells (%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Cards */}
      <div className="status-cards">
        {statusData.map((status, index) => (
          <div key={index} className="status-card" style={{ borderLeftColor: statusColors[status.name] || statusColors['Unknown'] }}>
            <div className="status-card-header">
              <span className="status-name">{status.name}</span>
              <span className="status-count">{status.value}</span>
            </div>
            <div className="status-percentage">{status.percentage}% of total wells</div>
            <div className="status-indicator" style={{ backgroundColor: statusColors[status.name] || statusColors['Unknown'] }}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WellStatusChart;