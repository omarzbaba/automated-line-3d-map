import * as THREE from 'three';
import { materials } from '../materials.js';
import {
  bodyBlock, box, facePanel, screen, statusStrip, accentStripe,
  vents, accessHood, casters, contactShadow,
} from '../primitives.js';

// A large clinical analyzer bank — the workhorse for Coagulation, Hematology,
// Immunoassay and Chemistry. Each unit has the real-analyzer silhouette: a low
// front deck under a glass hood (reagent/sample carousel) with a taller housing
// tower at the rear and a sloped shoulder between them. Units lay out either in
// a row (parallel to the spine) or as an L-shaped wing that juts 90°.

function buildUnit(uw, ud, h, domain, hoods, m) {
  const g = new THREE.Group();
  const frontZ = ud / 2;

  // Lower body.
  g.add(bodyBlock(uw - 0.12, h, ud - 0.2, 'bodyWhite', { z: 0, r: 0.2 }));

  // Rear housing tower — the taller back section.
  const towerH = h * 0.52;
  g.add(box(uw - 0.5, towerH, ud * 0.4, 'topCover', {
    y: h + towerH / 2, z: -ud * 0.26, r: 0.14,
  }));

  // Sloped shoulder linking the tower down to the front deck.
  const shoulder = box(uw - 0.6, 0.16, ud * 0.5, 'bodyLight', {
    y: h + towerH * 0.42, z: ud * 0.02, r: 0.05,
  });
  shoulder.rotation.x = -0.52;
  g.add(shoulder);

  // Front fascia band + recessed control panel.
  g.add(box(uw - 0.5, h * 0.26, 0.16, 'bodyLight', { y: h * 0.78, z: frontZ - 0.05 }));
  g.add(facePanel(uw - 1.1, h * 0.4, { y: h * 0.34, z: frontZ - 0.02, mat: 'panel' }));

  // Thin domain accent stripe along the base front.
  g.add(accentStripe(uw - 0.4, domain, { y: 0.42, z: frontZ + 0.02 }));

  // Operator touchscreen on an arm.
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.85, 10), m.metalDark);
  arm.position.set(uw * 0.3, h + 0.3, frontZ - 0.25);
  arm.castShadow = true;
  g.add(arm);
  g.add(screen(1.4, 0.95, { x: uw * 0.3, y: h + 0.82, z: frontZ - 0.05, tilt: -0.5 }));

  // Status lights + side vents.
  g.add(statusStrip(5, domain, { x: -uw * 0.24, y: h * 0.62, z: frontZ + 0.01 }));
  g.add(vents(0.5, h * 0.5, { x: -uw / 2 - 0.02, y: h * 0.5, z: 0, rows: 6 }));

  // Recessed door handles on the front.
  for (const hx of [-uw * 0.24, uw * 0.02]) {
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.12), m.metalDark);
    handle.position.set(hx, h * 0.36, frontZ + 0.04);
    g.add(handle);
  }

  // Glass access hood on the front deck over a reagent carousel.
  if (hoods) {
    const deckZ = frontZ * 0.32;
    g.add(accessHood(uw - 1.2, ud * 0.42, 0.85, { y: h, z: deckZ }));
    const rr = Math.min(uw, ud);
    const carousel = new THREE.Mesh(
      new THREE.CylinderGeometry(rr * 0.22, rr * 0.24, 0.4, 24), m.bodyMid,
    );
    carousel.position.set(0, h + 0.3, deckZ);
    g.add(carousel);
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(rr * 0.1, rr * 0.1, 0.44, 16), m.darkTrim,
    );
    hub.position.set(0, h + 0.32, deckZ);
    g.add(hub);
    const bottleGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.36, 8);
    const ring = rr * 0.17;
    for (let b = 0; b < 8; b++) {
      const a = (b / 8) * Math.PI * 2;
      const bot = new THREE.Mesh(bottleGeo, m.glass);
      bot.position.set(Math.cos(a) * ring, h + 0.42, deckZ + Math.sin(a) * ring);
      g.add(bot);
    }
  }
  return g;
}

// Straight row of units, parallel to the spine.
function rowPlacements(w, d, units) {
  const gap = 0.5;
  const uw = (w - gap * (units - 1)) / units;
  return Array.from({ length: units }, (_, u) => {
    const x = -w / 2 + uw / 2 + u * (uw + gap);
    return { uw, ud: d, x, z: 0, rot: 0, lx: x, lz: d / 2 + 0.2 };
  });
}

// L-shaped wing: unit 0 is the head (faces the spine at +Z); the remaining
// units rotate 90° and step back along -Z, jutting perpendicular from the line.
function wingPlacements(w, d, units) {
  const uw = 8.5;
  const ud = 7.4;
  const gap = 0.7;
  const out = [];
  const hx = w / 2 - uw / 2;
  const hz = d / 2 - ud / 2;
  out.push({ uw, ud, x: hx, z: hz, rot: 0, lx: hx, lz: d / 2 + 0.2 });
  const armX = -w / 2 + ud / 2 + 0.3;
  for (let u = 1; u < units; u++) {
    const z = (d / 2 - uw / 2) - (u - 1) * (uw + gap);
    out.push({ uw, ud, x: armX, z, rot: Math.PI / 2, lx: armX, lz: z });
  }
  return out;
}

export function buildAnalyzer(station) {
  const m = materials();
  const g = new THREE.Group();
  const { w, d, h, domain } = station;
  const units = station.units || 1;

  g.add(contactShadow(w, d));

  const placements = station.arrangement === 'wing'
    ? wingPlacements(w, d, units)
    : rowPlacements(w, d, units);

  placements.forEach((p) => {
    const unit = buildUnit(p.uw, p.ud, h, domain, station.hoods, m);
    unit.position.set(p.x, 0, p.z);
    unit.rotation.y = p.rot;
    g.add(unit);
  });

  g.add(casters(w, d, { inset: 0.7 }));
  g.userData.unitCenters = placements.map((p) => ({ x: p.lx, z: p.lz }));
  return g;
}
