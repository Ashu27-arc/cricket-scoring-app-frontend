# 🏏 Cricket Scoring Frontend

React application with Vite for real-time cricket scoring with live commentary and WebSocket updates.

## 🚀 Quick Start

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

## ✨ Features

### Core Scoring
- Ball-by-ball input with runs, extras, wickets
- Automatic over management and batsman rotation
- Match setup with customizable teams and overs
- Undo functionality and match controls

### Live Features
- Real-time WebSocket updates
- Live commentary generation
- Multi-user live viewing
- Connection status indicators
- Auto-save functionality

### Data Management
- Cloud storage integration
- Match history and loading
- Local storage backup
- JSON export functionality

## 🏗️ Project Structure

```
src/
├── components/
│   ├── BallInput.jsx       # Ball scoring interface
│   ├── Scoreboard.jsx      # Basic score display
│   ├── LiveScoreboard.jsx  # Real-time scoreboard
│   ├── LiveCommentary.jsx  # Live commentary panel
│   ├── SavedMatches.jsx    # Match history
│   ├── MatchSetup.jsx      # Match configuration
│   ├── MatchControls.jsx   # Match controls
│   ├── OversBoard.jsx      # Over details
│   └── LiveModeGuide.jsx   # User guide
├── hooks/
│   └── useMatchAPI.js      # API state management
├── services/
│   ├── api.js             # REST API client
│   └── socket.js          # WebSocket client
├── App.jsx                # Main application
├── main.jsx              # App entry point
└── index.css             # Global styles
```

## 🎯 Key Components

### BallInput
- Run selection (0-6)
- Wicket toggle
- Extras input (wide, no-ball, bye, leg-bye)
- Optional notes

### LiveScoreboard
- Real-time score updates
- Batsman information
- Run rate calculations
- Current over display

### LiveCommentary
- Ball-by-ball commentary
- Time-stamped updates
- Over summaries
- Milestone celebrations

### SavedMatches
- Match history list
- Load/delete functionality
- Match metadata display

## 🔧 Configuration

### API Configuration
```javascript
// services/api.js
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' 
  : 'http://localhost:5000/api';
```

### WebSocket Configuration
```javascript
// services/socket.js
const socket = io(import.meta.env.DEV 
  ? 'http://localhost:5000' 
  : 'http://localhost:5000'
);
```

## 📱 Responsive Design

- Mobile-first approach
- Touch-friendly controls
- Responsive grid layout
- Dark/light mode support

## 🎨 Styling

- CSS custom properties for theming
- Responsive breakpoints
- Component-specific styles
- Dark mode support

## 📦 Dependencies

### Core
- **react** - UI library
- **react-dom** - DOM rendering

### Development
- **vite** - Build tool
- **@vitejs/plugin-react** - React support
- **eslint** - Code linting

### Features
- **axios** - HTTP client
- **socket.io-client** - WebSocket client

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🔧 Development

### Local Development
```bash
npm run dev
# App runs on http://localhost:5173
```

### Linting
```bash
npm run lint
```

### Environment Variables
Create `.env.local` for local overrides:
```bash
VITE_API_URL=http://localhost:5000
VITE_WS_URL=http://localhost:5000
```

## 🎯 Usage Guide

### Basic Match Scoring
1. Setup match with team names and overs
2. Use ball input to score runs, wickets, extras
3. System automatically manages overs and batsmen
4. Use controls to undo, reset, or export

### Live Mode
1. Save match to cloud first
2. Enable "Live Mode" checkbox
3. Commentary panel appears below
4. Share Match ID for multi-user viewing

### Match Management
- Save matches to database
- Load previous matches
- Delete unwanted matches
- Export match data as JSON

## 🐛 Troubleshooting

### Common Issues
- **WebSocket not connecting**: Check backend server
- **Match not saving**: Verify API connection
- **Live updates not working**: Enable Live Mode first
- **Commentary not showing**: Ensure match is saved

### Debug Mode
```javascript
localStorage.setItem('debug', 'cricket:*');
```# cricket-scoring-app-frontend
