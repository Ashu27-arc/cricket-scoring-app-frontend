import { useState, useEffect, useRef } from 'react';
import socketService from '../services/socket';

export default function LiveCommentary({ matchId, isLive = false, lastBall = null, matchState = null }) {
  const [commentary, setCommentary] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const commentaryEndRef = useRef(null);

  // Add welcome commentary when component mounts
  useEffect(() => {
    if (matchState && commentary.length === 0) {
      const welcomeCommentary = {
        text: `Welcome to the match between ${matchState.teamA} and ${matchState.teamB}! ${matchState.batting} will bat first.`,
        timestamp: new Date().toISOString(),
        type: 'welcome',
        id: Date.now()
      };
      setCommentary([welcomeCommentary]);
    }
  }, [matchState]);

  // Generate local commentary when not in live mode
  useEffect(() => {
    if (!isLive && lastBall && matchState) {
      console.log('Generating local commentary for:', lastBall);
      const localCommentary = generateLocalCommentary(lastBall, matchState);
      setCommentary(prev => [...prev, {
        ...localCommentary,
        type: 'ball',
        id: Date.now()
      }]);
    }
  }, [lastBall, matchState, isLive]);

  useEffect(() => {
    if (isLive && matchId) {
      // Connect to socket
      const socket = socketService.connect();

      // Join match room
      socketService.joinMatch(matchId);

      // Listen for connection status
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));

      // Listen for live updates
      socketService.onMatchUpdate((data) => {
        if (data.commentary) {
          setCommentary(prev => [...prev, {
            ...data.commentary,
            type: 'ball',
            id: Date.now()
          }]);
        }
      });

      socketService.onOverCompleted((overSummary) => {
        setCommentary(prev => [...prev, {
          ...overSummary,
          id: Date.now()
        }]);
      });

      socketService.onInningsEnded((inningsCommentary) => {
        setCommentary(prev => [...prev, {
          ...inningsCommentary,
          id: Date.now()
        }]);
      });

      return () => {
        socketService.leaveMatch(matchId);
        socketService.offMatchUpdate();
        socketService.offOverCompleted();
        socketService.offInningsEnded();
      };
    }
  }, [matchId, isLive]);

  // Auto scroll to bottom when new commentary arrives
  useEffect(() => {
    commentaryEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commentary]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Local commentary generation (when not in live mode)
  const generateLocalCommentary = (ballData, matchState) => {
    const { runs, isWicket, extra, batsmanOnStrike } = ballData;
    let text = "";

    if (isWicket) {
      text = `WICKET! ${batsmanOnStrike} is out! What a breakthrough!`;
    } else if (extra) {
      switch (extra.type) {
        case 'wide':
          text = `Wide ball! Extra run to the batting side`;
          break;
        case 'no-ball':
          text = `No ball! Free hit coming up!`;
          break;
        case 'bye':
          text = `Bye! ${batsmanOnStrike} misses, keeper misses too`;
          break;
        case 'leg-bye':
          text = `Leg bye! Ball hits the pad and they run`;
          break;
        default:
          text = `Extra runs added to the total`;
      }
    } else {
      switch (runs) {
        case 0:
          text = `Dot ball! Good bowling`;
          break;
        case 1:
          text = `${batsmanOnStrike} pushes it for a single`;
          break;
        case 2:
          text = `Two runs! Good placement by ${batsmanOnStrike}`;
          break;
        case 3:
          text = `Three runs! Excellent running by ${batsmanOnStrike}`;
          break;
        case 4:
          text = `FOUR! Beautiful shot by ${batsmanOnStrike}!`;
          break;
        case 6:
          text = `SIX! What a shot by ${batsmanOnStrike}!`;
          break;
        default:
          text = `${runs} runs scored by ${batsmanOnStrike}`;
      }
    }

    // Add milestone commentary
    if (matchState.runs >= 50 && matchState.runs - (runs + (extra?.value || 0)) < 50) {
      text += ` FIFTY up for ${matchState.batting}!`;
    } else if (matchState.runs >= 100 && matchState.runs - (runs + (extra?.value || 0)) < 100) {
      text += ` HUNDRED up for ${matchState.batting}!`;
    }

    return {
      text,
      timestamp: new Date().toISOString(),
      ballNumber: matchState.ballCount,
      over: Math.floor((matchState.ballCount - 1) / 6) + 1,
      ballInOver: ((matchState.ballCount - 1) % 6) + 1
    };
  };

  const getCommentaryIcon = (type) => {
    switch (type) {
      case 'ball': return '⚾';
      case 'over-summary': return '🏏';
      case 'innings-end': return '🏁';
      default: return '📝';
    }
  };

  return (
    <div className="live-commentary">
      <div className="commentary-header">
        <h4 style={{ margin: 0 }}>Live Commentary</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isLive && (
            <div className="live-status">
              <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
              <span className="status-text">
                {isConnected ? 'LIVE' : 'Connecting...'}
              </span>
            </div>
          )}
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setCommentary([])}
            title="Clear Commentary"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      <div className="commentary-container">
        {commentary.length === 0 ? (
          <div className="no-commentary">
            {isLive ? 'Waiting for live updates...' : 'Start scoring to see commentary here!'}
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
              Commentary will appear as you add balls to the match
            </div>
          </div>
        ) : (
          <div className="commentary-list">
            {commentary.map((comment) => (
              <div key={comment.id} className={`commentary-item ${comment.type || 'ball'}`}>
                <div className="commentary-meta">
                  <span className="commentary-icon">{getCommentaryIcon(comment.type)}</span>
                  <span className="commentary-time">{formatTime(comment.timestamp)}</span>
                  {comment.ballNumber && (
                    <span className="ball-info">
                      {comment.over}.{comment.ballInOver}
                    </span>
                  )}
                </div>
                <div className="commentary-text">{comment.text}</div>
              </div>
            ))}
            <div ref={commentaryEndRef} />
          </div>
        )}
      </div>

      {!isLive && (
        <div className="commentary-note">
          Enable live mode to see real-time commentary
        </div>
      )}
    </div>
  );
}