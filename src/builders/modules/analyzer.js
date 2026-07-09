import * as THREE from 'three';
import { materials, accentMaterial } from '../materials.js';
import {
  bodyBlock, box, facePanel, screen, statusStrip, accentStripe,
  vents, accessHood, casters, contactShadow,
} from '../primitives.js';

// A large clinical analyzer bank — the workhorse for Coagulation, Hematology,
// Immunoassay and Chemistry. Splits its footprint into `units` sub-analyzers,
// each with a recessed control panel, a tilted touchscreen, a glass access
// hood revealing a reagent carousel, a base accent stripe and status lights.
export function buildAnalyzer(station) {
  const m = materials();
  const g = new THREE.Group();
  const { w, d, h, domain } = station;
  const units = station.units || 1;

  g.add(contactShadow(w, d));

  const gap = 0.5;
  const unitW = (w - gap * (units - 1)) / units;
  const frontZ = d / 2; // faces the track / camera

  for (let u = 0; u < units; u++) {
    const cx = -w / 2 + unitW / 2 + u * (unitW + gap);

    // Main body of this sub-analyzer.
    g.add(bodyBlock(unitW - 0.12, h, d - 0.2, 'bodyWhite', { x: cx, z: 0, r: 0.22 }));

    // Upper lighter fascia band.
    g.add(box(unitW - 0.5, h * 0.28, 0.18, 'bodyLight', {
      x: cx, y: h * 0.74, z: frontZ - 0.05,
    }));

    // Recessed control panel low on the front.
    g.add(facePanel(unitW - 1.1, h * 0.34, {
      x: cx, y: h * 0.34, z: frontZ - 0.02, mat: 'panel',
    }));

    // Base accent stripe (domain color).
    g.add(accentStripe(unitW - 0.3, domain, { x: cx, y: 0.42, z: frontZ + 0.02 }));

    // Tilted operator touchscreen on a short arm.
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.9, 10), m.metalDark,
    );
    arm.position.set(cx + unitW * 0.28, h + 0.35, frontZ - 0.3);
    arm.castShadow = true;
    g.add(arm);
    g.add(screen(1.5, 1.0, { x: cx + unitW * 0.28, y: h + 0.9, z: frontZ - 0.1, tilt: -0.5 }));

    // Status light strip.
    g.add(statusStrip(5, domain, { x: cx - unitW * 0.22, y: h * 0.62, z: frontZ + 0.01 }));

    // Side vents (only on the outer edges of the bank).
    if (u === 0) {
      g.add(vents(0.5, h * 0.5, { x: -w / 2 - 0.02, y: h * 0.5, z: 0, rows: 6 }));
    }

    // Glass access hood on top revealing a reagent carousel.
    if (station.hoods) {
      g.add(accessHood(unitW - 1.0, d - 1.4, 1.0, { x: cx, y: h, z: -0.2 }));
      const carousel = new THREE.Mesh(
        new THREE.CylinderGeometry(Math.min(unitW, d) * 0.28, Math.min(unitW, d) * 0.3, 0.4, 24),
        accentMaterial(domain),
      );
      carousel.position.set(cx, h + 0.35, -0.2);
      g.add(carousel);
      // Small reagent bottles around the carousel.
      const bottleGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8);
      const ring = Math.min(unitW, d) * 0.22;
      for (let b = 0; b < 8; b++) {
        const a = (b / 8) * Math.PI * 2;
        const bot = new THREE.Mesh(bottleGeo, m.glass);
        bot.position.set(cx + Math.cos(a) * ring, h + 0.5, -0.2 + Math.sin(a) * ring);
        g.add(bot);
      }
    }

    // Divider seam between units.
    if (u < units - 1) {
      g.add(box(0.1, h, d - 0.2, 'metalDark', {
        x: cx + unitW / 2 + gap / 2, y: h / 2, z: 0, r: 0.02,
      }));
    }
  }

  g.add(casters(w, d, { inset: 0.7 }));
  g.userData.unitCenters = unitCenters(w, units, gap, unitW);
  return g;
}

function unitCenters(w, units, gap, unitW) {
  const arr = [];
  for (let u = 0; u < units; u++) {
    arr.push(-w / 2 + unitW / 2 + u * (unitW + gap));
  }
  return arr;
}
