# MeetMind AI

Turns a meeting recording, an uploaded audio file, or a pasted transcript into a structured summary — decisions, owners, deadlines, and next steps — instead of notes nobody rereads.

## Overview

Meetings produce decisions and commitments that routinely disappear the moment the call ends. MeetMind AI takes a meeting's raw content and extracts it into a consistent, scannable record: what was discussed, what was decided, who owes what and by when, and how the conversation actually went. Every analyzed meeting is saved and searchable, so the record of a decision is as easy to find later as the decision was to make.

## Features

- **Live meeting recording** — record directly from the browser microphone, capped at 3 minutes per recording.
- **Audio file upload** — upload an existing recording (MP3, WAV, M4A) instead of recording live.
- **Automatic transcription** — both recorded and uploaded audio are sent to AssemblyAI for real speaker-diarized transcription (`Speaker 1`, `Speaker 2`, ...); no manual step required.
- **Paste-transcript input** — paste an existing transcript directly, skipping transcription entirely.
- **AI-generated analysis** — when configured, a real call to the Anthropic API (Claude) produces a grounded summary, explicit key decisions, action items with owner and due date, a sentiment/engagement read, and a suggested next-meeting agenda, using forced structured output that's validated server-side before it ever reaches the client.
- **Deterministic local fallback** — a rule-based analysis engine (keyword/pattern matching, no network call) runs whenever the AI path is disabled, unreachable, or returns something that fails validation, so the app always produces a result.
- **Action item tracking** — an interactive checklist with live completion progress on the Analysis Result page.
- **Meeting History** — every analyzed meeting, searchable by title or category, grouped into This Week / Last Week / Earlier.
- **Dashboard** — your most recent meetings, one click from starting a new one (see [Demo Data & Current Limitations](#demo-data--current-limitations) for the stat numbers shown here).
- **Local persistence** — meetings you create are saved in the browser via `localStorage` and appear across Dashboard and History immediately, including after a refresh.
- **Light / Dark / System appearance** — a real theme system that follows OS preference in System mode, live-updates if it changes, and otherwise persists your explicit choice.
- **Settings** — a working appearance control plus account and version information.

## How It Works

All three ways of starting a meeting converge on the same analysis pipeline:

```
Record Meeting  ─┐
Upload Audio    ─┼─► AssemblyAI transcription ─┐
Paste Transcript ┘                              ├─► Analysis (Anthropic, or local fallback) ─► Analysis Result ─► saved locally
                                                 ┘
```

1. Start a meeting from **New Meeting**: record from the microphone, upload an audio file, or paste a transcript.
2. If audio was recorded or uploaded, it's transcribed automatically via AssemblyAI into a speaker-labeled transcript. Pasted transcripts skip this step.
3. The transcript is analyzed — via the Anthropic API if configured and reachable, otherwise the local heuristic engine — producing a summary, decisions, action items, and sentiment.
4. The result is saved to `localStorage` and opens on the **Analysis Result** page, where you can check off action items as you go and view the full transcript.
5. The meeting now appears in **Dashboard** and **History**, searchable at any time.

This flow — including both the Record Meeting and Upload Audio paths through real AssemblyAI transcription into real Anthropic analysis — has been verified end-to-end against the live APIs, not just reviewed as code.

## Tech Stack

Confirmed directly from `package.json` and the repository layout:

- **Frontend:** React 19, React Router 7, Vite
- **Styling:** Tailwind CSS 4 (`@tailwindcss/vite`), plain JavaScript/JSX — no TypeScript compilation
- **Backend:** two Vercel serverless functions (`api/analyze.js`, `api/transcribe.js`), plain Node.js using the native `fetch` API — no server framework, no ORM
- **AI:** Anthropic Messages API (tool-use / structured output), model `claude-haiku-4-5-20251001`
- **Transcription:** AssemblyAI (upload → transcribe → poll, with speaker diarization)
- **Persistence:** browser `localStorage` — no database
- **Linting:** oxlint (no automated test suite is configured)
- **Hosting:** Vercel

## Getting Started

```bash
git clone https://github.com/zekiyebayrk-sketch/MeetMind-AI.git
cd MeetMind-AI
npm install
npm run dev
```

This runs the interface fully functional on the local heuristic analysis engine — no API keys required, and recording/upload UI works. Real transcription and AI analysis need the API keys below *and* the Vercel CLI, because plain `vite dev` does not serve the `/api` functions:

```bash
npm install -g vercel   # if you don't already have it
vercel dev
```

Other scripts (from `package.json`):

```bash
npm run build     # production build
npm run preview   # preview the production build locally
npm run lint       # run oxlint
```

## Environment Variables

None of these are required to run the app. Without them, recording and file upload still work in the UI, but transcription requests will fail gracefully and analysis falls back to the local heuristic engine. Create a `.env` (or `.env.local`) at the project root — it's already git-ignored; `.env.example` documents the same three variables with no real values.

```bash
# Client-safe boolean flag (bundled into the client build). Leave unset or
# "false" to use the local heuristic engine. Only set "true" once
# /api/analyze is deployed with a real ANTHROPIC_API_KEY configured.
VITE_ENABLE_AI_ANALYSIS=false

# Server-side only — read exclusively by api/analyze.js. Never prefix with
# VITE_. Required for real AI-generated analysis.
ANTHROPIC_API_KEY=your_anthropic_api_key

# Server-side only — read exclusively by api/transcribe.js. Required for
# both Record Meeting and Upload Audio to produce a real transcript.
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
```

## Project Structure

```
api/                       Vercel serverless functions
  analyze.js                 Anthropic-powered meeting analysis
  transcribe.js               AssemblyAI transcription

src/
  pages/                    Dashboard, NewMeeting, AnalysisResult, History, Settings
  layouts/, components/     Shared layout (sidebar, header) and UI primitives
  services/analysis/        analyzeMeeting() dispatcher + AI and heuristic providers
  services/transcription.js  Client wrapper for /api/transcribe
  hooks/useAudioRecorder.js  Microphone recording (getUserMedia + MediaRecorder)
  context/ThemeContext.jsx   Light/Dark/System theme state
  utils/meetingsStore.js     localStorage persistence + merge with seed data
  constants/                 Seed demo meetings, their analysis content, dashboard stats
  styles/theme.css           Design tokens (colors, materials) for both themes
```

## UI & Themes

The interface supports Light, Dark, and System appearance, switchable from Settings. System mode follows the OS color scheme automatically and updates live if it changes; Light and Dark persist as an explicit choice.

## Demo Data & Current Limitations

**Real functionality, verified end-to-end:**
- Record Meeting → AssemblyAI transcription → analysis.
- Upload Audio → AssemblyAI transcription → analysis (the same transcription pipeline as Record Meeting).
- Paste Transcript → analysis directly.
- Local heuristic fallback whenever the AI provider is disabled, unreachable, or its output fails server-side validation.
- Settings (theme control, account/about info).

**This is seeded demo data, not live analytics:**
- The app ships with 10 pre-populated demo meetings and hand-written analysis content so the interface isn't empty on first load.
- The three Dashboard stats — "Meetings Analyzed," "Action Items Found," "Hours Saved" — are **fixed values in `constants/dashboardData.js`**, not computed from real usage. They do not update as you analyze meetings.

**Not implemented:**
- No user accounts, authentication, or backend database — all meeting data lives in browser `localStorage`, scoped to one browser.
- No calendar, Slack, or video-conferencing integrations.

## License

No license file is currently included in this repository.
