import './Scorecard.css';
import { Shield, Zap, Target } from 'lucide-react';
import { getTeamConfig } from '../../config/teams';

const PlayerRow = ({ player, type, onClick, isOnStrike, isBowling }) => {
  if (!player) return null;

  return (
    <tr
      className={`player-row ${isOnStrike ? 'on-strike' : ''} ${isBowling ? 'bowling-active' : ''}`}
      onClick={onClick}
      title="Click to view player stats"
    >
      <td className="player-name-cell">
        <div className="player-name-wrap">
          <span className="player-name">{player.name}</span>
          {isOnStrike && <span className="strike-badge">*</span>}
          {isBowling && <span className="bowling-badge">⚡</span>}
        </div>
        {type === 'batting' && (
          <span className="player-dismissal">
            {player.howOut || (player.dismissed ? 'dismissed' : 'batting*')}
          </span>
        )}
      </td>
      {type === 'batting' ? (
        <>
          <td className="highlight">{player.runs ?? '-'}</td>
          <td>{player.balls ?? '-'}</td>
          <td>{player.fours ?? '-'}</td>
          <td>{player.sixes ?? '-'}</td>
          <td className={`sr-cell ${(player.sr || 0) >= 150 ? 'hot-sr' : (player.sr || 0) >= 120 ? 'warm-sr' : ''}`}>
            {player.sr?.toFixed(1) ?? '-'}
          </td>
        </>
      ) : (
        <>
          <td>{player.overs ?? '-'}</td>
          <td>{player.maidens ?? '-'}</td>
          <td className="highlight">{player.runs ?? '-'}</td>
          <td className="highlight-wickets">{player.wickets ?? '-'}</td>
          <td className={`econ-cell ${(player.economy || 0) < 7 ? 'good-econ' : (player.economy || 0) > 11 ? 'bad-econ' : ''}`}>
            {player.economy?.toFixed(2) ?? '-'}
          </td>
        </>
      )}
    </tr>
  );
};

const Scorecard = ({ scorecard, onPlayerClick }) => {
  if (!scorecard) return null;

  const {
    batting = [],
    bowling = [],
    currentInnings,
    onStrike,
    nonStriker,
    currentBowler,
  } = scorecard;

  const battingTeam = getTeamConfig(currentInnings?.team);

  return (
    <div className="scorecard-wrap">
      {/* Current Innings Header */}
      {currentInnings && (
        <div className="innings-header" style={{ '--team-color': battingTeam?.color || '#4a9eff' }}>
          <div className="innings-team-badge">
            <span className="innings-team-emoji">{battingTeam?.logo}</span>
            <span className="innings-team-name">{battingTeam?.short || currentInnings.team}</span>
            <span className="innings-label">Innings 1</span>
          </div>
          <div className="innings-score-block">
            <div className="innings-big-score">
              <span className="inning-runs">{currentInnings.runs}</span>
              <span className="inning-wk">/{currentInnings.wickets}</span>
            </div>
            <div className="innings-detail">
              <span className="inning-overs">{currentInnings.overs} overs</span>
              <span className="inning-rr">CRR: {currentInnings.runRate?.toFixed(2) || '—'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Currently At Crease */}
      {(onStrike || nonStriker) && (
        <div className="crease-panel">
          <div className="crease-title"><Zap size={13} /> At the Crease</div>
          <div className="crease-players">
            {onStrike && (
              <div className="crease-player on-strike-player" onClick={() => onPlayerClick?.(onStrike)}>
                <div className="crease-icon">🏏*</div>
                <div className="crease-info">
                  <span className="crease-name">{onStrike.name}</span>
                  <span className="crease-stat">{onStrike.runs} ({onStrike.balls}b)</span>
                </div>
              </div>
            )}
            {nonStriker && (
              <div className="crease-player" onClick={() => onPlayerClick?.(nonStriker)}>
                <div className="crease-icon">🏏</div>
                <div className="crease-info">
                  <span className="crease-name">{nonStriker.name}</span>
                  <span className="crease-stat">{nonStriker.runs} ({nonStriker.balls}b)</span>
                </div>
              </div>
            )}
            {currentBowler && (
              <div className="crease-player" onClick={() => onPlayerClick?.(currentBowler)}>
                <div className="crease-icon">⚡</div>
                <div className="crease-info">
                  <span className="crease-name">{currentBowler.name}</span>
                  <span className="crease-stat">{currentBowler.overs}-{currentBowler.maidens}-{currentBowler.runs}-{currentBowler.wickets}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Batting Scorecard */}
      <div className="scorecard-section card">
        <div className="section-header">
          <Shield size={15} />
          <span>Batting</span>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Batter</th>
                <th>R</th>
                <th>B</th>
                <th>4s</th>
                <th>6s</th>
                <th>SR</th>
              </tr>
            </thead>
            <tbody>
              {batting.map((p) => (
                <PlayerRow
                  key={p.id || p.name}
                  player={p}
                  type="batting"
                  onClick={() => onPlayerClick?.(p)}
                  isOnStrike={onStrike?.name === p.name}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bowling Scorecard */}
      <div className="scorecard-section card" style={{ marginTop: 12 }}>
        <div className="section-header">
          <Target size={15} />
          <span>Bowling</span>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bowler</th>
                <th>O</th>
                <th>M</th>
                <th>R</th>
                <th>W</th>
                <th>Econ</th>
              </tr>
            </thead>
            <tbody>
              {bowling.map((p) => (
                <PlayerRow
                  key={p.id || p.name}
                  player={p}
                  type="bowling"
                  onClick={() => onPlayerClick?.(p)}
                  isBowling={currentBowler?.name === p.name}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Scorecard;
