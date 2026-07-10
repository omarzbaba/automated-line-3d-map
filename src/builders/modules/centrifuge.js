import * as THREE from 'three';
import { materials } from '../materials.js';
import {
  bodyBlock, box, facePanel, statusStrip, accentStripe, casters, contactShadow,
} from '../primitives.js';

// Centrifuge bank — four units in a 2×2 cluster (as in the reference), each a
// boxy body with a circular rotor lid on top and a small control panel.
export function buildCentrifuges(station) {
  const m = materials();
  const g = new THREE.Group();
  const { w, d, h, domain } = station;
  const units = station.units || 4;
  const cols = 2;
  const rows = Math.ceil(units / cols);

  g.add(contactShadow(w, d));

  const gap = 0.6;
  const uw = (w - gap * (cols - 1)) / cols;
  const ud = (d - gap * (rows - 1)) / rows;
  const frontZ = d / 2;

  let n = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols && n < units; c++, n++) {
      const cx = -w / 2 + uw / 2 + c * (uw + gap);
      const cz = d / 2 - ud / 2 - r * (ud + gap);

      // Body.
      g.add(bodyBlock(uw - 0.1, h, ud - 0.1, 'bodyWhite', { x: cx, z: cz, r: 0.16 }));

      // Circular rotor lid.
      const lidR = Math.min(uw, ud) * 0.34;
      const lidBase = new THREE.Mesh(
        new THREE.CylinderGeometry(lidR + 0.12, lidR + 0.16, 0.28, 28), m.metal,
      );
      lidBase.position.set(cx, h + 0.14, cz);
      lidBase.castShadow = true;
      g.add(lidBase);

      const lid = new THREE.Mesh(
        new THREE.CylinderGeometry(lidR, lidR + 0.05, 0.44, 28), m.bodyMid,
      );
      lid.position.set(cx, h + 0.42, cz);
      lid.castShadow = true;
      g.add(lid);

      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(lidR * 0.26, lidR * 0.26, 0.14, 16), m.metalDark,
      );
      hub.position.set(cx, h + 0.66, cz);
      g.add(hub);

      // Lid handle at the front of each unit.
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.18), m.metalDark);
      handle.position.set(cx, h + 0.5, cz + lidR + 0.12);
      g.add(handle);

      // Front-row units get a control panel + status lights on the front face.
      if (r === 0) {
        g.add(facePanel(uw - 1.0, h * 0.26, { x: cx, y: h * 0.38, z: frontZ - 0.02 }));
        g.add(statusStrip(3, domain, { x: cx, y: h * 0.68, z: frontZ + 0.01, spacing: 0.42 }));
      }
    }
  }

  // Domain accent stripe across the front of the cluster.
  g.add(accentStripe(w - 0.4, domain, { y: 0.42, z: frontZ + 0.02 }));
  g.add(casters(w, d, { inset: 0.8 }));
  return g;
}
