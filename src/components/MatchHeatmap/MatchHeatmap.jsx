import './MatchHeatmap.css';
import { Target, Map as MapIcon } from 'lucide-react';

const MatchHeatmap = ({ scorecard }) => {
  // Generate some semi-random points for the heatmap
  // In a real app, this would come from ball-by-ball GPS coordinates or shot zones
  const shots = [
    { x: 120, y: 50, type: 'boundary', color: '#10b981' },
    { x: 50, y: 150, type: 'single', color: '#4a9eff' },
    { x: 220, y: 180, type: 'dot', color: '#4a5578' },
    { x: 180, y: 250, type: 'boundary', color: '#f5a623' },
    { x: 80, y: 230, type: 'wicket', color: '#ef4444' },
    { x: 150, y: 120, type: 'single', color: '#4a9eff' },
  ];

  return (
    <div className="heatmap-card">
      <div className="heat-header">
        <Target size={16} color="#8b5cf6" />
        <span>Live Shot Distribution (Wagon Wheel)</span>
      </div>

      <div className="field-container">
        <svg viewBox="0 0 300 300" className="field-svg">
          {/* Ground Boundary */}
          <circle cx="150" cy="150" r="140" className="field-boundary" />
          <circle cx="150" cy="150" r="100" className="field-inner" />
          
          {/* Pitch */}
          <rect x="142" y="110" width="16" height="80" rx="2" className="field-pitch" />

          {/* Shot Lines/Points */}
          {shots.map((s, i) => (
            <g key={i}>
              <line 
                x1="150" y1="150" 
                x2={s.x} y2={s.y} 
                stroke={s.color} 
                strokeWidth="1.5" 
                strokeDasharray="4 2"
                className="shot-line"
              />
              <circle cx={s.x} cy={s.y} r="4" fill={s.color} className="shot-dot" shadow="0 0 10px white" />
            </g>
          ))}
        </svg>

        <div className="field-labels">
          <span className="label-off">OFF SIDE</span>
          <span className="label-on">ON SIDE</span>
        </div>
      </div>

      <div className="heat-legend">
        <div className="leg-item"><span style={{ background: '#10b981' }} /> Boundary</div>
        <div className="leg-item"><span style={{ background: '#4a9eff' }} /> Single/Double</div>
        <div className="leg-item"><span style={{ background: '#ef4444' }} /> Wicket</div>
      </div>
    </div>
  );
};

export default MatchHeatmap;
