# Pitch Game Tracker - React Version

A modern, feature-rich pitch game scoring system built with React and Supabase.

## Features

- ✨ Modern React architecture with hooks
- 🎨 Sleek dark theme design with vibrant accents
- 📊 Multi-table support (4 tables)
- 👥 Player management with team assignments
- 🎯 Dealer rotation tracking
- 📈 Real-time score calculation
- 💾 Persistent data storage with Supabase
- 📱 Responsive design
- 🎮 Game and set tracking
- 💰 Configurable stakes and scoring

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Supabase** - Backend as a service (database)
- **Modern CSS** - Custom styling with CSS-in-JS

## Getting Started

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Project Structure

```
pitch-game-tracker/
├── src/
│   ├── PitchGameTracker.jsx  # Main application component
│   └── main.jsx               # React entry point
├── index.html                 # HTML template
├── package.json              # Dependencies and scripts
├── vite.config.js            # Vite configuration
└── README.md                 # This file
```

## Usage

### Game Flow

1. **Add Players** - Go to Players tab and add player names
2. **Assign Teams** - Click players to cycle through Team A → Team B → None
3. **Select Dealers** - Choose 4 dealers in rotation order
4. **Add Scores** - Enter hand scores as you play
5. **End Game** - When a team reaches 9+ points, end the game
6. **Track Sets** - Complete 3 games to finish a set

### Features

- **Edit Hands**: Click on any hand in the table to edit scores
- **Multi-table**: Switch between 4 different tables
- **Statistics**: View game history and set statistics
- **Settings**: Configure stakes (game, bump, points, bonus)

## Design Highlights

- **Dark Theme**: Modern slate/indigo color scheme
- **Smooth Animations**: Subtle transitions and hover effects
- **Clear Visual Hierarchy**: Color-coded teams (green/orange)
- **Responsive Layout**: Works on desktop and mobile
- **Custom Typography**: Manrope font for clean readability

## Customization

### Changing Colors

Edit the color values in `PitchGameTracker.jsx`:
- Background: `#0a0f1e`
- Primary: `#6366f1` (indigo)
- Team A: `#10b981` (green)
- Team B: `#f59e0b` (orange)

### Modifying Stakes

Use the Settings tab in the app or modify default values in the component:
```javascript
const [stakes, setStakes] = useState({ 
  gameScore: 4, 
  bump: 2, 
  points: 1, 
  bonus: 25 
});
```

## Database Schema

The app uses Supabase with the following tables:
- `players` - Player names
- `games` - Game records
- `hands` - Individual hand scores
- `sets` - Completed sets
- `stakes` - Scoring configuration

## Version History

- **v2.0.0** - React rewrite with modern design
- **v1.8.0** - Original vanilla JavaScript version

## License

MIT License - feel free to use and modify as needed.

## Support

For issues or questions, please check the inline code comments or consult the original requirements.
