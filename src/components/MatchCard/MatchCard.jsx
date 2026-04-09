import './MatchCard.css';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';
import { getTeamConfig } from '../../config/teams';

const MatchCard = ({ match }) => {
  const team1 = getTeamConfig(match.teams?.[0]);
  const team2 = getTeamConfig(match.teams?.[1]);
  const score1 = match.score?.[0];
  const score2 = match.score?.[1];
  const isLive = match.matchStarted && !match.matchEnded;
  const isCompleted = match.matchEnded;

  const getInningsTeam = (innings) => {
    if (!innings) return null;
    return innings.inning?.split(' Inning')?.[0] || '';
  };

  return (
    <Link to={`/match/${match.id}`} className="match-card-link">
      <div className={`match-card ${isLive ? 'match-card--live' : ''} ${isCompleted ? 'match-card--completed' : ''}`}>
        <div className="match-card-header">
          <div className="match-card-status">
            {isLive && (
              <span className="status-live">
                <span className="status-dot" />
                LIVE
              </span>
            )}
            {isCompleted && <span className="status-done">COMPLETED</span>}
            {!isLive && !isCompleted && <span className="status-upcoming">UPCOMING</span>}
          </div>
          <div className="match-card-meta">
            <MapPin size={11} />
            <span>{match.venue?.split(',')[0] || 'TBD'}</span>
          </div>
        </div>

        <div className="match-teams">
          <div className="team-row">
            <div className="team-identity">
              <div className="team-logo-circle" style={{ background: `${team1?.color}22`, border: `2px solid ${team1?.color}44` }}>
                <span>{team1?.logo}</span>
              </div>
              <div className="team-name-block">
                <div className="team-short" style={{ color: team1?.color }}>{team1?.short}</div>
                <div className="team-full">{match.teams?.[0]}</div>
              </div>
            </div>
            <div className="team-score">
              {score1 && getInningsTeam(score1) === match.teams?.[0] ? (
                <>
                  <span className="score-runs">{score1.r}<span className="score-wickets">/{score1.w}</span></span>
                  <span className="score-overs">({score1.o} ov)</span>
                </>
              ) : score2 && getInningsTeam(score2) === match.teams?.[0] ? (
                <>
                  <span className="score-runs">{score2.r}<span className="score-wickets">/{score2.w}</span></span>
                  <span className="score-overs">({score2.o} ov)</span>
                </>
              ) : (
                <span className="score-yet">Yet to bat</span>
              )}
            </div>
          </div>

          <div className="versus-divider">
            <div className="vs-line" />
            <span className="vs-text">VS</span>
            <div className="vs-line" />
          </div>

          <div className="team-row">
            <div className="team-identity">
              <div className="team-logo-circle" style={{ background: `${team2?.color}22`, border: `2px solid ${team2?.color}44` }}>
                <span>{team2?.logo}</span>
              </div>
              <div className="team-name-block">
                <div className="team-short" style={{ color: team2?.color }}>{team2?.short}</div>
                <div className="team-full">{match.teams?.[1]}</div>
              </div>
            </div>
            <div className="team-score">
              {score2 && getInningsTeam(score2) === match.teams?.[1] ? (
                <>
                  <span className="score-runs">{score2.r}<span className="score-wickets">/{score2.w}</span></span>
                  <span className="score-overs">({score2.o} ov)</span>
                </>
              ) : score1 && getInningsTeam(score1) === match.teams?.[1] ? (
                <>
                  <span className="score-runs">{score1.r}<span className="score-wickets">/{score1.w}</span></span>
                  <span className="score-overs">({score1.o} ov)</span>
                </>
              ) : (
                <span className="score-yet">Yet to bat</span>
              )}
            </div>
          </div>
        </div>

        <div className="match-card-footer">
          <p className="match-result">{match.status}</p>
          <span className="view-details">
            Details <ChevronRight size={13} />
          </span>
        </div>

        {isLive && <div className="live-glow-border" style={{ background: team1?.color }} />}
      </div>
    </Link>
  );
};

export default MatchCard;
