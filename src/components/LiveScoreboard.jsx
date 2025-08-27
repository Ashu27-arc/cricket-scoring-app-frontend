import { useState, useEffect } from 'react';
import socketService from '../services/socket';

export default function LiveScoreboard({ match, matchId, isLive = false }) {
  const [liveMatch, setLiveMatch] = useState(match);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setLiveMatch(match);
  }, [match]);

  useEffect(() => {
    if (isLive && matchId) {
      const socket = socketService.connect();

      socketService.joinMatch(matchId);

      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));

      socketService.onMatchUpdate((data) => {
        if (data.match && data.match.fullMatchJSON) {
          setLiveMatch(data.match.fullMatchJSON);
          setLastUpdate(new Date());
        }
      });

      return () => {
        socketService.leaveMatch(matchId);
        socketService.offMatchUpdate();
      };
    }
  }, [matchId, isLive]);

  if (!liveMatch) {
    return <div>Loading match data...</div>;
  }

  const oversCompleted = liveMatch.completedOvers?.length || 0;
  const legalBallsInCurrentOver = liveMatch.currentOverBalls?.filter(b => b.isLegal).length || 0;
  const overDisplay = `${oversCompleted}.${legalBallsInCurrentOver}`;

  // Calculate run rate
  const totalBalls = liveMatch.ballCount || 0;
  const runRate = totalBalls > 0 ? ((liveMatch.runs || 0) / totalBalls * 6).toFixed(2) : '0.00';

  return (
    <div className="live-scoreboard">
      <div className="scoreboard-header">
        <div className="match-title">
          <h3 style={{ margin: 0 }}>{liveMatch.teamA} vs {liveMatch.teamB}</h3>
          {isLive && (
            <div className="live-indicator">
              <span className={`live-dot ${isConnected ? 'live' : 'offline'}`}></span>
              <span className="live-text">
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          )}
        </div>
        {lastUpdate && (
          <div className="last-update">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="score-display">
        <div className="batting-team">
          <div className="team-name">{liveMatch.batting} (batting)</div>
          <div className="batsmen">
            <div className="batsman">
              <span className="batsman-name">{liveMatch.striker}*</span>
            </div>
            <div className="batsman">
              <span className="batsman-name">{liveMatch.nonStriker}</span>
            </div>
          </div>
        </div>

        <div className="main-score">
          <div className="runs-wickets">
            {liveMatch.runs || 0}/{liveMatch.wickets || 0}
          </div>
          <div className="overs-info">
            ({overDisplay}/{liveMatch.overs || 0} ov)
          </div>
        </div>
      </div>

      <div className="match-stats">
        <div className="stat-item">
          <span className="stat-label">Run Rate:</span>
          <span className="stat-value">{runRate}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Balls:</span>
          <span className="stat-value">{totalBalls}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Remaining:</span>
          <span className="stat-value">
            {Math.max(0, (liveMatch.overs || 0) * 6 - totalBalls)} balls
          </span>
        </div>
      </div>

      {/* Current Over Display */}
      <div className="current-over">
        <div className="over-title">This Over:</div>
        <div className="over-balls">
          {(!liveMatch.currentOverBalls || liveMatch.currentOverBalls.length === 0) ? (
            <span className="no-balls">No balls yet</span>
          ) : (
            liveMatch.currentOverBalls.map((ball, i) => (
              <span
                key={i}
                className={`ball-result ${ball.isWicket ? 'wicket' : ''} ${ball.runs === 4 ? 'four' : ''} ${ball.runs === 6 ? 'six' : ''}`}
                title={`${ball.runs} runs ${ball.isWicket ? '• wicket' : ''} ${ball.extra ? '• ' + ball.extra.type : ''}`}
              >
                {ball.isWicket ? 'W' : (ball.extra ? `${ball.extra.type[0].toUpperCase()}${ball.extra.value}` : ball.runs)}
              </span>
            ))
          )}
        </div>
      </div>

      {liveMatch.isInningsOver && (
        <div className="innings-complete">
          <span className="innings-text">Innings Complete</span>
        </div>
      )}
    </div>
  );
}