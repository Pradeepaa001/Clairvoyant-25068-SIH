import React, { useMemo } from 'react';
import '../assets/AlertsPanel.css';

const AlertsPanel = ({ data = [] }) => {
  const alerts = useMemo(() => {
    const dry = data.filter(d => d.is_dry);
    const debris = data.filter(d => (d.remarks_category || '').toLowerCase().includes('debris'));
    const rootblock = data.filter(d => (d.remarks_category || '').toLowerCase().includes('root'));

    // Detect sharp drops over time per well (requires multiple records per well)
    const byWell = new Map();
    data.forEach(d => {
      const key = d.well_no;
      if (!byWell.has(key)) byWell.set(key, []);
      byWell.get(key).push(d);
    });
    const drops = [];
    byWell.forEach(records => {
      records.sort((a, b) => new Date(a.date_parsed) - new Date(b.date_parsed));
      for (let i = 1; i < records.length; i++) {
        const prev = Number(records[i-1].water_level_bgl_m) || 0;
        const curr = Number(records[i].water_level_bgl_m) || 0;
        const delta = curr - prev;
        if (delta >= 5) { // 5m or more increase in depth (drop)
          drops.push({
            ...records[i],
            delta,
          });
          break;
        }
      }
    });

    return {
      dry,
      debris,
      rootblock,
      drops
    };
  }, [data]);

  const AlertCard = ({ title, items, color }) => (
    <div className="alert-card">
      <div className="alert-header" style={{ borderColor: color }}>
        <div className="alert-dot" style={{ background: color }}></div>
        <div className="alert-title">{title}</div>
        <div className="alert-count" style={{ color }}>{items.length}</div>
      </div>
      <div className="alert-body">
        {items.length === 0 && <div className="empty">No alerts</div>}
        {items.slice(0, 6).map((it, idx) => (
          <div className="alert-item" key={idx}>
            <div className="ai-title">{it.station_name_unified || 'Well'} • {it.well_no}</div>
            <div className="ai-row"><span>District</span><span>{it.district_unified}</span></div>
            <div className="ai-row"><span>Taluk</span><span>{it.taluk_unified}</span></div>
            {typeof it.delta !== 'undefined' && (
              <div className="ai-row"><span>Drop</span><span>{it.delta.toFixed(2)} m</span></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="alerts-grid">
      <AlertCard title="Dry Wells" items={alerts.dry} color="#e53935" />
      <AlertCard title="Debris Reported" items={alerts.debris} color="#8e24aa" />
      <AlertCard title="Rootblock Issues" items={alerts.rootblock} color="#fb8c00" />
      <AlertCard title="Sharp Level Drops" items={alerts.drops} color="#ffb300" />
    </div>
  );
};

export default AlertsPanel;


