import { useState } from 'react';

export default function CommentaryTest({ onTestBall }) {
  const [testRuns, setTestRuns] = useState(4);

  const generateTestBall = () => {
    const testBall = {
      runs: testRuns,
      isLegal: true,
      isWicket: testRuns === 0 && Math.random() > 0.7,
      extra: null,
      note: "Test ball",
      batsmanOnStrike: "Test Batter",
      nonStriker: "Other Batter",
      time: new Date().toISOString()
    };

    onTestBall(testBall);
  };

  return (
    <div style={{
      padding: '12px',
      background: '#f0f8ff',
      border: '1px solid #b3d9ff',
      borderRadius: '4px',
      marginBottom: '12px'
    }}>
      <h5 style={{ margin: '0 0 8px 0' }}>Commentary Test</h5>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <select
          value={testRuns}
          onChange={(e) => setTestRuns(Number(e.target.value))}
          style={{ padding: '4px' }}
        >
          <option value={0}>0 runs</option>
          <option value={1}>1 run</option>
          <option value={2}>2 runs</option>
          <option value={3}>3 runs</option>
          <option value={4}>4 runs (FOUR)</option>
          <option value={6}>6 runs (SIX)</option>
        </select>
        <button
          className="btn btn-sm btn-primary"
          onClick={generateTestBall}
        >
          Test Commentary
        </button>
      </div>
      <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
        Click to test commentary generation without affecting match score
      </div>
    </div>
  );
}