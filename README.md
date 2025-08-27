# 🏏 Cricket Scoring Frontend

React application with Vite for real-time cricket scoring with live commentary, individual batsmen tracking, complete match management, and WebSocket updates.

## ✨ Features

### 🎯 Complete Match Management
- **Both Innings Support**: Full match with first and second innings
- **Target-Based Chasing**: Second team chases target with live tracking
- **Winner Determination**: Automatic winner calculation with margin display
- **Match Completion**: Clear indication when match is finished

### 🏏 Advanced Scoring Features
- **Individual Batsmen Tracking**: Runs, balls, 4s, 6s, strike rate for each batsman
- **Ball-by-ball Input**: Runs, extras, wickets with detailed tracking
- **Over Management**: Automatic over completion with batsmen rotation
- **Partnership Display**: Live partnership runs between current batsmen
- **Innings Breakdown**: Complete summary of both innings

### 🌐 Live Features
- **Real-time WebSocket Updates**: Live scoring with Socket.IO
- **Live Commentary**: AI-generated commentary for every ball
- **Multi-user Viewing**: Multiple people can watch same match live
- **Connection Status**: Visual indicators for WebSocket connection
- **Auto-save**: Automatic cloud saving after every ball

### 💾 Data Management
- **Cloud Integration**: Save/load matches from MongoDB backend
- **Match History**: Browse and manage saved matches
- **Local Storage**: Offline backup for reliability
- **JSON Export**: Download complete match data

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Backend server running on port 5000

### Installation & Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Access Points
- **Development**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **WebSocket**: http://localhost:5000

## 🏆 Complete Match Flow

### 1. Match Setup
- Enter team names (e.g., "India", "Australia")
- Set overs (5, 10, 20, 50)
- Choose batting team
- Click "Start / Update"

### 2. First Innings Scoring
- Use ball input to score runs, wickets, extras
- System automatically tracks individual batsmen
- Over completion rotates batsmen
- Innings ends when overs complete or 10 wickets fall

### 3. Innings Break
- "Start 2nd Innings" button appears
- First innings data automatically saved
- Target calculated (first innings runs + 1)

### 4. Second Innings Chasing
- Second team chases target
- Live target tracking shows runs needed
- Match ends when target achieved or becomes impossible

### 5. Match Result
- Winner determined automatically
- Margin calculated (by runs or wickets)
- Complete match summary displayed

## 📖 User Guide

### Basic Scoring Interface

#### Ball Input Panel
- **Runs Dropdown**: Select 0-6 runs
- **Wicket Toggle**: Mark if batsman dismissed
- **Extras Selection**: Wide, no-ball, bye, leg-bye with values
- **Notes Field**: Optional commentary notes
- **Add Ball Button**: Submit the ball

#### Automatic Features
- **Strike Rotation**: Changes on odd runs (1, 3, 5)
- **Over Completion**: After 6 legal balls with batsmen swap
- **Score Tracking**: Individual and team totals updated
- **Wicket Handling**: New batsman initialization

### Individual Batsmen Scorecard

#### Display Format
```
Batsman         Runs  Balls  4s  6s   SR
Batter 1 *        45     32   6   2  140.6
Batter 2          23     18   3   0  127.8
```

#### Features
- **Strike Rate**: Calculated as (runs/balls) × 100
- **Boundary Tracking**: Automatic 4s and 6s counting
- **Active Indicator**: Asterisk (*) for current striker
- **Out Status**: Clear indication when dismissed
- **Partnership**: Combined runs of current batting pair

### Live Mode Setup

#### Enable Live Features
1. **Save Match First**: Click "Save to Cloud" button
2. **Enable Live Mode**: Check "Live Mode" checkbox
3. **Connection Status**: Green indicator shows WebSocket connected
4. **Share Match ID**: Give displayed ID to other viewers

#### Multi-User Viewing
1. **Primary Scorer**: Sets up and scores the match
2. **Viewers**: Load same match using Match ID
3. **Enable Live Mode**: All users check "Live Mode"
4. **Real-time Updates**: Everyone sees live score and commentary

