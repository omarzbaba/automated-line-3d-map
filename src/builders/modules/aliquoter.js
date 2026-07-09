import * as THREE from 'three';
import { materials } from '../materials.js';
import {
  bodyBlock, box, facePanel, screen, statusStrip, accentStripe,
  casters, contactShadow,
} from '../primitives.js';

// Aliquoter — divides a primary tube into secondary aliquot tubes. Features a
// pipetting gantry (X-rail + carriage) travelling over trays of small tubes.
export function buildAliquoter(station) {
  const m = materials();
  const g = new THREE.Group();
  const { w, d, h, domain } = station;
  const frontZ = d / 2;

  g.add(contactShadow(w, d));
  g.add(bodyBlock(w, h, d, 'bodyWhite', { r: 0.2 }));
  g.add(accentStripe(w - 0.4, domain, { y: 0.42, z: frontZ + 0.02 }));
  g.add(facePanel(w - 2, h * 0.3, { y: h * 0.34, z: frontZ - 0.02 }));
  g.add(screen(1.3, 0.9, { x: w * 0.3, y: h + 0.55, z: frontZ - 0.4, tilt: -0.55 }));
  g.add(statusStrip(4, domain, { x: -w * 0.28, y: h * 0.64, z: frontZ + 0.01 }));

  // Deck surface on top.
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.8, 0.16, d - 1.0), m.bodyLight,
  );
  deck.position.set(0, h + 0.1, -0.1);
  deck.receiveShadow = true;
  g.add(deck);

  // Trays of small aliquot tubes.
  const tubeGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8);
  const trayGeo = new THREE.BoxGeometry(w - 2.2, 0.12, 0.7);
  for (let r = 0; r < 2; r++) {
    const rz = -0.7 + r * 1.0;
    const tray = new THREE.Mesh(trayGeo, m.darkTrim);
    tray.position.set(0, h + 0.24, rz);
    g.add(tray);
    for (let t = 0; t < 12; t++) {
      const tube = new THREE.Mesh(tubeGeo, m.glass);
      tube.position.set(-w / 2 + 1.3 + t * ((w - 2.6) / 11), h + 0.44, rz);
      g.add(tube);
    }
  }

  // Pipetting gantry: two posts + X rail + travelling carriage with a needle.
  const postGeo = new THREE.BoxGeometry(0.24, 1.7, 0.24);
  for (const s of [-1, 1]) {
    const post = new THREE.Mesh(postGeo, m.metalDark);
    post.position.set(s * (w / 2 - 0.6), h + 0.85, -d * 0.28);
    post.castShadow = true;
    g.add(post);
  }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(w - 1.0, 0.2, 0.3), m.metal);
  rail.position.set(0, h + 1.6, -d * 0.28);
  rail.castShadow = true;
  g.add(rail);

  const carriage = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), m.darkTrim);
  carriage.position.set(w * 0.15, h + 1.45, -d * 0.28);
  g.add(carriage);
  const needle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.02, 0.9, 8), m.metal,
  );
  needle.position.set(w * 0.15, h + 0.9, -d * 0.28 + 0.35);
  g.add(needle);

  g.add(casters(w, d, { inset: 0.6 }));
  return g;
}
