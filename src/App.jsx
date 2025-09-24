import React, { useState, useEffect, useMemo } from 'react';
import KPICards from './components/KPICards';
import FilterPanel from './components/FilterPanel';
import WaterLevelChart from './components/WaterLevelChart';
import WellStatusChart from './components/WellStatusChart';
import GeospatialMap from './components/GeospatialMap';
import AlertsPanel from './components/AlertsPanel';
import LandUseAnalysis from './components/LandUseAnalysis';
import data from './data/data.json';
import './App.css';

function App() {
  const [filteredData, setFilteredData] = useState(data);
  const [filters, setFilters] = useState({
    district: 'All',
    taluk: 'All',
    wellType: 'All',
    dateRange: { start: null, end: null },
    remarksCategory: 'All'
  });

  // Process and filter data based on current filters
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply filters
    if (filters.district !== 'All') {
      filtered = filtered.filter(item => item.district_unified === filters.district);
    }
    
    if (filters.taluk !== 'All') {
      filtered = filtered.filter(item => item.taluk_unified === filters.taluk);
    }
    
    if (filters.wellType !== 'All') {
      filtered = filtered.filter(item => item.well_type_unified === filters.wellType);
    }
    
    if (filters.remarksCategory !== 'All') {
      filtered = filtered.filter(item => item.remarks_category === filters.remarksCategory);
    }

    // Date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date_parsed);
        return itemDate >= filters.dateRange.start && itemDate <= filters.dateRange.end;
      });
    }

    return filtered;
  }, [filters]);

  // Get unique values for filter dropdowns (taluks react to selected district)
  const filterOptions = useMemo(() => {
    const districts = [...new Set(data.map(item => item.district_unified).filter(Boolean))].sort();
    const talukSource = filters.district !== 'All' 
      ? data.filter(item => item.district_unified === filters.district)
      : data;
    const taluks = [...new Set(talukSource.map(item => item.taluk_unified).filter(Boolean))].sort();
    const wellTypes = [...new Set(data.map(item => item.well_type_unified).filter(Boolean))].sort();
    const remarksCategories = [...new Set(data.map(item => item.remarks_category).filter(Boolean))].sort();
    return { districts, taluks, wellTypes, remarksCategories };
  }, [filters.district]);

  useEffect(() => {
    setFilteredData(processedData);
  }, [processedData]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => {
      const next = { ...prev, ...newFilters };
      // If district changed, reset taluk to 'All' to avoid stale selection
      if (newFilters.district && newFilters.district !== prev.district) {
        next.taluk = 'All';
      }
      return next;
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="main-title">
            <span className="title-icon">💧</span>
            Groundwater Monitoring Dashboard
          </h1>
          <p className="subtitle">Real-time insights into groundwater resources and well status</p>
        </div>
      </header>

      <main className="dashboard-content">
        {/* KPI Cards Section */}
        <section className="dashboard-section">
          <KPICards data={filteredData} />
        </section>

        {/* Filters Section */}
        <section className="dashboard-section">
          <FilterPanel 
            filters={filters}
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions}
          />
        </section>

        {/* Alerts Panel */}
        <section className="dashboard-section">
          <AlertsPanel data={filteredData} />
        </section>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Water Level Trends */}
          <section className="chart-section full-width">
            <WaterLevelChart data={filteredData} />
          </section>

          {/* Well Status and Land Use */}
          <section className="chart-section">
            <WellStatusChart data={filteredData} />
          </section>

          <section className="chart-section">
            <LandUseAnalysis data={filteredData} />
          </section>

          {/* Geospatial Map */}
          <section className="chart-section full-width">
            <GeospatialMap data={filteredData} />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;