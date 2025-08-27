import React from "react";

export default function InningsBreakdown({ match }) {
    if (!match || match.currentInnings === 1) {
        return null; // Only show during/after second innings
    }

    const firstInnings = match.firstInnings;
    const currentInnings = {
        teamName: match.batting,
        runs: match.runs,
        wickets: match.wickets,
        overs: match.completedOvers?.length || 0,
        balls: match.ballCount
    };

    const getOversDisplay = (overs, balls) => {
        const legalBalls = balls % 6;
        return legalBalls > 0 ? `${overs}.${legalBalls}` : `${overs}`;
    };

    return (
        <div>
            <h4 style={{ marginTop: 0, marginBottom: 12 }}>Match Summary</h4>

            {/* First Innings */}
            <div style={{ marginBottom: 12, padding: 10, backgroundColor: '#f8f9fa', borderRadius: 6 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    1st Innings: {firstInnings?.teamName}
                </div>
                <div style={{ fontSize: '14px' }}>
                    {firstInnings?.runs}/{firstInnings?.wickets} ({getOversDisplay(firstInnings?.overs || 0, firstInnings?.balls || 0)} overs)
                </div>
            </div>

            {/* Second Innings */}
            <div style={{ marginBottom: 12, padding: 10, backgroundColor: match.currentInnings === 2 ? '#e8f5e8' : '#f8f9fa', borderRadius: 6 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    2nd Innings: {currentInnings.teamName}
                    {match.currentInnings === 2 && ' (Current)'}
                </div>
                <div style={{ fontSize: '14px' }}>
                    {currentInnings.runs}/{currentInnings.wickets} ({getOversDisplay(currentInnings.overs, currentInnings.balls)} overs)
                </div>
                {match.target > 0 && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: 2 }}>
                        Target: {match.target} | Need: {Math.max(0, match.target - currentInnings.runs)} runs
                    </div>
                )}
            </div>

            {/* Match Status */}
            {match.isMatchComplete && match.winner && (
                <div style={{ padding: 10, backgroundColor: '#dcfce7', border: '1px solid #16a34a', borderRadius: 6, color: '#15803d' }}>
                    <div style={{ fontWeight: 'bold' }}>🏆 {match.winner} Wins!</div>
                    <div style={{ fontSize: '12px', marginTop: 2 }}>
                        {match.winner === match.batting
                            ? `by ${10 - match.wickets} wickets`
                            : `by ${match.target - match.runs - 1} runs`
                        }
                    </div>
                </div>
            )}

            {match.currentInnings === 2 && !match.isMatchComplete && (
                <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                    Match in progress...
                </div>
            )}
        </div>
    );
}