import * as THREE from 'three';
import { materials, accentMaterial } from './materials.js';
import { SPUR_STATIONS } from '../layout/stations.js';
import { spineZ } from '../layout/spine.js';

// ---------------------------------------------------------------------------
// Perpendicular 90° spur branches. Each analyzer cell that is mounted off the
// main spine gets its own spur: a narrower green track running at right angles
// from the spine back to the cell, a junction/transfer node where it meets the
// spine, and a sample carrier that shuttles along it — reproducing the branched
// track topology in the reference (the cells do not sit inline on one belt).
// ---------------------------------------------------------------------------

const SPUR_W = 2.6; // spur deck width (across the branch)
const BELT_W = 1.7;
const CAP_COLORS = [0xe0455f, 0x2f6df6, 0x8b5cf6, 0xe8933a, 0x17b0a4];

export function buildBranches() {
  const m = materials();
  const group = new THREE.Group();
  group.name = 'branches';

  const junctions = [];
  const carriers = [];

  SPUR_STATIONS.forEach((s, idx) => {
    const x = s.x;
    const zSpine = spineZ(x) - 2.2; // where the spur meets the (curving) spine's far edge
    const zCell = s.z + s.d / 2 + 0.1; // the cell's front face
    const len = Math.abs(zCell - zSpine);
    const zMid = (zSpine + zCell) / 2;

    // --- Spur deck + belt ---
    const base = new THREE.Mesh(new THREE.BoxGeometry(SPUR_W, 0.5, len), m.bodyMid);
    base.position.set(x, 0.35, zMid);
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const belt = new THREE.Mesh(new THREE.BoxGeometry(BELT_W, 0.12, len - 0.3), m.belt);
    belt.position.set(x, 0.64, zMid);
    belt.receiveShadow = true;
    group.add(belt);

    // Chevron slats along the spur (pointing toward the cell).
    const slatGeo = new THREE.BoxGeometry(BELT_W * 0.82, 0.12, 0.4);
    const nSlats = Math.max(2, Math.floor(len / 1.6));
    const slats = new THREE.InstancedMesh(slatGeo, m.beltDark, nSlats);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < nSlats; i++) {
      dummy.position.set(x, 0.71, zSpine - (i + 0.5) * (len / nSlats) * Math.sign(zCell - zSpine));
      dummy.updateMatrix();
      slats.setMatrixAt(i, dummy.matrix);
    }
    group.add(slats);

    // Side rails.
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, len), m.metal);
      rail.position.set(x + side * (BELT_W / 2 + 0.2), 0.78, zMid);
      rail.castShadow = true;
      group.add(rail);
    }

    // Support legs.
    const legGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.5, 8);
    for (const t of [0.25, 0.75]) {
      for (const side of [-1, 1]) {
        const leg = new THREE.Mesh(legGeo, m.metalDark);
        leg.position.set(
          x + side * (BELT_W / 2 + 0.35),
          0.05,
          zSpine + (zCell - zSpine) * t,
        );
        group.add(leg);
      }
    }

    // --- Junction / transfer node where the spur meets the spine ---
    const jn = new THREE.Group();
    const jbox = new THREE.Mesh(new THREE.BoxGeometry(SPUR_W + 0.8, 1.5, 2.4), m.bodyWhite);
    jbox.position.y = 0.75;
    jbox.castShadow = true;
    jn.add(jbox);
    const jstripe = new THREE.Mesh(
      new THREE.BoxGeometry(SPUR_W + 0.9, 0.28, 0.14), accentMaterial(s.domain),
    );
    jstripe.position.set(0, 0.5, 1.25);
    jn.add(jstripe);
    // Rotating transfer disc that hands tubes from the spine onto the spur.
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.9, 0.28, 20), m.darkTrim,
    );
    disc.position.y = 1.62;
    jn.add(disc);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.14, 0.3), m.metal);
    arm.position.y = 1.78;
    jn.add(arm);
    jn.position.set(x, 0, zSpine + Math.sign(zCell - zSpine) * 1.1);
    group.add(jn);
    junctions.push(disc);

    // --- A carrier shuttling along the spur (spine ⇆ cell) ---
    const c = new THREE.Group();
    const puck = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.3, 14), m.darkTrim);
    puck.position.y = 0.15;
    puck.castShadow = true;
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.85, 10), m.glass);
    tube.position.y = 0.72;
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.2, 10),
      new THREE.MeshStandardMaterial({ color: CAP_COLORS[idx % CAP_COLORS.length], roughness: 0.5 }),
    );
    cap.position.y = 1.22;
    c.add(puck, tube, cap);
    c.position.set(x, 0.7, zMid);
    c.userData = { x, zSpine, zCell, phase: (idx * 0.37) % 1, speed: 0.35 + (idx % 3) * 0.05 };
    group.add(c);
    carriers.push(c);
  });

  function update(dt, flowOn) {
    for (const d of junctions) d.rotation.y += dt * 1.4;
    if (!flowOn) return;
    for (const c of carriers) {
      const u = c.userData;
      u.phase = (u.phase + dt * u.speed) % 1;
      // Triangle wave: travel out to the cell and back to the spine.
      const tri = u.phase < 0.5 ? u.phase * 2 : 2 - u.phase * 2;
      c.position.z = u.zSpine + (u.zCell - u.zSpine) * tri;
    }
  }

  return { group, update };
}
