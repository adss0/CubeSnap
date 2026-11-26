# CubeSnap: Plan

> Photograph a scrambled 3x3 Rubik's cube and get the solution one step at a time.

## Goals

- **Snap to solve:** photograph each of the six faces, confirm the detected colours and get a solution.
- **Two solve modes, switchable:**
  - **Fast:** Kociemba two-phase, about 20 moves or fewer.
  - **Beginner:** layer-by-layer method, with every stage explained so you learn it.
- **Step-by-step guidance:** show one move at a time, with a plain-English description and a cube preview of that move.
- **Free and private:** no backend, no accounts. Everything runs on your device, and hosting is free.
- **Works on phone and laptop:** an installable PWA with offline support.

## Non-goals (for now)

- Cube sizes other than 3x3 (2x2 is a stretch goal).
- Real-time video tracking of the cube while you turn it.
- Native app-store builds.

## Tech stack (all free)

| Concern | Choice | Why |
| --- | --- | --- |
| App framework | **Vite + React 19 + TypeScript** | Fast dev loop, typed and widely supported |
| Solver (fast) | **[cubejs](https://github.com/ldez/cubejs)** (MIT), **vendored** in `src/vendor/cubejs` and run in a **Web Worker** | Proven Kociemba two-phase implementation. Building its tables takes 4–5 s, so it must stay off the UI thread. It is vendored because the npm package is old CoffeeScript output that breaks under Vite 8's bundler (it relies on a top-level `this`) and drags in npm@6 with known vulnerabilities |
| Solver (beginner) | Own TypeScript implementation on top of cubejs's cube model | No library teaches the steps, so we write the stages ourselves |
| Camera | `getUserMedia` + Canvas 2D | Built into the browser, no dependency |
| Colour detection | Sample a 3x3 grid inside a guide overlay, convert to **CIELAB**, classify against the centre stickers, then balance so each colour gets exactly 9 stickers | Robust to lighting without shipping OpenCV.js (about 8 MB). OpenCV stays a fallback option |
| 3D view | **three.js** via **@react-three/fiber** (MIT) | Animated moves in the step-by-step view |
| PWA / offline | **vite-plugin-pwa** | Installable, works offline |
| Tests | **Vitest** | Native to Vite |
| Lint | **oxlint** | Already in the scaffold, very fast |
| Hosting | **GitHub Pages** via GitHub Actions | Free static hosting |

## Core concepts

- **Facelet string:** 54 characters in Kociemba order `U R F D L B`, 9 per face, read left to right and top to bottom.
- **Orientation:** the user holds the cube with **white on top and green facing them**. Centres never move relative to each other, so they define the faces.
- **Validation:** before solving, check for 9 stickers per colour, 6 distinct centres, real corner and edge pieces each appearing exactly once, corner twist sum ≡ 0 (mod 3), edge flip sum ≡ 0 (mod 2), and matching corner and edge permutation parity. Each failure gets a human-readable message, such as "Two stickers look swapped on the white–red edge".

## Phases

### Phase 0: Foundation ✅
- [x] Git repository, Vite + React + TS scaffold
- [x] Plan and README
- [x] Vitest set up, TypeScript strict mode

**Done when:** `npm run dev`, `npm test` and `npm run build` all succeed.

### Phase 1: Cube engine and manual solve 🚧 (built, waiting on a real-cube test)
- [x] Cube model: colours, faces, facelet indexing, colour ↔ facelet-string conversion
- [x] Validator with human-readable errors
- [x] Fast solver wrapped in a Web Worker
- [x] Move notation parser and plain-English descriptions ("R′: turn the right (red) face anticlockwise")
- [x] Manual colour input on a 2D net (tap a sticker, pick a colour)
- [x] Step-by-step stepper: next/previous, and the net updates after each move
- [x] Unit tests for the cube engine: validator (counts, flipped edge, twisted corner, parity, impossible piece), parser, and a solve round-trip on random scrambles
- [ ] Real-cube test: paint a physical scramble, follow the steps, end up solved

**Done when:** you can paint a real scrambled cube into the net and solve it by following the steps.

### Phase 2: 3D cube and animated moves
- [ ] Render the cube state with @react-three/fiber
- [ ] Animate each move (quarter and half turns), with play/pause/step controls
- [ ] Orbit controls, plus a "reset view" back to white-up/green-front
- [ ] Highlight the face that is about to turn

**Done when:** each step shows an animated 3D turn that matches the real cube.

### Phase 3: Camera capture and colour detection
- [ ] Camera page with a 3x3 guide overlay, plus "show the GREEN-centre face, WHITE on top" prompts per face
- [ ] Sample the stickers (median of a patch per cell), convert RGB → CIELAB
- [ ] Classify with centre colours as anchors, then balance assignments (9 per colour)
- [ ] Upload from the gallery as a fallback (pictures already taken)
- [ ] Review screen: detected net with tap-to-fix stickers, then validate
- [ ] Test fixtures: a folder of real cube photos with expected results

**Done when:** six photos of a real cube in normal room light give a valid state, with at most a couple of manual fixes.

### Phase 4: Beginner mode
- [ ] Layer-by-layer solver: white cross → white corners → middle layer → yellow cross → yellow edges → yellow corners position → yellow corners orient
- [ ] Each stage gets a title, a goal and an explanation of why the algorithm works
- [ ] Mode switch (Fast / Beginner) on the solution screen
- [ ] Property test: beginner mode solves 1,000 random scrambles

**Done when:** a beginner can follow the stages and finish the cube.

### Phase 5: PWA, polish and deploy
- [ ] vite-plugin-pwa: manifest, icons, offline cache (including the solver worker)
- [ ] Remember the last cube and step
- [ ] Accessibility: colour-blind sticker labels (W/Y/R/O/G/B), keyboard stepping
- [ ] GitHub Actions: lint, test, build, then deploy to GitHub Pages

**Done when:** it is installable on a phone from the Pages URL and works offline.

### Phase 6: Stretch
- 2x2 support
- Detect the cube without the guide overlay (OpenCV.js contour detection)
- Scan two faces per photo (corner view)
- Solve history and timing

## Project layout

```
src/
  cube/            # pure TypeScript cube engine (no React)
    colors.ts      # colour scheme + face mapping
    facelets.ts    # facelet indexing, piece definitions
    validate.ts    # state validation with readable errors
    moves.ts       # notation parsing + descriptions
    state.ts       # apply moves to a colour state
    solver.ts      # main-thread API for the worker
    solver.worker.ts
  components/      # React UI (CubeNet, ColorPalette, SolutionStepper)
  vendor/cubejs/   # vendored Kociemba solver (MIT), as ES modules
  App.tsx
```

## Open questions

- GitHub remote name and whether to deploy publicly on Pages.
- Colour scheme: the standard Western scheme (white opposite yellow, green opposite blue, red opposite orange) is assumed. Japanese-scheme cubes would need a setting.
