import * as THREE from 'three';
import { materials } from '../materials.js';
import {
  bodyBlock, box, facePanel, screen, statusStrip, accentStripe,
  casters, contactShadow,
} from '../primitives.js';

// Dynamic Inlet — the loading module. A body with a sloped input bay holding
// racks of tubes waiting to be released onto the transport track.
export function buildInlet(station) {
  const m = materials();
  const g = new THREE.Group();
  const { w, d, h, domain } = station;
  const frontZ = d / 2;

  g.add(contactShadow(w, d));
  g.add(bodyBlock(w, h, d, 'bodyWhite', { r: 0.24 }));
  g.add(accentStripe(w - 0.4, domain, { y: 0.42, z: frontZ + 0.02 }));
  g.add(facePanel(w - 2, h * 0.3, { y: h * 0.32, z: frontZ - 0.02 }));
  g.add(screen(1.3, 0.9, { x: w * 0.28, y: h + 0.55, z: frontZ - 0.4, tilt: -0.55 }));
  g.add(statusStrip(4, domain, { x: -w * 0.28, y: h * 0.6, z: frontZ + 0.01 }));

  // Sloped input bay on top holding tube racks.
  const bay = new THREE.Mesh(
    new THREE.BoxGeometry(w - 1.2, 0.2, d - 1.4), m.bodyLight,
  );
  bay.position.set(0, h + 0.35, -0.2);
  bay.rotation.x = 0.22;
  bay.castShadow = true;
  bay.receiveShadow = true;
  g.add(bay);

  // Racks of colored-cap tubes queued in the bay.
  const capColors = [0xe0455f, 0x2f6df6, 0x8b5cf6, 0xe8933a, 0x17b0a4];
  const tubeGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8);
  const rackGeo = new THREE.BoxGeometry(w - 1.8, 0.16, 0.6);
  for (let r = 0; r < 3; r++) {
    const rz = -0.9 + r * 0.7;
    const ry = h + 0.5 + r * 0.16;
    const rack = new THREE.Mesh(rackGeo, m.darkTrim);
    rack.position.set(0, ry, rz);
    rack.castShadow = true;
    g.add(rack);
    for (let t = 0; t < 9; t++) {
      const tube = new THREE.Mesh(
        tubeGeo,
        new THREE.MeshStandardMaterial({
          color: capColors[(r + t) % capColors.length], roughness: 0.55,
        }),
      );
      tube.position.set(-w / 2 + 1.1 + t * ((w - 2.2) / 8), ry + 0.3, rz);
      g.add(tube);
    }
  }

  g.add(casters(w, d, { inset: 0.7 }));
  return g;
}
