import React from "react";

export default function OversBoard({ match }) {
  // Add safety check for undefined match
  if (!match) {
    return <div>Loading match data...</div>;
  }

  const completedOvers = match.completedOvers || [];

  return (
    <div>
      <h4 style={{ marginTop: 0 }}>Overs / Details</h4>

      <div style={{ maxHeight: 300, overflowY: "auto", paddingRight: 6 }}>
        {completedOvers.length === 0 && <div className="note">No completed overs yet</div>}
        <ul className="list">
          {completedOvers.map((over, idx) => {
            const overRuns = over.reduce((s, b) => s + b.runs + (b.extra ? b.extra.value : 0), 0);
            const overWkts = over.reduce((s, b) => s + (b.isWicket ? 1 : 0), 0);
            return (
              <li key={idx} style={{ marginBottom: 8 }}>
                <div className="row-between">
                  <div><strong>Over {idx + 1}</strong> <span className="small">({over.length} balls)</span></div>
                  <div className="small">{overRuns} runs • {overWkts} wkts</div>
                </div>
                <div style={{ marginTop: 6 }}>
                  {over.map((b, i) => (
                    <span key={i} className="ball" title={b.note || ""}>
                      {b.isWicket ? "W" : (b.extra ? `${b.extra.type[0].toUpperCase()}${b.extra.value}` : b.runs)}
                    </span>
                  ))}
                </div>
                {/* Show batsmen info for completed over */}
                {over.length > 0 && (
                  <div className="small" style={{ marginTop: 4, color: '#666' }}>
                    Batsmen changed ends after this over
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
