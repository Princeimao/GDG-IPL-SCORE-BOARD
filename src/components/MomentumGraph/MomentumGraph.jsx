import './MomentumGraph.css';
import { useState } from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="momentum-tooltip">
      <div className="tooltip-header">Over {label}</div>
      {payload.map((point, index) => (
        <div key={index} className="tooltip-row">
          <span style={{ color: point.color }}>{point.name}:</span>
          <span className="tooltip-value">{point.value}</span>
        </div>
      ))}
    </div>
  );
};

const MomentumGraph = ({ data = [] }) => {
  const [view, setView] = useState('runrate');

  const viewConfig = {
    runrate: {
      label: 'Run Rate per Over',
      dataKey: 'runRate',
      color: '#4a9eff',
      description: 'Runs scored per over.',
    },
    cumulative: {
      label: 'Cumulative Runs',
      dataKey: 'cumulative',
      color: '#f5a623',
      description: 'Total runs progression.',
    },
    momentum: {
      label: 'Momentum Score',
      dataKey: 'momentum',
      color: '#10b981',
      description: 'Positive values favor batting, negative values favor bowling.',
    },
  };

  const cfg = viewConfig[view];
  const phases = [
    { over: 6.5, label: 'PP End', stroke: '#f5a623' },
    { over: 15.5, label: 'Middle End', stroke: '#8b5cf6' },
  ];

  return (
    <div className="momentum-card card">
      <div className="momentum-header">
        <div className="momentum-title-row">
          <TrendingUp size={18} className="momentum-icon" />
          <h3 className="momentum-title">Momentum Graph</h3>
          <span className="momentum-sub">Who is dominating each phase</span>
        </div>
        <div className="view-toggle">
          {Object.entries(viewConfig).map(([key, config]) => (
            <button
              key={key}
              className={`view-btn ${view === key ? 'active' : ''}`}
              onClick={() => setView(key)}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      <div className="phase-pills">
        <span className="phase-pill" style={{ color: '#f5a623', borderColor: '#f5a62344' }}>
          Powerplay (1-6)
        </span>
        <span className="phase-pill" style={{ color: '#8b5cf6', borderColor: '#8b5cf644' }}>
          Middle (7-15)
        </span>
        <span className="phase-pill" style={{ color: '#ef4444', borderColor: '#ef444444' }}>
          Death (16-20)
        </span>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={cfg.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal vertical={false} />
            <XAxis
              dataKey="over"
              tick={{ fill: '#4a5578', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
              label={{ value: 'Over', position: 'insideBottom', fill: '#4a5578', fontSize: 11 }}
            />
            <YAxis tick={{ fill: '#4a5578', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(74,158,255,0.04)' }} />

            {phases.map((phase) => (
              <ReferenceLine
                key={phase.over}
                x={phase.over}
                stroke={phase.stroke}
                strokeDasharray="4 2"
                strokeOpacity={0.5}
                label={{ value: phase.label, fill: phase.stroke, fontSize: 10, position: 'top' }}
              />
            ))}

            {data.filter((entry) => entry.wickets > 0).map((entry) => (
              <ReferenceLine
                key={`w-${entry.over}`}
                x={entry.over}
                stroke="#ef4444"
                strokeOpacity={0.4}
                strokeWidth={2}
              />
            ))}

            {view === 'momentum' ? (
              <Bar
                dataKey={cfg.dataKey}
                name={cfg.label}
                fill={cfg.color}
                opacity={0.8}
                radius={[3, 3, 0, 0]}
              />
            ) : (
              <Area
                type="monotone"
                dataKey={cfg.dataKey}
                name={cfg.label}
                stroke={cfg.color}
                strokeWidth={2.5}
                fill="url(#areaGradient)"
                dot={false}
                activeDot={{ r: 5, fill: cfg.color, stroke: '#0a0e1a', strokeWidth: 2 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="chart-desc">{cfg.description} Red markers indicate wickets.</p>
    </div>
  );
};

export default MomentumGraph;
