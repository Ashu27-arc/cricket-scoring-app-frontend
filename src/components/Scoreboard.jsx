import React from "react";

export default function Scoreboard({ match }) {
  // Add safety checks for undefined match or properties
  if (!match) {
    return <div>Loading match data...</div>;
  }

  const oversCompleted = match.completedOvers?.length || 0;
  // format balls in current over
  const legalBallsInCurrentOver = match.currentOverBalls?.filter(b => b.isLegal).length || 0;
  const overDisplay = `${oversCompleted}.${legalBallsInCurrentOver}`;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {match.batting || 'Team A'} (batting) - Innings {match.currentInnings || 1}
            {match.currentInnings === 2 && match.target > 0 && (
              <div style={{ fontSize: 12, fontWeight: 400, color: '#666' }}>
                Target: {match.target} runs (Need {Math.max(0, match.target - (match.runs || 0))} more)
              </div>
            )}
          </div>
          <div className="small">
            <div>Striker: {match.striker || 'Batter 1'} • Non-striker: {match.nonStriker || 'Batter 2'}</div>
            {/* Batsmen Scores */}
            {match.batsmenScores && (
              <div style={{ marginTop: 4 }}>
                <div>
                  <strong>{match.striker}:</strong> {match.batsmenScores[match.striker]?.runs || 0} ({match.batsmenScores[match.striker]?.balls || 0})
                  {match.batsmenScores[match.striker]?.fours > 0 && ` [4s: ${match.batsmenScores[match.striker].fours}]`}
                  {match.batsmenScores[match.striker]?.sixes > 0 && ` [6s: ${match.batsmenScores[match.striker].sixes}]`}
                  {match.batsmenScores[match.striker]?.isOut && ' (OUT)'}
                </div>
                <div>
                  <strong>{match.nonStriker}:</strong> {match.batsmenScores[match.nonStriker]?.runs || 0} ({match.batsmenScores[match.nonStriker]?.balls || 0})
                  {match.batsmenScores[match.nonStriker]?.fours > 0 && ` [4s: ${match.batsmenScores[match.nonStriker].fours}]`}
                  {match.batsmenScores[match.nonStriker]?.sixes > 0 && ` [6s: ${match.batsmenScores[match.nonStriker].sixes}]`}
                  {match.batsmenScores[match.nonStriker]?.isOut && ' (OUT)'}
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{match.runs || 0}/{match.wickets || 0}</div>
          <div className="small">{overDisplay} / {match.overs || 0} overs</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="small">Balls: <span className="note">{match.ballCount || 0}</span></div>
        <div style={{ marginTop: 8 }}>
          <strong>Current Over:</strong>
          <div style={{ marginTop: 8 }}>
            {(!match.currentOverBalls || match.currentOverBalls.length === 0) && <div className="note">No balls yet</div>}
            <div style={{ display: "flex", flexWrap: "wrap", marginTop: 6 }}>
              {match.currentOverBalls?.map((b, i) => (
                <div key={i} className="ball" title={`${b.runs} runs ${b.isWicket ? '• wicket' : ''} ${b.extra ? '• ' + b.extra.type + ':' + b.extra.value : ''}`}>
                  {b.isWicket ? "W" : (b.extra ? `${b.extra.type[0].toUpperCase()}${b.extra.value}` : b.runs)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Over completion notification */}
      {legalBallsInCurrentOver === 0 && oversCompleted > 0 && (
        <div style={{ marginTop: 10, padding: 8, borderRadius: 6, background: "#f0f9ff", border: "1px solid #bfdbfe", color: "#1e40af" }}>
          Over {oversCompleted} completed! Batsmen changed ends. {match.striker} now on strike.
        </div>
      )}

      {match.isInningsOver && <div style={{ marginTop: 10, padding: 8, borderRadius: 6, background: "#fff3f0", border: "1px solid #ffd6cc", color: "#7a2a18" }}>
        Innings Over
      </div>}
    </div>
  );
}
