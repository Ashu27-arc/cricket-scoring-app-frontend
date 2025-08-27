import { useState, useEffect } from 'react'
import MatchSetup from "./components/MatchSetup";
import Scoreboard from "./components/Scoreboard";
import BallInput from "./components/BallInput";
import OversBoard from "./components/OversBoard";
import MatchControls from "./components/MatchControls";
import SavedMatches from "./components/SavedMatches";
import LiveScoreboard from "./components/LiveScoreboard";
import LiveCommentary from "./components/LiveCommentary";
import LiveModeGuide from "./components/LiveModeGuide";
import CommentaryTest from "./components/CommentaryTest";
import BatsmenScorecard from "./components/BatsmenScorecard";
import InningsBreakdown from "./components/InningsBreakdown";
import { useMatchAPI } from "./hooks/useMatchAPI";
import socketService from "./services/socket";

/**
 * Main App - holds match state
 * Features:
 * - Setup match (team names, overs)
 * - Ball-by-ball input (runs, extras, wicket)
 * - Maintains balls, overs, runs, wickets, striker/non-striker
 * - LocalStorage save/load
 * - Export JSON
 */

const defaultState = {
  teamA: "Team A",
  teamB: "Team B",
  batting: "Team A", // currently batting
  overs: 5,
  currentOverBalls: [], // list of balls for ongoing over
  completedOvers: [], // array of over arrays
  runs: 0,
  wickets: 0,
  ballCount: 0, // total legal balls
  striker: "Batter 1",
  nonStriker: "Batter 2",
  nextBatterNum: 3,
  isInningsOver: false,
  // Match state tracking
  currentInnings: 1, // 1 or 2
  isMatchComplete: false,
  winner: null,
  // Innings data
  firstInnings: null, // will store first innings data
  secondInnings: null, // will store second innings data
  target: 0, // target for second innings (first innings runs + 1)
  // Individual batsmen scores
  batsmenScores: {
    "Batter 1": { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
    "Batter 2": { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }
  }
};

const STORAGE_KEY = "cricket_scoring_v1";

export default function App() {
  const [match, setMatch] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultState;
  });
  const [currentMatchId, setCurrentMatchId] = useState(null);
  const [autoSave, setAutoSave] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [lastBall, setLastBall] = useState(null);
  const { loading, error, saveMatch, updateMatch } = useMatchAPI();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(match));

    // Auto-save to backend if enabled and match has significant progress
    if (autoSave && (match.ballCount > 0 || match.runs > 0)) {
      handleAutoSave();
    }
  }, [match]);

  const handleAutoSave = async () => {
    try {
      if (currentMatchId) {
        // Check if over was just completed
        const previousOverCount = match.completedOvers?.length || 0;
        const wasInningsOver = match.isInningsOver;

        const additionalData = {};
        if (lastBall) {
          additionalData.lastBall = lastBall;

          // Check if over just completed
          if (lastBall.overJustCompleted) {
            additionalData.overCompleted = true;
            additionalData.completedOver = lastBall.completedOverData;
            additionalData.overNumber = previousOverCount + 1;
          }

          // Check if innings just ended
          if (wasInningsOver && lastBall.inningsJustEnded) {
            additionalData.inningsJustEnded = true;
          }
        }

        await updateMatch(currentMatchId, match, lastBall, additionalData);
      } else {
        const savedMatch = await saveMatch(match);
        setCurrentMatchId(savedMatch._id);
      }
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  };

  // Reset match
  function resetMatch() {
    setMatch({ ...defaultState });
    setCurrentMatchId(null);
    setLastBall(null);
    if (liveMode) {
      socketService.disconnect();
      setLiveMode(false);
    }
  }

  // Load match from backend
  function loadMatch(matchData, matchId = null) {
    setMatch(matchData);
    setCurrentMatchId(matchId);
  }

  // Save match to backend
  async function saveMatchToBackend() {
    try {
      if (currentMatchId) {
        const updated = await updateMatch(currentMatchId, match, lastBall);
        console.log('Match updated:', updated._id);
      } else {
        const saved = await saveMatch(match);
        setCurrentMatchId(saved._id);
        console.log('Match saved:', saved._id);
      }
      alert('Match saved successfully!');
    } catch (err) {
      alert('Failed to save match: ' + (err.response?.data?.message || err.message));
    }
  }

  // Toggle live mode
  function toggleLiveMode() {
    if (!currentMatchId) {
      alert('Please save the match first to enable live mode');
      return;
    }

    if (liveMode) {
      socketService.disconnect();
      setLiveMode(false);
    } else {
      socketService.connect();
      setLiveMode(true);
    }
  }

  // Setup match
  function setupMatch({ teamA, teamB, overs, batting }) {
    setMatch((m) => ({
      ...defaultState,
      teamA: teamA || m.teamA,
      teamB: teamB || m.teamB,
      overs: overs || m.overs,
      batting: batting || m.batting,
      currentInnings: 1,
      isMatchComplete: false,
      winner: null,
      firstInnings: null,
      secondInnings: null,
      target: 0,
      batsmenScores: {
        "Batter 1": { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
        "Batter 2": { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }
      }
    }));
  }

  // Start second innings
  function startSecondInnings() {
    if (!match.isInningsOver || match.currentInnings !== 1) {
      alert('First innings must be completed before starting second innings');
      return;
    }

    const firstInningsData = {
      teamName: match.batting,
      runs: match.runs,
      wickets: match.wickets,
      overs: match.completedOvers.length,
      balls: match.ballCount,
      batsmenScores: { ...match.batsmenScores },
      completedOvers: [...match.completedOvers]
    };

    const secondBattingTeam = match.batting === match.teamA ? match.teamB : match.teamA;
    const target = match.runs + 1;

    setMatch((m) => ({
      ...m,
      // Reset current innings data
      currentOverBalls: [],
      completedOvers: [],
      runs: 0,
      wickets: 0,
      ballCount: 0,
      striker: "Batter 1",
      nonStriker: "Batter 2",
      nextBatterNum: 3,
      isInningsOver: false,
      // Update match state
      currentInnings: 2,
      batting: secondBattingTeam,
      firstInnings: firstInningsData,
      target: target,
      // Reset batsmen scores for second innings
      batsmenScores: {
        "Batter 1": { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
        "Batter 2": { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false }
      }
    }));

    console.log(`Second innings started! ${secondBattingTeam} needs ${target} runs to win`);
  }

  // Add ball result
  function addBall({ runs = 0, isLegal = true, isWicket = false, extra = null, note = "" }) {
    if (match.isInningsOver) return;

    const previousOverCount = match.completedOvers?.length || 0;
    const wasInningsOver = match.isInningsOver;

    setMatch((m) => {
      const newRuns = m.runs + runs + (extra ? extra.value : 0);
      const ballObj = {
        runs,
        isLegal,
        isWicket,
        extra,
        note,
        batsmanOnStrike: m.striker,
        nonStriker: m.nonStriker,
        time: new Date().toISOString()
      };

      let newCompletedOvers = [...m.completedOvers];
      let newCurrentBalls = [...m.currentOverBalls, ballObj];
      let newBallCount = m.ballCount;
      // legal ball increments ball count
      if (isLegal) newBallCount = m.ballCount + 1;

      // Update batsmen scores
      let newBatsmenScores = { ...m.batsmenScores };

      // Initialize batsman score if not exists
      if (!newBatsmenScores[m.striker]) {
        newBatsmenScores[m.striker] = { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false };
      }

      // Update striker's stats (only for legal balls)
      if (isLegal) {
        newBatsmenScores[m.striker].runs += runs;
        newBatsmenScores[m.striker].balls += 1;
        if (runs === 4) newBatsmenScores[m.striker].fours += 1;
        if (runs === 6) newBatsmenScores[m.striker].sixes += 1;
      }

      // handle wicket
      let newWickets = m.wickets + (isWicket ? 1 : 0);
      let newStriker = m.striker;
      let newNonStriker = m.nonStriker;
      let nextBatterNum = m.nextBatterNum;

      if (isWicket) {
        // Mark current striker as out
        newBatsmenScores[m.striker].isOut = true;

        // new batsman replaces striker
        newStriker = "Batter " + nextBatterNum;

        // Initialize new batsman score
        if (!newBatsmenScores[newStriker]) {
          newBatsmenScores[newStriker] = { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false };
        }

        nextBatterNum++;
      } else if (isLegal && (runs % 2 === 1)) {
        // strike changes on odd runs
        [newStriker, newNonStriker] = [newNonStriker, newStriker];
      }

      // if over completed (6 legal balls)
      const legalBallsInCurrentOver = newCurrentBalls.filter(b => b.isLegal).length;
      let overJustCompleted = false;
      if (legalBallsInCurrentOver >= 6) {
        newCompletedOvers = [...newCompletedOvers, newCurrentBalls];
        newCurrentBalls = [];
        overJustCompleted = true;
        // swap strike at end of over - batsmen change ends
        [newStriker, newNonStriker] = [newNonStriker, newStriker];
        console.log(`Over ${newCompletedOvers.length} completed! Batsmen changed: ${newStriker} now on strike, ${newNonStriker} at non-striker end`);
      }

      // check innings over (overs completed or target achieved)
      const completedOversCount = newCompletedOvers.length;
      let inningsOver = completedOversCount >= m.overs || newWickets >= 10;
      let isMatchComplete = false;
      let winner = null;

      // Second innings specific logic
      if (m.currentInnings === 2 && m.target > 0) {
        // Check if target achieved
        if (newRuns >= m.target) {
          inningsOver = true;
          isMatchComplete = true;
          winner = m.batting;
          console.log(`${m.batting} wins by ${10 - newWickets} wickets!`);
        }
        // Check if impossible to achieve target (all out or overs finished)
        else if (newWickets >= 10 || completedOversCount >= m.overs) {
          inningsOver = true;
          isMatchComplete = true;
          winner = m.batting === m.teamA ? m.teamB : m.teamA;
          const margin = m.target - newRuns - 1;
          console.log(`${winner} wins by ${margin} runs!`);
        }
      }

      const newMatch = {
        ...m,
        runs: newRuns,
        wickets: newWickets,
        currentOverBalls: newCurrentBalls,
        completedOvers: newCompletedOvers,
        ballCount: newBallCount,
        striker: newStriker,
        nonStriker: newNonStriker,
        nextBatterNum,
        isInningsOver: inningsOver,
        isMatchComplete,
        winner,
        batsmenScores: newBatsmenScores
      };

      // Set last ball data for live updates
      const ballData = {
        ...ballObj,
        overJustCompleted,
        completedOverData: overJustCompleted ? newCompletedOvers[newCompletedOvers.length - 1] : null,
        inningsJustEnded: inningsOver && !wasInningsOver,
        newStriker: newStriker,
        newNonStriker: newNonStriker
      };
      setLastBall(ballData);

      return newMatch;
    });
  }

  function undoLastBall() {
    setMatch((m) => {
      let current = [...m.currentOverBalls];
      let completed = [...m.completedOvers];
      let ballToRemove = null;

      if (current.length > 0) {
        ballToRemove = current.pop();
      } else if (completed.length > 0) {
        // take last over's last ball
        current = completed.pop();
        ballToRemove = current.pop();
      } else {
        return m;
      }

      // reverse the effects
      let dedRuns = ballToRemove.runs + (ballToRemove.extra ? ballToRemove.extra.value : 0);
      let dedWickets = ballToRemove.isWicket ? 1 : 0;
      let dedLegal = ballToRemove.isLegal ? 1 : 0;

      // revert striker logic simply by resetting from stored ball
      const prevStriker = ballToRemove.batsmanOnStrike;
      const prevNonStriker = ballToRemove.nonStriker;

      // Revert batsmen scores
      let newBatsmenScores = { ...m.batsmenScores };
      if (ballToRemove.isLegal && newBatsmenScores[prevStriker]) {
        newBatsmenScores[prevStriker].runs -= ballToRemove.runs;
        newBatsmenScores[prevStriker].balls -= 1;
        if (ballToRemove.runs === 4) newBatsmenScores[prevStriker].fours -= 1;
        if (ballToRemove.runs === 6) newBatsmenScores[prevStriker].sixes -= 1;
      }

      // If wicket is being undone, mark batsman as not out
      if (ballToRemove.isWicket && newBatsmenScores[prevStriker]) {
        newBatsmenScores[prevStriker].isOut = false;
      }

      const newMatch = {
        ...m,
        runs: m.runs - dedRuns,
        wickets: m.wickets - dedWickets,
        ballCount: m.ballCount - dedLegal,
        currentOverBalls: current,
        completedOvers: completed,
        striker: prevStriker,
        nonStriker: prevNonStriker,
        isInningsOver: false,
        batsmenScores: newBatsmenScores
      };

      // adjust nextBatterNum if wicket removed
      if (dedWickets > 0) {
        newMatch.nextBatterNum = Math.max(3, newMatch.nextBatterNum - 1);
      }

      return newMatch;
    });
  }

  function exportMatch() {
    const blob = new Blob([JSON.stringify(match, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `match_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app-container">
      <div className="header">
        <h2 style={{ margin: 0 }}>Cricket Scoring App</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {error && <span style={{ color: 'red', fontSize: '12px' }}>API Error: {error}</span>}
          {loading && <span style={{ color: 'blue', fontSize: '12px' }}>Saving...</span>}
          {currentMatchId && <span style={{ color: 'green', fontSize: '12px' }}>Match ID: {currentMatchId.slice(-6)}</span>}

          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
            />
            Auto-save
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={liveMode}
              onChange={toggleLiveMode}
              disabled={!currentMatchId}
            />
            Live Mode
          </label>

          <button className="btn btn-success" onClick={saveMatchToBackend} disabled={loading}>
            Save to Cloud
          </button>
          <button className="btn btn-ghost" onClick={() => { localStorage.removeItem(STORAGE_KEY); resetMatch(); }}>
            New Match
          </button>
          <button className="btn btn-primary" onClick={exportMatch}>Export JSON</button>
        </div>
      </div>

      <div className="grid">
        <div className="left-panel panel">
          <MatchSetup match={match} onSetup={setupMatch} />
          <div style={{ height: 12 }} />
          <SavedMatches onLoadMatch={loadMatch} currentMatchId={currentMatchId} />
          <div style={{ height: 12 }} />
          <LiveModeGuide currentMatchId={currentMatchId} liveMode={liveMode} />
          <div style={{ height: 12 }} />
          <BallInput onAddBall={addBall} disabled={match.isInningsOver || match.isMatchComplete} />
          <div style={{ height: 12 }} />
          <MatchControls
            onUndo={undoLastBall}
            onReset={resetMatch}
            onExport={exportMatch}
            inningsOver={match.isInningsOver}
            match={match}
            onStartSecondInnings={startSecondInnings}
          />
        </div>

        <div className="right-panel panel">
          {liveMode ? (
            <LiveScoreboard match={match} matchId={currentMatchId} isLive={liveMode} />
          ) : (
            <Scoreboard match={match} />
          )}
          <div style={{ height: 12 }} />
          <OversBoard match={match} />
          <div style={{ height: 12 }} />
          <BatsmenScorecard match={match} />
          <div style={{ height: 12 }} />
          <InningsBreakdown match={match} />
        </div>
      </div>

      {/* Live Commentary Panel */}
      <div className="commentary-panel panel" style={{ marginTop: '20px' }}>
        <CommentaryTest onTestBall={(testBall) => setLastBall(testBall)} />
        <LiveCommentary
          matchId={currentMatchId}
          isLive={liveMode}
          lastBall={lastBall}
          matchState={match}
        />
      </div>
    </div>
  );
}
