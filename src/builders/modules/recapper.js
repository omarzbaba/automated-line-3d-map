import * as THREE from 'three';
import { materials, accentMaterial } from '../materials.js';
import {
  bodyBlock, box, facePanel, screen, statusStrip, accentStripe,
  casters, contactShadow,
} from '../primitives.js';

// Recapper — applies fresh caps before storage. A gantry head sits over the
// track, fed from a hopper of caps mounted on top.
export function buildRecapper(station) {
  const m = materials();
  const g = new THREE.Group();
  const { w, d, h, domain } = station;
  const frontZ = d / 2;

  g.add(contactShadow(w, d));
  g.add(bodyBlock(w, h, d, 'bodyWhite', { r: 0.2 }));
  g.add(accentStripe(w - 0.3, domain, { y: 0.42, z: frontZ + 0.02 }));
  g.add(facePanel(w - 1.6, h * 0.32, { y: h * 0.36, z: frontZ - 0.02 }));
  g.add(screen(1.1, 0.8, { x: w * 0.26, y: h + 0.5, z: frontZ - 0.4, tilt: -0.5 }));
  g.add(statusStrip(3, domain, { x: -w * 0.28, y: h * 0.66, z: frontZ + 0.01 }));

  // Gantry over the track pass-through.
  const colGeo = new THREE.BoxGeometry(0.3, 1.6, 0.3);
  for (const s of [-1, 1]) {
    const col = new THREE.Mesh(colGeo, m.metalDark);
    col.position.set(s * (w / 2 - 0.9), h + 0.8, -0.1);
    col.castShadow = true;
    g.add(col);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(w - 1.4, 0.3, 0.4), m.metal);
  beam.position.set(0, h + 1.55, -0.1);
  beam.castShadow = true;
  g.add(beam);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), m.darkTrim);
  head.position.set(-w * 0.1, h + 1.1, -0.1);
  head.castShadow = true;
  g.add(head);

  // Cap hopper (angled funnel) feeding the head, tinted by domain accent.
  const hopper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.25, 1.0, 16), accentMaterial(domain),
  );
  hopper.position.set(w * 0.28, h + 1.5, -d * 0.24);
  hopper.castShadow = true;
  g.add(hopper);
  // Loose caps in the hopper.
  const capGeo = new THREE.SphereGeometry(0.12, 8, 6);
  for (let i = 0; i < 10; i++) {
    const cap = new THREE.Mesh(capGeo, m.bodyLight);
    cap.position.set(
      w * 0.28 + (Math.random() - 0.5) * 0.7,
      h + 1.8 + Math.random() * 0.2,
      -d * 0.24 + (Math.random() - 0.5) * 0.7,
    );
    g.add(cap);
  }

  g.add(casters(w, d, { inset: 0.6 }));
  return g;
}
