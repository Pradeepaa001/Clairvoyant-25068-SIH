// import React, { useState, useEffect } from "react";
// import { Card, CardContent, Grid, Typography, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
// import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
// import "react-toastify/dist/ReactToastify.css";

// // Sample Colors for Pie/Markers
// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// // Sample Dataset (Replace with your dataset)
// import data from "./assets/data.json"; // your dataset in JSON format

// const Dashboard = () => {
//   const [districtFilter, setDistrictFilter] = useState("All");
//   const [wellTypeFilter, setWellTypeFilter] = useState("All");

//   // Filters applied to dataset
//   const filteredData = data.filter(d =>
//     (districtFilter === "All" || d.district_unified === districtFilter) &&
//     (wellTypeFilter === "All" || d.well_type_unified === wellTypeFilter)
//   );

//   // Unique districts and well types for filters
//   const districts = ["All", ...new Set(data.map(d => d.district_unified))];
//   const wellTypes = ["All", ...new Set(data.map(d => d.well_type_unified))];

//   // KPI Metrics
//   const totalWells = new Set(filteredData.map(d => d.well_no)).size;
//   const dryWells = filteredData.filter(d => d.is_dry).length;
//   const avgWaterLevel = (filteredData.reduce((acc, d) => acc + (d.water_level_bgl_m || 0), 0) / filteredData.length).toFixed(2);
//   const maxWaterLevel = Math.max(...filteredData.map(d => d.water_level_bgl_m || 0));
//   const minWaterLevel = Math.min(...filteredData.map(d => d.water_level_bgl_m || 0));

//   // Aggregate for Pie Chart: remarks_clean
//   const remarkCounts = filteredData.reduce((acc, d) => {
//     acc[d.remarks_clean] = (acc[d.remarks_clean] || 0) + 1;
//     return acc;
//   }, {});
//   const pieData = Object.keys(remarkCounts).map((key, index) => ({
//     name: key,
//     value: remarkCounts[key],
//     color: COLORS[index % COLORS.length]
//   }));

//   // Time-Series Data Example (Aggregate avg per date)
//   const timeSeriesData = [];
//   const dateMap = {};
//   filteredData.forEach(d => {
//     if (d.date_parsed && d.water_level_bgl_m !== null) {
//       if (!dateMap[d.date_parsed]) dateMap[d.date_parsed] = { date: d.date_parsed, total: 0, count: 0 };
//       dateMap[d.date_parsed].total += d.water_level_bgl_m;
//       dateMap[d.date_parsed].count += 1;
//     }
//   });
//   for (const key in dateMap) {
//     timeSeriesData.push({ date: key, avg: dateMap[key].total / dateMap[key].count });
//   }
//   timeSeriesData.sort((a, b) => new Date(a.date) - new Date(b.date));

//   return (
//     <div style={{ padding: 20 }}>
//       <Typography variant="h4" gutterBottom>Groundwater Dashboard</Typography>

//       {/* Filters */}
//       <Grid container spacing={2} style={{ marginBottom: 20 }}>
//         <Grid item>
//           <FormControl>
//             <InputLabel>District</InputLabel>
//             <Select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
//               {districts.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
//             </Select>
//           </FormControl>
//         </Grid>
//         <Grid item>
//           <FormControl>
//             <InputLabel>Well Type</InputLabel>
//             <Select value={wellTypeFilter} onChange={e => setWellTypeFilter(e.target.value)}>
//               {wellTypes.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
//             </Select>
//           </FormControl>
//         </Grid>
//       </Grid>

//       {/* KPI Cards */}
//       <Grid container spacing={2} style={{ marginBottom: 20 }}>
//         <Grid item xs={2}>
//           <Card><CardContent><Typography>Total Wells</Typography><Typography variant="h6">{totalWells}</Typography></CardContent></Card>
//         </Grid>
//         <Grid item xs={2}>
//           <Card><CardContent><Typography>Dry Wells</Typography><Typography variant="h6">{dryWells}</Typography></CardContent></Card>
//         </Grid>
//         <Grid item xs={2}>
//           <Card><CardContent><Typography>Avg Water Level (m)</Typography><Typography variant="h6">{avgWaterLevel}</Typography></CardContent></Card>
//         </Grid>
//         <Grid item xs={2}>
//           <Card><CardContent><Typography>Max Water Level (m)</Typography><Typography variant="h6">{maxWaterLevel}</Typography></CardContent></Card>
//         </Grid>
//         <Grid item xs={2}>
//           <Card><CardContent><Typography>Min Water Level (m)</Typography><Typography variant="h6">{minWaterLevel}</Typography></CardContent></Card>
//         </Grid>
//       </Grid>

