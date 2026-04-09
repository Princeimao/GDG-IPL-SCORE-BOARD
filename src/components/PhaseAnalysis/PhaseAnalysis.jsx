import './PhaseAnalysis.css';
import { BarChart2 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const PhaseCard = ({ phase, color }) => {
  const runsPerOver = parseFloat(phase.runRate).toFixed(1);
  return (
    <div className="phase-card" style={{ '--phase-color': color }}>
      <div className="phase-card-header">
        <span className="phase-emoji">
          {phase.label === 'Powerplay' ? '⚡' : phase.label === 'Middle Overs' ? '🎯' : '💀'}
        </span>
        <div>
          <div className="phase-label">{phase.label}</div>
          <div className="phase-overs">Overs {phase.overs}</div>
        </div>
      </div>

      <div className="phase-stats-grid">
        <StatItem label="Runs" value={phase.runs} color={color} />
        <StatItem label="Wickets" value={phase.wickets} color="#ef4444" />
        <StatItem label="Run Rate" value={runsPerOver} color={color} suffix="/ov" />
        <StatItem label="Boundaries" value={phase.boundaries} color="#f5a623" />
        <StatItem label="Sixes" value={phase.sixes} color="#8b5cf6" />
        <StatItem label="Dot %" value={`${phase.dotPercent}%`} color="#4a5578" />
      </div>

      {/* RR progress bar */}
      <div className="phase-rr-bar">
        <div className="phase-rr-label">Run Rate</div>
        <div className="progress-bar" style={{ flex: 1 }}>
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(100, (runsPerOver / 15) * 100)}%`,
              background: color,
            }}
          />
        </div>
        <div className="phase-rr-value" style={{ color }}>{runsPerOver}</div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, color, suffix = '' }) => (
  <div className="stat-item">
    <span className="stat-value" style={{ color }}>{value}{suffix}</span>
    <span className="stat-label">{label}</span>
  </div>
);

const PhaseAnalysis = ({ phases }) => {
  if (!phases) return null;

  const { powerplay, middle, death } = phases;

  const radarData = [
    { metric: 'Run Rate', PP: powerplay.runRate, Mid: middle.runRate, Death: death.runRate },
    { metric: 'Wickets', PP: powerplay.wickets * 20, Mid: middle.wickets * 10, Death: death.wickets * 15 },
    { metric: 'Boundaries', PP: powerplay.boundaries * 8, Mid: middle.boundaries * 6, Death: death.boundaries * 8 },
    { metric: 'Dot %', PP: powerplay.dotPercent, Mid: middle.dotPercent, Death: death.dotPercent },
    { metric: 'Sixes', PP: powerplay.sixes * 12, Mid: middle.sixes * 9, Death: death.sixes * 12 },
  ];

  return (
    <div className="phase-analysis card">
      <div className="phase-analysis-header">
        <BarChart2 size={18} className="phase-icon" />
        <h3 className="phase-title">Phase Analysis</h3>
        <span className="phase-sub">Powerplay · Middle · Death Overs</span>
      </div>

      <div className="phase-cards-row">
        <PhaseCard phase={powerplay} color="#f5a623" />
        <PhaseCard phase={middle} color="#8b5cf6" />
        <PhaseCard phase={death} color="#ef4444" />
      </div>

      <div className="radar-section">
        <div className="radar-title">Phase Comparison Radar</div>
        <div className="radar-chart-wrap">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#8892b0', fontSize: 11 }} />
              <Radar name="Powerplay" dataKey="PP" stroke="#f5a623" fill="#f5a623" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Middle" dataKey="Mid" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Death" dataKey="Death" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
              <Tooltip
                contentStyle={{
                  background: '#1a2440',
                  border: '1px solid rgba(74,158,255,0.2)',
                  borderRadius: 10,
                  fontSize: 12,
                  color: '#e8eaf6',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="radar-legend">
            <span style={{ color: '#f5a623' }}>⚡ Powerplay</span>
            <span style={{ color: '#8b5cf6' }}>🎯 Middle</span>
            <span style={{ color: '#ef4444' }}>💀 Death</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhaseAnalysis;