### Match Controls

#### During Match
- **Undo Last Ball**: Correct scoring mistakes
- **Auto-save**: Automatic cloud saving toggle
- **Live Mode**: Real-time updates toggle
- **Export JSON**: Download match data

#### Between Innings
- **Start 2nd Innings**: Begin second innings
- **Innings Summary**: View both innings data
- **Target Display**: Shows runs needed to win

#### Match Complete
- **Winner Display**: Final result with winning margin
- **Match History**: Automatically saved to database
- **New Match**: Reset for fresh game

## 🏗️ Project Structure

```
src/
├── components/
│   ├── BallInput.jsx           # Ball scoring interface
│   ├── Scoreboard.jsx          # Basic score display
│   ├── LiveScoreboard.jsx      # Real-time scoreboard
│   ├── BatsmenScorecard.jsx    # Individual batsmen stats
│   ├── InningsBreakdown.jsx    # Complete match summary
│   ├── LiveCommentary.jsx      # Live commentary panel
│   ├── SavedMatches.jsx        # Match history management
│   ├── MatchSetup.jsx          # Team & over configuration
│   ├── MatchControls.jsx       # Match control buttons
│   ├── OversBoard.jsx          # Over details display
│   ├── LiveModeGuide.jsx       # User instructions
│   └── CommentaryTest.jsx      # Commentary testing
├── hooks/
│   └── useMatchAPI.js          # API state management
├── services/
│   ├── api.js                  # REST API client
│   └── socket.js               # WebSocket client
├── App.jsx                     # Main application
├── main.jsx                    # App entry point
├── index.css                   # Global styles
└── styles.css                  # Component styles
```

## 🎯 Key Components

### App.jsx - Main Application
```javascript
// Core match state management
const [match, setMatch] = useState(defaultState);
const [currentMatchId, setCurrentMatchId] = useState(null);
const [liveMode, setLiveMode] = useState(false);

// Key functions
function addBall() { /* Ball scoring logic */ }
function startSecondInnings() { /* Second innings setup */ }
function undoLastBall() { /* Undo functionality */ }
function saveMatchToBackend() { /* Cloud save */ }
function toggleLiveMode() { /* WebSocket connection */ }
```

### BallInput.jsx - Scoring Interface
```javascript
// Ball input state
const [runs, setRuns] = useState(0);
const [isWicket, setIsWicket] = useState(false);
const [extraType, setExtraType] = useState("");

// Submit ball data
function handleAdd() {
  onAddBall({
    runs: Number(runs),
    isLegal: extraType !== "wide" && extraType !== "no-ball",
    isWicket,
    extra: extraType ? { type: extraType, value: extraValue } : null
  });
}
```

### BatsmenScorecard.jsx - Individual Stats
```javascript
// Calculate strike rate
const getStrikeRate = (runs, balls) => {
  if (balls === 0) return 0;
  return ((runs / balls) * 100).toFixed(1);
};

// Display batsmen with stats
{allBatsmen.map((batsmanName) => {
  const stats = batsmenScores[batsmanName];
  const isStriker = match.striker === batsmanName;
  // Render batsman row with stats
})}
```

### InningsBreakdown.jsx - Match Summary
```javascript
// Show both innings data
const firstInnings = match.firstInnings;
const currentInnings = {
  teamName: match.batting,
  runs: match.runs,
  wickets: match.wickets,
  overs: match.completedOvers?.length || 0
};

// Display winner and margin
{match.isMatchComplete && match.winner && (
  <div>🏆 {match.winner} Wins!</div>
)}
```

## 🔧 Configuration

### API Configuration
```javascript
// services/api.js
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' 
  : 'http://localhost:5000/api';

export const matchAPI = {
  saveMatch: async (matchData) => { /* POST /matches */ },
  getAllMatches: async () => { /* GET /matches */ },
  getMatch: async (id) => { /* GET /matches/:id */ },
  updateMatch: async (id, matchData) => { /* PUT /matches/:id */ },
  deleteMatch: async (id) => { /* DELETE /matches/:id */ }
};
```