//       {/* Map */}
//       <div style={{ height: 500, marginBottom: 20 }}>
//         <MapContainer center={[20, 78]} zoom={5} style={{ height: "100%", width: "100%" }}>
//           <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//           {filteredData.map((d, idx) => (
//             d.latitude_unified && d.longitude_unified && (
//               <CircleMarker
//                 key={idx}
//                 center={[d.latitude_unified, d.longitude_unified]}
//                 radius={5}
//                 color={d.is_dry ? "red" : "blue"}
//               >
//                 <Popup>
//                   <strong>{d.station_name_unified}</strong><br />
//                   Water Level: {d.water_level_bgl_m} m<br />
//                   Type: {d.well_type_unified}<br />
//                   Remarks: {d.remarks_clean}<br />
//                   Land Use: {d.land_use}
//                 </Popup>
//               </CircleMarker>
//             )
//           ))}
//         </MapContainer>
//       </div>

//       {/* Time-Series Chart */}
//       <Typography variant="h6" gutterBottom>Average Water Level Over Time</Typography>
//       <LineChart width={1000} height={300} data={timeSeriesData}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="date" />
//         <YAxis />
//         <Tooltip />
//         <Legend />
//         <Line type="monotone" dataKey="avg" stroke="#8884d8" name="Avg Water Level" />
//       </LineChart>

//       {/* Pie Chart for Remarks */}
//       <Typography variant="h6" gutterBottom>Well Status Distribution (Remarks)</Typography>
//       <PieChart width={400} height={300}>
//         <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100}>
//           {pieData.map((entry, index) => (
//             <Cell key={`cell-${index}`} fill={entry.color} />
//           ))}
//         </Pie>
//       </PieChart>
//     </div>
//   );
// };

// export default Dashboard;
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { MapContainer, TileLayer, CircleMarker, Tooltip as MapTooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Example color palette
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Dashboard = ({ data }) => {
  const [filteredData, setFilteredData] = useState(data);

  // Aggregate KPIs
  const totalWells = filteredData.length;
  const dryWells = filteredData.filter(d => d.is_dry).length;
  const avgWaterLevel =
    filteredData.reduce((acc, d) => acc + (d.water_level_bgl_m || 0), 0) / totalWells || 0;

  // Prepare time series data (example: average water level per date)
  const timeSeriesData = Object.values(
    filteredData.reduce((acc, curr) => {
      const date = curr.date_parsed;
      if (!acc[date]) acc[date] = { date, water_level_sum: 0, count: 0 };
      acc[date].water_level_sum += curr.water_level_bgl_m || 0;
      acc[date].count += 1;
      return acc;
    }, {})
  ).map(d => ({
    date: d.date,
    avgWaterLevel: d.water_level_sum / d.count
  }));

  // Prepare remarks category distribution
  const remarksCount = {};
  filteredData.forEach(d => {
    const cat = d.remarks_clean || "Unknown";
    remarksCount[cat] = (remarksCount[cat] || 0) + 1;
  });
  const pieData = Object.keys(remarksCount).map(key => ({
    name: key,
    value: remarksCount[key]
  }));

  return (
    <div style={{ padding: "20px" }}>
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="dashboard-card">
          <h3>Total Wells</h3>
          <p>{totalWells}</p>
        </div>
        <div className="dashboard-card">
          <h3>Dry Wells</h3>
          <p>{dryWells}</p>
        </div>
        <div className="dashboard-card">
          <h3>Avg Water Level (BGL)</h3>
          <p>{avgWaterLevel.toFixed(2)} m</p>
        </div>
      </div>

      {/* Line Chart */}
      <div className="chart-container">
        <h2>Average Water Level Over Time</h2>
        <LineChart width={800} height={300} data={timeSeriesData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="avgWaterLevel" stroke="#0d6efd" />
        </LineChart>
      </div>

      {/* Pie Chart for Remarks */}
      <div className="chart-container">
        <h2>Remarks Category Distribution</h2>
        <PieChart width={400} height={300}>
          <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} fill="#8884d8" label>
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </div>

      {/* Map */}
      <div className="map-container">
        <MapContainer center={[20, 77]} zoom={5} style={{ height: "500px", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {filteredData.map((d, idx) => (
            <CircleMarker
              key={idx}
              center={[d.latitude_unified, d.longitude_unified]}
              radius={6}
              color={d.is_dry ? "red" : "blue"}
            >
              <MapTooltip>
                <div>
                  <strong>{d.station_name_unified}</strong>
                  <br />
                  Well Type: {d.well_type_unified}
                  <br />
                  Water Level: {d.water_level_bgl_m} m
                  <br />
                  Remarks: {d.remarks_clean}
                </div>
              </MapTooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default Dashboard;
