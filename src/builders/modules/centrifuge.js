import * as THREE from 'three';
import { materials, accentMaterial } from '../materials.js';
import {
  bodyBlock, box, facePanel, statusStrip, accentStripe, casters, contactShadow,
} from '../primitives.js';

// Centrifuge bank — several units, each with a circular top lid over the rotor
// bowl and a small control panel. Matches the rounded-top units in the model.
export function buildCentrifuges(station) {
  const m = materials();
  const g = new THREE.Group();
  const { w, d, h, domain } = station;
  const units = station.units || 4;
  const frontZ = d / 2;

  g.add(contactShadow(w, d));

  const gap = 0.4;
  const unitW = (w - gap * (units - 1)) / units;

  for (let u = 0; u < units; u++) {
    const cx = -w / 2 + unitW / 2 + u * (unitW + gap);

    g.add(bodyBlock(unitW - 0.1, h, d, 'bodyWhite', { x: cx, r: 0.2 }));
    g.add(accentStripe(unitW - 0.3, domain, { x: cx, y: 0.42, z: frontZ + 0.02 }));
    g.add(facePanel(unitW - 1.2, h * 0.28, { x: cx, y: h * 0.4, z: frontZ - 0.02 }));
    g.add(statusStrip(3, domain, { x: cx, y: h * 0.68, z: frontZ + 0.01, spacing: 0.5 }));

    // Circular rotor lid on top.
    const lidR = Math.min(unitW, d) * 0.36;
    const lidBase = new THREE.Mesh(
      new THREE.CylinderGeometry(lidR + 0.12, lidR + 0.16, 0.3, 28), m.metal,
    );
    lidBase.position.set(cx, h + 0.15, -0.2);
    lidBase.castShadow = true;
    g.add(lidBase);

    const lid = new THREE.Mesh(
      new THREE.CylinderGeometry(lidR, lidR + 0.05, 0.45, 28), m.bodyMid,
    );
    lid.position.set(cx, h + 0.42, -0.2);
    lid.castShadow = true;
    g.add(lid);

    // Central hub button on the lid.
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(lidR * 0.28, lidR * 0.28, 0.14, 16),
      accentMaterial(domain),
    );
    hub.position.set(cx, h + 0.67, -0.2);
    g.add(hub);

    // Small handle notch on the lid front.
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.1, 0.2), m.metalDark,
    );
    handle.position.set(cx, h + 0.5, -0.2 + lidR + 0.1);
    g.add(handle);
  }

  g.add(casters(w, d, { inset: 0.7 }));
  return g;
}
