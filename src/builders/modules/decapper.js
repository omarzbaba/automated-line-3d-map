import * as THREE from 'three';
import { materials } from '../materials.js';
import {
  bodyBlock, box, facePanel, screen, statusStrip, accentStripe,
  casters, contactShadow,
} from '../primitives.js';

// Decapper / Secondary Decapper — a compact module with a top gantry carrying
// a decapping head over the track pass-through, plus a cap-waste chute.
export function buildDecapper(station) {
  const m = materials();
  const g = new THREE.Group();
  const { w, d, h, domain } = station;
  const frontZ = d / 2;

  g.add(contactShadow(w, d));
  g.add(bodyBlock(w, h, d, 'bodyWhite', { r: 0.2 }));
  g.add(accentStripe(w - 0.3, domain, { y: 0.42, z: frontZ + 0.02 }));
  g.add(facePanel(w - 1.6, h * 0.32, { y: h * 0.36, z: frontZ - 0.02 }));
  g.add(screen(1.1, 0.8, { x: -w * 0.24, y: h + 0.5, z: frontZ - 0.4, tilt: -0.5 }));
  g.add(statusStrip(3, domain, { x: w * 0.26, y: h * 0.66, z: frontZ + 0.01 }));

  // Gantry columns + cross beam over the top.
  const colGeo = new THREE.BoxGeometry(0.3, 1.6, 0.3);
  for (const s of [-1, 1]) {
    const col = new THREE.Mesh(colGeo, m.metalDark);
    col.position.set(s * (w / 2 - 0.9), h + 0.8, -0.1);
    col.castShadow = true;
    g.add(col);
  }
  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(w - 1.4, 0.3, 0.4), m.metal,
  );
  beam.position.set(0, h + 1.55, -0.1);
  beam.castShadow = true;
  g.add(beam);

  // Decapping head hanging from the beam.
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.7, 0.7), m.darkTrim,
  );
  head.position.set(w * 0.12, h + 1.1, -0.1);
  head.castShadow = true;
  g.add(head);
  const chuck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.22, 0.4, 12), m.metal,
  );
  chuck.position.set(w * 0.12, h + 0.7, -0.1);
  g.add(chuck);

  // Cap-waste chute box.
  const waste = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 1.0, 1.0), m.bodyLight,
  );
  waste.position.set(-w * 0.3, h + 0.5, -d * 0.28);
  waste.castShadow = true;
  g.add(waste);

  g.add(casters(w, d, { inset: 0.6 }));
  return g;
}
