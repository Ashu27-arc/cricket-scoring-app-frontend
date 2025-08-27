import React from "react";

export default function MatchControls({ onUndo, onReset, onExport, inningsOver, match, onStartSecondInnings }) {
  const canStartSecondInnings = match && match.isInningsOver && match.currentInnings === 1 && !match.isMatchComplete;
  const isMatchComplete = match && match.isMatchComplete;

  return (
    <div>
      <h4 style={{ marginTop: 0 }}>Controls</h4>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn btn-ghost" onClick={onUndo} disabled={inningsOver || isMatchComplete}>Undo Last Ball</button>
        <button className="btn btn-ghost" onClick={onExport}>Export</button>
        <button className="btn btn-ghost" onClick={onReset}>Reset</button>

        {canStartSecondInnings && (
          <button className="btn btn-primary" onClick={onStartSecondInnings}>
            Start 2nd Innings
          </button>
        )}
      </div>

      <div className="note">Tip: Export saves JSON of current match. Reset clears all data.</div>

      {inningsOver && !isMatchComplete && match?.currentInnings === 1 && (
        <div className="note" style={{ color: '#2563eb', marginTop: 4 }}>
          First innings completed - Click "Start 2nd Innings" to continue
        </div>
      )}

      {inningsOver && !isMatchComplete && match?.currentInnings === 2 && (
        <div className="note" style={{ color: '#e53e3e', marginTop: 4 }}>
          Second innings completed - Match finished
        </div>
      )}

      {isMatchComplete && (
        <div style={{ marginTop: 8, padding: 8, backgroundColor: '#dcfce7', border: '1px solid #16a34a', borderRadius: 4, color: '#15803d' }}>
          <strong>🏆 Match Complete!</strong><br />
          Winner: <strong>{match.winner}</strong>
        </div>
      )}
    </div>
  );
}
