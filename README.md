# CubeSnap

Photograph a scrambled 3x3 Rubik's cube and CubeSnap tells you, step by step, how to solve it.

- **Fast mode:** an optimal-ish solve in about 20 moves (Kociemba two-phase).
- **Beginner mode:** the layer-by-layer method, with each stage explained.
- Runs entirely in your browser: free, private and works offline (PWA).

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm test         # run unit tests
npm run build    # type-check + production build
```

## How to hold the cube

Hold the cube with the **white centre on top** and the **green centre facing you**. Every face and every move is described relative to that hold.

## Tech stack

Vite · React 19 · TypeScript · cubejs (Kociemba solver in a Web Worker) · Canvas + CIELAB colour detection · three.js / @react-three/fiber · vite-plugin-pwa · Vitest · GitHub Pages

All of it is free and open source, and there is no backend.

## Roadmap

| Phase | What | Status |
| --- | --- | --- |
| 0 | Foundation: repo, scaffold, tests, plan | ✅ Done |
| 1 | Cube engine, validator, fast solver, manual colour input, step-by-step stepper | 🚧 In progress |
| 2 | 3D cube with animated moves | ⏳ |
| 3 | Camera capture and colour detection, with tap-to-fix review | ⏳ |
| 4 | Beginner (layer-by-layer) mode with explanations | ⏳ |
| 5 | PWA/offline, accessibility, CI and deploy to GitHub Pages | ⏳ |
| 6 | Stretch: 2x2, guide-free detection, solve history | 💭 |

The full plan, with tasks, done criteria and design notes, is in **[PLAN.md](PLAN.md)**.
