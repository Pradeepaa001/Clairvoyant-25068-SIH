import React, { useMemo, useState } from 'react';
import '../assets/GeospatialMap.css';

const GeospatialMap = ({ data = [] }) => {
  const [hoverInfo, setHoverInfo] = useState(null);

  const bounds = useMemo(() => {
    if (!data.length) {
      return { minLat: 5, maxLat: 37, minLon: 68, maxLon: 98 };
    }
    let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
    data.forEach(d => {
      const lat = Number(d.latitude_unified);
      const lon = Number(d.longitude_unified);
      if (isFinite(lat) && isFinite(lon)) {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
      }
    });
    if (!isFinite(minLat) || !isFinite(minLon)) {
      return { minLat: 5, maxLat: 37, minLon: 68, maxLon: 98 };
    }
    // Add small padding
    const latPad = (maxLat - minLat || 1) * 0.05;
    const lonPad = (maxLon - minLon || 1) * 0.05;
    return { minLat: minLat - latPad, maxLat: maxLat + latPad, minLon: minLon - lonPad, maxLon: maxLon + lonPad };
  }, [data]);

  const projected = useMemo(() => {
    const width = 900;
    const height = 420;
    const { minLat, maxLat, minLon, maxLon } = bounds;
    const lonSpan = (maxLon - minLon) || 1;
    const latSpan = (maxLat - minLat) || 1;

    const points = data
      .filter(d => isFinite(Number(d.latitude_unified)) && isFinite(Number(d.longitude_unified)))
      .map(d => {
        const lon = Number(d.longitude_unified);
        const lat = Number(d.latitude_unified);
        const x = ((lon - minLon) / lonSpan) * width;
        const y = height - ((lat - minLat) / latSpan) * height; // invert y
        const status = d.is_dry ? 'dry' : (d.remarks_category || '').toLowerCase();
        return { x, y, d, status };
      });

    return { width, height, points };
  }, [data, bounds]);

  const getColor = (p) => {
    const cat = p.status;
    if (cat === 'dry') return '#e53935';
    if (cat.includes('root')) return '#fb8c00';
    if (cat.includes('debris')) return '#8e24aa';
    if (cat.includes('closed')) return '#546e7a';
    return '#1e88e5';
  };

  const getSize = (d) => {
    const depth = Number(d.well_depth_m_unified) || 0;
    const wl = Number(d.water_level_bgl_m) || 0;
    const base = 3;
    const depthFactor = Math.max(0, Math.min(1, depth / 100));
    const wlFactor = Math.max(0, Math.min(1, wl / 50));
    return base + 2 * depthFactor + 2 * wlFactor;
  };

  return (
    <div className="geo-card">
      <div className="geo-header">
        <div className="geo-title">Geospatial Well Distribution</div>
        <div className="geo-legend">
          <span className="legend-item"><span className="dot" style={{ background: '#1e88e5' }}></span>Normal</span>
          <span className="legend-item"><span className="dot" style={{ background: '#e53935' }}></span>Dry</span>
          <span className="legend-item"><span className="dot" style={{ background: '#fb8c00' }}></span>Rootblock</span>
          <span className="legend-item"><span className="dot" style={{ background: '#8e24aa' }}></span>Debris</span>
          <span className="legend-item"><span className="dot" style={{ background: '#546e7a' }}></span>Closed</span>
        </div>
      </div>

      <div className="geo-body">
        <svg className="geo-svg" width={projected.width} height={projected.height} role="img" aria-label="Well locations map">
          <defs>
            <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d253f" />
              <stop offset="100%" stopColor="#133b5c" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={projected.width} height={projected.height} fill="url(#bgGrad)" rx="12" />

          {projected.points.map((p, i) => (
            <g key={i}
               onMouseEnter={(e) => setHoverInfo({ x: e.clientX, y: e.clientY, item: p.d })}
               onMouseLeave={() => setHoverInfo(null)}>
              <circle cx={p.x} cy={p.y} r={getSize(p.d)} fill={getColor(p)} opacity="0.9" />
              <circle cx={p.x} cy={p.y} r={getSize(p.d) + 2} fill="none" stroke="rgba(255,255,255,0.18)" />
            </g>
          ))}
        </svg>

        {hoverInfo && (
          <div className="geo-tooltip" style={{ left: hoverInfo.x + 12, top: hoverInfo.y + 12 }}>
            <div className="tt-title">{hoverInfo.item.station_name_unified || 'Well'}</div>
            <div className="tt-row"><span>Well No</span><span>{hoverInfo.item.well_no}</span></div>
            <div className="tt-row"><span>Type</span><span>{hoverInfo.item.well_type_unified}</span></div>
            <div className="tt-row"><span>Water Level (BGL)</span><span>{Number(hoverInfo.item.water_level_bgl_m || 0).toFixed(2)} m</span></div>
            <div className="tt-row"><span>Status</span><span>{hoverInfo.item.is_dry ? 'Dry' : (hoverInfo.item.remarks_category || 'OK')}</span></div>
            <div className="tt-row"><span>Location</span><span>{hoverInfo.item.district_unified} / {hoverInfo.item.taluk_unified}</span></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeospatialMap;


