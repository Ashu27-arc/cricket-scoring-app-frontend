import { useState, useEffect } from 'react';
import { useMatchAPI } from '../hooks/useMatchAPI';

export default function SavedMatches({ onLoadMatch, currentMatchId }) {
  const [matches, setMatches] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const { loading, error, loadMatches, deleteMatch } = useMatchAPI();

  useEffect(() => {
    if (showSaved) {
      fetchMatches();
    }
  }, [showSaved]);

  const fetchMatches = async () => {
    try {
      const matchList = await loadMatches();
      setMatches(matchList);
    } catch (err) {
      console.error('Failed to load matches:', err);
    }
  };

  const handleLoadMatch = (match) => {
    onLoadMatch(match.fullMatchJSON, match._id);
    setShowSaved(false);
  };

  const handleDeleteMatch = async (matchId) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        await deleteMatch(matchId);
        fetchMatches(); // Refresh list
      } catch (err) {
        console.error('Failed to delete match:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!showSaved) {
    return (
      <button
        className="btn btn-secondary"
        onClick={() => setShowSaved(true)}
      >
        Load Saved Match
      </button>
    );
  }

  return (
    <div className="saved-matches">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0 }}>Saved Matches</h3>
        <button
          className="btn btn-ghost"
          onClick={() => setShowSaved(false)}
        >
          Close
        </button>
      </div>

      {loading && <p>Loading matches...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {matches.length === 0 && !loading && (
        <p>No saved matches found.</p>
      )}

      <div className="matches-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {matches.map((match) => (
          <div
            key={match._id}
            className="match-item"
            style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: currentMatchId === match._id ? '#f0f8ff' : 'white'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0' }}>
                  {match.teamA} vs {match.teamB}
                </h4>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                  {match.runs}/{match.wickets} in {Math.floor(match.ballCount / 6)}.{match.ballCount % 6} overs
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
                  {formatDate(match.updatedAt)}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleLoadMatch(match)}
                >
                  Load
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteMatch(match._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}