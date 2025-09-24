// import React, { useMemo } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import '../assets/WaterLevelChart.css';

// const WaterLevelChart = ({ data }) => {
//   // Process data for time series chart
//   const chartData = useMemo(() => {
//     // First group by well_no, then by date for each well
//     const wellGroups = data.reduce((acc, item) => {
//       const wellNo = item.well_no;
//       if (!acc[wellNo]) {
//         acc[wellNo] = {};
//       }
      
//       const date = item.date_parsed;
//       if (!acc[wellNo][date]) {
//         acc[wellNo][date] = {
//           date,
//           levels: [],
//           isDry: false
//         };
//       }
      
//       if (item.is_dry) {
//         acc[wellNo][date].isDry = true;
//       } else if (item.water_level_bgl_m !== null && item.water_level_bgl_m !== undefined) {
//         acc[wellNo][date].levels.push(item.water_level_bgl_m);
//       }
      
//       return acc;
//     }, {});

//     // Calculate averages for each well on each date
//     const wellAverages = {};
//     Object.keys(wellGroups).forEach(wellNo => {
//       wellAverages[wellNo] = {};
//       Object.keys(wellGroups[wellNo]).forEach(date => {
//         const wellData = wellGroups[wellNo][date];
//         if (wellData.levels.length > 0) {
//           wellAverages[wellNo][date] = {
//             date,
//             avg: wellData.levels.reduce((sum, level) => sum + level, 0) / wellData.levels.length,
//             max: Math.max(...wellData.levels),
//             min: Math.min(...wellData.levels),
//             isDry: wellData.isDry
//           };
//         } else if (wellData.isDry) {
//           wellAverages[wellNo][date] = {
//             date,
//             avg: null,
//             max: null,
//             min: null,
//             isDry: true
//           };
//         }
//       });
//     });

//     // Now group by date and collect all well averages, maximums, and minimums for each day
//     const dateGroups = {};
//     Object.keys(wellAverages).forEach(wellNo => {
//       Object.keys(wellAverages[wellNo]).forEach(date => {
//         if (!dateGroups[date]) {
//           dateGroups[date] = {
//             date,
//             allAverages: [],
//             allMaximums: [],
//             allMinimums: [],
//             dryWells: 0,
//             totalWells: 0
//           };
//         }
        
//         const wellData = wellAverages[wellNo][date];
//         dateGroups[date].totalWells += 1;
        
//         if (wellData.isDry) {
//           dateGroups[date].dryWells += 1;
//         } else {
//           if (wellData.avg !== null) dateGroups[date].allAverages.push(wellData.avg);
//           if (wellData.max !== null) dateGroups[date].allMaximums.push(wellData.max);
//           if (wellData.min !== null) dateGroups[date].allMinimums.push(wellData.min);
//         }
//       });
//     });

//     // Convert to array and calculate final statistics for each day
//     return Object.values(dateGroups)
//       .map(group => {
//         // Calculate average of all well averages for this day
//         const avgOfAverages = group.allAverages.length > 0 ? 
//           group.allAverages.reduce((sum, level) => sum + level, 0) / group.allAverages.length : null;
        
//         // Calculate average of all well maximums for this day
//         const avgOfMaximums = group.allMaximums.length > 0 ? 
//           group.allMaximums.reduce((sum, level) => sum + level, 0) / group.allMaximums.length : null;
        
//         // Calculate average of all well minimums for this day
//         const avgOfMinimums = group.allMinimums.length > 0 ? 
//           group.allMinimums.reduce((sum, level) => sum + level, 0) / group.allMinimums.length : null;

//         return {
//           date: group.date,
//           avgWaterLevel: avgOfAverages,
//           maxWaterLevel: avgOfMaximums,
//           minWaterLevel: avgOfMinimums,
//           dryWellsPercentage: (group.dryWells / group.totalWells) * 100,
//           wellCount: group.totalWells,
//           activeWells: group.allAverages.length
//         };
//       })
//       .sort((a, b) => new Date(a.date) - new Date(b.date))
//       .slice(0, 50); // Limit to 50 data points for performance
//   }, [data]);

//   const customTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="custom-tooltip">
//           <p className="tooltip-date">{`Date: ${new Date(label).toLocaleDateString()}`}</p>
//           {payload.map((entry, index) => (
//             <p key={index} style={{ color: entry.color }} className="tooltip-data">
//               {`${entry.name}: ${entry.value?.toFixed(2) || 'N/A'}${entry.name.includes('Level') ? 'm' : '%'}`}
//             </p>
//           ))}
//         </div>
//       );
//     }
//     return null;
//   };

