import * as THREE from 'three';
import { materials, accentMaterial } from '../materials.js';
import {
  bodyBlock, box, facePanel, screen, statusStrip, accentStripe,
  vents, accessHood, casters, contactShadow,
} from '../primitives.js';

// A large clinical analyzer bank — the workhorse for Coagulation, Hematology,
// Immunoassay and Chemistry. Each sub-analyzer unit is built independently so
// units can be laid out either in a row (parallel to the spine) or as an
// L-shaped "wing" where later units turn 90° and jut perpendicular from the
// line (used for Chemistry: AU 1 at the head, AU 2 + Cobas jutting out).

// One self-contained analyzer unit, centered at local origin, front facing +Z.
function buildUnit(uw, ud, h, domain, hoods, m) {
  const g = new THREE.Group();
  const frontZ = ud / 2;

  g.add(bodyBlock(uw - 0.12, h, ud - 0.2, 'bodyWhite', { z: 0, r: 0.22 }));
  g.add(box(uw - 0.5, h * 0.28, 0.18, 'bodyLight', { y: h * 0.74, z: frontZ - 0.05 }));
  g.add(facePanel(uw - 1.1, h * 0.34, { y: h * 0.34, z: frontZ - 0.02, mat: 'panel' }));
  g.add(accentStripe(uw - 0.3, domain, { y: 0.42, z: frontZ + 0.02 }));

  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 10), m.metalDark);
  arm.position.set(uw * 0.28, h + 0.35, frontZ - 0.3);
  arm.castShadow = true;
  g.add(arm);
  g.add(screen(1.5, 1.0, { x: uw * 0.28, y: h + 0.9, z: frontZ - 0.1, tilt: -0.5 }));
  g.add(statusStrip(5, domain, { x: -uw * 0.22, y: h * 0.62, z: frontZ + 0.01 }));
  g.add(vents(0.5, h * 0.5, { x: -uw / 2 - 0.02, y: h * 0.5, z: 0, rows: 6 }));

  if (hoods) {
    g.add(accessHood(uw - 1.0, ud - 1.4, 1.0, { y: h, z: -0.2 }));
    const rr = Math.min(uw, ud);
    const carousel = new THREE.Mesh(
      new THREE.CylinderGeometry(rr * 0.28, rr * 0.3, 0.4, 24), accentMaterial(domain),
    );
    carousel.position.set(0, h + 0.35, -0.2);
    g.add(carousel);
    const bottleGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8);
    const ring = rr * 0.22;
    for (let b = 0; b < 8; b++) {
      const a = (b / 8) * Math.PI * 2;
      const bot = new THREE.Mesh(bottleGeo, m.glass);
      bot.position.set(Math.cos(a) * ring, h + 0.5, -0.2 + Math.sin(a) * ring);
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
  // Head unit at the front-right, facing the spine.
  const hx = w / 2 - uw / 2;
  const hz = d / 2 - ud / 2;
  out.push({ uw, ud, x: hx, z: hz, rot: 0, lx: hx, lz: d / 2 + 0.2 });
  // Perpendicular arm on the left, each unit rotated to face +X.
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
  // Local {x, z} anchors so model sub-labels sit above each unit.
  g.userData.unitCenters = placements.map((p) => ({ x: p.lx, z: p.lz }));
  return g;
}
