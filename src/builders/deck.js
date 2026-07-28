import * as THREE from 'three';
import { materials } from './materials.js';
import { SPINE } from '../layout/spine.js';

// ---------------------------------------------------------------------------
// The raised floor deck the whole line stands on — the light tiled slab with a
// visible lip seen in the reference. Its top surface is y = 0, so every
// instrument (which builds from a y = 0 base) sits directly on it, while the
// slab body drops below to read as a platform above the surrounding floor.
// ---------------------------------------------------------------------------

const THICKNESS = 0.34;
const FRONT_Z = 4; // deck edge in front of the track
const BACK_Z = -23; // deck edge just past the instruments and desks

export function buildDeck() {
  const m = materials();
  const group = new THREE.Group();
  group.name = 'deck';

  const x0 = SPINE.startX - 4;
  const x1 = SPINE.endX + 4;
  const w = x1 - x0;
  const d = FRONT_Z - BACK_Z;
  const cx = (x0 + x1) / 2;
  const cz = (FRONT_Z + BACK_Z) / 2;

  // Slab body — top face flush with y = 0.
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(w, THICKNESS, d),
    m.bodyWhite,
  );
  slab.position.set(cx, -THICKNESS / 2, cz);
  slab.receiveShadow = true;
  slab.castShadow = true;
  group.add(slab);

  // Slightly inset darker skirt so the lip reads as a step, not a flat sheet.
  const skirt = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.5, THICKNESS * 0.5, d - 0.5),
    m.bodyMid,
  );
  skirt.position.set(cx, -THICKNESS - 0.06, cz);
  group.add(skirt);

  // Faint tile seams on the deck surface, drawn to the real footprint.
  const TILE = 6;
  const pts = [];
  const y = 0.012;
  for (let x = Math.ceil(x0 / TILE) * TILE; x < x1; x += TILE) {
    pts.push(x, y, BACK_Z, x, y, FRONT_Z);
  }
  for (let z = Math.ceil(BACK_Z / TILE) * TILE; z < FRONT_Z; z += TILE) {
    pts.push(x0, y, z, x1, y, z);
  }
  const seamGeo = new THREE.BufferGeometry();
  seamGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const seams = new THREE.LineSegments(
    seamGeo,
    new THREE.LineBasicMaterial({ color: 0xc3cdda, transparent: true, opacity: 0.55 }),
  );
  group.add(seams);

  return { group };
}
