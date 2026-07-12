import * as THREE from 'three';
import { materials } from './materials.js';
import { LINE } from '../layout/stations.js';
import { spineZ, spineHeading, spineNormal, SPINE } from '../layout/spine.js';

// ---------------------------------------------------------------------------
// The transport track: a raised white plinth carrying a TWO-LANE green conveyor
// (outbound + return lanes, as in the reference) that follows the curving
// spine. Built from instanced segments for performance, with a center divider
// rail, outer rails, support legs and sample carriers streaming both ways.
// ---------------------------------------------------------------------------

const TUBE_CAP_COLORS = [0xe0455f, 0x2f6df6, 0x8b5cf6, 0xe8933a, 0x17b0a4, 0x9aa4b2];

const PLATFORM_W = 4.6;
const LANE_W = 1.35;
const LANE_OFF = 0.82; // lane center offset from the spine centerline
const PLATFORM_Y = 0.35;
const BELT_Y = 0.64;

export function buildTrack() {
  const m = materials();
  const group = new THREE.Group();
  group.name = 'track';

  const length = SPINE.endX - SPINE.startX;
  const N = Math.max(40, Math.round(length / 5.6));
  const segLen = length / N + 0.5; // small overlap to avoid gaps on the curve

  // Instanced segment helper: places `geo/mat` at each segment midpoint,
  // rotated to the local heading, optionally offset along the normal.
  const dummy = new THREE.Object3D();
  function instancedRun(geo, mat, y, off, { shadow = false } = {}) {
    const mesh = new THREE.InstancedMesh(geo, mat, N);
    for (let i = 0; i < N; i++) {
      const x = SPINE.startX + (i + 0.5) * (length / N);
      const h = spineHeading(x);
      const nrm = spineNormal(x);
      dummy.position.set(x + nrm.nx * off, y, spineZ(x) + nrm.nz * off);
      dummy.rotation.set(0, -h, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }

  // Plinth / platform.
  instancedRun(new THREE.BoxGeometry(segLen, 0.5, PLATFORM_W), m.bodyLight, PLATFORM_Y, 0, { shadow: true });

  // Two green belt lanes.
  instancedRun(new THREE.BoxGeometry(segLen, 0.12, LANE_W), m.belt, BELT_Y, LANE_OFF);
  instancedRun(new THREE.BoxGeometry(segLen, 0.12, LANE_W), m.belt, BELT_Y, -LANE_OFF);

  // Center divider rail + outer rails.
  instancedRun(new THREE.BoxGeometry(segLen, 0.2, 0.16), m.metal, BELT_Y + 0.06, 0, { shadow: true });
  instancedRun(new THREE.BoxGeometry(segLen, 0.22, 0.12), m.metal, BELT_Y + 0.08, PLATFORM_W / 2 - 0.12, { shadow: true });
  instancedRun(new THREE.BoxGeometry(segLen, 0.22, 0.12), m.metal, BELT_Y + 0.08, -(PLATFORM_W / 2 - 0.12), { shadow: true });

  // Chevron direction dashes on each lane.
  const chevGeo = new THREE.BoxGeometry(0.45, 0.13, LANE_W * 0.72);
  const chevN = Math.floor(length / 2.4);
  for (const laneOff of [LANE_OFF, -LANE_OFF]) {
    const chev = new THREE.InstancedMesh(chevGeo, m.beltDark, chevN);
    for (let i = 0; i < chevN; i++) {
      const x = SPINE.startX + 1.2 + i * 2.4;
      const h = spineHeading(x);
      const nrm = spineNormal(x);
      dummy.position.set(x + nrm.nx * laneOff, BELT_Y + 0.07, spineZ(x) + nrm.nz * laneOff);
      dummy.rotation.set(0, -h, 0);
      dummy.updateMatrix();
      chev.setMatrixAt(i, dummy.matrix);
    }
    group.add(chev);
  }

  // Support legs periodically under the plinth.
  const legGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.5, 10);
  const legN = Math.floor(length / 9);
  const legMesh = new THREE.InstancedMesh(legGeo, m.metalDark, legN * 2);
  let li = 0;
  for (let i = 0; i < legN; i++) {
    const x = SPINE.startX + 3 + (i / (legN - 1)) * (length - 6);
    const nrm = spineNormal(x);
    for (const s of [-1, 1]) {
      const off = s * (PLATFORM_W / 2 - 0.4);
      dummy.position.set(x + nrm.nx * off, 0.05, spineZ(x) + nrm.nz * off);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      legMesh.setMatrixAt(li++, dummy.matrix);
    }
  }
  legMesh.castShadow = true;
  group.add(legMesh);

  // --- Sample carriers (pucks + capped tubes) on both lanes ---
  const carriers = [];
  const carrierCount = Math.max(26, Math.floor(length / 6));
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
    const cap = new THREE.Mesh(
      capGeo,
      new THREE.MeshStandardMaterial({ color: TUBE_CAP_COLORS[i % TUBE_CAP_COLORS.length], roughness: 0.5 }),
    );
    cap.position.y = 1.28;
    cap.castShadow = true;
    c.add(puck, tube, cap);

    const laneSign = i % 2 === 0 ? 1 : -1; // near lane +X, far lane -X
    c.userData.laneSign = laneSign;
    c.userData.dir = laneSign; // outbound on near lane, return on far lane
    c.userData.x = SPINE.startX + (i / carrierCount) * length;
    c.userData.speed = 5.5 + (i % 3) * 0.9;
    placeCarrier(c);
    group.add(c);
    carriers.push(c);
  }

  function placeCarrier(c) {
    const x = c.userData.x;
    const nrm = spineNormal(x);
    const off = c.userData.laneSign * LANE_OFF;
    c.position.set(x + nrm.nx * off, 0.7, spineZ(x) + nrm.nz * off);
  }

  function update(dt, flowOn) {
    if (!flowOn) return;
    for (const c of carriers) {
      c.userData.x += c.userData.dir * c.userData.speed * dt;
      if (c.userData.x > SPINE.endX) c.userData.x = SPINE.startX;
      else if (c.userData.x < SPINE.startX) c.userData.x = SPINE.endX;
      placeCarrier(c);
    }
  }

  return { group, update };
}
