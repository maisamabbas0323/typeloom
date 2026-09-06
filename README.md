# Typeloom

Typeloom is an offline-first typing practice web app for building speed, accuracy, and consistency through focused repetition.

It runs entirely in the browser. Your typing sessions, profiles, settings, personal bests, and history stay in local storage on your device.

## Features

### Practice modes

- Words: practice with 10, 25, 50, or 100 words.
- Time: practice for 15, 30, 60, or 120 seconds.
- Quote: type curated short, medium, and long quotations.
- Custom: paste your own text for drills, code, notes, or poetry.

### Typing controls

- Punctuation and numbers
- Blind mode
- Confidence mode without backspace
- Strict spaces
- Stop on error
- Mirror text
- Reverse words
- Random case

### Metrics and history

- Net WPM and raw WPM
- Accuracy, consistency, burst speed, and error counts
- Second-by-second speed tracking
- Personal bests by mode and test length
- Thread visualizations for completed runs
- Pin and rename saved results
- Separate profiles with independent history, personal bests, and settings

### Personalization

- Multiple visual themes
- Adjustable typing font size
- Caret style and movement settings
- Sound effects with volume and sound profile controls
- Live WPM, accuracy, and burst indicators
- Reduced motion and high contrast options

### Local-first data

- No account or backend required
- No analytics or tracking
- No remote fonts or remote audio assets
- JSON backup export and import
- Browser storage keeps data on the current device
- Progressive Web App manifest and offline service worker

## Technology

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Motion
- Lucide React
- Web Audio API
- Browser `localStorage`

## Requirements

- Node.js 22 or newer is recommended.
- npm 10 or newer is recommended.
- A modern browser with JavaScript enabled.

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/maisamabbas0323/typeloom.git
cd typeloom
npm install
```

## Development

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed by Vite, normally:

```text
http://localhost:3000/
```

## Production build

Type-check the project:

```bash
npm run lint
```

Build the production files:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The optimized static output is written to `dist/`.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Tab` or `Enter` | Restart or take another run |
| `Esc` | Open or close preferences |
| `1` | Words mode |
| `2` | Time mode |
| `3` | Quote mode |
| `4` | Custom text mode |
| `Ctrl/Cmd + K` | Open preferences with search |
| `Ctrl/Cmd + E` | Export local data |
| `Ctrl/Cmd + I` | Import a backup |
| `Ctrl/Cmd + Enter` | Start a custom text run |

## Data and privacy

Typeloom stores application data locally in the browser. This includes profiles, settings, completed runs, personal bests, and imported or exported preferences.

Use the backup controls in the app to export your local data as JSON before clearing browser storage or moving to another device. Imported backup files are validated before they are applied.

Typeloom does not send typing content or practice history to a server.

## Project structure

```text
src/
├── components/   React UI components and views
├── data/         Local word lists, quotations, and themes
├── engine/       Typing, metrics, storage, sound, and thread logic
├── store/        Zustand profile, history, and settings stores
├── types/        Shared TypeScript types
├── App.tsx       Main application workflow
├── index.css     Theme variables and global styles
└── main.tsx      React entry point

public/
├── assets/       App icons and static assets
├── manifest.webmanifest
└── sw.js         Offline service worker
```

## License

MIT
