import React from 'react';
import '../assets/FilterPanel.css';

const FilterPanel = ({ filters, onFilterChange, filterOptions }) => {
  const handleSelectChange = (filterType, value) => {
    onFilterChange({ [filterType]: value });
  };

  const handleDateChange = (type, value) => {
    const newDateRange = { ...filters.dateRange };
    newDateRange[type] = value ? new Date(value) : null;
    onFilterChange({ dateRange: newDateRange });
  };

  const clearFilters = () => {
    onFilterChange({
      district: 'All',
      taluk: 'All',
      wellType: 'All',
      dateRange: { start: null, end: null },
      remarksCategory: 'All'
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'dateRange') {
      return value.start || value.end;
    }
    return value !== 'All';
  }).length;

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3 className="filter-title">
          <span className="filter-icon">🔍</span>
          Filters & Controls
        </h3>
        {activeFiltersCount > 0 && (
          <div className="filter-actions">
            <span className="active-filters-count">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </span>
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="filter-grid">
        {/* District Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="label-icon">🏛️</span>
            District
          </label>
          <select
            className="filter-select"
            value={filters.district}
            onChange={(e) => handleSelectChange('district', e.target.value)}
          >
            <option value="All">All Districts</option>
            {filterOptions.districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        {/* Taluk Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="label-icon">🏘️</span>
            Taluk
          </label>
          <select
            className="filter-select"
            value={filters.taluk}
            onChange={(e) => handleSelectChange('taluk', e.target.value)}
          >
            <option value="All">All Taluks</option>
            {filterOptions.taluks.map(taluk => (
              <option key={taluk} value={taluk}>{taluk}</option>
            ))}
          </select>
        </div>

        {/* Well Type Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="label-icon">🏗️</span>
            Well Type
          </label>
          <select
            className="filter-select"
            value={filters.wellType}
            onChange={(e) => handleSelectChange('wellType', e.target.value)}
          >
            <option value="All">All Types</option>
            {filterOptions.wellTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Remarks Category Filter */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="label-icon">📝</span>
            Status
          </label>
          <select
            className="filter-select"
            value={filters.remarksCategory}
            onChange={(e) => handleSelectChange('remarksCategory', e.target.value)}
          >
            <option value="All">All Status</option>
            {filterOptions.remarksCategories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filters */}
        <div className="filter-group">
          <label className="filter-label">
            <span className="label-icon">📅</span>
            Start Date
          </label>
          <input
            type="date"
            className="filter-input"
            value={filters.dateRange.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
            onChange={(e) => handleDateChange('start', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <span className="label-icon">📅</span>
            End Date
          </label>
          <input
            type="date"
            className="filter-input"
            value={filters.dateRange.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
            onChange={(e) => handleDateChange('end', e.target.value)}
          />
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="quick-filters">
        <h4 className="quick-filters-title">Quick Filters:</h4>
        <div className="quick-filter-buttons">
          <button 
            className={`quick-filter-btn ${filters.remarksCategory === 'dry' ? 'active' : ''}`}
            onClick={() => handleSelectChange('remarksCategory', filters.remarksCategory === 'dry' ? 'All' : 'dry')}
          >
            🚨 Dry Wells
          </button>
          <button 
            className={`quick-filter-btn ${filters.wellType === 'Borewell' ? 'active' : ''}`}
            onClick={() => handleSelectChange('wellType', filters.wellType === 'Borewell' ? 'All' : 'Borewell')}
          >
            🔩 Borewells
          </button>
          <button 
            className={`quick-filter-btn ${filters.wellType === 'Dug Well' ? 'active' : ''}`}
            onClick={() => handleSelectChange('wellType', filters.wellType === 'Dug Well' ? 'All' : 'Dug Well')}
          >
            🕳️ Dug Wells
          </button>
          <button 
            className={`quick-filter-btn ${filters.remarksCategory === 'debris' ? 'active' : ''}`}
            onClick={() => handleSelectChange('remarksCategory', filters.remarksCategory === 'debris' ? 'All' : 'debris')}
          >
            🗑️ Debris
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;