# Automated Line — 3D Map

An interactive 3D reproduction of a **Total Lab Automation (TLA)** line, rebuilt
from the reference floor-plan render. The whole track is walkable, rotatable and
pannable, and every instrument is labelled by name and clinical domain.

Built with [Three.js](https://threejs.org) + [Vite](https://vitejs.dev). No
build step is baked into the assets — it runs as a normal dev server.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

Production build:

```bash
npm run build    # → dist/
npm run preview
```

Deploy to GitHub Pages (publishes `dist/` to the `gh-pages` branch):

```bash
npm run deploy
```

Live demo: **https://omarzbaba.github.io/automated-line-3d-map/**

---

## Controls

| Control | What it does |
|---------|--------------|
| **Drag** | Rotate / orbit the line |
| **Right-drag** (or two-finger) | Pan |
| **Scroll / pinch** | Zoom |
| **Hover a machine** | Highlights it, shows its info card, dims other labels |
| **Click a machine or label** | Flies the camera in for a close-up |
| **Orbit / Walk** (dock) | Switch between orbit and first-person walk-through |
| **Walk mode** | `W A S D` move · `Q`/`E` down/up · mouse to look · `Shift` sprint · `Esc` exit |
| **Tour** | Guided fly-through of every station |
| **Reset** | Return to the overview |
| **Labels** | Toggle the floating name tags |
| **Flow** | Toggle the sample carriers streaming along the track |
| **Station list** (right) | Jump straight to any station |

---

## Track topology

The line is **not** a single straight conveyor. It is a main transport **spine**
that runs the full length in front, and the analyzer cells **branch off it at 90°**
via perpendicular **spur tracks** — each spur has a junction/transfer node where it
meets the spine and a carrier that shuttles samples in and out (matching the
reference, where the DxI / AU / Cobas cells sit back from the spine). Pre-analytic
modules (inlet, decapper, aliquoter, SMS, outlet, recapper) sit inline on the spine.

## The line (left → right)

Same order as the reference render:

1. **Dynamic Inlet** — sample loading / entry
2. **Centrifuges** — 4-unit spin bank
3. **Decapper** — cap removal
4. **Aliquoter** — secondary-tube creation
5. **Coagulation** — STAGO analyzers
6. **Command Central · Hematology** — operator control desk
7. **Hematology** — DxH 3s / DxH 2s (CBC + differential)
8. **SMS** — Sample Management System buffer
9. **Immunoassay** — DxI 1 & 2 / DxI 3
10. **SMS** — Sample Management System buffer
11. **Chemistry** — AU 1 / AU 2 / Cobas
12. **Command Central · Chemistry** — operator control desk
13. **Outlet 2** — post-analytic exit
14. **Secondary Decapper** — rework cap removal
15. **Recapper** — resealing for archive
16. **Stockyards** — refrigerated robotic archive

Colours are semantic (each clinical domain has its own accent used on the
machine stripe, its floating label and the legend).

---

## Project structure

```
src/
├── main.js                 Assembles the scene and runs the loop
├── core/
│   ├── scene.js            Renderer, lighting, ground
│   ├── camera.js           Perspective camera + orbit controls + focus tweens
│   ├── walk.js             First-person walk controls
│   ├── labels.js           CSS2D floating labels + leader stalks
│   ├── interaction.js      Raycast hover/select + highlight rig
│   └── hud.js              Legend, station list, info card
├── layout/
│   └── stations.js         Data-driven master layout (edit this to change the line)
├── builders/
│   ├── materials.js        Domain colours + shared material palette
│   ├── primitives.js       Reusable parts (bodies, panels, screens, vents, casters…)
│   ├── track.js            Conveyor track + animated sample carriers
│   ├── instruments.js      Dispatches each station to its builder
│   └── modules/            One detailed builder per instrument type
└── styles/
    └── global.css          HUD styling
```

### Changing the line

Everything about the layout lives in
[`src/layout/stations.js`](src/layout/stations.js) — add, remove, reorder or
resize stations there and the geometry, labels, legend and navigation all follow
automatically.

---

## Notes

- The bundle is ~138 kB gzipped, almost entirely Three.js.
- The camera intro animation and focus tweens rely on `requestAnimationFrame`;
  in a normal (focused) browser they run at 60 fps. Background tabs throttle rAF,
  which is expected browser behaviour.