### WebSocket Configuration
```javascript
// services/socket.js
const socket = io(import.meta.env.DEV 
  ? 'http://localhost:5000' 
  : 'http://localhost:5000'
);

class SocketService {
  connect() { /* Establish connection */ }
  joinMatch(matchId) { /* Join match room */ }
  onMatchUpdate(callback) { /* Listen for updates */ }
  onOverCompleted(callback) { /* Over completion events */ }
  onInningsEnded(callback) { /* Innings end events */ }
}
```

### Environment Variables
Create `.env.local` for local overrides:
```bash
VITE_API_URL=http://localhost:5000
VITE_WS_URL=http://localhost:5000
```

## 📱 Responsive Design

### Mobile Features
- **Touch-friendly Controls**: Large buttons and inputs
- **Responsive Grid**: Adapts to screen size
- **Swipe Support**: Easy navigation
- **Optimized Commentary**: Scrollable panels

### Desktop Features
- **Multi-panel Layout**: Side-by-side components
- **Keyboard Support**: Shortcuts for common actions
- **Enhanced Visuals**: Larger displays and animations
- **Multi-window**: Can open multiple matches

## 🎨 Styling

### CSS Architecture
```css
/* Global variables */
:root {
  --primary-color: #3b82f6;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --background: #ffffff;
  --text: #1f2937;
}

/* Component-specific styles */
.ball { /* Ball display styling */ }
.scorecard { /* Scorecard layout */ }
.commentary { /* Commentary panel */ }
```

### Theme Support
- **Light Mode**: Default clean interface
- **Dark Mode**: Coming soon
- **Custom Properties**: Easy theme switching
- **Responsive Breakpoints**: Mobile-first approach

## 🔌 WebSocket Integration

### Connection Management
```javascript
// Establish connection
useEffect(() => {
  if (liveMode && currentMatchId) {
    socketService.connect();
    socketService.joinMatch(currentMatchId);
  }
  
  return () => {
    socketService.disconnect();
  };
}, [liveMode, currentMatchId]);
```

### Event Handling
```javascript
// Listen for real-time updates
socketService.onMatchUpdate((data) => {
  // Update match state
  setMatch(data.match);
  
  // Add commentary
  if (data.commentary) {
    setCommentary(prev => [...prev, data.commentary]);
  }
});

// Over completion events
socketService.onOverCompleted((summary) => {
  console.log(`Over completed: ${summary.text}`);
});
```

## 🚀 Build & Deployment

### Development Build
```bash
npm run dev
# Runs on http://localhost:5173
# Hot reload enabled
# Source maps included
```

### Production Build
```bash
npm run build
# Creates optimized dist/ folder
# Minified and compressed
# Ready for deployment
```

### Deployment Options

#### Vercel (Recommended)
```bash
npm install -g vercel
npm run build
vercel --prod
```

#### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
# Configure redirects for SPA
```

#### Static Hosting
```bash
npm run build
# Serve dist/ folder with any static server
# Configure API_BASE_URL for production
```

## 🐛 Troubleshooting

### Common Issues

#### WebSocket Connection Failed
**Symptoms**: Live mode not working, no real-time updates
**Solutions**:
- Check backend server is running on port 5000
- Verify WebSocket URL in `services/socket.js`
- Check browser console for connection errors
- Enable debug: `localStorage.setItem('debug', 'socket.io-client:*')`

#### API Calls Failing
**Symptoms**: Match not saving, loading errors
**Solutions**:
- Verify backend server is running
- Check API_BASE_URL in `services/api.js`
- Check network tab in browser dev tools
- Verify CORS settings on backend

#### Individual Scores Not Updating
**Symptoms**: Batsmen scorecard not showing correct stats
**Solutions**:
- Check ball input is legal (not wide/no-ball for batsman stats)
- Verify wicket handling updates scores correctly
- Check undo functionality reverts scores properly
- Clear localStorage and refresh

#### Commentary Not Appearing
**Symptoms**: Live mode enabled but no commentary
**Solutions**:
- Save match to cloud first (required for live mode)
- Check WebSocket connection status indicator
- Verify match ID exists in backend database
- Clear browser cache and reload page

### Debug Mode
```javascript
// Enable comprehensive debugging
localStorage.setItem('debug', '*');

