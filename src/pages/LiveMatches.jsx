import React from 'react';
import LiveMatchViewer from '../components/LiveMatchViewer';

export default function LiveMatches() {
  return (
    <div className="live-matches-page">
      <LiveMatchViewer />
      
      <style jsx>{`
        .live-matches-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 0;
        }
      `}</style>
    </div>
  );
}