//   const formatXAxis = (tickItem) => {
//     return new Date(tickItem).toLocaleDateString('en-US', { 
//       month: 'short', 
//       year: '2-digit' 
//     });
//   };

//   return (
//     <div className="chart-container">
//       <div className="chart-header">
//         <h3 className="chart-title">
//           <span className="chart-icon">📈</span>
//           Water Level Trends Over Time
//         </h3>
//         <div className="chart-stats">
//           <span className="stat-item">
//             📊 {chartData.length} Data Points
//           </span>
//           <span className="stat-item">
//             🏗️ {new Set(data.map(d => d.well_no)).size} Unique Wells
//           </span>
//           <span className="stat-item">
//             📈 Well-based Grouping
//           </span>
//         </div>
//       </div>

//       <div className="chart-wrapper">
//         <ResponsiveContainer width="100%" height={400}>
//           <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
//             <XAxis 
//               dataKey="date" 
//               tickFormatter={formatXAxis}
//               angle={-45}
//               textAnchor="end"
//               height={60}
//               stroke="#718096"
//               fontSize={12}
//             />
//             <YAxis 
//               stroke="#718096"
//               fontSize={12}
//               label={{ value: 'Water Level (m BGL)', angle: -90, position: 'insideLeft' }}
//             />
//             <Tooltip content={customTooltip} />
//             <Legend />
            
//             <Line 
//               type="monotone" 
//               dataKey="avgWaterLevel" 
//               stroke="#667eea" 
//               strokeWidth={3}
//               name="Avg of Well Averages"
//               dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
//               activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2, fill: '#fff' }}
//             />
            
//             <Line 
//               type="monotone" 
//               dataKey="maxWaterLevel" 
//               stroke="#f56565" 
//               strokeWidth={2}
//               strokeDasharray="5 5"
//               name="Avg of Well Maximums"
//               dot={false}
//             />
            
//             <Line 
//               type="monotone" 
//               dataKey="minWaterLevel" 
//               stroke="#48bb78" 
//               strokeWidth={2}
//               strokeDasharray="5 5"
//               name="Avg of Well Minimums"
//               dot={false}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Summary Statistics */}
//       <div className="chart-summary">
//         <div className="summary-card">
//           <div className="summary-value">
//             {chartData.length > 0 ? 
//               chartData[chartData.length - 1]?.avgWaterLevel?.toFixed(2) || 'N/A' : 'N/A'}m
//           </div>
//           <div className="summary-label">Latest Average</div>
//         </div>
        
//         <div className="summary-card">
//           <div className="summary-value">
//             {Math.max(...chartData.map(d => d.avgWaterLevel || 0)).toFixed(2)}m
//           </div>
//           <div className="summary-label">Deepest Recorded</div>
//         </div>
        
//         <div className="summary-card">
//           <div className="summary-value">
//             {Math.min(...chartData.map(d => d.avgWaterLevel || Infinity)).toFixed(2)}m
//           </div>
//           <div className="summary-label">Shallowest Recorded</div>
//         </div>
        
//         <div className="summary-card">
//           <div className="summary-value">
//             {chartData.reduce((sum, d) => sum + (d.dryWellsPercentage || 0), 0) / chartData.length || 0}%
//           </div>
//           <div className="summary-label">Avg Dry Wells</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WaterLevelChart;
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../assets/WaterLevelChart.css';

