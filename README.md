# Flappy Bird Game

A modern recreation of the classic Flappy Bird game built with HTML5 Canvas, CSS3, and vanilla JavaScript.

## Features

- **Progressive Difficulty**: Starts easy and gets harder as your score increases
- **Responsive Design**: Works on both desktop and mobile devices
- **Smooth Physics**: Realistic bird movement with gravity and jump mechanics
- **Beautiful Graphics**: Gradient backgrounds, animated clouds, and detailed sprites
- **Touch Controls**: Tap/click to jump on mobile devices
- **Keyboard Controls**: Press spacebar to jump on desktop

## How to Play

1. Click "Start Game" or press SPACEBAR to begin
2. Tap the screen (mobile) or press SPACEBAR (desktop) to make the bird jump
3. Navigate through the gaps between pipes
4. Score increases for each pipe you pass
5. Game gets progressively harder every 5 points

## Difficulty Progression

- **0-4 points**: Very easy - large gaps (180px), slow pipes (1.5x speed)
- **5-9 points**: Easy - smaller gaps, moderate speed
- **10-14 points**: Medium - normal gaps, faster pipes
- **15+ points**: Hard - challenging gaps, fast pipes

## Controls

- **Desktop**: Press SPACEBAR to jump
- **Mobile**: Tap the screen to jump
- **Buttons**: Use Start/Restart buttons for game control

## Technical Details

- **Canvas Resolution**: 400x600 pixels
- **Physics Engine**: Custom gravity and collision detection
- **Responsive**: Adapts to screen size on mobile devices
- **Performance**: Optimized rendering with requestAnimationFrame

## Getting Started

1. Clone this repository
2. Open `index.html` in a web browser
3. Or run a local server: `python3 -m http.server 8000`
4. Visit `http://localhost:8000`

## File Structure

```
FlappyBird/
├── index.html      # Main HTML structure
├── style.css       # Styling and responsive design
├── game.js         # Game engine and logic
└── README.md       # Project documentation
```

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

Enjoy playing! 🐦
