import './PlayerStats.css';
import { useEffect, useState } from 'react';
import { X, ExternalLink, Award } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { fetchPlayerInfo, fetchPlayerNews, computeImpactScore } from '../../services/cricketApi';
import { getTeamConfig } from '../../config/teams';
import { useApp } from '../../context/AppContext';

const ImpactMeter = ({ score }) => {
  const color = score >= 80 ? '#f5a623' : score >= 60 ? '#10b981' : score >= 40 ? '#4a9eff' : '#8892b0';
  const label = score >= 80 ? 'Elite' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Below Avg';
  return (
    <div className="impact-meter">
      <div className="impact-label-row">
        <span className="impact-label">Player Impact Score</span>
        <span className="impact-badge" style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
          {label}
        </span>
      </div>
      <div className="impact-bar-row">
        <div className="impact-bar-bg">
          <div className="impact-bar-fill" style={{ width: `${score}%`, background: color }} />
        </div>
        <div className="impact-score" style={{ color }}>{score}</div>
      </div>
      <p className="impact-formula">
        Computed from: Runs × (Strike Rate / 150) × (Average / 30) + Wickets × 5
      </p>
    </div>
  );
};

const FormGraph = ({ form = [] }) => {
  const data = form.map((r, i) => ({ match: `M${i + 1}`, runs: r }));
  return (
    <div className="form-chart">
      <div className="form-title">Recent Form (Last {form.length} Matches)</div>
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="match" tick={{ fill: '#4a5578', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#4a5578', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#1a2440', border: '1px solid rgba(74,158,255,0.2)', borderRadius: 8, fontSize: 11 }}
            formatter={(v) => [`${v} runs`, 'Runs']}
          />
          <Line
            type="monotone"
            dataKey="runs"
            stroke="#f5a623"
            strokeWidth={2}
            dot={{ fill: '#f5a623', r: 3 }}
            activeDot={{ r: 5, fill: '#f5a623' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const NewsCard = ({ article }) => (
  <a
    href={article.url === '#' ? undefined : article.url}
    target="_blank"
    rel="noopener noreferrer"
    className="news-card"
  >
    <div className="news-source">{article.source?.name || 'Cricket News'}</div>
    <div className="news-title">{article.title}</div>
    {article.description && (
      <div className="news-desc">{article.description}</div>
    )}
    <div className="news-footer">
      <span className="news-time">
        {new Date(article.publishedAt).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short',
        })}
      </span>
      <ExternalLink size={11} />
    </div>
  </a>
);


const PlayerStats = ({ player, onClose }) => {
  const [data, setData] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('stats'); // 'stats' | 'news'
  const { dataMode } = useApp();

  useEffect(() => {
    if (!player) return;
    const load = async () => {
      setLoading(true);
      const [playerData, newsData] = await Promise.all([
        fetchPlayerInfo(player.id, player, dataMode === 'mock'),
        fetchPlayerNews(player.name, dataMode === 'mock'),
      ]);
      setData(playerData);
      setNews(newsData);
      setLoading(false);
    };
    load();
  }, [player, dataMode]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!player) return null;

  const teamConfig = getTeamConfig(data?.team);
  const impactScore = data ? computeImpactScore(data) : player.impactScore || 50;
  const batting = data?.stats?.batting || {};
  const bowling = data?.stats?.bowling || {};

  return (
    <div className="player-stats-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="player-stats-panel animate-fadeInUp">
        {/* Header */}
        <div className="ps-header" style={{ '--team-color': teamConfig?.color || '#4a9eff' }}>
          <div className="ps-team-bg" style={{ background: teamConfig?.bg }} />
          <div className="ps-header-content">
            <div className="ps-player-avatar">
              <span className="ps-avatar-emoji">
                {data?.role?.toLowerCase().includes('bowl') ? '🏏' : '🏏'}
              </span>
            </div>
            <div className="ps-player-meta">
              <div className="ps-player-name">{data?.name || player.name}</div>
              <div className="ps-player-details">
                <span className="ps-team" style={{ color: teamConfig?.color || '#4a9eff' }}>
                  {teamConfig?.short || ''} {data?.team || ''}
                </span>
                {data?.role && <span className="ps-role">{data.role}</span>}
                {data?.country && <span className="ps-country">🌍 {data.country}</span>}
              </div>
              <div className="ps-style-row">
                {data?.battingStyle && <span>🏏 {data.battingStyle}</span>}
                {data?.bowlingStyle && <span>⚡ {data.bowlingStyle}</span>}
              </div>
            </div>
          </div>
          <button className="ps-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Impact Score */}
        <div className="ps-body">
          {loading ? (
            <div className="ps-loading">
              <div className="spinner" />
              <span>Loading player data...</span>
            </div>
          ) : (
            <>
              <ImpactMeter score={impactScore} />

              {/* Tabs */}
              <div className="ps-tabs">
                <button className={`ps-tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>
                  <Award size={13} /> Stats
                </button>
                <button className={`ps-tab ${tab === 'news' ? 'active' : ''}`} onClick={() => setTab('news')}>
                  📰 News
                </button>
              </div>

              {tab === 'stats' ? (
                <div className="ps-stats-section">
                  {/* Batting Stats */}
                  {Object.keys(batting).length > 0 && (
                    <div className="ps-stats-block">
                      <div className="ps-block-title">Batting — IPL 2026</div>
                      <div className="ps-stat-grid">
                        <div className="ps-stat"><span className="ps-sv">{batting.matches || '-'}</span><span className="ps-sl">Mat</span></div>
                        <div className="ps-stat"><span className="ps-sv">{batting.innings || '-'}</span><span className="ps-sl">Inn</span></div>
                        <div className="ps-stat"><span className="ps-sv gold">{batting.runs || '-'}</span><span className="ps-sl">Runs</span></div>
                        <div className="ps-stat"><span className="ps-sv">{batting.hs || '-'}</span><span className="ps-sl">HS</span></div>
                        <div className="ps-stat"><span className="ps-sv">{batting.avg?.toFixed(1) || '-'}</span><span className="ps-sl">Avg</span></div>
                        <div className="ps-stat"><span className="ps-sv gold">{batting.sr?.toFixed(1) || '-'}</span><span className="ps-sl">SR</span></div>
                        <div className="ps-stat"><span className="ps-sv">{batting.fifties || '-'}</span><span className="ps-sl">50s</span></div>
                        <div className="ps-stat"><span className="ps-sv">{batting.hundreds || '-'}</span><span className="ps-sl">100s</span></div>
                        <div className="ps-stat"><span className="ps-sv">{batting.fours || '-'}</span><span className="ps-sl">4s</span></div>
                        <div className="ps-stat"><span className="ps-sv">{batting.sixes || '-'}</span><span className="ps-sl">6s</span></div>
                      </div>
                    </div>
                  )}

                  {/* Form Graph */}
                  {data?.currentForm?.length > 0 && (
                    <FormGraph form={data.currentForm} />
                  )}

                  {/* Bowling Stats */}
                  {bowling.overs > 0 && (
                    <div className="ps-stats-block">
                      <div className="ps-block-title">Bowling — IPL 2026</div>
                      <div className="ps-stat-grid">
                        <div className="ps-stat"><span className="ps-sv">{bowling.overs || '-'}</span><span className="ps-sl">Overs</span></div>
                        <div className="ps-stat"><span className="ps-sv gold">{bowling.wickets || '-'}</span><span className="ps-sl">Wickets</span></div>
                        <div className="ps-stat"><span className="ps-sv">{bowling.economy?.toFixed(1) || '-'}</span><span className="ps-sl">Econ</span></div>
                      </div>
                    </div>
                  )}

                  {/* Bar chart */}
                  {batting.runs && (
                    <div className="ps-bar-chart">
                      <div className="ps-block-title">Scoring Breakdown</div>
                      <ResponsiveContainer width="100%" height={120}>
                        <BarChart
                          data={[
                            { name: '1s', val: Math.max(0, batting.runs - batting.fours * 4 - batting.sixes * 6 - (batting.balls - batting.runs)), fill: '#4a9eff' },
                            { name: '4s', val: (batting.fours || 0) * 4, fill: '#f5a623' },
                            { name: '6s', val: (batting.sixes || 0) * 6, fill: '#8b5cf6' },
                          ]}
                          margin={{ top: 0, right: 0, bottom: 0, left: -25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: '#4a5578', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#4a5578', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: '#1a2440', border: '1px solid rgba(74,158,255,0.2)', borderRadius: 8, fontSize: 11 }}
                          />
                          <Bar dataKey="val" name="Runs" fill="#4a9eff" radius={[4, 4, 0, 0]}>
                            {[{ fill: '#4a9eff' }, { fill: '#f5a623' }, { fill: '#8b5cf6' }].map((entry, i) => (
                              <rect key={i} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              ) : (
                <div className="ps-news-section">
                  {news.length === 0 ? (
                    <div className="ps-no-news">No recent news found.</div>
                  ) : (
                    news.map((article, i) => (
                      <NewsCard key={i} article={article} />
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
