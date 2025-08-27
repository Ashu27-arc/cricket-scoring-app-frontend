import React, { useState, useEffect } from 'react';
import { matchAPI } from '../services/api';
import socketService from '../services/socket';

export default function OngoingMatches({ onSelectMatch, selectedMatchId }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOngoingMatches();
    
    // Set up WebSocket connection for real-time match list updates
    socketService.connect();
    socketService.onMatchStatusUpdate(handleMatchStatusUpdate);
    socketService.onMatchListUpdate(handleMatchListUpdate);
    
    // Refresh matches every 30 seconds as fallback
    const interval = setInterval(loadOngoingMatches, 30000);
    
    return () => {
      clearInterval(interval);
      socketService.offMatchStatusUpdate();
      socketService.offMatchListUpdate();
    };
  }, []);

  const handleMatchStatusUpdate = (data) => {
    // Update the specific match in the list
    setMatches(prevMatches => {
      return prevMatches.map(match => {
        if (match._id === data.matchId) {
          return { 
            ...match, 
            fullMatchJSON: data.matchData,
            updatedAt: new Date().toISOString()
          };
        }
        return match;
      });
    });
  };

  const handleMatchListUpdate = (data) => {
    // Handle new matches being added or removed from the list
    if (data.type === 'new_match') {
      setMatches(prevMatches => {
        // Check if match already exists
        const exists = prevMatches.some(match => match._id === data.match._id);
        if (!exists) {
          return [...prevMatches, data.match];
        }
        return prevMatches;
      });
    } else if (data.type === 'match_completed') {
      setMatches(prevMatches => {
        return prevMatches.filter(match => match._id !== data.matchId);
      });
    }
  };

  const loadOngoingMatches = async () => {
    try {
      setLoading(true);
      const response = await matchAPI.getAllMatches();
      // Filter for ongoing matches (not completed and has some progress)
      const ongoingMatches = response.filter(match => {
        const fullMatch = match.fullMatchJSON || match;
        return !fullMatch.isMatchComplete && 
               (fullMatch.ballCount > 0 || fullMatch.runs > 0);
      });
      setMatches(ongoingMatches);
      setError(null);
    } catch (err) {
      console.error('Failed to load ongoing matches:', err);
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const formatMatchStatus = (match) => {
    const fullMatch = match.fullMatchJSON || match;
    const oversCompleted = fullMatch.completedOvers?.length || 0;
    const ballsInCurrentOver = fullMatch.currentOverBalls?.filter(b => b.isLegal).length || 0;
    const overDisplay = ballsInCurrentOver > 0 ? `${oversCompleted}.${ballsInCurrentOver}` : `${oversCompleted}`;
    
    if (fullMatch.currentInnings === 2) {
      const target = fullMatch.target || 0;
      const needed = Math.max(0, target - (fullMatch.runs || 0));
      return `${fullMatch.batting} need ${needed} runs (${overDisplay}/${fullMatch.overs} ov)`;
    } else {
      return `${fullMatch.batting} ${fullMatch.runs || 0}/${fullMatch.wickets || 0} (${overDisplay}/${fullMatch.overs} ov)`;
    }
  };

  const getMatchTitle = (match) => {
    const fullMatch = match.fullMatchJSON || match;
    return `${fullMatch.teamA} vs ${fullMatch.teamB}`;
  };

  const getInningsInfo = (match) => {
    const fullMatch = match.fullMatchJSON || match;
    const inningsText = fullMatch.currentInnings === 2 ? '2nd Innings' : '1st Innings';
    return inningsText;
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now - updated;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return updated.toLocaleDateString();
  };

  const getMatchProgress = (match) => {
    const fullMatch = match.fullMatchJSON || match;
    const totalOvers = fullMatch.overs || 1;
    const completedOvers = fullMatch.completedOvers?.length || 0;
    const ballsInCurrentOver = fullMatch.currentOverBalls?.filter(b => b.isLegal).length || 0;
    
    const totalBalls = totalOvers * 6;
    const completedBalls = (completedOvers * 6) + ballsInCurrentOver;
    
    // For second innings, calculate based on both innings
    if (fullMatch.currentInnings === 2) {
      const firstInningsBalls = totalBalls;
      const secondInningsBalls = completedBalls;
      const totalMatchBalls = totalBalls * 2;
      const totalCompletedBalls = firstInningsBalls + secondInningsBalls;
      return Math.round((totalCompletedBalls / totalMatchBalls) * 100);
    }
    
    return Math.round((completedBalls / totalBalls) * 100);
  };

  if (loading) {
    return (
      <div className="ongoing-matches">
        <h3>🏏 Live Matches</h3>
        <div className="loading">Loading ongoing matches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ongoing-matches">
        <h3>🏏 Live Matches</h3>
        <div className="error">{error}</div>
        <button className="btn btn-ghost" onClick={loadOngoingMatches}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="ongoing-matches">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>🏏 Live Matches</h3>
        <button 
          className="btn btn-ghost" 
          onClick={loadOngoingMatches}
          style={{ fontSize: '12px', padding: '4px 8px' }}
        >
          🔄 Refresh
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="no-matches">
          <div className="note">No ongoing matches found</div>
          <div className="small" style={{ marginTop: 4 }}>
            Start a new match to see it here
          </div>
        </div>
      ) : (
        <div className="matches-list">
          {matches.map((match) => (
            <div
              key={match._id}
              className={`match-card ${selectedMatchId === match._id ? 'selected' : ''}`}
              onClick={() => onSelectMatch(match)}
              style={{ cursor: 'pointer' }}
            >
              <div className="match-header">
                <div className="match-title">{getMatchTitle(match)}</div>
                <div className="innings-badge">{getInningsInfo(match)}</div>
              </div>
              
              <div className="match-status">
                {formatMatchStatus(match)}
              </div>
              
              <div className="match-meta">
                <span className="live-indicator">🔴 LIVE</span>
                <span className="match-time">
                  Updated {getTimeAgo(match.updatedAt)}
                </span>
              </div>
              
              <div className="match-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${getMatchProgress(match)}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {getMatchProgress(match)}% complete
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .ongoing-matches {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .matches-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .match-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 12px;
          transition: all 0.2s ease;
        }

        .match-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
        }

        .match-card.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .match-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .match-title {
          font-weight: 600;
          font-size: 14px;
          color: #1f2937;
        }

        .innings-badge {
          background: #3b82f6;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
        }

        .match-status {
          font-size: 13px;
          color: #4b5563;
          margin-bottom: 6px;
        }

        .match-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
        }

        .live-indicator {
          color: #dc2626;
          font-weight: 500;
        }

        .match-time {
          color: #6b7280;
        }

        .match-progress {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }

        .progress-bar {
          flex: 1;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #3b82f6);
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 10px;
          color: #6b7280;
          min-width: 60px;
          text-align: right;
        }

        .no-matches {
          text-align: center;
          padding: 20px;
          color: #6b7280;
        }

        .loading, .error {
          text-align: center;
          padding: 20px;
          color: #6b7280;
        }

        .error {
          color: #dc2626;
        }
      `}</style>
    </div>
  );
}