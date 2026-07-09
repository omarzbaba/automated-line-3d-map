import * as THREE from 'three';
import { materials, PALETTE } from './materials.js';
import { LINE } from '../layout/stations.js';

// ---------------------------------------------------------------------------
// The transport track: a grey platform carrying a green conveyor belt with
// chevron slats, side rails, periodic support legs, and a population of sample
// carriers (pucks holding capped tubes) that stream along the line.
// ---------------------------------------------------------------------------

const TUBE_CAP_COLORS = [0xe0455f, 0x2f6df6, 0x8b5cf6, 0xe8933a, 0x17b0a4, 0x9aa4b2];

export function buildTrack() {
  const m = materials();
  const group = new THREE.Group();
  group.name = 'track';

  const length = LINE.endX - LINE.startX;
  const midX = (LINE.startX + LINE.endX) / 2;
  const beltW = LINE.beltHalf * 2;

  // --- Platform base (the grey deck the belt sits on) ---
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(length, 0.5, beltW + 1.4),
    m.bodyMid,
  );
  base.position.set(midX, 0.35, LINE.z);
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // --- Belt surface ---
  const belt = new THREE.Mesh(
    new THREE.BoxGeometry(length, 0.12, beltW),
    m.belt,
  );
  belt.position.set(midX, 0.64, LINE.z);
  belt.receiveShadow = true;
  group.add(belt);

  // --- Chevron slats along the belt (direction cue) ---
  const slatGeo = new THREE.BoxGeometry(0.5, 0.14, beltW * 0.86);
  const slatCount = Math.floor(length / 2.2);
  const slats = new THREE.InstancedMesh(slatGeo, m.beltDark, slatCount);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < slatCount; i++) {
    dummy.position.set(LINE.startX + 1.2 + i * 2.2, 0.71, LINE.z);
    dummy.updateMatrix();
    slats.setMatrixAt(i, dummy.matrix);
  }
  slats.castShadow = false;
  group.add(slats);

  // --- Side rails ---
  const railGeo = new THREE.BoxGeometry(length, 0.22, 0.14);
  for (const s of [-1, 1]) {
    const rail = new THREE.Mesh(railGeo, m.metal);
    rail.position.set(midX, 0.78, LINE.z + s * (LINE.beltHalf + 0.15));
    rail.castShadow = true;
    group.add(rail);
  }

  // --- Support legs periodically under the deck ---
  const legGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.5, 10);
  const legCount = Math.floor(length / 9);
  for (let i = 0; i <= legCount; i++) {
    const lx = LINE.startX + 1 + (i / legCount) * (length - 2);
    for (const s of [-1, 1]) {
      const leg = new THREE.Mesh(legGeo, m.metalDark);
      leg.position.set(lx, 0.05, LINE.z + s * (LINE.beltHalf + 0.35));
      leg.castShadow = true;
      group.add(leg);
    }
  }

  // --- Sample carriers (pucks + tubes) streaming along the belt ---
  const carriers = [];
  const carrierCount = Math.max(24, Math.floor(length / 6));
  const puckGeo = new THREE.CylinderGeometry(0.34, 0.4, 0.3, 16);
  const tubeGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.9, 12);
  const capGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.22, 12);

  for (let i = 0; i < carrierCount; i++) {
    const c = new THREE.Group();
    const puck = new THREE.Mesh(puckGeo, m.darkTrim);
    puck.position.y = 0.15;
    puck.castShadow = true;
    const tube = new THREE.Mesh(tubeGeo, m.glass);
    tube.position.y = 0.75;
    const capColor = TUBE_CAP_COLORS[i % TUBE_CAP_COLORS.length];
    const cap = new THREE.Mesh(
      capGeo,
      new THREE.MeshStandardMaterial({ color: capColor, roughness: 0.5 }),
    );
    cap.position.y = 1.28;
    cap.castShadow = true;
    c.add(puck, tube, cap);

    // Distribute along both lanes of the belt.
    const lane = i % 2 === 0 ? -0.55 : 0.55;
    const t = i / carrierCount;
    c.position.set(LINE.startX + t * length, 0.7, LINE.z + lane);
    c.userData.lane = lane;
    c.userData.speed = 5.5 + (i % 3) * 0.9;
    group.add(c);
    carriers.push(c);
  }

  function update(dt, flowOn) {
    if (!flowOn) return;
    for (const c of carriers) {
      c.position.x += c.userData.speed * dt;
      if (c.position.x > LINE.endX) {
        c.position.x = LINE.startX - Math.random() * 4;
      }
    }
  }

  return { group, update };
}
