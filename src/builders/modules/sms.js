import * as THREE from 'three';
import { materials } from '../materials.js';
import {
  bodyBlock, box, facePanel, statusStrip, accentStripe, casters, contactShadow,
} from '../primitives.js';

// SMS — Sample Management System. A compact sorting / buffering module with a
// small rotary sorter visible under a low glass dome and a status column.
export function buildSms(station) {
  const m = materials();
  const g = new THREE.Group();
  const { w, d, h, domain } = station;
  const frontZ = d / 2;

  g.add(contactShadow(w, d));
  g.add(bodyBlock(w, h, d, 'bodyWhite', { r: 0.18 }));
  g.add(accentStripe(w - 0.3, domain, { y: 0.4, z: frontZ + 0.02 }));
  g.add(facePanel(w - 1.4, h * 0.34, { y: h * 0.4, z: frontZ - 0.02 }));
  g.add(statusStrip(4, domain, { x: 0, y: h * 0.72, z: frontZ + 0.01, spacing: 0.34 }));

  // Low glass dome with a small rotary sorter disc.
  const domeGeo = new THREE.CylinderGeometry(
    Math.min(w, d) * 0.4, Math.min(w, d) * 0.42, 0.7, 24,
  );
  const dome = new THREE.Mesh(domeGeo, m.glass);
  dome.position.set(0, h + 0.35, -0.1);
  g.add(dome);
  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(Math.min(w, d) * 0.42, Math.min(w, d) * 0.44, 0.14, 24),
    m.metal,
  );
  rim.position.set(0, h + 0.05, -0.1);
  g.add(rim);
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(Math.min(w, d) * 0.32, Math.min(w, d) * 0.32, 0.1, 24),
    m.darkTrim,
  );
  disc.position.set(0, h + 0.12, -0.1);
  g.add(disc);

  // Small carriers on the sorter disc.
  const puckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.18, 10);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const rr = Math.min(w, d) * 0.22;
    const p = new THREE.Mesh(puckGeo, m.metalDark);
    p.position.set(Math.cos(a) * rr, h + 0.24, -0.1 + Math.sin(a) * rr);
    g.add(p);
  }

  g.add(casters(w, d, { inset: 0.55 }));
  return g;
}