// Frontend-specific debugging
localStorage.setItem('debug', 'cricket:*');

// WebSocket debugging only
localStorage.setItem('debug', 'socket.io-client:*');
```

### Performance Issues
- **Large Match Data**: Use pagination for match history
- **Memory Leaks**: Ensure WebSocket cleanup in useEffect
- **Slow Rendering**: Use React.memo for expensive components
- **Bundle Size**: Implement code splitting for large components

## 📦 Dependencies

### Core Dependencies
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
}
```

### Development Dependencies
```json
{
  "vite": "^6.0.0",
  "@vitejs/plugin-react": "^4.3.0",
  "eslint": "^9.0.0"
}
```

### Runtime Dependencies
```json
{
  "axios": "^1.6.0",
  "socket.io-client": "^4.7.0"
}
```

## 🎯 Usage Examples

### Basic Match Scoring
```javascript
// Setup match
setupMatch({
  teamA: "India",
  teamB: "Australia", 
  overs: 20,
  batting: "India"
});

// Score a ball
addBall({
  runs: 4,
  isLegal: true,
  isWicket: false,
  extra: null,
  note: "Beautiful cover drive"
});
```

### Live Mode Integration
```javascript
// Enable live mode
const toggleLiveMode = () => {
  if (!currentMatchId) {
    alert('Please save match first');
    return;
  }
  
  if (liveMode) {
    socketService.disconnect();
    setLiveMode(false);
  } else {
    socketService.connect();
    setLiveMode(true);
  }
};
```

### Match State Management
```javascript
// Complete match state structure
const matchState = {
  // Basic info
  teamA: "India",
  teamB: "Australia",
  batting: "India",
  overs: 20,
  
  // Current innings
  currentInnings: 1,
  runs: 45,
  wickets: 2,
  ballCount: 30,
  
  // Match progress
  isInningsOver: false,
  isMatchComplete: false,
  winner: null,
  target: 0,
  
  // Individual scores
  batsmenScores: {
    "Batter 1": { runs: 25, balls: 18, fours: 3, sixes: 1, isOut: false }
  }
};
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Start development: `npm run dev`
5. Make changes and test thoroughly
6. Submit pull request

### Code Standards
- Use ESLint configuration provided
- Follow React best practices and hooks rules
- Add JSDoc comments for complex functions
- Include error handling for all async operations
- Write meaningful commit messages

### Testing
- Test all features manually before submitting
- Verify WebSocket connections work properly
- Check responsive design on different screen sizes
- Ensure proper error handling and user feedback

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Future Enhancements

### Planned Features
- [ ] Progressive Web App (PWA) support
- [ ] Offline-first architecture with service workers
- [ ] Advanced player statistics and analytics
- [ ] Tournament bracket management
- [ ] Social media integration for match sharing
- [ ] Video highlights integration
- [ ] Advanced commentary AI with context awareness

### Technical Improvements
- [ ] TypeScript migration for better type safety
- [ ] Unit and integration testing with Jest/Vitest
- [ ] Storybook for component documentation
- [ ] Performance monitoring and optimization
- [ ] Advanced error boundary implementation
- [ ] Internationalization (i18n) support

---

## 🏏 Summary

This Cricket Scoring Frontend is a **complete React application** featuring:

✅ **Complete Match Management**: Both innings with winner determination  
✅ **Individual Batsmen Tracking**: Detailed statistics for each player  
✅ **Real-time Updates**: Live scoring with WebSocket connections  
✅ **Professional UI**: Responsive design with intuitive controls  
✅ **Cloud Integration**: Save/load matches from backend  
✅ **Multi-user Support**: Multiple viewers can watch live  
✅ **Advanced Features**: Undo, export, match history  

**Perfect for cricket scoring with professional-grade features!** 🏆

---

**Built with React + Vite for Cricket Lovers** ❤️

*Start scoring your matches with real-time updates and comprehensive statistics!* 🏏