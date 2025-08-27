import React, { useState, useEffect } from 'react';
import OngoingMatches from './OngoingMatches';
import MatchCommentaryViewer from './MatchCommentaryViewer';
import socketService from '../services/socket';

export default function LiveMatchViewer() {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    // Initialize WebSocket connection for the live matches page
    socketService.connect();
    
    // Monitor connection status
    const socket = socketService.socket;
    if (socket) {
      socket.on('connect', () => setConnectionStatus('connected'));
      socket.on('disconnect', () => setConnectionStatus('disconnected'));
      socket.on('connect_error', () => setConnectionStatus('error'));
    }

    return () => {
      // Clean up but don't disconnect as commentary viewer might need it
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
      }
    };
  }, []);

  const handleSelectMatch = (match) => {
    setSelectedMatch(match);
  };

  const handleBackToMatches = () => {
    setSelectedMatch(null);
  };

  const getSelectedMatchStatus = (match) => {
    const fullMatch = match.fullMatchJSON || match;
    const oversCompleted = fullMatch.completedOvers?.length || 0;
    const ballsInCurrentOver = fullMatch.currentOverBalls?.filter(b => b.isLegal).length || 0;
    const overDisplay = ballsInCurrentOver > 0 ? `${oversCompleted}.${ballsInCurrentOver}` : `${oversCompleted}`;
    
    if (fullMatch.currentInnings === 2) {
      const target = fullMatch.target || 0;
      const needed = Math.max(0, target - (fullMatch.runs || 0));
      return `Need ${needed} runs • ${overDisplay}/${fullMatch.overs} overs • 2nd Innings`;
    } else {
      return `${fullMatch.runs || 0}/${fullMatch.wickets || 0} • ${overDisplay}/${fullMatch.overs} overs • 1st Innings`;
    }
  };

  return (
    <div className="live-match-viewer">
      <div className="viewer-header">
        <div className="header-title">
          <h2>🏏 Live Cricket Matches</h2>
          <div className="connection-indicator">
            <span className={`status-dot ${connectionStatus}`}></span>
            <span className="status-text">
              {connectionStatus === 'connected' && 'Connected'}
              {connectionStatus === 'disconnected' && 'Offline'}
              {connectionStatus === 'error' && 'Connection Error'}
            </span>
          </div>
        </div>
        <div className="subtitle">
          {selectedMatch ? 
            'Real-time commentary and match updates' : 
            'Select a match to view real-time commentary and updates'
          }
        </div>
      </div>

      <div className="viewer-content">
        <div className="matches-panel">
          <OngoingMatches 
            onSelectMatch={handleSelectMatch}
            selectedMatchId={selectedMatch?._id}
          />
          
          {selectedMatch && (
            <div className="selected-match-info">
              <div className="info-header">
                <h4>Selected Match</h4>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={handleBackToMatches}
                >
                  ← Back to matches
                </button>
              </div>
              <div className="match-details">
                <div className="match-title">
                  {selectedMatch.fullMatchJSON?.teamA} vs {selectedMatch.fullMatchJSON?.teamB}
                </div>
                <div className="match-status">
                  {getSelectedMatchStatus(selectedMatch)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="commentary-panel">
          <MatchCommentaryViewer 
            match={selectedMatch}
            isVisible={!!selectedMatch}
          />
        </div>
      </div>

      <style jsx>{`
        .live-match-viewer {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .viewer-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .header-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 8px;
        }

        .viewer-header h2 {
          margin: 0;
          color: #1f2937;
          font-size: 28px;
        }

        .connection-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6b7280;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #dc2626;
        }

        .status-dot.connected {
          background: #10b981;
        }

        .status-dot.error {
          background: #f59e0b;
        }

        .subtitle {
          color: #6b7280;
          font-size: 16px;
        }

        .viewer-content {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 24px;
          align-items: start;
        }

        .selected-match-info {
          background: #f0f9ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 16px;
          margin-top: 16px;
        }

        .info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .info-header h4 {
          margin: 0;
          font-size: 14px;
          color: #1e40af;
          font-weight: 600;
        }

        .match-details {
          font-size: 13px;
        }

        .match-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .match-status {
          color: #4b5563;
        }

        .btn {
          padding: 4px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 11px;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
        }

        .btn:hover {
          background: #f9fafb;
        }

        .btn-ghost {
          background: transparent;
          border-color: transparent;
        }

        .btn-ghost:hover {
          background: #f3f4f6;
        }

        .btn-sm {
          padding: 2px 6px;
          font-size: 10px;
        }

        @media (max-width: 1024px) {
          .viewer-content {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .matches-panel {
            order: 1;
          }
          
          .commentary-panel {
            order: 2;
          }

          .header-title {
            flex-direction: column;
            gap: 8px;
          }
        }

        @media (max-width: 768px) {
          .live-match-viewer {
            padding: 16px;
          }
          
          .viewer-header h2 {
            font-size: 24px;
          }
          
          .subtitle {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}