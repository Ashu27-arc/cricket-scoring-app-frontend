import React, { useState, useEffect, useRef } from 'react';
import socketService from '../services/socket';

export default function MatchCommentaryViewer({ match, isVisible }) {
    const [commentary, setCommentary] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [isAutoScroll, setIsAutoScroll] = useState(true);
    const commentaryEndRef = useRef(null);
    const commentaryContainerRef = useRef(null);

    useEffect(() => {
        if (!match || !isVisible) {
            // Disconnect when not viewing
            socketService.disconnect();
            setConnectionStatus('disconnected');
            setCommentary([]);
            return;
        }

        // Connect to WebSocket for this match
        connectToMatch();

        return () => {
            socketService.disconnect();
        };
    }, [match, isVisible]);

    useEffect(() => {
        // Auto-scroll to bottom when new commentary arrives
        if (isAutoScroll && commentaryEndRef.current) {
            commentaryEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [commentary, isAutoScroll]);

    const connectToMatch = async () => {
        try {
            setConnectionStatus('connecting');

            // Connect to WebSocket
            socketService.connect();

            // Join match room
            socketService.joinMatch(match._id);

            // Set up event listeners
            socketService.onMatchUpdate(handleMatchUpdate);
            socketService.onOverCompleted(handleOverCompleted);
            socketService.onInningsEnded(handleInningsEnded);

            setConnectionStatus('connected');

            // Add initial commentary
            addCommentary({
                type: 'system',
                message: `Connected to live commentary for ${getMatchTitle(match)}`,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Failed to connect to match:', error);
            setConnectionStatus('error');
            addCommentary({
                type: 'error',
                message: 'Failed to connect to live updates',
                timestamp: new Date().toISOString()
            });
        }
    };

    const handleMatchUpdate = (data) => {
        const { lastBall, matchState } = data;

        if (lastBall) {
            const commentary = generateBallCommentary(lastBall, matchState);
            addCommentary({
                type: 'ball',
                message: commentary,
                timestamp: lastBall.time || new Date().toISOString(),
                ballData: lastBall
            });
        }
    };

    const handleOverCompleted = (data) => {
        const { overNumber, completedOver, matchState } = data;
        const overRuns = completedOver.reduce((sum, ball) => {
            return sum + ball.runs + (ball.extra ? ball.extra.value : 0);
        }, 0);

        addCommentary({
            type: 'over',
            message: `End of Over ${overNumber}: ${overRuns} runs from the over. ${matchState.batting} ${matchState.runs}/${matchState.wickets}`,
            timestamp: new Date().toISOString(),
            overData: { overNumber, runs: overRuns, balls: completedOver }
        });
    };

    const handleInningsEnded = (data) => {
        const { matchState } = data;
        let message = '';

        if (matchState.currentInnings === 1) {
            message = `End of 1st Innings: ${matchState.batting} scored ${matchState.runs}/${matchState.wickets} in ${matchState.completedOvers.length} overs`;
        } else {
            if (matchState.isMatchComplete) {
                message = `Match Complete! ${matchState.winner} wins!`;
            } else {
                message = `End of 2nd Innings: ${matchState.batting} ${matchState.runs}/${matchState.wickets}`;
            }
        }

        addCommentary({
            type: 'innings',
            message,
            timestamp: new Date().toISOString(),
            inningsData: matchState
        });
    };

    const addCommentary = (commentaryItem) => {
        setCommentary(prev => [...prev, { ...commentaryItem, id: Date.now() + Math.random() }]);
    };

    const generateBallCommentary = (ball, matchState) => {
        const { runs, isWicket, extra, batsmanOnStrike } = ball;
        let commentary = '';

        if (isWicket) {
            commentary = `🏏 WICKET! ${batsmanOnStrike} is out! ${matchState.batting} ${matchState.runs}/${matchState.wickets}`;
        } else if (runs === 6) {
            commentary = `🚀 SIX! Magnificent shot by ${batsmanOnStrike}! ${runs} runs added`;
        } else if (runs === 4) {
            commentary = `🏏 FOUR! Beautiful boundary by ${batsmanOnStrike}! ${runs} runs`;
        } else if (extra) {
            commentary = `${extra.type.toUpperCase()}: ${extra.value} extra run${extra.value > 1 ? 's' : ''} conceded`;
        } else if (runs === 0) {
            commentary = `Dot ball. Good bowling, no runs scored`;
        } else {
            commentary = `${batsmanOnStrike} takes ${runs} run${runs > 1 ? 's' : ''}`;
        }

        return commentary;
    };

    const getMatchTitle = (match) => {
        const fullMatch = match.fullMatchJSON || match;
        return `${fullMatch.teamA} vs ${fullMatch.teamB}`;
    };

    const getMatchSummary = (match) => {
        const fullMatch = match.fullMatchJSON || match;
        const oversCompleted = fullMatch.completedOvers?.length || 0;
        const ballsInCurrentOver = fullMatch.currentOverBalls?.filter(b => b.isLegal).length || 0;
        const overDisplay = ballsInCurrentOver > 0 ? `${oversCompleted}.${ballsInCurrentOver}` : `${oversCompleted}`;

        if (fullMatch.currentInnings === 2) {
            const target = fullMatch.target || 0;
            const needed = Math.max(0, target - (fullMatch.runs || 0));
            const ballsRemaining = (fullMatch.overs - oversCompleted) * 6 - ballsInCurrentOver;
            return `${fullMatch.batting} need ${needed} runs from ${ballsRemaining} balls (${overDisplay}/${fullMatch.overs} ov)`;
        } else {
            return `${fullMatch.batting} ${fullMatch.runs || 0}/${fullMatch.wickets || 0} (${overDisplay}/${fullMatch.overs} ov) - 1st Innings`;
        }
    };

    const handleScrollToggle = () => {
        setIsAutoScroll(!isAutoScroll);
    };

    const handleScrollToBottom = () => {
        if (commentaryEndRef.current) {
            commentaryEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getCommentaryIcon = (type) => {
        switch (type) {
            case 'ball': return '🏏';
            case 'over': return '⚪';
            case 'innings': return '🏆';
            case 'system': return '📡';
            case 'error': return '❌';
            default: return '📝';
        }
    };

    if (!match) {
        return (
            <div className="commentary-viewer">
                <div className="commentary-header">
                    <h3>Match Commentary</h3>
                </div>
                <div className="no-match">
                    <div className="empty-state">
                        <div className="empty-icon">🏏</div>
                        <div className="empty-title">No Match Selected</div>
                        <div className="empty-subtitle">Select a live match to view real-time commentary</div>
                    </div>
                </div>
                <style jsx>{`
          .commentary-viewer {
            background: white;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            height: 500px;
            display: flex;
            flex-direction: column;
          }
          .commentary-header {
            padding: 16px;
            border-bottom: 1px solid #e5e7eb;
            background: #f9fafb;
          }
          .commentary-header h3 {
            margin: 0;
            font-size: 16px;
            color: #1f2937;
          }
          .no-match {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .empty-state {
            text-align: center;
            color: #6b7280;
          }
          .empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .empty-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #374151;
          }
          .empty-subtitle {
            font-size: 14px;
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="commentary-viewer">
            <div className="commentary-header">
                <div className="header-content">
                    <h3>{getMatchTitle(match)}</h3>
                    <div className="connection-status">
                        <span className={`status-indicator ${connectionStatus}`}>
                            {connectionStatus === 'connected' && '🟢'}
                            {connectionStatus === 'connecting' && '🟡'}
                            {connectionStatus === 'disconnected' && '🔴'}
                            {connectionStatus === 'error' && '❌'}
                        </span>
                        <span className="status-text">
                            {connectionStatus === 'connected' && 'Live'}
                            {connectionStatus === 'connecting' && 'Connecting...'}
                            {connectionStatus === 'disconnected' && 'Offline'}
                            {connectionStatus === 'error' && 'Error'}
                        </span>
                    </div>
                </div>

                <div className="match-summary">
                    {getMatchSummary(match)}
                </div>

                <div className="commentary-controls">
                    <button
                        className={`btn btn-sm ${isAutoScroll ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={handleScrollToggle}
                        title={isAutoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
                    >
                        {isAutoScroll ? '📌' : '📌'} Auto-scroll
                    </button>
                    <button
                        className="btn btn-sm btn-ghost"
                        onClick={handleScrollToBottom}
                        title="Scroll to bottom"
                    >
                        ⬇️ Bottom
                    </button>
                </div>
            </div>

            <div
                className="commentary-content"
                ref={commentaryContainerRef}
            >
                {commentary.length === 0 ? (
                    <div className="no-commentary">
                        <div className="waiting-message">
                            <div className="waiting-icon">⏳</div>
                            <div>Waiting for live commentary...</div>
                            <div className="waiting-subtitle">Commentary will appear here as the match progresses</div>
                        </div>
                    </div>
                ) : (
                    <div className="commentary-list">
                        {commentary.map((item) => (
                            <div key={item.id} className={`commentary-item ${item.type}`}>
                                <div className="commentary-time">
                                    {formatTime(item.timestamp)}
                                </div>
                                <div className="commentary-content-item">
                                    <span className="commentary-icon">
                                        {getCommentaryIcon(item.type)}
                                    </span>
                                    <span className="commentary-text">
                                        {item.message}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={commentaryEndRef} />
                    </div>
                )}
            </div>

            <style jsx>{`
        .commentary-viewer {
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          height: 500px;
          display: flex;
          flex-direction: column;
        }

        .commentary-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .header-content h3 {
          margin: 0;
          font-size: 16px;
          color: #1f2937;
        }

        .match-summary {
          background: #f0f9ff;
          border: 1px solid #bfdbfe;
          border-radius: 6px;
          padding: 8px 12px;
          margin: 8px 0;
          font-size: 13px;
          font-weight: 500;
          color: #1e40af;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }

        .status-indicator {
          font-size: 10px;
        }

        .status-text {
          font-weight: 500;
        }

        .status-text {
          color: #10b981;
        }

        .commentary-controls {
          display: flex;
          gap: 8px;
        }

        .commentary-content {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }

        .no-commentary {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .waiting-message {
          text-align: center;
          color: #6b7280;
        }

        .waiting-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }

        .waiting-subtitle {
          font-size: 12px;
          margin-top: 8px;
          color: #9ca3af;
        }

        .commentary-list {
          padding: 0;
        }

        .commentary-item {
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .commentary-item:last-child {
          border-bottom: none;
        }

        .commentary-item.ball {
          background: #fefefe;
        }

        .commentary-item.over {
          background: #f0f9ff;
          border-left: 3px solid #3b82f6;
        }

        .commentary-item.innings {
          background: #f0fdf4;
          border-left: 3px solid #10b981;
        }

        .commentary-item.system {
          background: #fafafa;
          font-style: italic;
        }

        .commentary-item.error {
          background: #fef2f2;
          border-left: 3px solid #ef4444;
        }

        .commentary-time {
          font-size: 11px;
          color: #6b7280;
          font-family: monospace;
          min-width: 60px;
          padding-top: 2px;
        }

        .commentary-content-item {
          flex: 1;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .commentary-icon {
          font-size: 14px;
          margin-top: 1px;
        }

        .commentary-text {
          font-size: 14px;
          line-height: 1.4;
          color: #374151;
        }

        .btn {
          padding: 4px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 11px;
          transition: all 0.2s;
        }

        .btn:hover {
          background: #f9fafb;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-ghost {
          background: transparent;
          border-color: transparent;
        }

        .btn-ghost:hover {
          background: #f3f4f6;
        }
      `}</style>
        </div>
    );
}