const WaterLevelChart = ({ data }) => {
  // Process data for time series chart
  const chartData = useMemo(() => {
    // Step 1: group by well_no, then by date
    const wellGroups = data.reduce((acc, item) => {
      const wellNo = item.well_no;
      if (!acc[wellNo]) {
        acc[wellNo] = {};
      }
      
      const date = item.date_parsed;
      if (!acc[wellNo][date]) {
        acc[wellNo][date] = {
          date,
          levels: [],
          isDry: false
        };
      }
      
      if (item.is_dry) {
        acc[wellNo][date].isDry = true;
      } else if (item.water_level_bgl_m !== null && item.water_level_bgl_m !== undefined) {
        acc[wellNo][date].levels.push(item.water_level_bgl_m);
      }
      
      return acc;
    }, {});

    // Step 2: calculate per-well avg, max, min for each date
    const wellAverages = {};
    Object.keys(wellGroups).forEach(wellNo => {
      wellAverages[wellNo] = {};
      Object.keys(wellGroups[wellNo]).forEach(date => {
        const wellData = wellGroups[wellNo][date];
        if (wellData.levels.length > 0) {
          wellAverages[wellNo][date] = {
            date,
            avg: wellData.levels.reduce((sum, level) => sum + level, 0) / wellData.levels.length,
            max: Math.max(...wellData.levels),
            min: Math.min(...wellData.levels),
            isDry: wellData.isDry
          };
        } else if (wellData.isDry) {
          wellAverages[wellNo][date] = {
            date,
            avg: null,
            max: null,
            min: null,
            isDry: true
          };
        }
      });
    });

    // Step 3: group by date, collect all well averages and all individual levels
    const dateGroups = {};
    Object.keys(wellAverages).forEach(wellNo => {
      Object.keys(wellAverages[wellNo]).forEach(date => {
        if (!dateGroups[date]) {
          dateGroups[date] = {
            date,
            allAverages: [],
            allLevels: [], // Collect all individual water levels for max/min calculation
            dryWells: 0,
            totalWells: 0
          };
        }
        
        const wellData = wellAverages[wellNo][date];
        dateGroups[date].totalWells += 1;
        
        if (wellData.isDry) {
          dateGroups[date].dryWells += 1;
        } else {
          if (wellData.avg !== null) {
            dateGroups[date].allAverages.push(wellData.avg);
            // Add all individual levels from this well for this date
            const wellLevels = wellGroups[wellNo][date].levels;
            dateGroups[date].allLevels.push(...wellLevels);
          }
        }
      });
    });

    // Step 4: compute daily statistics
    return Object.values(dateGroups)
      .map(group => {
        // Average of all well averages for this day
        const avgOfAverages = group.allAverages.length > 0
          ? group.allAverages.reduce((sum, level) => sum + level, 0) / group.allAverages.length
          : null;

        // Maximum water level across all wells for this day
        const maxAcrossAllWells = group.allLevels.length > 0
          ? Math.max(...group.allLevels)
          : null;

        // Minimum water level across all wells for this day
        const minAcrossAllWells = group.allLevels.length > 0
          ? Math.min(...group.allLevels)
          : null;

        return {
          date: group.date,
          avgWaterLevel: avgOfAverages,
          maxWaterLevel: maxAcrossAllWells,
          minWaterLevel: minAcrossAllWells,
          dryWellsPercentage: (group.dryWells / group.totalWells) * 100,
          wellCount: group.totalWells,
          activeWells: group.allAverages.length
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 50); // Limit to 50 points for performance
  }, [data]);

  // Tooltip formatter
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

  // X axis format
  const formatXAxis = (tickItem) => {
    return new Date(tickItem).toLocaleDateString('en-US', { 
      month: 'short', 
      year: '2-digit' 
    });
  };

  // ---------- SUMMARY VALUES ----------
  const latest = chartData.length > 0 ? chartData[chartData.length - 1] : null;
  const deepest = chartData.length > 0 ? Math.max(...chartData.map(d => d.maxWaterLevel || 0)) : null;
  const shallowest = chartData.length > 0 ? Math.min(...chartData.map(d => d.minWaterLevel || Infinity)) : null;
  const avgDry = chartData.length > 0
    ? chartData.reduce((sum, d) => sum + (d.dryWellsPercentage || 0), 0) / chartData.length
    : 0;

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
            🏗️ {new Set(data.map(d => d.well_no)).size} Unique Wells
          </span>
          <span className="stat-item">
            📈 Well-based Grouping
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
            {latest?.avgWaterLevel?.toFixed(2) || 'N/A'}m
          </div>
          <div className="summary-label">Latest Average</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-value">
            {deepest ? deepest.toFixed(2) : 'N/A'}m
          </div>
          <div className="summary-label">Deepest Recorded</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-value">
            {shallowest !== Infinity ? shallowest.toFixed(2) : 'N/A'}m
          </div>
          <div className="summary-label">Shallowest Recorded</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-value">
            {avgDry.toFixed(2)}%
          </div>
          <div className="summary-label">Avg Dry Wells</div>
        </div>
      </div>
    </div>
  );
};

export default WaterLevelChart;
