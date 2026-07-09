import * as THREE from 'three';
import { materials } from '../materials.js';
import { box, screen, contactShadow } from '../primitives.js';

// Command Central — an operator control desk facing the line, with a curved
// bank of monitors, a CPU tower, and a chair. Monitors face +Z (the camera /
// track side) while the operator sits behind, facing the line.
export function buildCommand(station) {
  const m = materials();
  const g = new THREE.Group();
  const { w, d } = station;
  const frontZ = d / 2;

  g.add(contactShadow(w, d));

  // Desk top on a solid base panel.
  const deskH = 1.4;
  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.18, d - 1.2), m.bodyLight,
  );
  desk.position.set(0, deskH, 0.2);
  desk.castShadow = true;
  desk.receiveShadow = true;
  g.add(desk);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.6, deskH - 0.1, d - 2.2), m.darkTrim,
  );
  base.position.set(0, (deskH - 0.1) / 2, 0.2);
  base.castShadow = true;
  g.add(base);

  // Bank of three monitors facing +Z (toward the camera / track).
  const monTilt = 0.14;
  const monSpecs = [
    { x: -w * 0.3, rot: 0.35 },
    { x: 0, rot: 0 },
    { x: w * 0.3, rot: -0.35 },
  ];
  for (const s of monSpecs) {
    const mon = new THREE.Group();
    const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.1, 0.5, 10), m.metalDark,
    );
    stand.position.y = 0.25;
    mon.add(stand);
    const sc = screen(1.5, 0.95, { y: 0.85, z: 0, tilt: monTilt });
    // Swap the glass to a glowing green ops display.
    sc.children[1].material = m.screenGlow;
    mon.add(sc);
    mon.position.set(s.x, deskH + 0.1, frontZ - 0.5);
    mon.rotation.y = s.rot;
    g.add(mon);
  }

  // CPU tower beside the desk.
  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 1.3, 0.7), m.bodyWhite,
  );
  tower.position.set(-w / 2 + 0.5, 0.65, -d * 0.2);
  tower.castShadow = true;
  g.add(tower);

  // Operator chair behind the desk (facing -Z, toward the line).
  const chair = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.16, 1.0), m.rubber);
  seat.position.y = 1.0;
  seat.castShadow = true;
  const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.1, 0.16), m.rubber);
  backrest.position.set(0, 1.6, -0.5);
  backrest.castShadow = true;
  const postC = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.9, 10), m.metalDark,
  );
  postC.position.y = 0.5;
  const legsC = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.1, 5), m.metalDark,
  );
  legsC.position.y = 0.06;
  chair.add(seat, backrest, postC, legsC);
  chair.position.set(0, 0, -d * 0.32);
  g.add(chair);

  return g;
}
