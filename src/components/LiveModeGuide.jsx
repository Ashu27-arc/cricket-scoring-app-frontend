import { useState } from 'react';

export default function LiveModeGuide({ currentMatchId, liveMode }) {
  const [showGuide, setShowGuide] = useState(false);

  if (liveMode) return null; // Don't show guide when live mode is active

  return (
    <div className="live-mode-guide">
      <button
        className="btn btn-info btn-sm"
        onClick={() => setShowGuide(!showGuide)}
      >
        ℹ️ Live Mode Guide
      </button>

      {showGuide && (
        <div className="guide-content">
          <h4>Live Commentary & Updates Guide</h4>
          <div className="guide-steps">
            <div className="step">
              <span className="step-number">1</span>
              <div className="step-content">
                <strong>Save Match First</strong>
                <p>Click "Save to Cloud" button to save your match to database</p>
                {!currentMatchId && <span className="status pending">❌ Not saved yet</span>}
                {currentMatchId && <span className="status done">✅ Match saved</span>}
              </div>
            </div>

            <div className="step">
              <span className="step-number">2</span>
              <div className="step-content">
                <strong>Enable Live Mode</strong>
                <p>Check the "Live Mode" checkbox in the header</p>
                <span className="status pending">⏳ Waiting for Live Mode</span>
              </div>
            </div>

            <div className="step">
              <span className="step-number">3</span>
              <div className="step-content">
                <strong>Commentary Will Appear</strong>
                <p>Live commentary panel will show below the main scoring area</p>
                <div className="commentary-preview">
                  <div className="preview-header">Live Commentary</div>
                  <div className="preview-item">
                    <span className="preview-time">14:30</span>
                    <span className="preview-text">FOUR! Beautiful shot by Batter 1!</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-time">14:29</span>
                    <span className="preview-text">Two runs! Good placement by Batter 1</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="step">
              <span className="step-number">4</span>
              <div className="step-content">
                <strong>Real-time Updates</strong>
                <p>Every ball will generate automatic commentary and live score updates</p>
                <ul className="feature-list">
                  <li>🏏 Ball-by-ball commentary</li>
                  <li>📊 Live score updates</li>
                  <li>🎯 Milestone celebrations</li>
                  <li>📝 Over summaries</li>
                  <li>🏁 Innings end commentary</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="guide-note">
            <strong>Note:</strong> Multiple people can watch the same match live by using the same Match ID!
          </div>
        </div>
      )}
    </div>
  );
}