# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This is a Create React App project (react-scripts 5).

- `npm start` — dev server on http://localhost:3001 (port set in `.env`)
- `npm run build` — production build
- `npm test` — Jest in interactive watch mode (CRA preset)
- `npm test -- --watchAll=false path/to/File.test.tsx` — run a single test file once
- `npm test -- -t "test name"` — run tests matching a name
- ESLint is configured via flat config in `.eslintrc.mjs` (note: CRA still uses the legacy `eslintConfig` block in `package.json` during `npm start`/`npm run build`). There is no `lint` script; run `npx eslint src` to use the flat config.

## Backend dependency

The UI calls a backend via two endpoints (relative URLs — CRA proxies them):
- `GET /api/samples/all` — returns `Sample[]` (see `Sample` interface in `src/components/Clips.tsx`)
- `GET /{sample.path}` — serves the raw audio file

CRA's dev server runs on port 3001 (`.env`) and proxies unmatched requests to `http://localhost:3000` (`proxy` in `package.json`). Run the backend on port 3000 before `npm start`.

## Architecture

The app is a single-page audio clip editor: pick a sample from a list, scrub start/end markers on a waveform, preview the clip.

### State ownership

`Clips.tsx` is the top-level state owner. It holds:
- `currentClip: Clip` — the clip being edited (`startAt`, `endAt`, `gain`, `sample`)
- `arrayBuffer` / `audioBuffer` — the decoded audio for the selected sample
- `playState` — playback status (transitional; see "In-flight refactor" below)

Sample selection updates `currentClip.sample`, which triggers the audio fetch+decode `useEffect`. The decoded `audioBuffer` is used by `playClip()` (Web Audio `BufferSource`); the raw `arrayBuffer` is forwarded to `Waveform` so `useAudioData` can decode it again into chart points.

The wireframe notes (`wireframe.md`) explicitly endorse "passing large state objects around" rather than introducing context/stores — follow that convention.

### Waveform rendering

`Waveform.tsx` is built on `react-chartjs-2` but most behavior lives in **Chart.js plugins** returned from custom hooks:

- `useAudioData(arrayBuffer)` — decodes via `audio-decode`, downsamples by averaging absolute values in windows of `DOWNSAMPLE_FACTOR` (100), assumes `SAMPLE_RATE = 44_100`. These constants are hardcoded — real sample rate from the decoded buffer is not consulted.
- `useStartEndMarkers(currentClipRef, setCurrentClip)` — returns a plugin that draws the two vertical marker lines and handles `mousedown`/`mousemove`/`mouseup`/`mouseout` to drag them. It reads `currentClip` from a **ref** (not props) so the plugin closure stays stable; `Waveform` keeps that ref in sync inside a `useEffect`. Clip state is committed to React on `mouseup`/`mouseout`, not on every move (the plugin mutates pixel positions in `overlays.current` and calls `chart.draw()` directly during a drag).
- `usePlaybackSweep(chartRef)` — `requestAnimationFrame`-driven red sweep line. `start(startAt, endAt, onStart)` triggers `onStart()` (the actual `playClip`) and animates the line; `stop` cancels and is also wired to unmount cleanup.

The Chart's `events` array is restricted to `["mousemove","mousedown","mouseup","mouseout"]` so plugin event handlers see them.

### Coordinate systems

Three coordinate spaces appear in this code; do not confuse them:
1. **Audio time (seconds)** — `Clip.startAt` / `Clip.endAt`, used by Web Audio `source.start`.
2. **Chart x-values** — also seconds, derived in `useAudioData` as `index / (SAMPLE_RATE / DOWNSAMPLE_FACTOR)`.
3. **Canvas pixel x** — what the markers plugin actually mutates during drag. Convert via `chart.scales.x.getPixelForValue` / `getValueForPixel`.

### In-flight refactor

`Clips.tsx` passes `playState` / `setPlayState` down to `ClipEditor`, which spreads them into `Waveform` — but `Waveform.tsx`'s `WaveformProps` interface does not declare them, so they are silently dropped. Playback timing is currently driven entirely by `usePlaybackSweep`'s internal refs, not by `playState`. Treat `playState` as legacy/aspirational until the refactor lands.

## Conventions

From `wireframe.md`:
> 1. Make it work
> 2. Make it right
> 3. Make it fast
>
> It's better to have bad names than no names at all.

Prefer concrete prop drilling over abstractions; component hierarchy mirrors the wireframe (`sampler → clips → {sampleList, clipEditor → {waveform, parameters, clipPreview}}`).
