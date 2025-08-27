import React, { useState } from "react";

/**
 * BallInput: choose runs 0-6, wicket toggle, extras
 * extras: {type: 'wide'|'no-ball'|'bye'|'leg-bye', value: number}
 */

export default function BallInput({ onAddBall, disabled }) {
  const [runs, setRuns] = useState(0);
  const [isWicket, setIsWicket] = useState(false);
  const [extraType, setExtraType] = useState("");
  const [extraValue, setExtraValue] = useState(0);
  const [note, setNote] = useState("");

  function handleAdd() {
    const extra = extraType ? { type: extraType, value: Number(extraValue || 0) } : null;
    const isLegal = extraType === "wide" || extraType === "no-ball" ? false : true;
    onAddBall({
      runs: Number(runs) || 0,
      isLegal,
      isWicket,
      extra,
      note
    });
    // reset small fields
    setRuns(0);
    setIsWicket(false);
    setExtraType("");
    setExtraValue(0);
    setNote("");
  }

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Ball Input</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <select className="input" value={runs} onChange={e => setRuns(e.target.value)} disabled={disabled}>
          {[0, 1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} run{n !== 1 ? 's' : ''}</option>)}
        </select>
        <button className="btn btn-ghost" onClick={() => setIsWicket(!isWicket)} style={{ minWidth: 110 }} disabled={disabled}>
          {isWicket ? "Wicket ✓" : "Wicket"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <select className="input" value={extraType} onChange={e => setExtraType(e.target.value)} disabled={disabled}>
          <option value="">No Extra</option>
          <option value="wide">Wide</option>
          <option value="no-ball">No-ball</option>
          <option value="bye">Bye</option>
          <option value="leg-bye">Leg-bye</option>
        </select>
        {extraType && (
          <input className="input" type="number" min="0" value={extraValue} onChange={e => setExtraValue(e.target.value)} placeholder="extra runs" disabled={disabled} />
        )}
      </div>

      <div style={{ marginBottom: 8 }}>
        <input className="input" placeholder="note (optional)" value={note} onChange={e => setNote(e.target.value)} disabled={disabled} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary" onClick={handleAdd} disabled={disabled}>Add Ball</button>
        {disabled && <div className="small note">Innings over — no more balls allowed</div>}
      </div>
    </div>
  );
}
