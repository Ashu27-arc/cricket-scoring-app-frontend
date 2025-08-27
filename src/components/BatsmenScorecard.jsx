import React from "react";

export default function BatsmenScorecard({ match }) {
  if (!match || !match.batsmenScores) {
    return null;
  }

  const batsmenScores = match.batsmenScores;
  const activeBatsmen = [match.striker, match.nonStriker];

  // Get all batsmen who have played
  const allBatsmen = Object.keys(batsmenScores).filter(name =>
    batsmenScores[name].balls > 0 || activeBatsmen.includes(name)
  );

  // Calculate strike rate
  const getStrikeRate = (runs, balls) => {
    if (balls === 0) return 0;
    return ((runs / balls) * 100).toFixed(1);
  };

  return (
    <div>
      <h4 style={{ marginTop: 0, marginBottom: 12 }}>Batsmen Scorecard</h4>

      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        {allBatsmen.length === 0 && <div className="note">No batsmen data yet</div>}

        <div style={{ fontSize: '12px', marginBottom: 8, color: '#666' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: 8, fontWeight: 'bold' }}>
            <div>Batsman</div>
            <div>Runs</div>
            <div>Balls</div>
            <div>4s</div>
            <div>6s</div>
            <div>SR</div>
          </div>
        </div>

        {allBatsmen.map((batsmanName) => {
          const stats = batsmenScores[batsmanName];
          const isActive = activeBatsmen.includes(batsmanName);
          const isStriker = match.striker === batsmanName;

          return (
            <div
              key={batsmanName}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                gap: 8,
                padding: '4px 0',
                fontSize: '12px',
                backgroundColor: isActive ? (isStriker ? '#e8f5e8' : '#f0f8ff') : 'transparent',
                borderRadius: '4px',
                paddingLeft: isActive ? '4px' : '0'
              }}
            >
              <div style={{ fontWeight: isActive ? 'bold' : 'normal' }}>
                {batsmanName}
                {isStriker && ' *'}
                {stats.isOut && ' (OUT)'}
              </div>
              <div>{stats.runs}</div>
              <div>{stats.balls}</div>
              <div>{stats.fours}</div>
              <div>{stats.sixes}</div>
              <div>{getStrikeRate(stats.runs, stats.balls)}</div>
            </div>
          );
        })}
      </div>

      {/* Partnership info */}
      {activeBatsmen.length === 2 && !batsmenScores[match.striker]?.isOut && !batsmenScores[match.nonStriker]?.isOut && (
        <div style={{ marginTop: 12, padding: 8, backgroundColor: '#f8f9fa', borderRadius: 4, fontSize: '12px' }}>
          <strong>Current Partnership:</strong> {
            (batsmenScores[match.striker]?.runs || 0) + (batsmenScores[match.nonStriker]?.runs || 0)
          } runs
        </div>
      )}
    </div>
  );
}