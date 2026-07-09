import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { materials, accentMaterial } from './materials.js';

// ---------------------------------------------------------------------------
// Low-level building blocks. Every instrument is composed from these so the
// whole line shares one visual language: soft-cornered bodies, recessed
// panels, dark screens, glowing status strips, vents, casters and handrails.
// All builders return a THREE.Object3D positioned in the group's local space.
// ---------------------------------------------------------------------------

const geoCache = new Map();
function roundedBox(w, h, d, r = 0.12, seg = 3) {
  const key = `${w.toFixed(2)}:${h.toFixed(2)}:${d.toFixed(2)}:${r}:${seg}`;
  if (geoCache.has(key)) return geoCache.get(key);
  const radius = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
  const g = new RoundedBoxGeometry(w, h, d, seg, Math.max(radius, 0.01));
  geoCache.set(key, g);
  return g;
}

// A soft-cornered box mesh, positioned by its CENTER.
export function box(w, h, d, mat, { x = 0, y = 0, z = 0, r = 0.14 } = {}) {
  const m = materials();
  const material = typeof mat === 'string' ? m[mat] : mat;
  const mesh = new THREE.Mesh(roundedBox(w, h, d, r), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// A body block that sits ON the floor — positioned by its base, not center.
export function bodyBlock(w, h, d, mat = 'bodyWhite', { x = 0, z = 0, r = 0.18 } = {}) {
  return box(w, h, d, mat, { x, y: h / 2, z, r });
}

// A recessed dark panel on the +Z face of a body.
export function facePanel(w, h, { x = 0, y = 0, z = 0, mat = 'panel' } = {}) {
  const m = materials();
  const material = typeof mat === 'string' ? m[mat] : mat;
  const mesh = new THREE.Mesh(roundedBox(w, h, 0.12, 0.06), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// A glowing screen (touch monitor) with a thin bezel.
export function screen(w, h, { x = 0, y = 0, z = 0, tilt = 0 } = {}) {
  const m = materials();
  const g = new THREE.Group();
  const bezel = new THREE.Mesh(roundedBox(w, h, 0.1, 0.05), m.darkTrim);
  bezel.castShadow = true;
  const glass = new THREE.Mesh(roundedBox(w * 0.9, h * 0.86, 0.14, 0.03), m.screen);
  glass.position.z = 0.03;
  g.add(bezel, glass);
  g.position.set(x, y, z);
  g.rotation.x = tilt;
  return g;
}

// A row of small glowing status lights along a strip.
export function statusStrip(count, domainKey, { x = 0, y = 0, z = 0, spacing = 0.42, axis = 'x' } = {}) {
  const g = new THREE.Group();
  const on = accentMaterial(domainKey);
  const off = materials().metalDark;
  const geo = new THREE.SphereGeometry(0.09, 12, 10);
  for (let i = 0; i < count; i++) {
    const lit = i % 3 !== 1;
    const dot = new THREE.Mesh(geo, lit ? on : off);
    const o = (i - (count - 1) / 2) * spacing;
    dot.position.set(axis === 'x' ? o : 0, axis === 'y' ? o : 0, 0);
    g.add(dot);
  }
  g.position.set(x, y, z);
  return g;
}

// A colored accent stripe wrapping the front of a body.
export function accentStripe(w, domainKey, { x = 0, y = 0, z = 0, h = 0.34 } = {}) {
  const mesh = new THREE.Mesh(roundedBox(w, h, 0.16, 0.05), accentMaterial(domainKey));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
}

// Ventilation grille — a set of thin horizontal slats.
export function vents(w, h, { x = 0, y = 0, z = 0, rows = 5 } = {}) {
  const m = materials();
  const g = new THREE.Group();
  const slatH = (h / rows) * 0.55;
  const geo = new THREE.BoxGeometry(w, slatH, 0.06);
  for (let i = 0; i < rows; i++) {
    const s = new THREE.Mesh(geo, m.darkTrim);
    s.position.y = (i - (rows - 1) / 2) * (h / rows);
    g.add(s);
  }
  g.position.set(x, y, z);
  return g;
}

// A rounded transparent access hood / lid (dome-ish) sitting on top of a body.
export function accessHood(w, d, h, { x = 0, y = 0, z = 0 } = {}) {
  const m = materials();
  const g = new THREE.Group();
  const glass = new THREE.Mesh(roundedBox(w, h, d, 0.12), m.glass);
  glass.position.y = h / 2;
  const frame = new THREE.Mesh(roundedBox(w + 0.06, 0.12, d + 0.06, 0.05), m.metal);
  g.add(glass, frame);
  g.position.set(x, y, z);
  return g;
}

// Casters / feet under a machine.
export function casters(w, d, { x = 0, z = 0, inset = 0.5 } = {}) {
  const m = materials();
  const g = new THREE.Group();
  const geo = new THREE.CylinderGeometry(0.16, 0.18, 0.3, 12);
  const positions = [
    [w / 2 - inset, d / 2 - inset],
    [-w / 2 + inset, d / 2 - inset],
    [w / 2 - inset, -d / 2 + inset],
    [-w / 2 + inset, -d / 2 + inset],
  ];
  for (const [px, pz] of positions) {
    const c = new THREE.Mesh(geo, m.rubber);
    c.position.set(px, 0.15, pz);
    c.castShadow = true;
    g.add(c);
  }
  g.position.set(x, 0, z);
  return g;
}

// A soft dark contact shadow blob placed on the floor beneath a footprint.
export function contactShadow(w, d, { x = 0, z = 0 } = {}) {
  const geo = new THREE.PlaneGeometry(w * 1.16, d * 1.16);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x1a2740,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0.015, z);
  mesh.renderOrder = -1;
  return mesh;
}

// A handrail / pole (used on command desks & walkways).
export function pole(h, { x = 0, z = 0, mat = 'metal', r = 0.05 } = {}) {
  const m = materials();
  const geo = new THREE.CylinderGeometry(r, r, h, 12);
  const mesh = new THREE.Mesh(geo, m[mat]);
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = true;
  return mesh;
}

export { roundedBox };
