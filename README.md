# TypAstra

## Optional production authentication

Copy `.env.example` to `.env.local`, then add a Supabase project URL and its public anon key. TypAstra will show email registration, login, and password reset whenever those values are present. Without them, it falls back to browser-only local profiles — no backend needed.

**Important:** authentication here is a gate, not a sync layer. Signing in only controls who can open the app; your typing stats, XP, lessons, and achievements always stay in that browser's `localStorage`, never on a server. Signing in on a second device starts fresh there — it won't show progress from the first. If you want real cross-device sync later, that requires adding a database table and a sync layer on top of this; it's a separate, bigger feature.

For password reset emails to work, set your Supabase project's **Auth → URL Configuration → Site URL** to wherever you deploy this app (e.g. `http://localhost:5173` for local dev, or your production URL). Supabase redirects back to that URL after a reset-link click.

A modern typing practice web app — lessons, speed tests, a typing game, XP/levels, achievements, streaks, and real analytics, all running locally with no backend.

## Features

- **Practice mode** — random words, quotes, paragraphs, numbers, punctuation, mixed content, and code snippets
- **Speed tests** — time-based (15/30/60/120s) and word-based (10/25/50/100 words)
- **Lessons** — 22 lessons from home-row basics through expert-level passages, with per-lesson targets and completion tracking
- **Type Rush** — a playable typing game where words fall toward a danger zone
- **Dashboard** — greeting, key stats, recent WPM trend, next lesson, daily challenges, recent activity
- **Statistics** — filterable charts (7d / 30d / 90d / all time) and a "keys that need work" breakdown
- **Gamification** — XP, levels 1–100, achievements, daily streaks, daily challenges, toast notifications
- **Local profiles** — a "Who's typing?" picker on launch. Each profile is fully isolated (own stats, XP, lessons, achievements); switch anytime from the sidebar
- **Settings** — light/dark/system theme, typing preferences, accessibility (reduced motion), per-profile data reset
- **Onboarding** — a short first-launch wizard (experience level + goal) that recommends a starting lesson; skippable, shown once
- **Sound** — synthesized keystroke/error/level-up/achievement tones via the Web Audio API — no audio files shipped
- **Keyboard heatmap** — per-key accuracy visualization on the Statistics page, colored by how reliably you hit each key
- **Persistence** — everything is saved to `localStorage` through a small storage abstraction, and survives refresh

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS (theme tokens via CSS variables, dark mode via class)
- React Router
- Recharts for charts
- Lucide React for icons
- No backend, no environment variables required

## Getting started in VS Code

1. Open this folder in VS Code.
2. Open a terminal (`` Ctrl+` ``) and run:
   ```bash
   npm install
   npm run dev
   ```
3. Open the URL Vite prints (usually `http://localhost:5173`).

To create a production build:
```bash
npm run build
npm run preview
```

To run the automated test suite (core WPM/accuracy/XP/date logic):
```bash
npm test
```

## Project structure

```
src/
  components/
    layout/      AppShell (sidebar + mobile nav)
    typing/       TypingArea, LiveMetrics, ResultsPanel
    keyboard/     VirtualKeyboard
    charts/       WpmTrendChart, MissedKeysChart
    dashboard/    StatCard
    ui/           ToastContainer
  pages/          One file per route (Dashboard, Practice, Lessons, Tests, Games, TypeRush, Statistics, Achievements, Settings, Profile)
  hooks/
    useTypingEngine.ts   Core typing engine — shared by practice, tests, lessons
  context/
    AppDataContext.tsx   Profile, stats, XP/levels, streaks, achievements, daily challenges
    ThemeContext.tsx     Theme state
  services/storage/      Small localStorage wrapper split by data domain
  data/                  Seed content: words, quotes, paragraphs, code snippets, lessons, achievements
  utils/                 wpm.ts, accuracy.ts, xp.ts, date.ts
  types/                 Shared TypeScript interfaces
```

## How statistics work

Every completed session (practice, test, lesson, or game) is passed to `recordResult()` in `AppDataContext`. That function:
1. Computes XP from WPM, accuracy, and duration
2. Updates rolling stats (best/average WPM & accuracy, totals, per-key mistake counts)
3. Updates the daily streak (based on calendar days, not 24h windows)
4. Updates lesson progress if the session was a lesson
5. Updates today's daily challenges
6. Checks every achievement's unlock condition and fires a toast for newly unlocked ones

All values are then written to `localStorage` immediately.

## How to add a lesson

Add an entry to `src/data/lessons.ts`. Each lesson needs a `textGenerator` (`'keys' | 'words' | 'numbers' | 'punctuation' | 'paragraph'`) which tells `LessonDetail.tsx` how to build its practice text, plus a target WPM/accuracy that determines when it's marked complete.

## How to add a game

Games are just pages that call `recordResult()` and `recordGameScore()` on completion (see `src/pages/TypeRush.tsx`), then get a card on `src/pages/Games.tsx` and a route in `src/App.tsx`.

## How profiles work

There's no server and no real authentication — profiles are just separate local save slots on one device/browser. `src/context/ProfileContext.tsx` tracks the list of profiles and which one is active; `src/services/storage/profileManager.ts` persists that list. Every other piece of per-user data (stats, results, lessons, achievements, XP) is stored under a key prefixed with the profile's id, so switching profiles swaps out the entire dataset. Theme and sound settings are shared across profiles on a device rather than per-profile. `AppDataProvider` is mounted with `key={profileId}` in `src/components/ui/ProfileGate.tsx`, which forces a full remount (and re-read from storage) whenever the active profile changes.

## How to customize the theme

All colors are CSS variables defined in `src/index.css` under `:root` (light) and `.dark` (dark mode), and mapped to Tailwind color names in `tailwind.config.js`. Change the variable values to re-theme the whole app.

## Deploying

TypAstra builds to a static site — any static host works (Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.).

1. Build command: `npm run build`
2. Output directory: `dist`
3. If using Supabase auth, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as **build-time environment variables** on your host (not just a local `.env` — the host needs them at build time since Vite inlines them into the bundle). These are the public anon key and project URL, safe to expose client-side by design; just make sure Row Level Security is enabled on any Supabase tables you add later.
4. If using auth, also set the Supabase Site URL as described above, or password reset links will redirect somewhere wrong.
5. A runtime error boundary is in place (`src/components/ui/ErrorBoundary.tsx`) so a crash shows a reload prompt instead of a blank page — check the browser console for the actual error if this happens.

Routes other than the dashboard are code-split (`React.lazy`), and the Recharts dependency is isolated from the initial bundle, so first load stays small even as more pages/games get added.

## What's not included yet

This build focuses on a genuinely working core rather than shallow stubs of every possible feature. Not yet implemented: two additional games (Word Defender, Keyboard Race), and cross-device sync of stats when signed in (see the authentication section above — this is a deliberate scope decision, not an oversight). Type Rush is fully playable; the game architecture (shared XP/stats recording via `recordResult()` and `recordGameScore()`) is ready to support more games without rework.

## License

MIT — see [LICENSE](./LICENSE).
