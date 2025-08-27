import React, { useState } from "react";

export default function MatchSetup({ match, onSetup }) {
  // Add safety checks for undefined match properties
  const [teamA, setTeamA] = useState(match?.teamA || "Team A");
  const [teamB, setTeamB] = useState(match?.teamB || "Team B");
  const [overs, setOvers] = useState(match?.overs || 5);
  const [batting, setBatting] = useState(match?.batting || "Team A");

  function handleSubmit(e) {
    e.preventDefault();
    onSetup({ teamA, teamB, overs: Number(overs), batting });
  }

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Match Setup</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label className="small">Team A</label>
          <input className="input" value={teamA} onChange={e => setTeamA(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label className="small">Team B</label>
          <input className="input" value={teamB} onChange={e => setTeamB(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <label className="small">Overs</label>
            <input className="input" type="number" min="1" value={overs} onChange={e => setOvers(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="small">Batting</label>
            <select className="input" value={batting} onChange={e => setBatting(e.target.value)}>
              <option value={teamA}>{teamA}</option>
              <option value={teamB}>{teamB}</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" className="btn btn-primary">Start / Update</button>
        </div>
      </form>
    </div>
  );
}
