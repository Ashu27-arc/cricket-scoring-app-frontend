import React, { useState, useEffect } from 'react';
import { matchAPI } from '../services/api';

export default function OngoingMatches({ onSelectMatch, selectedMatchId }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOngoingMatches();
    // Refresh matches every 30 seconds
    const interval = setInterval(loadOngoingMatches, 30000);
    return () => clearInterval(interval);
  }, []);

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
      
      // Show all ongoing matches (sorted by most recent first)
      setMatches(ongoingMatches);
      setError(null);
    } catch (err) {
      console.error('Failed to load ongoing matches:', err);
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const getMatchTitle = (match) => {
    const fullMatch = match.fullMatchJSON || match;
    return `${fullMatch.teamA} vs ${fullMatch.teamB}`;
  };

  const getMatchScore = (match) => {
    const fullMatch = match.fullMatchJSON || match;
    const oversCompleted = fullMatch.completedOvers?.length || 0;
    const ballsInCurrentOver = fullMatch.currentOverBalls?.filter(b => b.isLegal).length || 0;
    const overDisplay = ballsInCurrentOver > 0 ? `${oversCompleted}.${ballsInCurrentOver}` : `${oversCompleted}`;
    
    return `${fullMatch.runs || 0}/${fullMatch.wickets || 0} (${overDisplay}/${fullMatch.overs})`;
  };

  const getMatchInnings = (match) => {
    const fullMatch = match.fullMatchJSON || match;
    if (fullMatch.currentInnings === 2) {
      const target = fullMatch.target || 0;
      const needed = Math.max(0, target - (fullMatch.runs || 0));
      return `Need ${needed} runs • 2nd Innings`;
    }
    return '1st Innings';
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
              <div className="match-title">{getMatchTitle(match)}</div>
              <div className="match-score">{getMatchScore(match)}</div>
              <div className="match-innings">{getMatchInnings(match)}</div>
              <div className="match-status">🔴 LIVE</div>
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

        .match-title {
          font-weight: 600;
          font-size: 14px;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .match-score {
          font-size: 13px;
          color: #4b5563;
          margin-bottom: 2px;
        }

        .match-innings {
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .match-status {
          font-size: 11px;
          color: #dc2626;
          font-weight: 500;
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